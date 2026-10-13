import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
// Browserless DOM harness for real UI handlers. No preview server or browser required.
class Element {
  constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.listeners={};this.attributes={};this.style={};this.hidden=false;this.value='';this.selectionStart=0;this.selectionEnd=0;this.scrollTop=0;this.scrollHeight=0;this.className='';this._text='';this.disabled=false;}
  set textContent(value){this.children=[];this._text=String(value);}
  get textContent(){return this._text+this.children.map(c=>c.textContent).join('');}
  set innerHTML(value){this._html=value;this.children=[];}
  get innerHTML(){return this._html||'';}
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this._text='';this.children=[...nodes];}
  setAttribute(key,value){this.attributes[key]=String(value);}
  addEventListener(name,callback){(this.listeners[name]||=[]).push(callback);}
  fire(name,event={}){for(const callback of this.listeners[name]||[])callback({target:this,preventDefault(){},...event});}
  focus(){globalThis.document.activeElement=this;}
  scrollIntoView(){}
  showModal(){this.open=true;}
  close(){this.open=false;}
  getBoundingClientRect(){return {left:0,right:600,top:0,bottom:600};}
}
test('full interactive UI: edit → run → type answers → check → continue → reload-safe drafts',async()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const elements=new Map([...html.matchAll(/<([\w-]+)[^>]*\bid="([^"]+)"[^>]*>/g)].map(m=>[m[2],new Element(m[1])]));
  const storage=new Map();globalThis.window={localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)}};
  globalThis.document={getElementById:id=>{assert.ok(elements.has(id),`HTML contains #${id}`);return elements.get(id);},createElement:tag=>new Element(tag),createTextNode:text=>{const node=new Element('text');node.textContent=text;return node;}};
  const $=id=>elements.get(id);
  await import('../app.js');
  assert.equal($('lesson-title').textContent,'Say something');assert.equal($('previous').disabled,true);
  $('check').fire('click');assert.match($('feedback').textContent,/Run your latest code/);
  $('code').value='print("Favorite food:", "Rice")';$('code').selectionStart=2;$('code').fire('input');
  $('run').fire('click');assert.match($('output').textContent,/Favorite food: Rice/);$('check').fire('click');
  assert.equal($('progress-text').textContent,'1 / 8');assert.equal($('continue').hidden,false);
  $('continue').fire('click');assert.equal($('lesson-title').textContent,'Give values names');
  $('next').fire('click');assert.equal($('lesson-title').textContent,'Make it personal');
  $('code').value='name = input("Name? ")\nfood = input("Food? ")\nprint("Hello,", name)\nprint("You chose:", food)';$('code').fire('input');$('run').fire('click');
  assert.equal($('input-form').hidden,false);assert.equal($('input-prompt').textContent,'Name? ');
  assert.equal(globalThis.document.activeElement,$('input-answer'));
  $('check').fire('click');assert.match($('feedback').textContent,/remaining question/);
  $('input-answer').value='Bright';$('input-form').fire('submit');assert.equal($('input-prompt').textContent,'Food? ');
  $('input-answer').value='Rice';$('input-form').fire('submit');assert.equal($('input-form').hidden,true);
  assert.match($('output').textContent,/Hello, Bright/);assert.match($('variables').textContent,/food/);
  $('check').fire('click');assert.equal($('progress-text').textContent,'2 / 8');
  // User output is inserted as text, never executable HTML.
  $('code').value='print("<img src=x onerror=alert(1)>")';$('code').fire('input');$('run').fire('click');
  assert.equal($('output').children[0].textContent,'<img src=x onerror=alert(1)>');assert.equal($('output').children[0].innerHTML,'');
  $('code').value='print("Oops)';$('code').fire('input');$('run').fire('click');assert.match($('output').textContent,/closing quote/);
  $('reset-code').fire('click');assert.equal($('code').value,'name = input("What is your name? ")\nprint("Hello,", name)');
  $('hint').fire('click');assert.equal($('hint-text').hidden,false);$('solution').fire('click');assert.equal($('solution-panel').hidden,false);
  $('open-glossary').fire('click');assert.equal($('glossary-dialog').open,true);$('glossary-search').value='strip';$('glossary-search').fire('input');assert.match($('glossary-list').textContent,/whitespace/);
  $('close-glossary').fire('click');assert.equal($('glossary-dialog').open,false);
  // Keyboard shortcut and cancellation.
  $('code').fire('keydown',{key:'Enter',ctrlKey:true});assert.equal($('input-form').hidden,false);$('stop').fire('click');assert.equal($('input-form').hidden,true);
  const persisted=JSON.parse([...storage.values()][0]);assert.equal(persisted.active,2);assert.ok(persisted.completed.includes('print'));assert.ok(persisted.completed.includes('input'));
});
