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

// RENAMED from turtle() to generateTreeGeometry()
function generateTreeGeometry() {
	// ADDED: Initialize the geometry object and state variables
	treeGeometry = new p5.Geometry();
	let currentPosition = createVector(0, 0, 0);
	let stack = [];
    
	// We'll add orientation vectors in the next step

	for (const module of sentence) {
		switch (module.char) {
			case '!': // Set line width
				// TODO: Store this width in a variable
				// strokeWeight(module.params[0]); // <-- REMOVED
				break;
			case 'F': // Move forward and draw a line
				// TODO: Calculate new position and add cylinder
				// line(0, 0, 0, 0, 0, -module.params[0]); // <-- REMOVED
				// translate(0, 0, -module.params[0]); // <-- REMOVED
				break;
			case '+': // Turn Right (Yaw)
				// TODO: Apply yaw rotation to our vectors
				// rotateY(radians(-module.params[0])); // <-- REMOVED
				break;
			case '-': // Turn Left (Yaw)
				// TODO: Apply yaw rotation to our vectors
				// rotateY(radians(module.params[0])); // <-- REMOVED
				break;
			case '&': // Pitch Down
				// TODO: Apply pitch rotation to our vectors
				// rotateX(radians(module.params[0])); // <-- REMOVED
				break;
			case '^': // Pitch Up
				// TODO: Apply pitch rotation to our vectors
				// rotateX(radians(-module.params[0])); // <-- REMOVED
				break;
			case '/': // Roll Right
				// TODO: Apply roll rotation to our vectors
				// rotateZ(radians(module.params[0])); // <-- REMOVED
				break;
			case '\\': // Roll Left
				// TODO: Apply roll rotation to our vectors
				// rotateZ(radians(-module.params[0])); // <-- REMOVED
				break;
			case '$': // Roll 180 degrees
				// TODO: Apply roll rotation to our vectors
				// rotateZ(-radians(180)); // <-- REMOVED
				break;
			case '[': // Push state
				// TODO: Push our state onto the 'stack' array
				// push(); // <-- REMOVED
				break;
			case ']': // Pop state
				// TODO: Pop our state from the 'stack' array
				// pop(); // <-- REMOVED
				break;
		}
	}
    
	// After the loop, we should finalize the geometry
	// (We'll add computation steps here later)
}



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