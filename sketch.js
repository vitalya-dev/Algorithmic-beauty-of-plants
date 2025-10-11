// L-System variables
let axiom = 'F-F-F-F';
let sentence = axiom;
let len = 100;
let angle;

const rules = {
  F: 'F-F+F+FF-F-F+F'
};

// The setup function runs once when the sketch starts
function setup() {
	createCanvas(600, 600);
	background(50);
	angle = radians(90); // Set the angle to 90 degrees in radians
	// The generate() function is not needed for this step,
	// as we are just drawing the initial axiom.
}

// This function tells the turtle how to draw based on the sentence
function turtle() {
  // Loop through every character in the current sentence
  for (let i = 0; i < sentence.length; i++) {
    const current = sentence.charAt(i);

    // Check what the current character is and act accordingly
    if (current == 'F') {
      // 'F' means draw a line forward
      line(0, 0, 0, -len); // Draw the line
      translate(0, -len);  // Move the turtle to the end of the line
    } else if (current == '+') {
      // '+' means turn right (positive rotation)
      rotate(angle);
    } else if (current == '-') {
      // '-' means turn left (negative rotation)
      rotate(-angle);
    }
  }
}

// The draw function runs in a loop
function draw() {
	background(50); // Redraw background each frame
	stroke(255);    // Set the line color to white
	strokeWeight(2); // Make the lines a bit thicker

	// We need to reset the drawing state and move to a starting position
	// each time draw() is called.
	resetMatrix();
	translate(width - 150, height - 150); // Move the starting point

	// Call the turtle function to draw the current sentence
	turtle();
}

// The generate function is still here, we will use it in the next step
function generate() {
	let nextSentence = '';
	for (let i = 0; i < sentence.length; i++) {
		const current = sentence.charAt(i);
		let found = false;
		if (current == 'F') {
			nextSentence += rules.F;
			found = true;
		}
		if (!found) {
			nextSentence += current;
		}
	}
	sentence = nextSentence;
}