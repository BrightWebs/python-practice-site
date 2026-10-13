import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {runPython} from '../engine.js';
import {lessons,glossary,conceptsInCode} from '../lessons.js';
import {PracticeState,STORAGE_KEY} from '../state.js';

const memoryStorage=()=>{const map=new Map();return {getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};};
const finish=(code,inputs)=>{let result=runPython(code);for(const answer of inputs){assert.equal(result.status,'input');result=runPython(code,inputs.slice(0,inputs.indexOf(answer)+1));}return result;};

test('all starting examples match CPython output for their documented sample inputs',()=>{
  const python=process.env.CODEX_PRIMARY_RUNTIME_PYTHON||(process.platform === 'win32' ? 'python' : 'python3');
  for(const lesson of lessons){
    const result=runPython(lesson.code,lesson.sampleInputs);
    assert.equal(result.status,'complete',lesson.id);
    assert.deepEqual(result.output,lesson.sampleOutput,lesson.id);
    const actual=execFileSync(python,['-c',lesson.code],{input:lesson.sampleInputs.join('\n')+'\n',encoding:'utf8'});
    // input() prompts are displayed inline by CPython; remove those for printed-output comparison.
    const prompts=result.events.filter(e=>e.type==='input').map(e=>e.prompt);
    let stripped=actual;for(const prompt of prompts)stripped=stripped.replace(prompt,'');
    assert.equal(result.output.join('\n')+'\n',stripped,lesson.id);
  }
});

test('all worked solutions satisfy their challenges, with real staged input',()=>{
  const storage=memoryStorage(), state=new PracticeState(storage);
  for(let index=0;index<lessons.length;index++){
    state.select(index);state.edit(state.lesson.solution);let result=state.run();
    const inputs=state.lesson.id==='input'?['Bright','Rice']:state.lesson.id==='float'?['12.5']:state.lesson.sampleInputs;
    for(const answer of inputs){assert.equal(result.status,'input',state.lesson.id);result=state.submitInput(answer);}
    assert.equal(result.status,'complete',state.lesson.id);
    assert.equal(state.check().passed,true,state.lesson.id);
    assert.equal(state.check().passed,true,'checking twice is harmless');
  }
  assert.equal(state.data.completed.length,8);
  assert.equal(new PracticeState(storage).data.completed.length,8);
});

test('starter examples do not accidentally complete challenges',()=>{
  for(const lesson of lessons){const r=runPython(lesson.code,lesson.sampleInputs);assert.equal(lesson.check(r,lesson.code),false,lesson.id);}
});

test('input pause/resume preserves prompt order, spaces, output, and values',()=>{
  const state=new PracticeState(memoryStorage());state.select(7);
  assert.equal(state.run().prompt,'Your name: ');
  assert.equal(state.submitInput('  Bright  ').prompt,'Hours per week: ');
  assert.equal(state.submitInput('19').prompt,'Hourly rate: ');
  const r=state.submitInput('13');
  assert.equal(r.status,'complete');assert.equal(r.variables.name.value,'Bright');assert.equal(r.variables.gross.value,494);
  assert.deepEqual(r.events.filter(e=>e.type==='input').map(e=>e.answer),['  Bright  ','19','13']);
  assert.deepEqual(r.output,['Hello, Bright!','Practice total: $494.00']);
});

test('editing after running invalidates stale output; reset and lesson changes cancel input',()=>{
  const s=new PracticeState(memoryStorage());s.edit('print("Favorite food:", "Rice")');s.run();assert.equal(s.check().passed,true);
  s.edit('print("Favorite food:", "Pizza")');assert.equal(s.check().needsRun,true);
  s.select(2);s.run();assert.equal(s.result.status,'input');s.select(1);assert.equal(s.result,null);assert.deepEqual(s.inputs,[]);
  s.edit('hours = 5');s.reset();assert.equal(s.code,lessons[1].code);assert.equal(s.result,null);
});

test('drafts, progress, and active lesson survive reload; malformed storage is safe',()=>{
  const storage=memoryStorage();const first=new PracticeState(storage);first.select(4);first.edit('hours = float(input("Hours? "))');
  const second=new PracticeState(storage);assert.equal(second.data.active,4);assert.equal(second.code,first.code);
  storage.setItem(STORAGE_KEY,'not json');assert.doesNotThrow(()=>new PracticeState(storage));
  storage.setItem(STORAGE_KEY,JSON.stringify({active:99,completed:['missing','print','print'],drafts:{print:'print("safe")'}}));
  const sanitized=new PracticeState(storage);assert.equal(sanitized.data.active,0);assert.deepEqual(sanitized.data.completed,['print']);
  const blocked=new PracticeState({getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}});blocked.edit('print("Still works")');assert.equal(blocked.saved,false);assert.equal(blocked.run().status,'complete');
});

test('common beginner mistakes explain the problem and point to the right line',()=>{
  const cases=[['print("Hello)',1,/quote/],['print("Hello"',1,/parenthesis/],['hours = input("Hours? ")\nprint(hours * 2.0)',2,/cannot use/],['hours = float(input("Hours? "))',1,/cannot turn/],['hours = 19\nprint(Hours)',2,/not been given/],['print(10 / 0)',1,/zero/],['hours = 19\nprint(hours.strip())',2,/needs text/],['print(f"Hello {name")',1,/closing brace/],['import os',1,/not been given/],['print(__import__("os"))',1,/not included/]];
  for(const [code,line,message] of cases){const r=runPython(code,['twelve']);assert.equal(r.status,'error',code);assert.equal(r.error.line,line,code);assert.match(r.error.message,message,code);assert.ok(r.error.hint);}
  assert.equal(runPython('print("<script>alert(1)</script>")').output[0],'<script>alert(1)</script>');
});

test('arithmetic precedence, text cleanup, and f-string rounding match CPython',()=>{
  const programs=[
    'print(2 + 3 * 4)\nprint((2 + 3) * 4)\nprint(10 / 2)',
    'original = "  Bright Chitoro  "\nclean = original.strip()\nprint(original)\nprint(clean)',
    'print("Hi" * 3)\nprint("Hello, " + "Bright")',
    'print(f"{1.125:.2f}")\nprint(f"{2.675:.2f}")\nprint(f"{-0.0:.2f}")\nprint(f"{{literal}} {494:.2f}")',
    'x = float("1e2")\nprint(x)\nprint(f"{x / 8:.2f}")',
    'print("first\\nsecond")\nprint("tab\\there")',
  ];
  for(const code of programs){const result=runPython(code);assert.equal(result.status,'complete');const actual=execFileSync(process.env.CODEX_PRIMARY_RUNTIME_PYTHON||(process.platform === 'win32' ? 'python' : 'python3'),['-c',code],{encoding:'utf8'});assert.equal(result.output.join('\n')+'\n',actual);}
});

test('each introduced concept has meaning, purpose, details, and an explained example',()=>{
  for(const lesson of lessons){assert.equal(lesson.code.split('\n').length,lesson.lineTips.length);for(const key of new Set([...lesson.concepts,...conceptsInCode(lesson.code),...conceptsInCode(lesson.solution)])){assert.ok(glossary[key],`${lesson.id}: ${key}`);for(const field of ['label','meaning','why','detail','example'])assert.ok(glossary[key][field],`${key}.${field}`);}}
});
