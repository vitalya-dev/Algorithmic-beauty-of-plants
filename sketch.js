// L-System variables
let axiom = 'F-F-F-F';
let sentence = axiom;
let len = 400; // Start with a large length
let angle;
let generation = 0; // Keep track of the current generation

const rules = {
  F: 'F-FF--F-F'
};

// The setup function runs once when the sketch starts
function setup() {
	createCanvas(600, 600);
	angle = radians(90);
	
	// Create a button to generate the next iteration
	const button = createButton('Generate Next');
	button.mousePressed(generate);
	
	drawFractal(); // Initial draw
}

// This function generates the next iteration of the sentence
function generate() {
	len /= 2; // Shrink the length for the next iteration
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
    }
  }
}

// Central function to handle all the drawing logic
function drawFractal() {
	background(50);
	fill(255);
	noStroke();
	text('Generation: ' + generation, 10, 20); // Display current generation
	
	stroke(255);
	strokeWeight(1.5);

	resetMatrix();
	// This starting position works well to keep the shape centered
	translate(500, 500); 
	
	turtle(); // Draw the fractal
}

// The draw function is not used in this version because we are
// only redrawing when the button is pressed.
function draw() {
	noLoop(); // Stop p5.js from looping the draw() function
}