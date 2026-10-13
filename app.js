import {lessons,glossary,conceptsInCode} from './lessons.js';
import {PracticeState} from './state.js';
import {representation} from './engine.js';

let storage;try{storage=window.localStorage;}catch{}
const state=new PracticeState(storage);
const $=id=>document.getElementById(id);
const make=(tag,className,text)=>{const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;};
const escapeHTML=text=>text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
let currentLine=1, feedback='', feedbackType='', hintVisible=false, solutionVisible=false;

function saveStatus(){
  $('save-status').textContent=state.saved?'Saved in this browser':'Changes are not being saved';
  $('storage-warning').hidden=state.saved;
}
function renderNavigation(){
  $('lesson-nav').replaceChildren();
  lessons.forEach((lesson,index)=>{
    const done=state.data.completed.includes(lesson.id), active=index===state.data.active;
    const button=make('button','lesson-link'+(active?' active':'')+(done?' done':''));
    if(active)button.setAttribute('aria-current','step');
    button.setAttribute('aria-label',`Lesson ${index+1}: ${lesson.title}${done?', completed':''}`);
    button.append(make('span','lesson-number',done?'✓':String(index+1).padStart(2,'0')));
    const label=make('span');label.append(make('strong','',lesson.title),make('small','',lesson.subtitle));button.append(label);
    button.addEventListener('click',()=>selectLesson(index));$('lesson-nav').append(button);
  });
  $('progress-text').textContent=`${state.data.completed.length} / ${lessons.length}`;
  $('progress').value=state.data.completed.length;
  $('progress-caption').textContent=state.data.completed.length===lessons.length?'You made every small step. Keep practicing!':state.data.completed.length?'Look at you making progress.':'Every small step counts.';
}
function highlight(){
  const code=$('code').value;
  const pattern=/(#[^\n]*|f?(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|\b(?:print|input|float)\b|\b\d+(?:\.\d+)?\b|[+*/=\-])/g;
  let html='',start=0;
  for(const match of code.matchAll(pattern)){
    html+=escapeHTML(code.slice(start,match.index));
    const token=match[0];const kind=token.startsWith('#')?'comment':/^f["']/.test(token)?'f':/^["']/.test(token)?'string':/^(print|input|float)$/.test(token)?'function':/^\d/.test(token)?'number':'operator';
    html+=`<span class="tok-${kind}">${escapeHTML(token)}</span>`;start=match.index+token.length;
  }
  html+=escapeHTML(code.slice(start));$('highlight').innerHTML=html+'\n';
  const count=code.split('\n').length;
  $('line-numbers').textContent=Array.from({length:count},(_,i)=>i+1).join('\n');
  const height=Math.max(200,count*27+27);$('highlight').style.height=`${height}px`;$('code').style.height=`${height}px`;
}
function syntaxItem(key,open=false){
  const info=glossary[key];const details=make('details','syntax-item');details.open=open;
  const summary=make('summary');summary.append(make('span','syntax-dot'),make('span','',info.label));details.append(summary);
  const body=make('div','syntax-content');body.append(make('p','',info.meaning));
  const why=make('p');why.append(make('strong','','Why use it? '),document.createTextNode(info.why));body.append(why);
  body.append(make('p','',info.detail),make('code','',info.example));details.append(body);return details;
}
function renderGuide(){
  const line=$('code').value.split('\n')[currentLine-1]||'';
  const originalIndex=state.lesson.code.split('\n').indexOf(line);
  const original=originalIndex>=0?state.lesson.lineTips[originalIndex]:null;
  const priorities=['strip','float','fstrings','input','variables','print','comments','numbers','strings','math'];
  const detected=conceptsInCode(line);
  const primary=priorities.find(k=>detected.includes(k));
  const info=original||primary&&{syntax:line,title:glossary[primary].label,meaning:glossary[primary].meaning,why:glossary[primary].why};
  const box=$('line-explanation');box.replaceChildren();
  box.append(make('div','line-label',`LINE ${currentLine} · WHAT & WHY`));
  if(info){box.append(make('code','',line),make('h4','',info.title),make('p','',info.meaning));const why=make('p','why');why.append(make('strong','','Why use it? '),document.createTextNode(info.why));box.append(why);}
  else box.append(make('p','',line.trim()?'This runner covers the beginner syntax in the dictionary. Run your code for a helpful message if a new piece is unsupported.':'A blank line separates your code visually. It does not do anything when the program runs.'));
  const all=[...new Set([...state.lesson.concepts,...conceptsInCode($('code').value)])];
  $('syntax-guide').replaceChildren(...all.map((key,index)=>syntaxItem(key,key===primary||!primary&&index===0)));
}
function setCurrentLine(){const next=$('code').value.slice(0,$('code').selectionStart).split('\n').length;if(next!==currentLine){currentLine=next;renderGuide();}}
function renderVariables(){
  const entries=Object.entries(state.result?.variables||{});$('variable-count').textContent=`${entries.length} ${entries.length===1?'value':'values'}`;
  const box=$('variables');box.replaceChildren();
  if(!entries.length){box.append(make('p','muted',state.result?'No variables have been saved yet.':'Run your code to inspect saved values.'));return;}
  const table=make('table','variables-table');const head=make('thead'), header=make('tr');
  ['Name','Value','Type'].forEach(text=>{const th=make('th','',text);th.scope='col';header.append(th);});head.append(header);table.append(head);
  const body=make('tbody');entries.forEach(([name,value])=>{const tr=make('tr');tr.append(make('td','',name),make('td','',representation(value)));const type=make('td');type.append(make('span','type-tag',value.type));tr.append(type);body.append(tr);});table.append(body);box.append(table);
}
function renderOutput(focus=false){
  const result=state.result;const box=$('output');box.replaceChildren();$('input-form').hidden=true;
  const status=$('run-status');status.className='run-status';
  if(!result){status.textContent='Ready when you are';const empty=make('div','output-empty');empty.append(make('span','','▶'));const p=make('p','','Your code has something to say.');p.append(make('small','','Press Run code to see it here.'));empty.append(p);box.append(empty);}
  else{
    for(const event of result.events||[]){
      if(event.type==='output')box.append(make('div','output-line',event.text||' '));
      else{const row=make('div','input-transcript');row.append(document.createTextNode(event.prompt),make('span','typed-answer',event.answer));box.append(row);}
    }
    if(result.status==='input'){
      status.textContent=`Waiting for input · line ${result.line}`;status.className+=' waiting';
      $('input-prompt').textContent=result.prompt||'Enter a response:';$('input-answer').value='';$('input-form').hidden=false;
      if(focus)$('input-answer').focus();
    }else if(result.status==='error'){
      status.textContent=`Let's fix line ${result.error.line}`;status.className+=' error';
      const error=make('div','error-box');error.append(make('strong','',`Line ${result.error.line}: ${result.error.message}`),make('small','',result.error.hint));box.append(error);
    }else{status.textContent='Finished ✓';status.className+=' success';if(!(result.events||[]).length)box.append(make('div','input-transcript','No printed output. Your variables are saved below.'));}
  }
  box.scrollTop=box.scrollHeight;renderVariables();
}
function renderFeedback(){
  $('feedback').hidden=!feedback;$('feedback').textContent=feedback;$('feedback').className=feedbackType==='success'?'':'pending';
  $('continue').hidden=feedbackType!=='success'||state.data.active===lessons.length-1;
}
function renderLesson(){
  currentLine=1;hintVisible=false;solutionVisible=false;feedback='';feedbackType='';
  $('lesson-kicker').textContent=`STEP ${String(state.data.active+1).padStart(2,'0')} / ${String(lessons.length).padStart(2,'0')} · ${state.lesson.subtitle}`;
  $('lesson-title').textContent=state.lesson.title;$('lesson-time').textContent=`~ ${state.lesson.time}`;
  $('lesson-intro').textContent=state.lesson.intro;$('code').value=state.code;$('code').selectionStart=0;$('code').selectionEnd=0;
  $('task').textContent=state.lesson.task;$('hint-text').textContent=state.lesson.hint;$('hint-text').hidden=true;$('hint').setAttribute('aria-expanded','false');
  $('solution-panel').hidden=true;$('solution').setAttribute('aria-expanded','false');$('solution-code').textContent=state.lesson.solution;
  $('previous').disabled=state.data.active===0;$('next').disabled=state.data.active===lessons.length-1;
  const sample=$('sample');sample.replaceChildren();
  if(state.lesson.sampleInputs.length){const row=make('div','sample-inputs','Sample answers, in order: ');state.lesson.sampleInputs.forEach(s=>row.append(make('code','',JSON.stringify(s))));sample.append(row);}
  sample.append(make('strong','','Expected printed output:'),make('pre','',state.lesson.sampleOutput.join('\n')));
  renderNavigation();highlight();renderGuide();renderOutput();renderFeedback();saveStatus();
}
function selectLesson(index){state.select(index);renderLesson();}
function run(){feedback='';feedbackType='';state.run();renderOutput(true);renderFeedback();}
$('code').addEventListener('input',()=>{
  state.edit($('code').value);currentLine=$('code').value.slice(0,$('code').selectionStart).split('\n').length;
  feedback='';feedbackType='';highlight();renderGuide();renderOutput();renderFeedback();saveStatus();
});
['click','keyup','select'].forEach(type=>$('code').addEventListener(type,setCurrentLine));
$('code').addEventListener('scroll',()=>{$('highlight').scrollLeft=$('code').scrollLeft;});
$('code').addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();run();}});
$('run').addEventListener('click',run);
$('input-form').addEventListener('submit',e=>{e.preventDefault();state.submitInput($('input-answer').value);feedback='';feedbackType='';renderOutput(true);renderFeedback();});
$('stop').addEventListener('click',()=>{state.stop();renderOutput();$('run-status').textContent='Stopped · run to start again';});
$('reset-code').addEventListener('click',()=>{state.reset();renderLesson();});
$('previous').addEventListener('click',()=>selectLesson(state.data.active-1));
$('next').addEventListener('click',()=>selectLesson(state.data.active+1));
$('continue').addEventListener('click',()=>{selectLesson(state.data.active+1);$('lesson-title').scrollIntoView({behavior:'smooth',block:'start'});});
$('hint').addEventListener('click',()=>{hintVisible=!hintVisible;$('hint-text').hidden=!hintVisible;$('hint').setAttribute('aria-expanded',String(hintVisible));});
$('solution').addEventListener('click',()=>{solutionVisible=!solutionVisible;$('solution-panel').hidden=!solutionVisible;$('solution').setAttribute('aria-expanded',String(solutionVisible));});
$('check').addEventListener('click',()=>{
  const check=state.check();
  if(check.needsRun){feedback=state.result?.status==='input'?'Answer the remaining question in the output area, then check again.':state.result?.status==='error'?'Fix the message in the output area and run your code again.':'Run your latest code first, then check your practice.';feedbackType='pending';}
  else if(check.passed){feedback=state.lesson.success;feedbackType='success';if(state.data.completed.length===lessons.length)feedback+=' All 8 steps are complete. You can revisit any lesson whenever you like.';}
  else{feedback='Your code ran. Now compare it with the challenge above: '+state.lesson.task;feedbackType='pending';}
  renderFeedback();renderNavigation();saveStatus();
});
function renderGlossary(){
  const query=$('glossary-search').value.toLowerCase().trim();
  const keys=Object.keys(glossary).filter(key=>[key,...Object.values(glossary[key])].join(' ').toLowerCase().includes(query));
  $('glossary-list').replaceChildren(...keys.map(key=>syntaxItem(key,true)));
  if(!keys.length)$('glossary-list').append(make('p','muted','No match yet. Try a word like input, quotes, or number.'));
}
$('open-glossary').addEventListener('click',()=>{$('glossary-search').value='';renderGlossary();$('glossary-dialog').showModal();$('glossary-search').focus();});
$('close-glossary').addEventListener('click',()=>{$('glossary-dialog').close();$('open-glossary').focus();});
$('glossary-search').addEventListener('input',renderGlossary);
$('glossary-dialog').addEventListener('click',e=>{if(e.target===$('glossary-dialog')){const r=$('glossary-dialog').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('glossary-dialog').close();}});
state.save();renderLesson();
