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
	// MODIFIED: Added WEBGL to enable 3D mode
	createCanvas(600, 600, WEBGL); 
	
	angle = radians(25);
	
	const button = createButton('Generate Next');
	button.mousePressed(generate);
	
	drawFractal(); // Initial draw
}

// This function generates the next iteration of the sentence
function generate() {
	len *= 0.55;
	generation++;
	
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
			strokeWeight(strokeWidth);
			line(0, 0, 0, 0, -len, 0); // Note: line() in 3D takes 6 arguments
			translate(0, -len, 0);
		} else if (current == '+') {
			rotateZ(angle);
		} else if (current == '-') {
			rotateZ(-angle);
		} else if (current == '[') {
			push(); // Save position and angle
			strokeWidth *= 0.7; 
		} else if (current == ']') {
			strokeWidth /= 0.7; 
			pop();  // Restore position and angle
		}
	}
}

// Central function to handle all the drawing logic
function drawFractal() {
	background(50);
	resetMatrix();
	translate(0, 300 , 0); 

	
	// The text display part is a bit trickier in WEBGL, so we'll comment it out for now.
	// fill(255);
	// noStroke();
	// text('Generation: ' - + generation, 10, 20);
	
	stroke(255);
	
	strokeWidth = 4;

	// In 3D, we don't need to resetMatrix() or translate to the bottom center
	// The orbitControl centers the view for us.
	// resetMatrix();
	// translate(width / 2, height); 
	
	turtle(); // Draw the fractal
}

// The draw function is not used in this version
function draw() {
	noLoop();
}