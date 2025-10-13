// L-System variables
let axiom = 'F';
let sentence = axiom;
let len = 150; 
let angle;
let generation = 0;

// Note the new rule with branching symbols '[' and ']'
const rules = {
	F: 'F[+F]F[-F]F'
};

// The setup function runs once when the sketch starts
function setup() {
	createCanvas(600, 600);
	// Using a smaller angle for more plant-like growth
	angle = radians(25);
	
	// Create a button to generate the next iteration
	const button = createButton('Generate Next');
	button.mousePressed(generate);
	
	drawFractal(); // Initial draw
}

// This function generates the next iteration of the sentence
function generate() {
	// Let's use a multiplier to shrink the length
	len *= 0.5; 
	generation++;
	let nextSentence = '';

	for (let i = 0; i < sentence.length; i++) {
		const current = sentence.charAt(i);
		if (current == 'F') {
			nextSentence += rules.F;
		} else {
			nextSentence += current;
		}
	}
	sentence = nextSentence;
	drawFractal(); // Redraw with the new sentence
}

// This function tells the turtle how to draw based on the sentence
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
			push(); // Save the current transformation state
		} else if (current == ']') {
			pop();  // Restore the previous transformation state
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
	// Start drawing from the bottom-middle of the canvas
	translate(width / 2, height); 
	
	turtle(); // Draw the fractal
}

// The draw function is not used in this version
function draw() {
	noLoop(); // Stop p5.js from looping the draw() function
}