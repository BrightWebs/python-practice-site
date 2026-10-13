export const glossary = {
  print:{label:'print(...)',meaning:'Shows a value in the output area. It does not save that value.',why:'Use it to see a result or check what your code is doing.',example:'print("Hello")',detail:'print is a function: a named instruction you can call. The parentheses hold what you want to show. Text goes inside matching quotes.'},
  strings:{label:'"text"',meaning:'Quotes tell Python that something is text. Text is also called a string; its type is abbreviated str in the variable table.',why:'Use text for names, questions, and messages.',example:'"Python practice"',detail:'Single quotes and double quotes both work. Open and close with the same kind.'},
  parentheses:{label:'( )',meaning:'After a function name, parentheses hold the values you give it. In math, parentheses group a calculation.',why:'They tell Python what belongs to the function or what math to do first.',example:'print("Hello")',detail:'Every opening ( needs a closing ). Nested calls finish the inside call first.'},
  commas:{label:',',meaning:'A comma separates values given to a function.',why:'print() can show several values on one line, putting a space between them.',example:'print("Hours:", hours)',detail:'The comma separates arguments (the values you give a function). It is not printed.'},
  variables:{label:'name = value',meaning:'A variable is a name that refers to a value. The equals sign gives that name its value.',why:'Save a value so you can use it later without typing it again.',example:'hours = 19',detail:'This = means assign, not ask whether two things are equal. Names are case-sensitive: hours and Hours are different.'},
  numbers:{label:'19 and 12.5',meaning:'A whole number like 19 is an int (integer). A decimal number like 12.5 is a float.',why:'Use numbers for calculations. A number inside quotes is text instead.',example:'hours = 12.5',detail:'19 is a number. "19" is text. That difference matters when you do math.'},
  input:{label:'input(...)',meaning:'Asks for a response and gives your code that response as text.',why:'Use it when the person running the code should choose the value.',example:'name = input("Your name: ")',detail:'The text in parentheses is the prompt (the question). Even entering 19 returns "19" as text.'},
  strip:{label:'.strip()',meaning:'Removes whitespace, such as spaces and tabs, from the beginning and end of text.',why:'Clean accidental spaces from an answer someone types.',example:'clean_name = name.strip()',detail:'The dot means use a method belonging to that text. The empty parentheses use the default whitespace cleanup. Spaces in the middle stay. The original text is unchanged unless you save the new result to its name.'},
  float:{label:'float(...)',meaning:'Turns numeric text into a decimal number you can calculate with.',why:'input() returns text, so convert answers before doing math.',example:'hours = float(input("Hours: "))',detail:'The inside input() runs first. Then float() converts its answer. "12.5" works; "twelve" does not.'},
  math:{label:'+  −  *  /',meaning:'In code, + adds, - subtracts, * multiplies, and / divides.',why:'Turn saved numbers into a useful result.',example:'gross = hours * rate * weeks',detail:'Multiplication and division happen before addition and subtraction. Parentheses can change the order. Division produces a float, even for 10 / 2.'},
  fstrings:{label:'f"Hello, {name}"',meaning:'An f-string is text with values inserted into it. The f goes directly before the opening quote.',why:'Make a readable sentence using your variables.',example:'print(f"Hello, {name}!")',detail:'Python works out the value inside each pair of { } braces and puts it into the text. Ordinary strings do not replace braces.'},
  formatting:{label:'{pay:.2f}',meaning:'Inside an f-string, :.2f displays a number with two digits after the decimal point.',why:'Make amounts look tidy, like 37.50 instead of 37.5.',example:'print(f"Pay: ${pay:.2f}")',detail:'The colon starts the format instruction. .2 means two decimal places; f means fixed-point number display. This changes the displayed text, not the saved number. The $ is just ordinary text.'},
  comments:{label:'# a note',meaning:'A # starts a comment: a note that Python does not run.',why:'Leave a reminder about what a line does.',example:'# Calculate the total',detail:'A # inside quotes is just text. Outside quotes, Python ignores the rest of that line.'},
  escapes:{label:'\\n and \\t',meaning:'Inside quoted text, \\n creates a new line and \\t creates a tab.',why:'Control how a message is laid out.',example:'print("Hello\\nPython")',detail:'The backslash starts an escape sequence. \\" puts a double quote inside double-quoted text; \\\\ represents one backslash.'},
  textmath:{label:'text + text',meaning:'With two text values, + joins the text. A string times a whole number repeats it.',why:'Build text from smaller pieces or repeat a pattern.',example:'print("Hello, " + name)',detail:'"Hi" + "!" gives "Hi!". "Hi" * 2 gives "HiHi". Mixing text and a number with + causes an error; use a comma in print() or an f-string.'},
};
const tip=(syntax,title,meaning,why)=>({syntax,title,meaning,why});
export const lessons = [
  {
    id:'print',title:'Say something',subtitle:'print & text',time:'4 min',concepts:['print','strings','parentheses','commas'],
    intro:'Start with one small win: make Python show a message. Change the text, run the code, and see what happens.',
    code:'print("Hello, Bright!")\nprint("I am learning Python.")\nprint("Favorite food:", "Pizza")',
    lineTips:[tip('print("Hello, Bright!")','Show a message','print shows the text inside its parentheses. The quotes mark the words as text.','Use this when you want your program to say something.'),tip('"I am learning Python."','Text stays text','Python shows the words without showing the surrounding quotes.','Quotes let Python tell your message apart from a variable name.'),tip(',','Show two things','The comma separates two pieces of text. print puts a space between them.','Useful for showing a label and a value together.')],
    sampleInputs:[],sampleOutput:['Hello, Bright!','I am learning Python.','Favorite food: Pizza'],
    task:'Change the favorite food from Pizza to any food you like. Keep a line that shows "Favorite food:" and your new choice.',
    hint:'Edit the text inside the final pair of quotes. You can pick anything, such as "Rice".',
    solution:'print("Hello, Bright!")\nprint("I am learning Python.")\nprint("Favorite food:", "Rice")',
    check:r=>r.output.some(s=>/^Favorite food:\s*\S/i.test(s)&&!/^Favorite food:\s*Pizza\s*$/i.test(s)),
    success:'You changed a string and used print() to show your own choice.'
  },
  {
    id:'variables',title:'Give values names',subtitle:'variables & numbers',time:'5 min',concepts:['variables','strings','numbers','print','commas'],
    intro:'A variable lets you give a value a useful name. You can change the value in one place and reuse it below.',
    code:'name = "Bright"\nhours = 19\nprint("Name:", name)\nprint("Hours:", hours)',
    lineTips:[tip('name = "Bright"','Save some text','The = assigns the text "Bright" to the variable name.','You can reuse name instead of typing "Bright" again.'),tip('hours = 19','Save a number','19 has no quotes, so Python treats it as a whole number: an int.','A number can be used in a calculation later.'),tip('print("Name:", name)','Read a saved value','name has no quotes here. Python looks up its saved value.','If you wrote "name", Python would print the word name instead.'),tip('print("Hours:", hours)','Use a variable again','print reads the number saved in hours and shows it beside the label.','Check the variable table below to see both its value and its type.')],
    sampleInputs:[],sampleOutput:['Name: Bright','Hours: 19'],
    task:'Change hours to 12.5, then run the code. Keep the variable named hours and show its value in the output.',
    hint:'Replace 19 with 12.5. Leave the number outside quotes so it stays a number.',
    solution:'name = "Bright"\nhours = 12.5\nprint("Name:", name)\nprint("Hours:", hours)',
    check:r=>r.variables.hours?.type==='float'&&r.variables.hours.value===12.5&&r.output.some(s=>s.includes('12.5')),
    success:'You saved a decimal number in a variable and displayed its value.'
  },
  {
    id:'input',title:'Make it personal',subtitle:'input & prompts',time:'5 min',concepts:['input','variables','strings','print','commas','parentheses'],
    intro:'Let the person running the program choose a value. When input() runs, type your answer in the output area and press Enter.',
    code:'name = input("What is your name? ")\nprint("Hello,", name)',
    lineTips:[tip('input("What is your name? ")','Ask a question','input displays this prompt, waits for your answer, and returns it as text. name saves that answer.','Use input when a value should come from the person running the program.'),tip('print("Hello,", name)','Use the answer','The comma separates the greeting and the saved answer. print adds a space between them.','You get a greeting that changes for each person.')],
    sampleInputs:['Bright'],sampleOutput:['Hello, Bright'],
    task:'Add a second question that saves a favorite food in food. Print a line that shows the answer. Run it and answer both questions.',
    hint:'Add food = input("Favorite food? ") and then print("You chose:", food). Each input() asks for one response.',
    solution:'name = input("What is your name? ")\nfood = input("Favorite food? ")\nprint("Hello,", name)\nprint("You chose:", food)',
    check:r=>r.inputCount>=2&&r.variables.food?.type==='str'&&r.variables.food.value.trim().length>0&&r.output.some(s=>s.includes(r.variables.food.value)),
    success:'Your program collected two answers and used a saved answer in its output.'
  },
  {
    id:'strip',title:'Clean up an answer',subtitle:'.strip() & methods',time:'5 min',concepts:['strip','variables','strings','input','print','commas','parentheses'],
    intro:'Accidental spaces can make two answers look different. .strip() removes whitespace from the ends and keeps the spaces in the middle.',
    code:'name = "  Bright Chitoro  "\nclean_name = name.strip()\nprint("Before:", name)\nprint("After:", clean_name)',
    lineTips:[tip('"  Bright Chitoro  "','Spaces are part of text','The spaces inside the quotes are saved along with the name.','The variable table shows quotes so you can spot those extra spaces.'),tip('name.strip()','Use a text method','The dot connects the text to strip. The empty () uses its default cleanup. It returns new text with the outer spaces removed.','Save the returned text in clean_name. name still contains the original spaces.'),tip('print("Before:", name)','See the original','This displays the original name, including its extra spaces.','Compare it with the cleaned version.'),tip('print("After:", clean_name)','See the result','The space between Bright and Chitoro stays. Only the spaces at the ends are removed.','Use clean text when you compare or display someone\'s answer.')],
    sampleInputs:[],sampleOutput:['Before:   Bright Chitoro  ','After: Bright Chitoro'],
    task:'Change name to "  Python practice  ". Use .strip() to save "Python practice" in clean_name and display it.',
    hint:'Keep the two words separated by a space. .strip() removes the spaces outside them, not between them.',
    solution:'name = "  Python practice  "\nclean_name = name.strip()\nprint("Before:", name)\nprint("After:", clean_name)',
    check:(r,code)=>r.variables.clean_name?.value==='Python practice'&&code.includes('.strip()')&&r.output.some(s=>s.includes('Python practice')),
    success:'You cleaned the outer spaces while preserving the space between words.'
  },
  {
    id:'float',title:'Turn text into a number',subtitle:'float & nested calls',time:'6 min',concepts:['float','input','parentheses','numbers','variables','print','commas'],
    intro:'Even when you type a number, input() returns text. float() turns numeric text into a decimal number, ready for calculations.',
    code:'hours = float(input("How many hours? "))\nprint("Hours:", hours)',
    lineTips:[tip('float(input("How many hours? "))','Work from the inside out','input first collects text, such as "19". float then converts that text to the number 19.0. hours saves the number.','This combines collecting a number and converting it into one line.'),tip('print("Hours:", hours)','Check the number','The variable table says float because hours now stores a decimal number.','A float can store 19.0 or 12.5, so partial hours work too.')],
    sampleInputs:['19'],sampleOutput:['Hours: 19.0'],
    task:'Run the code and enter 12.5. Check that hours is saved as a float and that the output shows 12.5.',
    hint:'Type 12.5 into the answer box when the program asks. Do not include quotation marks or a dollar sign.',
    solution:'hours = float(input("How many hours? "))\nprint("Hours:", hours)',
    check:r=>r.inputCount>=1&&r.variables.hours?.type==='float'&&r.variables.hours.value===12.5&&r.output.some(s=>s.includes('12.5')),
    success:'You converted an input answer into a number that can be used in math.'
  },
  {
    id:'math',title:'Make a calculation',subtitle:'arithmetic & grouping',time:'6 min',concepts:['math','variables','numbers','parentheses','print','commas'],
    intro:'Use numbers and variables to calculate something useful. This example multiplies hours, rate, and weeks. The figures are practice values.',
    code:'hours = 19\nrate = 13\nweeks = 2\ngross = hours * rate * weeks\nprint("Gross pay:", gross)',
    lineTips:[tip('hours = 19','Choose the hours','hours saves a whole number.','A named number makes the calculation easier to read.'),tip('rate = 13','Choose the rate','rate saves the amount used for each hour in this practice example.','Change one value and run again to see the effect.'),tip('weeks = 2','Choose the weeks','weeks is how many identical weeks the example includes.','The calculation assumes the same hours each week.'),tip('hours * rate * weeks','Multiply the values','* means multiply. 19 × 13 × 2 gives 494, which is saved in gross.','Use * in Python instead of a written multiplication sign.'),tip('print("Gross pay:", gross)','Show the calculation','gross has no quotes, so print uses its saved number.','You can inspect the result without repeating the math.')],
    sampleInputs:[],sampleOutput:['Gross pay: 494'],
    task:'Add deduction = 25, then calculate net = gross - deduction. Print net so the output includes 469.',
    hint:'The - symbol subtracts. Put net = gross - deduction after the line that creates gross.',
    solution:'hours = 19\nrate = 13\nweeks = 2\ngross = hours * rate * weeks\ndeduction = 25\nnet = gross - deduction\nprint("Gross pay:", gross)\nprint("After deduction:", net)',
    check:r=>r.variables.gross?.value===494&&r.variables.deduction?.value===25&&r.variables.net?.value===469&&r.output.some(s=>s.includes('469')),
    success:'You reused a calculated value and subtracted a practice deduction.'
  },
  {
    id:'fstrings',title:'Build a clear message',subtitle:'f-strings & money display',time:'6 min',concepts:['fstrings','formatting','strings','variables','numbers','print','parentheses'],
    intro:'An f-string puts saved values inside a message. Add :.2f when you want a number to display with two decimal places.',
    code:'name = "Bright"\npay = 494.0\nprint(f"Hello, {name}!")\nprint(f"Practice pay: ${pay:.2f}")',
    lineTips:[tip('name = "Bright"','Save the name','A quoted string is saved in name.','The f-string below can insert this saved text.'),tip('pay = 494.0','Save a decimal number','The decimal point makes pay a float.','A number can be formatted with a chosen number of decimal places.'),tip('f"Hello, {name}!"','Insert a value','f before the quote enables value insertion. {name} is replaced with the value saved in name.','The result is Hello, Bright! rather than the literal words {name}.'),tip('${pay:.2f}','Format the display','Inside the braces, pay selects the value; the colon starts formatting; .2f asks for two decimal places. $ is ordinary text outside the braces.','The display becomes $494.00. pay keeps its original numeric value.')],
    sampleInputs:[],sampleOutput:['Hello, Bright!','Practice pay: $494.00'],
    task:'Add savings = 37.5 and show "Savings: $37.50" using an f-string and :.2f.',
    hint:'Add print(f"Savings: ${savings:.2f}") after creating savings. The f belongs before the opening quote.',
    solution:'name = "Bright"\npay = 494.0\nsavings = 37.5\nprint(f"Hello, {name}!")\nprint(f"Practice pay: ${pay:.2f}")\nprint(f"Savings: ${savings:.2f}")',
    check:(r,code)=>r.variables.savings?.value===37.5&&r.output.includes('Savings: $37.50')&&/f["']/.test(code)&&code.includes('savings:.2f'),
    success:'You inserted a variable into a message and formatted its number to two decimal places.'
  },
  {
    id:'calculator',title:'Put it all together',subtitle:'your practice pay calculator',time:'8 min',concepts:['input','strip','float','variables','math','numbers','parentheses','fstrings','formatting','print'],
    intro:'Build on your pay calculator idea. Collect a name, hours, and rate; calculate a total; then display it clearly. These are coding practice figures, not a payroll estimate.',
    code:'name = input("Your name: ").strip()\nhours = float(input("Hours per week: "))\nrate = float(input("Hourly rate: "))\nweeks = 2\ngross = hours * rate * weeks\nprint(f"Hello, {name}!")\nprint(f"Practice total: ${gross:.2f}")',
    lineTips:[tip('input("Your name: ").strip()','Collect and clean text','input returns the typed name. .strip() returns a copy without outer whitespace. name saves the clean copy.','A greeting should not contain accidental extra spaces.'),tip('float(input("Hours per week: "))','Collect hours as a number','input runs first, then float converts its text answer.','Decimal hours, such as 12.5, can be used in the calculation.'),tip('float(input("Hourly rate: "))','Collect the rate','The response becomes a float saved in rate.','Use a number such as 13, without a dollar sign.'),tip('weeks = 2','Choose the number of weeks','weeks stores a whole number.','This example includes two identical weeks.'),tip('gross = hours * rate * weeks','Calculate the total','The three numbers are multiplied and the answer is saved in gross.','A later line can display or reuse gross.'),tip('f"Hello, {name}!"','Make the greeting','The f enables value insertion; braces select the name to insert.','Use the cleaned name in a readable message.'),tip('f"Practice total: ${gross:.2f}"','Display two decimal places','The braces select gross and :.2f formats it with two digits after the decimal point.','This changes the displayed text, not gross itself.')],
    sampleInputs:['  Bright  ','19','13'],sampleOutput:['Hello, Bright!','Practice total: $494.00'],
    task:'Add savings = 25, calculate remaining = gross - savings, and show "After savings: $469.00" with an f-string. Test with a name, 19 hours, and a rate of 13.',
    hint:'Place savings = 25 and remaining = gross - savings after gross is created. Then add print(f"After savings: ${remaining:.2f}").',
    solution:'name = input("Your name: ").strip()\nhours = float(input("Hours per week: "))\nrate = float(input("Hourly rate: "))\nweeks = 2\ngross = hours * rate * weeks\nsavings = 25\nremaining = gross - savings\nprint(f"Hello, {name}!")\nprint(f"Practice total: ${gross:.2f}")\nprint(f"After savings: ${remaining:.2f}")',
    check:(r,code)=>r.inputCount>=3&&r.variables.name?.value.trim().length>0&&r.variables.name.value===r.variables.name.value.trim()&&r.variables.gross?.value===494&&r.variables.savings?.value===25&&r.variables.remaining?.value===469&&r.output.includes('After savings: $469.00')&&code.includes('.strip()')&&code.includes('remaining:.2f'),
    success:'You collected input, cleaned text, converted numbers, calculated a result, and displayed it in your own mini program.'
  },
];

export function conceptsInCode(code) {
  const found=[]; const add=k=>{if(!found.includes(k))found.push(k);};
  if(/\bprint\s*\(/.test(code))add('print');
  if(/["']/.test(code))add('strings');
  if(/[()]/.test(code))add('parentheses');
  if(/,/.test(code))add('commas');
  if(/^\s*[A-Za-z_]\w*\s*=/m.test(code))add('variables');
  if(/\d/.test(code))add('numbers');
  if(/\binput\s*\(/.test(code))add('input');
  if(/\.strip\s*\(/.test(code))add('strip');
  if(/\bfloat\s*\(/.test(code))add('float');
  if(/[+*/-]/.test(code))add('math');
  if(/f["']/.test(code))add('fstrings');
  if(/:\.\d+f/.test(code))add('formatting');
  if(/#/.test(code))add('comments');
  if(/\\[ntr"'\\]/.test(code))add('escapes');
  if(/["'][^\n]*[+*]/.test(code))add('textmath');
  return found;
}
