// L-System variables
let axiom = 'X';
let sentence = axiom;
let len = 150; 
let angle;
let generation = 0;

// A more complex, organic set of rules
const rules = {
	X: 'F+[[X]-X]-F[-FX]+X',
	F: 'FF'
};

// The setup function runs once when the sketch starts
function setup() {
	createCanvas(600, 600);
	angle = radians(25);
	
	const button = createButton('Generate Next');
	button.mousePressed(generate);
	
	drawFractal(); // Initial draw
}

// This function generates the next iteration of the sentence
function generate() {
	len *= 0.55; // We can fine-tune this multiplier for best results
	generation++;
	let nextSentence = '';

	for (let i = 0; i < sentence.length; i++) {
		const current = sentence.charAt(i);
		// Check if the current character has a rule in our rules object
		if (rules.hasOwnProperty(current)) {
			nextSentence += rules[current];
		} else {
			// If no rule, just keep the character as is (e.g., for '+', '-', '[', ']')
			nextSentence += current;
		}
	}
	sentence = nextSentence;
	drawFractal(); // Redraw with the new sentence
}

// This function tells the turtle how to draw based on the sentence
// NOTE: No changes are needed here! The turtle automatically ignores 'X'.
function turtle() {
	for (let i = 0; i < sentence.length; i++) {
		const current = sentence.charAt(i);

		if (current == 'F') {
			line(0, 0, 0, -len);
			translate(0, -len);
		} else if (current == '+') {
			rotate(angle);
		} else if (current == '-') {
			rotate(-angle);
		} else if (current == '[') {
			push();
		} else if (current == ']') {
			pop();
		}
	}
}

// Central function to handle all the drawing logic
function drawFractal() {
	background(50);
	fill(255);
	noStroke();
	text('Generation: ' + generation, 10, 20);
	
	stroke(255);
	strokeWeight(1.5);

	resetMatrix();
	translate(width / 2, height); 
	
	turtle(); // Draw the fractal
}

// The draw function is not used in this version
function draw() {
	noLoop();
}