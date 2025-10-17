// Constants for the Honda tree model from the book
const r1 = 0.9; // Contraction ratio for the trunk
const r2 = 0.9; // Contraction ratio for branches
const a0 = 45;  // Branching angle from the trunk
const a2 = 60;  // Branching angle for lateral axes
const s = 137.5; // Divergence angle
const wr = 0.707; // Width decrease rate

// The axiom is an array of objects
let axiom = [{ char: 'A', params: [100, 10] }]; // Start with length 100, width 10
let sentence = axiom;
let generation = 0;

// Rules are functions that return arrays of new module objects.
const rules = {
	A: (l, w) => [
		{ char: '!', params: [w] }, { char: 'F', params: [l] }, { char: '[' },
		{ char: '&', params: [a0] }, { char: 'B', params: [l * r2, w * wr] }, { char: ']' },
		{ char: '/', params: [s] }, { char: 'A', params: [l * r1, w * wr] }
	],
	B: (l, w) => [
		{ char: '!', params: [w] }, { char: 'F', params: [l] }, { char: '[' },
		{ char: '-', params: [a2] }, { char: '$' }, { char: 'C', params: [l * r2, w * wr] }, { char: ']' },
		{ char: 'C', params: [l * r1, w * wr] }
	],
	C: (l, w) => [
		{ char: '!', params: [w] }, { char: 'F', params: [l] }, { char: '[' },
		{ char: '+', params: [a2] }, { char: '$' }, { char: 'B', params: [l * r2, w * wr] }, { char: ']' },
		{ char: 'B', params: [l * r1, w * wr] }
	]
};

function setup() {
	createCanvas(600, 600, WEBGL);
	const button = createButton('Generate Next');
	button.mousePressed(generate);
	drawFractal();
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

	// ADDED: Debug message to see the sentence in the console
	console.log(`Generation ${generation}:`, sentence); 
	
	drawFractal(); 
}

function turtle() {
	for (const module of sentence) {
		switch (module.char) {
			case '!': // Set line width
				strokeWeight(module.params[0]);
				break;
			case 'F': // Move forward and draw a line
				line(0, 0, 0, 0, 0, -module.params[0]);
				translate(0, 0, -module.params[0]);
				break;
			case '+': // Turn Right (Yaw)
				rotateY(radians(-module.params[0]));
				break;
			case '-': // Turn Left (Yaw)
				rotateY(radians(module.params[0]));
				break;
			case '&': // Pitch Down
				rotateX(radians(module.params[0]));
				break;
			case '^': // Pitch Up
				rotateX(radians(-module.params[0]));
				break;
			case '/': // Roll Right
				rotateZ(radians(module.params[0]));
				break;
			case '\\': // Roll Left
				rotateZ(radians(-module.params[0]));
				break;
			case '$': // Roll 180 degrees
				rotateZ(radians(180));
				break;
			case '[': // Push state
				push();
				break;
			case ']': // Pop state
				pop();
				break;
		}
	}
}



function drawFractal() {
	background(50);
	resetMatrix();
	
	// Since the tree now "grows" along the Z-axis (forward), we need to
	// rotate the whole scene so we can see it standing up.
	// 1. Move the starting point down.
	translate(0, 200, 0); 
	// 2. Rotate it 90 degrees to make it stand up vertically.
	rotateX(radians(-90)); 
	
	stroke(255);
	turtle();
}

function draw() {
	noLoop();
}