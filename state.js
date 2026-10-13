import {lessons} from './lessons.js';
import {runPython} from './engine.js';
export const STORAGE_KEY='bright-python-practice-v1';
export class PracticeState {
  constructor(storage) {
    this.storage=storage;this.saved=true;this.data={active:0,drafts:{},completed:[]};this.inputs=[];this.result=null;this.runningCode='';this.runLesson=null;
    try { const data=JSON.parse(storage?.getItem(STORAGE_KEY)||'null');
      if(data&&typeof data==='object') {
        this.data.active=Number.isInteger(data.active)&&data.active>=0&&data.active<lessons.length?data.active:0;
        this.data.drafts=Object.fromEntries(lessons.filter(l=>typeof data.drafts?.[l.id]==='string'&&data.drafts[l.id].length<=20000).map(l=>[l.id,data.drafts[l.id]]));
        this.data.completed=Array.isArray(data.completed)?[...new Set(data.completed.filter(id=>lessons.some(l=>l.id===id)))]:[];
      }
    }catch {this.saved=false;}
  }
  get lesson(){return lessons[this.data.active];}
  get code(){return this.data.drafts[this.lesson.id]??this.lesson.code;}
  save(){try{this.storage?.setItem(STORAGE_KEY,JSON.stringify(this.data));this.saved=!!this.storage;}catch{this.saved=false;}return this.saved;}
  edit(code){this.data.drafts[this.lesson.id]=code;this.stop();this.save();}
  select(index){if(index<0||index>=lessons.length)return;this.stop();this.data.active=index;this.save();}
  reset(){this.data.drafts[this.lesson.id]=this.lesson.code;this.stop();this.save();}
  stop(){this.inputs=[];this.result=null;this.runningCode='';this.runLesson=null;}
  run(){this.inputs=[];this.runningCode=this.code;this.runLesson=this.lesson.id;this.result=runPython(this.runningCode,this.inputs);return this.result;}
  submitInput(answer){if(this.result?.status!=='input')return null;this.inputs.push(answer);this.result=runPython(this.runningCode,this.inputs);return this.result;}
  check(){
    if(!this.result||this.result.status!=='complete'||this.runningCode!==this.code||this.runLesson!==this.lesson.id)return {passed:false,needsRun:true};
    const passed=this.lesson.check(this.result,this.code);
    if(passed&&!this.data.completed.includes(this.lesson.id)){this.data.completed.push(this.lesson.id);this.save();}
    return {passed,needsRun:false};
  }
}
