// Constants for the Honda tree model from the book
const r1 = 0.9; // Contraction ratio for the trunk
const r2 = 0.6; // Contraction ratio for branches
const a0 = 45;  // Branching angle from the trunk
const a2 = 45;  // Branching angle for lateral axes
const s = 137.5; // Divergence angle
const wr = 0.707; // Width decrease rate

// The axiom is an array of objects
let axiom = [{ char: 'A', params: [100, 10] }]; // Start with length 100, width 10
let sentence = axiom;
let generation = 0;

let treeGeometry; // <-- ADDED: Will hold our 3D model

// Jitter setup
const JITTER_DEG = 30;                 // max jitter ±30°
const jitter = (amp = JITTER_DEG) => (Math.random() * 2 - 1) * amp;

const rules = {
	// ... (rules are unchanged) ...
	A: (l, w) => [
		{ char: '!', params: [w] }, { char: 'F', params: [l] }, { char: '[' },
		{ char: '&', params: [a0] }, { char: 'B', params: [l * r2, w * wr] }, { char: ']' },
		{ char: '/', params: [s] }, { char: 'A', params: [l * r1, w * wr] }
	],
	B: (l, w) => [
		{ char: '!', params: [w] }, { char: 'F', params: [l] }, { char: '[' },
		{ char: '/', params: [jitter()] },
		{ char: '-', params: [a2] }, { char: '$' },
		{ char: 'C', params: [l * r2, w * wr] }, { char: ']' },
		{ char: '/', params: [jitter()] },
		{ char: 'C', params: [l * r1, w * wr] }
	],
	C: (l, w) => [
		{ char: '!', params: [w] }, { char: 'F', params: [l] }, { char: '[' },
		{ char: '/', params: [jitter()] },
		{ char: '+', params: [a2] }, { char: '$' },
		{ char: 'B', params: [l * r2, w * wr] }, { char: ']' },
		{ char: '/', params: [jitter()] },
		{ char: 'B', params: [l * r1, w * wr] }
	]
};

function setup() {
	createCanvas(600, 600, WEBGL);
	const button = createButton('Generate Next');
	button.mousePressed(generate);

	// We build the geometry once at the start
	generateTreeGeometry(); 
}

function generate() {
	generation++;
	let nextSentence = [];
	
	for (const module of sentence) {
		const rule = rules[module.char];
		if (rule) {
			const newModules = rule(...module.params);
			nextSentence.push(...newModules);
		} else {
			nextSentence.push(module);
		}
	}
	sentence = nextSentence;

	console.log(`Generation ${generation}:`, sentence); 
	
	// Re-build the geometry every time we generate
	generateTreeGeometry();
	// We don't call drawFractal() here, the main draw() 
	// loop will handle rendering the 'treeGeometry'
}

// ... (constants, axiom, rules, setup, generate functions are unchanged) ...

// ... (constants, axiom, rules, setup, generate functions are unchanged) ...

function generateTreeGeometry() {
	// ... (treeGeometry, currentPosition, stack, currentWidth, heading, up, left initializations) ...
	treeGeometry = new p5.Geometry();
	let currentPosition = createVector(0, 0, 0);
	let stack = [];
    
	let currentWidth = axiom[0].params[1]; 
	let heading = createVector(0, 0, -1);
	let up = createVector(0, 1, 0);
	let left = createVector(-1, 0, 0); 
    
	for (const module of sentence) {
		switch (module.char) {
			case '!': 
				currentWidth = module.params[0];
				break;
			case 'F': 
				// TODO
				break;
			case '+': 
				// TODO
				break;
			case '-': 
				// TODO
				break;
			case '&': 
				// TODO
				break;
			case '^': 
				// TODO
				break;
			case '/': 
				// TODO
				break;
			case '\\': 
				// TODO
				break;
			case '$': 
				// TODO
				break;

			// --- ADDED FOR SUBTASK 1.3 ---
			case '[': // Push state
				// Save a copy of the current state onto the stack
				stack.push({
					pos: currentPosition.copy(),
					heading: heading.copy(),
					up: up.copy(),
					left: left.copy(),
					width: currentWidth 
				});
				break;
			case ']': // Pop state
				// Restore the last saved state from the stack
				const state = stack.pop();
				currentPosition = state.pos;
				heading = state.heading;
				up = state.up;
				left = state.left;
				currentWidth = state.width;
				break;
			// --- END OF ADDED CODE ---
		}
	}
    
	// ... (rest of function) ...
}

// ... (drawFractal, draw functions are unchanged for now) ...

// ... (drawFractal, draw functions are unchanged for now) ...



function drawFractal() {
	background(50);
	resetMatrix();
	
	// Move the starting point down.
	translate(0, 200, 0); 
	
	stroke(255);
	// TODO: This will be changed to 'model(treeGeometry)'
	// turtle(); // <-- REMOVED and will be replaced
}

function draw() {
	orbitControl();
	drawFractal();
}