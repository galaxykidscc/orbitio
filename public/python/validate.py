"""Shared lesson runner, executed in a disposable Pyodide worker or by tests."""
import ast
import asyncio
import inspect
import sys
import builtins
import contextlib
import copy
import io
import json
import re
import traceback


class OutputBuffer(io.StringIO):
    def __init__(self, on_output=None):
        super().__init__()
        self.on_output = on_output
        self.display = io.StringIO()

    def write(self, text):
        if self.tell() + len(text) > 50000:
            raise RuntimeError("Too much output. Check your print statements or loops.")
        self.display.write(text)
        if self.on_output and "\n" in text:
            self.on_output(self.display.getvalue())
        return super().write(text)


class SkipGradingSleeps(ast.NodeTransformer):
    """Keep the visible pause; avoid repeating it in hidden grading runs."""
    def visit_Call(self, node):
        self.generic_visit(node)
        if (isinstance(node.func, ast.Attribute)
                and isinstance(node.func.value, ast.Name)
                and node.func.value.id == "time" and node.func.attr == "sleep"
                and len(node.args) == 1 and not node.keywords
                and isinstance(node.args[0], ast.Constant)
                and type(node.args[0].value) in (int, float)):
            node.args[0] = ast.copy_location(ast.Constant(value=0), node.args[0])
        return node

    def visit_Await(self, node):
        self.generic_visit(node)
        call = node.value
        if (isinstance(call, ast.Call) and isinstance(call.func, ast.Attribute)
                and isinstance(call.func.value, ast.Name)
                and call.func.value.id == "asyncio" and call.func.attr == "sleep"
                and len(call.args) == 1 and not call.keywords
                and isinstance(call.args[0], ast.Constant)
                and type(call.args[0].value) in (int, float)):
            call.args[0] = ast.copy_location(ast.Constant(value=0), call.args[0])
        return node


def execute(code, inputs, input_reader=None, on_output=None, grading=False):
    output = OutputBuffer(on_output)
    answers = iter(inputs)

    def read_input(prompt=""):
        # Only the student's visible run asks questions; grading uses recorded answers.
        if input_reader is not None:
            answer = input_reader(str(prompt), output.display.getvalue())
            if answer is None:
                raise EOFError("Input cancelled.")
            # Keep the question, but let print() display the answer.
            output.display.write(str(prompt) + "\n")
            return answer
        try:
            return next(answers)
        except StopIteration:
            raise EOFError("No more input available.") from None

    namespace = {"__name__": "__main__", "__builtins__": dict(vars(builtins), input=read_input)}
    error = None
    try:
        with contextlib.redirect_stdout(output), contextlib.redirect_stderr(output):
            tree = ast.parse(code) if isinstance(code, str) else copy.deepcopy(code)
            if grading:
                tree = ast.fix_missing_locations(SkipGradingSleeps().visit(tree))
            value = eval(compile(tree, "<student>", "exec", flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT), namespace)
            if inspect.isawaitable(value):
                if sys.platform == "emscripten":
                    from pyodide.ffi import run_sync
                    run_sync(value)
                else:
                    asyncio.run(value)
    except BaseException as exc:
        error = "".join(traceback.format_exception(type(exc), exc, exc.__traceback__))
    return {"output": output.getvalue(), "displayOutput": output.display.getvalue(), "error": error}


def literal(node):
    try:
        value = ast.literal_eval(node)
        return value
    except (ValueError, TypeError, SyntaxError):
        return None


def matches(template, student, specs, bindings):
    if isinstance(template, ast.Name) and template.id in specs:
        spec = specs[template.id]
        kind = spec["type"]
        value = literal(student)
        valid = (
            (kind == "identifier" and isinstance(student, ast.Name))
            or (kind == "integer" and type(value) is int)
            or (kind == "number" and type(value) in (int, float))
            or (kind == "string" and type(value) is str)
        )
        if not valid:
            return False
        if spec.get("pattern") and (type(value) is not str or not re.fullmatch(spec["pattern"], value, re.I | re.S)):
            return False
        # Context differs between storing and reading an identifier.
        key = student.id if kind == "identifier" else ast.dump(student)
        if template.id in bindings:
            return bindings[template.id][0] == key
        bindings[template.id] = (key, student)
        return True
    if type(template) is not type(student):
        return False
    if isinstance(template, ast.AST):
        return all(matches(getattr(template, field), getattr(student, field), specs, bindings)
                   for field in template._fields)
    if isinstance(template, list):
        return len(template) == len(student) and all(matches(a, b, specs, bindings) for a, b in zip(template, student))
    return template == student


class FillPlaceholders(ast.NodeTransformer):
    def __init__(self, bindings):
        self.bindings = bindings

    def visit_Name(self, node):
        if node.id not in self.bindings:
            return node
        replacement = copy.deepcopy(self.bindings[node.id][1])
        if isinstance(replacement, ast.Name):
            replacement.ctx = node.ctx
        return ast.copy_location(replacement, node)


def normalize(output):
    # Keep leading/inner whitespace: it can be meaningful in printed boards.
    return output.replace("\r\n", "\n").rstrip("\n")


def validate(code, validation, inputs=None, input_reader=None, on_output=None):
    inputs = list(inputs or [])

    def record_input(prompt, output):
        answer = input_reader(prompt, output)
        if answer is not None:
            inputs.append(answer)
        return answer

    first = execute(code, inputs, record_input if input_reader else None, on_output)
    result = dict(first, passed=False, message="Fix the Python error, then run the mission again.")
    if first["error"]:
        return result
    solution = validation["solution"]
    if validation["mode"] == "template":
        student = ast.parse(code)
        for candidate in [solution] + validation.get("alternatives", []):
            template = ast.parse(candidate)
            bindings = {}
            if matches(template, student, validation.get("placeholders", {}), bindings):
                solution = ast.fix_missing_locations(FillPlaceholders(bindings).visit(template))
                break
        else:
            result["message"] = validation.get("message", "Follow the lesson steps and try again.")
            return result
    elif validation["mode"] != "output":
        raise ValueError("Unsupported lesson validation mode")

    # Check the user's run as well as every repeatable scenario.
    cases = [{"inputs": inputs or [], "label": "your input"}] + validation.get("cases", [])
    for index, case in enumerate(cases):
        expected = execute(solution, case["inputs"], grading=True)
        if expected["error"]:
            raise ValueError("The lesson solution could not run for " + case["label"])
        actual = first if index == 0 else execute(code, case["inputs"], grading=True)
        if actual["error"]:
            result.update(error=actual["error"], message="Python error while checking " + case["label"] + ".")
            return result
        if normalize(actual["output"]) != normalize(expected["output"]):
            result["message"] = "The output is not correct for " + case["label"] + ". Check what your program prints."
            return result
    result.update(passed=True, message="Mission complete!")
    return result


def validate_request(payload):
    request = json.loads(payload)
    return json.dumps(validate(request["code"], request["validation"], request.get("inputs", [])))


def validate_interactive_request(payload):
    from js import requestLessonInput, publishLessonOutput
    from pyodide.ffi import run_sync
    request = json.loads(payload)
    return json.dumps(validate(
        request["code"], request["validation"],
        input_reader=lambda prompt, output: run_sync(requestLessonInput(prompt, output)),
        on_output=publishLessonOutput,
    ))
