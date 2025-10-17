let sentence;

function setup() {
	createCanvas(600, 600, WEBGL);
	
	// Test sentence for Roll: F [ / & F ] [ \ & F ]
	// F: Draw forward
	// [: Push state
	// ]: Pop state
	// /: Roll right
	// \: Roll left
	// &: Pitch down
	sentence = [
		{ char: '!', params: [3] },      // Set line width
		{ char: 'F', params: [100] },    // Draw a central stem
		{ char: '[' },                   // Save state at the end of the stem
		{ char: '/', params: [45] },     // Roll right 45 degrees
		{ char: '&', params: [45] },     // Pitch down 45 degrees
		{ char: 'F', params: [80] },     // Draw first branch
		{ char: ']' },                   // Restore state
		{ char: '[' },                   // Save state again
		{ char: '\\', params: [45] },    // Roll left 45 degrees
		{ char: '&', params: [45] },     // Pitch down 45 degrees
		{ char: 'F', params: [80] },     // Draw second branch
		{ char: ']' }                    // Restore state
	];
}

// Your corrected turtle function
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
	orbitControl();
	
	resetMatrix();
	stroke(255);
	turtle();
}

function draw() {
	drawFractal();
}