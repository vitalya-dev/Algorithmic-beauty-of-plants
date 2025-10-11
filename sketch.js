// L-System variables
let axiom = 'F-F-F-F'; // The starting point (a square)
let sentence = axiom;   // The sentence that will grow and be drawn
let len = 100;          // The initial length of 'F'
let angle;              // The angle for '+' and '-' turns

// The rule for how 'F' expands
const rules = {
	F: 'F-F+F+FF-F-F+F'
};

// The setup function runs once when the sketch starts
function setup() {
	createCanvas(600, 600);
	background(50);
	angle = radians(90); // Set the angle to 90 degrees in radians

	// Let's see what the L-system produces!
	console.log('Generation 0: ' + sentence);
	generate();
	console.log('Generation 1: ' + sentence);
	generate();
	console.log('Generation 2: ' + sentence);
}

// This function generates the next iteration of the sentence
function generate() {
	let nextSentence = ''; // Start with an empty next sentence

	// Loop through every character in the current sentence
	for (let i = 0; i < sentence.length; i++) {
		const current = sentence.charAt(i);
		let found = false;
		
		// If the current character is 'F', apply the rule
		if (current == 'F') {
			nextSentence += rules.F;
			found = true;
		}

		// If it's not 'F' (like '+' or '-'), just copy it as is
		if (!found) {
			nextSentence += current;
		}
	}
	// Replace the old sentence with the new, longer one
	sentence = nextSentence;
}


// The draw function is not used yet, but p5.js needs it to run
function draw() {
	// We'll add drawing code here in the next subtask
}