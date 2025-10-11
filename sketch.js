// The setup function runs once when the sketch starts
function setup() {
	// Create a canvas of 400 pixels wide by 200 pixels high
	createCanvas(400, 200);
}

// The draw function runs in a loop, over and over again
function draw() {
	// Set the background color of the canvas
	background(50); // A dark grey

	// Set the properties for our text
	fill(255); // White color
	textSize(32);
	textAlign(CENTER, CENTER); // Center the text horizontally and vertically

	// Display the text string in the middle of the canvas
	text('Hello, World!', width / 2, height / 2);
}