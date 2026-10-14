import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import vm from "node:vm";
import ts from "typescript";

const lessons = {};
for (const file of readdirSync("src/data/lessons/python")) {
  if (!file.endsWith(".ts") || file === "index.ts" || file === "validate-python-lesson.ts") continue;
  const source = readFileSync(`src/data/lessons/python/${file}`, "utf8");
  const context = { exports: {} };
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
  const lesson = Object.values(context.exports)[0];
  lessons[lesson.slug] = JSON.parse(JSON.stringify(lesson));
}
function run(code, validation, inputs = []) {
  const result = spawnSync("python3", ["-c", `
import json, runpy, sys
engine = runpy.run_path('public/python/validate.py')
request = json.load(sys.stdin)
print(engine['validate_request'](json.dumps(request)))
`], { input: JSON.stringify({ code, validation, inputs }), encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}
const good = {
  "power-up-the-robot": 'print("Hello robot!")\nrobot_name = "Nova"\nprint(robot_name, "is ready.")',
  "practice-using-print": 'print("Hello, Lucretia!")\nprint("My name is Nova.")',
  "variables-practice": 'robot_name = "Nova"\npower_level = -12.5\nprint(robot_name)\nprint(power_level)',
  "math-in-python": 'first_number = 40\nsecond_number = 25\ntotal_number = first_number + second_number\nprint(total_number)',
  "syntax-errors": 'print("Python is ready!")\nprint("No syntax errors!")',
  "how-to-get-user-input": 'user_name = input("Your name? ")\nprint(user_name)',
  "nova's-status-report": 'robot_name = "Nova"\nlocation = "forest crash site"\npower_level = 85\nprint("Hello!")\nprint(robot_name)\nprint(location)\nprint(power_level)',
  "one-half-of-a-number": 'number = float(input("Enter a number: "))\nhalf = number / 2\nprint(half)',
};
good["novas-century-scanner"] = lessons["novas-century-scanner"].validation.solution
  .replaceAll("__name_prompt__", '"Your name? "')
  .replaceAll("__age_prompt__", '"Your age? "');
for (const [slug, lesson] of Object.entries(lessons)) {
  test(`${slug}: accepts solution with comments, rejects blank and starter`, () => {
    const inputs = slug === "one-half-of-a-number" ? ["10"] : ["Alex", "10"];
    assert.equal(run(`# A comment\n${good[slug]}\n`, lesson.validation, inputs).passed, true);
    assert.equal(run("", lesson.validation, inputs).passed, false);
    assert.equal(run(lesson.starterCode, lesson.validation, inputs).passed, false);
  });
}
test("types, exact lesson values, and printed variables matter", () => {
  const validation = lessons["variables-practice"].validation;
  for (const code of [good["variables-practice"].replace('-12.5', 'True'), good["variables-practice"].replace('-12.5', '"80"'), good["variables-practice"].replace('"Nova"', '"Wrong"'), good["variables-practice"].replace('print(power_level)', 'print(80)')]) {
    assert.equal(run(code, validation).passed, false);
  }
  assert.equal(run(good["variables-practice"].replaceAll('"', "'").replaceAll(' = ', '='), validation).passed, true);
});

test("half-number lesson accepts equivalent calculations and numeric formatting", () => {
  const validation = lessons["one-half-of-a-number"].validation;
  for (const code of [
    good["one-half-of-a-number"],
    'value = float(input("Number? "))\nprint(value * 0.5)',
    'value = float(input())\nprint(f"{value / 2:g}")',
  ]) {
    for (const input of ["10", "7", "2.5", "-8", "0", "0.125"]) {
      assert.equal(run(code, validation, [input]).passed, true);
    }
  }
});

test("half-number lesson rejects hardcoded answers, truncation, and extra output", () => {
  const validation = lessons["one-half-of-a-number"].validation;
  for (const code of [
    'input()\nprint(5)',
    'number = float(input())\nprint(number // 2)',
    'number = int(input())\nprint(number / 2)',
    'number = float(input())\nprint(number * 2)',
    'number = float(input())\nprint("Half:", number / 2)',
    'number = float(input())\nprint(number / 2)\nprint(number / 2)',
    'input()\nprint("NaN")',
    'input()\nprint("Infinity")',
  ]) {
    assert.equal(run(code, validation, ["10"]).passed, false);
  }
  assert.equal(run('print(5)', { mode: "output", solution: 'print(5.0)' }).passed, false);
});
test("math requires computing the result, not printing a hardcoded answer", () => {
  assert.equal(run(good["math-in-python"].replace('first_number + second_number', '65'), lessons["math-in-python"].validation).passed, false);
});
test("unchanged greetings, missing robot name, and commented code fail", () => {
  const validation = lessons["practice-using-print"].validation;
  for (const code of ['print("Hello World")\nprint("Nova")', 'print("Hello Alex")\nprint("Robot")', '# print("Hello Alex")\nprint("Nova")']) {
    assert.equal(run(code, validation).passed, false);
  }
});
test("ready messages accept f-strings and concatenation", () => {
  for (const line of ['print(f"{robot_name} is ready.")', 'print(robot_name + " is ready.")']) {
    assert.equal(run(good["power-up-the-robot"].replace('print(robot_name, "is ready.")', line), lessons["power-up-the-robot"].validation).passed, true);
  }
});
test("named identifiers bind consistently and integer excludes booleans", () => {
  const validation = { mode: "template", solution: '__var__ = __value__\nprint(__var__)', placeholders: { __var__: { type: "identifier" }, __value__: { type: "integer" } } };
  assert.equal(run('battery = -20\nprint(battery)', validation).passed, true);
  assert.equal(run('battery = True\nprint(battery)', validation).passed, false);
  assert.equal(run('battery = 20\nprint(20)', validation).passed, false);
});
test("Python exceptions preserve previous output and cannot be mistaken for printed text", () => {
  const validation = { mode: "output", solution: 'print("Python Error: just text")' };
  assert.equal(run(validation.solution, validation).passed, true);
  const result = run('print("before")\n1 / 0', validation);
  assert.equal(result.passed, false);
  assert.equal(result.output, "before\n");
  assert.match(result.error, /ZeroDivisionError/);
  assert.match(run('print(', validation).error, /SyntaxError/);
  assert.match(run('print(missing)', validation).error, /NameError/);
});
test("behavior mode checks multiple inputs and permits different implementations", () => {
  const validation = { mode: "output", solution: 'print(int(input()) * 2)', cases: [{ label: "another number", inputs: ["7"] }] };
  assert.equal(run('n = int(input())\nprint(n + n)', validation, ["3"]).passed, true);
  assert.equal(run('print(6)', validation, ["3"]).passed, false);
});

test("student errors show their line and advice without runner frames", () => {
  const validation = { mode: "output", solution: 'print(1)' };
  const scenarios = [
    ['print("before")\n1 / 0', /Line 2: ZeroDivisionError/, /must not be zero/],
    ['print("before")\nprint(missing)', /Line 2: NameError/, /create the variable/],
    ['print("before")\nprint(', /Line 2: SyntaxError/, /parentheses/],
    ['if True:\nprint("hello")', /Line 2: IndentationError/, /indentation/],
    ['number = int(input())', /Line 1: ValueError/, /float\(input/],
    ['number = float(input())', /Line 1: ValueError/, /without extra words/],
    ['number = input()\nprint(number / 2)', /Line 2: TypeError/, /before doing math/],
    ['def divide():\n    return 1 / 0\ndivide()', /Line 2: ZeroDivisionError/, /return 1 \/ 0/],
  ];
  for (const [code, location, advice] of scenarios) {
    const result = run(code, validation, [code.includes('int(input') ? '2.5' : 'hello']);
    assert.match(result.error, location);
    assert.match(result.error, advice);
    assert.doesNotMatch(result.error, /Traceback|<exec>|<student>|validate\.py/);
  }
});

test("hidden decimal failure preserves successful output and identifies the test input", () => {
  const result = run('number = int(input("Enter a number: "))\nhalf = number / 2\nprint(half)',
    lessons['one-half-of-a-number'].validation, ['10']);
  assert.equal(result.passed, false);
  assert.equal(result.output, '5.0\n');
  assert.equal(result.error, null);
  assert.match(result.message, /Your run finished successfully/);
  assert.match(result.message, /a decimal number; input: '2.5'/);
  assert.match(result.validationError, /Line 1: ValueError/);
  assert.match(result.validationError, /float\(input/);
  assert.doesNotMatch(result.validationError, /Traceback|<exec>|<student>/);
});
test("output whitespace remains meaningful and unbounded output stops", () => {
  assert.equal(run('print(" a")', { mode: "output", solution: 'print("a")' }).passed, false);
  assert.match(run('print("x" * 50001)', { mode: "output", solution: '' }).error, /Too much output/);
});
test("input lesson uses provided answers and rejects hardcoded names", () => {
  const validation = lessons["how-to-get-user-input"].validation;
  const result = run(good["how-to-get-user-input"], validation, ["Taylor"]);
  assert.equal(result.output, "Taylor\n");
  assert.equal(result.passed, true);
  assert.equal(run('user_name = "Alex"\nprint(user_name)', validation, ["Alex"]).passed, false);
  assert.match(run(good["how-to-get-user-input"], validation).error, /EOFError/);
});

test("worker timeout, completion, and cancellation terminate the runtime", async () => {
  const source = readFileSync("src/data/lessons/python/validate-python-lesson.ts", "utf8");
  function harness() {
    const workers = [];
    let timer;
    class FakeWorker {
      terminated = false;
      constructor() { workers.push(this); }
      postMessage(data) { this.request = data; }
      terminate() { this.terminated = true; }
    }
    const context = {
      exports: {}, Worker: FakeWorker,
      setTimeout(callback, delay) { timer = { callback, delay }; return timer; },
      clearTimeout(value) { if (value) value.cleared = true; },
    };
    vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
    return { run: context.exports.validatePythonLesson, worker: () => workers[0], timer: () => timer };
  }
  const timed = harness();
  const pending = timed.run('while True: pass', lessons['syntax-errors']);
  assert.equal(timed.timer().delay, 60000);
  timed.worker().onmessage({ data: { type: 'ready' } });
  assert.equal(timed.timer().delay, 3000);
  timed.timer().callback();
  await assert.rejects(pending, /endless loop/);
  assert.equal(timed.worker().terminated, true);

  const done = harness();
  const completed = done.run('', lessons['syntax-errors']);
  done.worker().onmessage({ data: { type: 'result', result: { passed: true } } });
  assert.equal((await completed).passed, true);
  assert.equal(done.worker().terminated, true);

  const scanner = harness();
  const outputs = [];
  const scannerRun = scanner.run('', lessons['novas-century-scanner'], [], undefined, undefined,
    (output) => outputs.push(output));
  scanner.worker().onmessage({ data: { type: 'ready' } });
  assert.equal(scanner.timer().delay, 10000);
  scanner.worker().onmessage({ data: { type: 'output', output: 'Please wait while I think....\n' } });
  assert.deepEqual(outputs, ['Please wait while I think....\n']);
  scanner.worker().onmessage({ data: { type: 'result', result: { passed: true } } });
  assert.equal((await scannerRun).passed, true);

  const interactive = harness();
  let submit;
  const interactiveResult = interactive.run('', lessons['how-to-get-user-input'], [], undefined,
    (prompt, output) => {
      assert.equal(prompt, 'Name?');
      assert.equal(output, 'Welcome\n');
      return new Promise((resolve) => { submit = resolve; });
    });
  await interactive.worker().onmessage({ data: { type: 'ready' } });
  const waiting = interactive.worker().onmessage({ data: { type: 'input', prompt: 'Name?', output: 'Welcome\n' } });
  assert.equal(interactive.timer().cleared, true);
  submit('Jordan');
  await waiting;
  assert.equal(interactive.timer().cleared, undefined);
  assert.equal(interactive.worker().request.answer, 'Jordan');
  await interactive.worker().onmessage({ data: { type: 'result', result: { passed: true } } });
  assert.equal((await interactiveResult).passed, true);

  const cancelled = harness();
  const controller = new AbortController();
  const stopped = cancelled.run('', lessons['syntax-errors'], [], controller.signal);
  controller.abort();
  await assert.rejects(stopped, /cancelled/);
  assert.equal(cancelled.worker().terminated, true);
});

test("interactive input shows real prompts once and keeps grading answers hidden", () => {
  const validation = lessons['how-to-get-user-input'].validation;
  const result = spawnSync('python3', ['-c', `
import json, runpy, sys
engine = runpy.run_path('public/python/validate.py')
validation = json.load(sys.stdin)
prompts = []
def answer(prompt, output):
    prompts.append([prompt, output])
    return 'Jordan'
result = engine['validate']('user_name = input("What is your name? ")\\nprint(user_name)', validation, input_reader=answer)
print(json.dumps(dict(result, prompts=prompts)))
`], { input: JSON.stringify(validation), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const actual = JSON.parse(result.stdout);
  assert.equal(actual.passed, true);
  assert.deepEqual(actual.prompts, [['What is your name? ', '']]);
  assert.equal(actual.output, 'Jordan\n');
  assert.equal(actual.displayOutput, 'What is your name? \nJordan\n');
  assert.equal(actual.displayOutput.includes('Alex'), false);
});

test("multiple input calls retain execution state and accept an empty answer", () => {
  const result = spawnSync('python3', ['-c', `
import json, runpy
engine = runpy.run_path('public/python/validate.py')
answers = iter(['', 'second'])
prompts = []
def answer(prompt, output):
    prompts.append([prompt, output])
    return next(answers)
result = engine['execute']('print("Welcome")\\na = input("First? ")\\nb = input("Second? ")\\nprint(repr(a), b)', [], answer)
print(json.dumps(dict(result, prompts=prompts)))
`], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const actual = JSON.parse(result.stdout);
  assert.equal(actual.error, null);
  assert.deepEqual(actual.prompts, [['First? ', 'Welcome\n'], ['Second? ', 'Welcome\nFirst? \n']]);
  assert.equal(actual.displayOutput, "Welcome\nFirst? \nSecond? \n'' second\n");
});


test("century scanner accepts alternatives and rejects missing sleep, wrong delay, and hardcoded year", () => {
  const lesson = lessons["novas-century-scanner"];
  for (const alternative of lesson.validation.alternatives) {
    const code = alternative.replaceAll("__name_prompt__", '"Name? "').replaceAll("__age_prompt__", '"Age? "');
    assert.equal(run(code, lesson.validation, ["Taylor", "25"]).passed, true);
  }
  for (const code of [
    good[lesson.slug].replace("time.sleep(3)", "time.sleep(0)"),
    good[lesson.slug].replace("time.sleep(3)", ""),
    good[lesson.slug].replace("current_year + (100 - age)", "2116"),
  ]) {
    assert.equal(run(code, lesson.validation, ["Luna", "10"]).passed, false);
  }
});

test("century scanner streams its thinking message before the actual pause and skips grading delays", () => {
  const result = spawnSync("python3", ["-c", `
import json, runpy, sys, time
engine = runpy.run_path('public/python/validate.py')
lesson = json.load(sys.stdin)
code = lesson['validation']['solution'].replace('__name_prompt__', '"Name? "').replace('__age_prompt__', '"Age? "')
updates = []
started = time.monotonic()
result = engine['validate'](code, lesson['validation'], ['Luna', '10'], on_output=lambda output: updates.append([time.monotonic() - started, output]))
assert result['passed'], result
assert updates[0][0] < 1
assert updates[-1][0] - updates[0][0] >= 2.9
assert time.monotonic() - started < 6, 'Hidden checks should not repeat the delay'
print('ok')
`], { input: JSON.stringify(lessons['novas-century-scanner']), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});
