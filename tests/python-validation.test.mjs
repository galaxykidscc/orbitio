import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import vm from "node:vm";
import ts from "typescript";

const lessons = {};
for (const file of readdirSync("src/data/lessons/python")) {
  if (file === "index.ts" || file === "validate-python-lesson.ts") continue;
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
};
for (const [slug, lesson] of Object.entries(lessons)) {
  test(`${slug}: accepts solution with comments, rejects blank and starter`, () => {
    assert.equal(run(`# A comment\n${good[slug]}\n`, lesson.validation, ["Alex"]).passed, true);
    assert.equal(run("", lesson.validation, ["Alex"]).passed, false);
    assert.equal(run(lesson.starterCode, lesson.validation, ["Alex"]).passed, false);
  });
}
test("types, exact lesson values, and printed variables matter", () => {
  const validation = lessons["variables-practice"].validation;
  for (const code of [good["variables-practice"].replace('-12.5', 'True'), good["variables-practice"].replace('-12.5', '"80"'), good["variables-practice"].replace('"Nova"', '"Wrong"'), good["variables-practice"].replace('print(power_level)', 'print(80)')]) {
    assert.equal(run(code, validation).passed, false);
  }
  assert.equal(run(good["variables-practice"].replaceAll('"', "'").replaceAll(' = ', '='), validation).passed, true);
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
