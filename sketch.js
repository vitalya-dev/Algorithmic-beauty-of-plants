// L-System variables
let axiom = 'X';
let sentence = axiom;
let len = 150;
let angle;
let generation = 0;
// We will manage this variable inside the turtle function
let strokeWidth; 

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
	len *= 0.55;
	generation++;
	// The logic for strokeWidth is no longer needed here.
	
	let nextSentence = '';
	for (let i = 0; i < sentence.length; i++) {
		const current = sentence.charAt(i);
		if (rules.hasOwnProperty(current)) {
			nextSentence += rules[current];
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
			// Set the stroke weight for this specific line segment
			strokeWeight(strokeWidth);
			line(0, 0, 0, -len);
			translate(0, -len);
		} else if (current == '+') {
			rotate(angle);
		} else if (current == '-') {
			rotate(-angle);
		} else if (current == '[') {
			push(); // Save position and angle
			// Make the lines for the new branch thinner
			strokeWidth *= 0.7; 
		} else if (current == ']') {
			// Restore the thickness for the parent branch
			strokeWidth /= 0.7; 
			pop();  // Restore position and angle
		}
	}
}

// Central function to handle all the drawing logic
function drawFractal() {
	background(50);
	fill(255);
	noStroke();
	text('Generation: ' - + generation, 10, 20);
	
	stroke(255);
	
	// Reset the strokeWidth to its thickest value before each full redraw
	strokeWidth = 4;

	resetMatrix();
	translate(width / 2, height); 
	
	turtle(); // Draw the fractal
}

// The draw function is not used in this version
function draw() {
	noLoop();
}