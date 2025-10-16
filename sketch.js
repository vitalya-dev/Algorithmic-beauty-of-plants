// NEW: Constants for the Honda tree model from the book
const n = 10; // This will control the number of generations, but we'll still use the button for now.
const r1 = 0.9; // Contraction ratio for the trunk
const r2 = 0.6; // Contraction ratio for branches
const a0 = 45;  // Branching angle from the trunk
const a2 = 45;  // Branching angle for lateral axes
const s = 137.5; // Divergence angle
const wr = 0.707; // Width decrease rate

// NEW: The axiom is now an array of objects
let axiom = [{ char: 'A', params: [100, 10] }]; // Start with length 100, width 10
let sentence = axiom;

let generation = 0;

// NEW: Rules are now functions that return arrays of new module objects.
const rules = {
	// A(l,w) -> !(w)F(l)[&(a0)B(l*r2,w*wr)]/(s)A(l*r1,w*wr)
	A: (l, w) => [
		{ char: '!', params: [w] },
		{ char: 'F', params: [l] },
		{ char: '[' },
		{ char: '&', params: [a0] },
		{ char: 'B', params: [l * r2, w * wr] },
		{ char: ']' },
		{ char: '/', params: [s] },
		{ char: 'A', params: [l * r1, w * wr] }
	],
	// B(l,w) -> !(w)F(l)[-(a2)$C(l*r2,w*wr)]C(l*r1,w*wr)
	B: (l, w) => [
		{ char: '!', params: [w] },
		{ char: 'F', params: [l] },
		{ char: '[' },
		{ char: '-', params: [a2] },
		{ char: '$' },
		{ char: 'C', params: [l * r2, w * wr] },
		{ char: ']' },
		{ char: 'C', params: [l * r1, w * wr] }
	],
	// C(l,w) -> !(w)F(l)[+(a2)$B(l*r2,w*wr)]B(l*r1,w*wr)
	C: (l, w) => [
		{ char: '!', params: [w] },
		{ char: 'F', params: [l] },
		{ char: '[' },
		{ char: '+', params: [a2] },
		{ char: '$' },
		{ char: 'B', params: [l * r2, w * wr] },
		{ char: ']' },
		{ char: 'B', params: [l * r1, w * wr] }
	]
};

function setup() {
	createCanvas(600, 600, WEBGL);
	
	const button = createButton('Generate Next');
	button.mousePressed(generate);
	
	drawFractal(); // Initial draw
}

// NEW: The generate function is rewritten to handle the array of objects
function generate() {
	generation++;
	let nextSentence = [];
	
	for (const module of sentence) {
		const rule = rules[module.char];
		if (rule) {
			// If a rule exists, call it with the module's parameters
			const newModules = rule(...module.params);
			nextSentence.push(...newModules);
		} else {
			// If no rule, it's a constant like '[', ']', '+', etc. Just copy it.
			nextSentence.push(module);
		}
	}
	sentence = nextSentence;
	// You can uncomment the line below to see the generated sentence in the console!
	// console.log(sentence); 
	drawFractal(); 
}

// This function tells the turtle how to draw based on the sentence
// NOTE: This function is now BROKEN and will be fixed in Subtask 3.
function turtle() {
	// The old code looping through a string will not work here.
	// We leave it empty for now.
}

// Central function to handle all the drawing logic
function drawFractal() {
	background(50);
	resetMatrix();
	// Let's position the origin a bit lower on the screen
	translate(0, 200, 0);
	// We also rotate it slightly on the X-axis to get a better initial view
	rotateX(radians(-30));
	
	stroke(255);
	turtle(); // Draw the fractal
}

function draw() {
	noLoop();
}