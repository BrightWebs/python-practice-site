// A deliberately bounded Python practice interpreter. No eval or network calls.
// The UI states its supported beginner syntax; unsupported code produces a clear error.
export class PracticeError extends Error {
  constructor(message, line = 1, hint = '') { super(message); this.name = 'PracticeError'; this.line = line; this.hint = hint; }
}
const V = (type, value) => ({type, value});
const isNumber = value => value.type === 'int' || value.type === 'float';
export function display(value) {
  if (value.type === 'str') return value.value;
  if (value.type === 'NoneType') return 'None';
  if (value.type === 'float') {
    if (Number.isNaN(value.value)) return 'nan';
    if (!Number.isFinite(value.value)) return value.value < 0 ? '-inf' : 'inf';
    if (Object.is(value.value, -0)) return '-0.0';
    const s = String(value.value);
    return Number.isInteger(value.value) && !s.includes('e') ? s + '.0' : s;
  }
  return String(value.value);
}
export function representation(value) { return value.type === 'str' ? JSON.stringify(value.value) : display(value); }

// Round the exact binary float to fixed decimals with Python's ties-to-even rule.
function fixed(number, digits) {
  if (!Number.isFinite(number)) return display(V('float',number));
  const negative = number < 0 || Object.is(number, -0);
  const buffer = new ArrayBuffer(8), view = new DataView(buffer);
  view.setFloat64(0, Math.abs(number));
  const bits = view.getBigUint64(0), exponent = Number((bits >> 52n) & 2047n);
  const fraction = bits & ((1n << 52n) - 1n);
  let numerator = exponent === 0 ? fraction : fraction + (1n << 52n);
  const power = exponent === 0 ? -1074 : exponent - 1023 - 52;
  numerator *= 10n ** BigInt(digits);
  let denominator = 1n;
  if (power < 0) denominator <<= BigInt(-power); else numerator <<= BigInt(power);
  let rounded = numerator / denominator;
  const remainder = numerator % denominator;
  if (remainder * 2n > denominator || (remainder * 2n === denominator && rounded % 2n)) rounded++;
  let text = rounded.toString().padStart(digits + 1, '0');
  if (digits) text = text.slice(0, -digits) + '.' + text.slice(-digits);
  return (negative ? '-' : '') + text;
}

