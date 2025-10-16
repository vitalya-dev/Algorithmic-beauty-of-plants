// A variable to hold the sequence of drawing commands.
let sentence;

function setup() {
	createCanvas(600, 600, WEBGL);
	//debugMode()
	// This is our test sentence to draw a square using Yaw turns.
	// F: Draw forward
	// +: Turn right (Yaw) 90 degrees
	sentence = [
		{ char: '!', params: [3] },      // Set line width to 3
		{ char: 'F', params: [150] },    // Forward 150
		{ char: '+', params: [90] },     // Turn right 90 degrees
		{ char: 'F', params: [150] },    // Forward 150
		{ char: '+', params: [90] },     // Turn right 90 degrees
		{ char: 'F', params: [150] },    // Forward 150
		{ char: '-', params: [90] },     // Turn right 90 degrees
		{ char: 'F', params: [150] }     // Forward 150
	];
}

// Interprets the 'sentence' array and draws the corresponding 3D graphics.
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
			case '+': // Turn Right (Yaw) -> Rotates around turtle's Up (Y-axis)
				rotateY(radians(-module.params[0]));
				break;
			case '-': // Turn Left (Yaw) -> Rotates around turtle's Up (Y-axis)
				rotateY(radians(module.params[0]));
				break;
			case '&': // Pitch Down -> Rotates around turtle's Left (X-axis)
				rotateX(radians(module.params[0]));
				break;
			case '^': // Pitch Up -> Rotates around turtle's Left (X-axis)
				rotateX(radians(-module.params[0]));
				break;
			case '/': // Roll Right -> Rotates around turtle's Heading (Z-axis)
				rotateZ(radians(module.params[0]));
				break;
			case '\\': // Roll Left -> Rotates around turtle's Heading (Z-axis)
				rotateZ(radians(-module.params[0]));
				break;
			case '$': // Roll 180 degrees
				rotateZ(radians(180));
				break;
			case '[': // Push the current transformation matrix onto the stack
				push();
				break;
			case ']': // Pop the current transformation matrix from the stack
				pop();
				break;
		}
	}
}

// Sets up the 3D scene and calls the turtle to draw.
function drawFractal() {
	background(50);
	
	// Use orbitControl for interactive camera
	orbitControl();
	
	// We reset the matrix and draw the turtle at the center of the world
	resetMatrix();
	stroke(255);
	turtle();
}

// The draw loop now continuously calls drawFractal to update the scene
// and listen for orbitControl inputs.
function draw() {
	drawFractal();
}