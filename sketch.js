// Constants for the 3D Hilbert curve
const delta = 90; // Branching angle (δ)
let n = 2; // Number of generations (will be controlled by button)
let len = 50; // Initial segment length

// The axiom is a simple string
let axiom = 'A';
let sentence = axiom;
let generation = 0;

// Rules are now string replacements
const rules = {
  'A': 'B-F+CFC+F-D&F^D-F+&&CFC+F+B//',
  'B': 'A&F^CFB^F^D^^-F-D^|F^B|FC^F^A//',
  'C': '|D^|F^B-F+C^F^A&&FA&F^C+F+B^F^D//',
  'D': '|CFB-F+B|FA&F^A&&FB-F+B|FC//'
};

function setup() {
  createCanvas(600, 600, WEBGL);
  const button = createButton('Generate Next');
  button.mousePressed(generate);
  drawFractal();
}

function generate() {
  generation++;
  let nextSentence = '';
  
  for (let i = 0; i < sentence.length; i++) {
    const char = sentence.charAt(i);
    const rule = rules[char];
    if (rule) {
      nextSentence += rule;
    } else {
      nextSentence += char; // Keep symbols like F, +, -, etc.
    }
  }
  sentence = nextSentence;
  
  // We'll adjust length and camera in a later step
  // len *= 0.5; 

  drawFractal();
}

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
	resetMatrix();
	
	// Since the tree now "grows" along the Z-axis (forward), we need to
	// rotate the whole scene so we can see it standing up.
	// 1. Move the starting point down.
	translate(0, 200, 0); 
	// 2. Rotate it 90 degrees to make it stand up vertically.
	rotateX(radians(-90)); 
	
	stroke(255);
	turtle();
}

function draw() {
	noLoop();
}