function tokenize(source, line) {
  const tokens = []; let p = 0;
  while (p < source.length) {
    const c = source[p];
    if (/\s/.test(c)) { p++; continue; }
    if (c === '#') break;
    if (c === '"' || c === "'" || (c === 'f' && /["']/.test(source[p + 1] || ''))) {
      const formatted = c === 'f'; if (formatted) p++;
      const quote = source[p++]; let value = '', closed = false;
      while (p < source.length) {
        const ch = source[p++];
        if (ch === quote) { closed = true; break; }
        if (ch === '\\') {
          const escape = source[p++];
          if (escape === undefined) break;
          const map = {n:'\n',t:'\t',r:'\r','\\':'\\','"':'"',"'":"'"};
          value += Object.hasOwn(map,escape) ? map[escape] : '\\' + escape;
        } else value += ch;
      }
      if (!closed) throw new PracticeError('This text is missing its closing quote.', line, 'Put matching quotes around the text, like "Hello".');
      tokens.push({kind:formatted?'fstring':'string',value}); continue;
    }
    const number = source.slice(p).match(/^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/);
    if (number) { tokens.push({kind:'number',value:number[0]}); p += number[0].length; continue; }
    const name = source.slice(p).match(/^[A-Za-z_][A-Za-z_0-9]*/);
    if (name) { tokens.push({kind:'name',value:name[0]}); p += name[0].length; continue; }
    if ('+-*/(),.='.includes(c)) { tokens.push({kind:c,value:c}); p++; continue; }
    throw new PracticeError(`The practice runner does not support ${JSON.stringify(c)} here.`, line, 'Use the syntax explained in these lessons. Full Python projects can run in VS Code.');
  }
  tokens.push({kind:'end'}); return tokens;
}

class Parser {
  constructor(tokens, context, line) { this.tokens = tokens; this.context = context; this.line = line; this.p = 0; }
  peek(kind) { return this.tokens[this.p].kind === kind; }
  take(kind) {
    if (!this.peek(kind)) throw new PracticeError(`Expected ${kind === ')' ? 'a closing parenthesis )' : kind}.`,this.line,'Check the punctuation in the example beside your code.');
    return this.tokens[this.p++];
  }
  parse() { const value = this.expression(); this.take('end'); return value; }
  expression() {
    let value = this.product();
    while (this.peek('+') || this.peek('-')) { const op = this.tokens[this.p++].kind; value = this.binary(value,this.product(),op); }
    return value;
  }
  product() {
    let value = this.unary();
    while (this.peek('*') || this.peek('/')) { const op = this.tokens[this.p++].kind; value = this.binary(value,this.unary(),op); }
    return value;
  }
  unary() {
    if (this.peek('-') || this.peek('+')) {
      const op=this.tokens[this.p++].kind, value=this.unary();
      if (!isNumber(value)) throw new PracticeError('A plus or minus sign here needs a number.',this.line);
      return V(value.type,op==='-'?-value.value:value.value);
    }
    let value = this.atom();
    while (this.peek('.')) {
      this.take('.'); const method=this.take('name').value; this.take('('); this.take(')');
      if (method !== 'strip') throw new PracticeError(`.${method}() is outside this practice runner.`,this.line,'These lessons explain .strip(): it removes whitespace from the ends of text.');
      if (value.type !== 'str') throw new PracticeError('.strip() needs text, but this value is a number.',this.line,'Use .strip() on input text before converting it with float().');
      value=V('str',value.value.replace(/^[\s\u001c-\u001f]+|[\s\u001c-\u001f]+$/gu,''));
    }
    return value;
  }
  atom() {
    if (this.peek('number')) { const s=this.take('number').value; return V(/[.eE]/.test(s)?'float':'int',Number(s)); }
    if (this.peek('string')) return V('str',this.take('string').value);
    if (this.peek('fstring')) return V('str',this.format(this.take('fstring').value));
    if (this.peek('(')) { this.take('('); const value=this.expression(); this.take(')'); return value; }
    if (this.peek('name')) {
      const name=this.take('name').value;
      if (this.peek('(')) {
        this.take('('); const args=[];
        if (!this.peek(')')) { args.push(this.expression()); while(this.peek(',')) {this.take(','); if(this.peek(')')) break; args.push(this.expression());} }
        this.take(')'); return this.call(name,args);
      }
      if (Object.hasOwn(this.context.variables,name)) return this.context.variables[name];
      throw new PracticeError(`The variable "${name}" has not been given a value yet.`,this.line,`Create it first, for example: ${name} = "something". Names are case-sensitive.`);
    }
    throw new PracticeError('This line is missing a value or has punctuation in the wrong place.',this.line,'Compare it with the example, then check quotes and parentheses.');
  }
  binary(a,b,op) {
    if (op==='+' && a.type==='str' && b.type==='str') return V('str',a.value+b.value);
    if (op==='*' && ((a.type==='str' && b.type==='int') || (b.type==='str' && a.type==='int'))) {
      const s=a.type==='str'?a:b, n=a.type==='int'?a:b;
      if(n.value>10000) throw new PracticeError('That repeats the text too many times for this practice area.',this.line);
      return V('str',s.value.repeat(Math.max(0,n.value)));
    }
    if (!isNumber(a) || !isNumber(b)) throw new PracticeError(`You cannot use ${op} between ${a.type==='str'?'text':'this value'} and ${b.type==='str'?'text':'this value'} here.`,this.line,'input() returns text. Use float(...) to turn numeric text into a number before doing math.');
    if (op==='/' && b.value===0) throw new PracticeError('You cannot divide by zero.',this.line,'Change the number after / to something other than 0.');
    const value=op==='+'?a.value+b.value:op==='-'?a.value-b.value:op==='*'?a.value*b.value:a.value/b.value;
    if(Math.abs(value)>Number.MAX_SAFE_INTEGER && a.type==='int' && b.type==='int') throw new PracticeError('That integer is too large for this beginner runner.',this.line,'Use smaller practice numbers here; full Python supports larger integers.');
    return V(op==='/'||a.type==='float'||b.type==='float'?'float':'int',value);
  }
  call(name,args) {
    if (name==='print') { this.context.print(args.map(display).join(' ')); return V('NoneType',null); }
    if (name==='input') {
      if(args.length>1) throw new PracticeError('input() takes one prompt at most.',this.line);
      const index=this.context.inputIndex++;
      if(index>=this.context.inputs.length) throw {needInput:true,prompt:args.length?display(args[0]):'',line:this.line};
      this.context.events.push({type:'input',prompt:args.length?display(args[0]):'',answer:this.context.inputs[index]});
      return V('str',this.context.inputs[index]);
    }
    if (name==='float') {
      if(args.length>1) throw new PracticeError('float() takes one value at most.',this.line);
      if(!args.length) return V('float',0);
      if(isNumber(args[0])) return V('float',args[0].value);
      if(args[0].type!=='str') throw new PracticeError('float() needs numeric text or a number.',this.line);
      const s=args[0].value.trim();
      if(!/^[+-]?(?:(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|inf(?:inity)?|nan)$/i.test(s)) throw new PracticeError(`float() cannot turn ${JSON.stringify(args[0].value)} into a number.`,this.line,'Enter a number such as 19 or 12.5. Leave out dollar signs and commas.');
      return V('float',/^[+-]?inf/i.test(s)?(s.startsWith('-')?-Infinity:Infinity):Number(s));
    }
    throw new PracticeError(`${name}() is not included in this beginner practice runner.`,this.line,'Supported functions: print(), input(), and float(). The lessons explain each one.');
  }
  format(template) {
    let result='', p=0;
    while(p<template.length) {
      if(template.slice(p,p+2)==='{{') {result+='{';p+=2;continue;}
      if(template.slice(p,p+2)==='}}') {result+='}';p+=2;continue;}
      if(template[p]==='}') throw new PracticeError('This f-string has an extra closing brace }.',this.line,'Put a value inside matching braces, like {name}.');
      if(template[p]!=='{') {result+=template[p++];continue;}
      const end=template.indexOf('}',p+1);
      if(end<0) throw new PracticeError('This f-string needs a closing brace }.',this.line,'Example: f"Hello, {name}!"');
      const inside=template.slice(p+1,end), separator=inside.indexOf(':');
      const expression=separator<0?inside:inside.slice(0,separator), spec=separator<0?'':inside.slice(separator+1);
      const value=new Parser(tokenize(expression,this.line),this.context,this.line).parse();
      if(spec) {
        const match=spec.match(/^\.(\d{1,2})f$/);
        if(!match || Number(match[1])>10) throw new PracticeError('This runner supports formats from :.0f to :.10f.',this.line,'For money, :.2f shows a number with two digits after the decimal point.');
        if(!isNumber(value)) throw new PracticeError(':.2f and similar formats need a number.',this.line,'Convert numeric input with float() first.');
        result+=fixed(value.value,Number(match[1]));
      } else result+=display(value);
      p=end+1;
    }
    return result;
  }
}

export function runPython(code, inputs=[]) {
  const output=[], events=[], context={variables:Object.create(null),inputs,inputIndex:0,events,print:text=>{output.push(text);events.push({type:'output',text});}};
  if(code.length>20000) return {status:'error',output,variables:{},error:{message:'Keep practice code under 20,000 characters.',line:1,hint:''}};
  const lines=code.replace(/\r\n?/g,'\n').split('\n');
  let line=1;
  try {
    for(let i=0;i<lines.length;i++) {
      line=i+1; const source=lines[i];
      if(!source.trim()||source.trim().startsWith('#')) continue;
      if(/^\s/.test(source)) throw new PracticeError('This beginner example does not need spaces at the start of a line.',line,'Keep each statement against the left edge. Indented blocks are a later topic.');
      const tokens=tokenize(source,line);
      if(tokens[0].kind==='name' && tokens[1].kind==='=') {
        const name=tokens[0].value;
        if(['print','input','float','if','else','for','while','def','import','True','False','None','class','return','in','and','or','not','try','except','with','as','pass','break','continue','lambda','from','is','del','global','nonlocal','assert','raise','yield','async','await','elif','finally'].includes(name)) throw new PracticeError(`Choose a variable name other than "${name}".`,line,'That name is reserved or is a function used in this workspace. Try name, hours, or pay.');
        context.variables[name]=new Parser(tokens.slice(2),context,line).parse();
      } else new Parser(tokens,context,line).parse();
    }
    return {status:'complete',output,events,variables:{...context.variables},inputCount:context.inputIndex};
  } catch(error) {
    if(error.needInput) return {status:'input',output,events,variables:{...context.variables},prompt:error.prompt,line:error.line,inputCount:context.inputIndex};
    return {status:'error',output,events,variables:{...context.variables},error:{message:error.message||'Check the syntax on this line.',line:error.line||line,hint:error.hint||'Use the supported syntax shown in the lessons.'}};
  }
}
