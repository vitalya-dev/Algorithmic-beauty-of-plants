// Constants for the Honda tree model from the book
const r1 = 0.9; // Contraction ratio for the trunk
const r2 = 0.6; // Contraction ratio for branches
const a0 = 45;  // Branching angle from the trunk
const a2 = 45;  // Branching angle for lateral axes
const s = 137.5; // Divergence angle
const wr = 0.707; // Width decrease rate

// Jitter setup
const JITTER_DEG = 60;                 // max jitter ±30°
const jitter = (amp = JITTER_DEG) => (Math.random() * 2 - 1) * amp;

// ... (Constants r1, r2, a0, etc. are unchanged) ...
// ... (Jitter setup is unchanged) ...

let trees = []; // <-- MODIFIED: An array to hold all our trees

// --- NEW Tree Class ---
class Tree {
	constructor(x, y, z) {
		// 1. Store the tree's base position
		this.basePosition = createVector(x, y, z);

		// 2. Each tree gets its own L-system state
		this.axiom = [{ char: 'A', params: [100, 10] }]; // Start with length 100, width 10
		this.sentence = this.axiom;
		this.generation = 0;
		this.maxWidth = this.axiom[0].params[1]; // Max width is the starting width

		// 3. Each tree gets its own 3D model
		this.treeGeometry = null; // Will be a p5.Geometry object

		// 4. Each tree gets its own button
		this.button = createButton('Generate Next');
		this.button.position(20, 20); // Still static
		
		// --- MODIFIED ---
		// Tell the button to call THIS tree's generate method
		this.button.mousePressed(() => this.generate());
		
		// --- ADDED ---
		// Build the initial geometry (Gen 0)
		this.generateTreeGeometry();
	}
	
	// --- MOVED FUNCTION ---
	generate() {
		// Use 'this' to access class properties
		this.generation++;
		let nextSentence = [];
		
		for (const module of this.sentence) { // Use this.sentence
			const rule = rules[module.char];
			if (rule) {
				const newModules = rule(...module.params);
				nextSentence.push(...newModules);
			} else {
				nextSentence.push(module);
			}
		}
		this.sentence = nextSentence; // Use this.sentence

		console.log(`Generation ${this.generation}:`, this.sentence); 
		
		// Re-build THIS tree's geometry
		this.generateTreeGeometry(); // Use this.generateTreeGeometry
	}

	// --- MOVED FUNCTION ---
	generateTreeGeometry() {
		// Use 'this' to access class properties
		this.treeGeometry = new p5.Geometry(); // Use this.treeGeometry
		
		// --- MODIFIED ---
		// Start at the tree's base position
		let currentPosition = createVector(0, 0, 0);
		let stack = [];
		
		const brownColor = color(139, 69, 19);
		const newGrowthColor = color(210, 180, 140);
		
		// Use this.maxWidth
		const maxWidth = this.maxWidth;
		let currentWidth = this.maxWidth; 
		
		let heading = createVector(0, 0, -1);
		let up = createVector(0, 1, 0);
		let left = createVector(-1, 0, 0); 
		
		// Rotation functions (these are fine as nested functions)
		const applyYaw = (angle) => {
			heading = rotateAroundAxis(heading, up, angle);
			left = rotateAroundAxis(left, up, angle);
		};
		const applyPitch = (angle) => {
			heading = rotateAroundAxis(heading, left, angle);
			up = rotateAroundAxis(up, left, angle);
		};
		const applyRoll = (angle) => {
			left = rotateAroundAxis(left, heading, angle);
			up = rotateAroundAxis(up, heading, angle);
		};
		
		// Use this.sentence
		for (const module of this.sentence) {
			switch (module.char) {
				case '!':
					currentWidth = module.params[0];
					break;
				
				case 'F':
					const len = module.params[0];
					const radius = currentWidth / 2;
					
					const startPos = currentPosition.copy();
					const endPos = p5.Vector.add(startPos, heading.copy().mult(len));
					
					const colorT_Start = map(currentWidth, 0, maxWidth, 1, 0);
					const colorStart = lerpColor(brownColor, newGrowthColor, colorT_Start);
					
					const nextWidth = currentWidth * wr;
					const colorT_End = map(nextWidth, 0, maxWidth, 1, 0);
					const colorEnd = lerpColor(brownColor, newGrowthColor, colorT_End);

					// Add cylinder to THIS tree's geometry
					addCylinder(this.treeGeometry, startPos, endPos, radius, 6, colorStart, colorEnd);
					
					currentPosition = endPos;
					break;
				
				// ... (cases '+', '-', '&', '^', '/', '\', '$' are unchanged) ...
				case '+': // Turn Right (Yaw)
					applyYaw(-module.params[0]);
					break;
				case '-': // Turn Left (Yaw)
					applyYaw(module.params[0]);
					break;
				case '&': // Pitch Down
					applyPitch(module.params[0]);
					break;
				case '^': // Pitch Up
					applyPitch(-module.params[0]);
					break;
				case '/': // Roll Right
					applyRoll(module.params[0]);
					break;
				case '\\': // Roll Left
					applyRoll(-module.params[0]);
					break;
				case '$': // Roll 180 degrees
					applyRoll(-180);
					break;

				case '[':
					stack.push({
						pos: currentPosition.copy(),
						heading: heading.copy(),
						up: up.copy(),
						left: left.copy(),
						width: currentWidth 
					});
					break;
				case ']':
					const state = stack.pop();
					currentPosition = state.pos;
					heading = state.heading;
					up = state.up;
					left = state.left;
					currentWidth = state.width;
					break;
			}
		}
		
		// Recalculate normals for THIS tree's geometry
		this.treeGeometry.computeNormals();
	}

	draw() {
		// The push() and pop() functions save and restore the drawing state.
		// This is critical for drawing multiple objects. It means the
		// translate/rotate for THIS tree won't affect the NEXT tree.
		push();
		
		// Move the starting point down and rotate for a better view
		// Note: The tree itself is built at (0,0,0) relative to its basePosition.
		// The 'translate(0, height / 3, 0)' is a camera-like move,
		// so we'll do it in the main draw() loop instead.
		
		rotateX(-PI / 2); // Rotate to see it standing up
		
		// Render the pre-built 3D model
		if (this.treeGeometry) {
			model(this.treeGeometry);
		}
		
		pop();
	}
	
}
// --- END of Tree Class ---


// ... (rules object is unchanged) ...
// ... (rotateAroundAxis function is unchanged) ...

const rules = {
	// ... (rules are unchanged) ...
	A: (l, w) => [
		{ char: '!', params: [w] }, { char: 'F', params: [l] }, { char: '[' },
		{ char: '&', params: [a0] }, { char: 'B', params: [l * r2, w * wr] }, { char: ']' },
		{ char: '/', params: [s] }, { char: 'A', params: [l * r1, w * wr] }
	],
	B: (l, w) => [
		{ char: '!', params: [w] }, { char: 'F', params: [l] }, { char: '[' },
		{ char: '/', params: [jitter()] },
		{ char: '-', params: [a2] }, { char: '$' },
		{ char: 'C', params: [l * r2, w * wr] }, { char: ']' },
		{ char: '/', params: [jitter()] },
		{ char: 'C', params: [l * r1, w * wr] }
	],
	C: (l, w) => [
		{ char: '!', params: [w] }, { char: 'F', params: [l] }, { char: '[' },
		{ char: '/', params: [jitter()] },
		{ char: '+', params: [a2] }, { char: '$' },
		{ char: 'B', params: [l * r2, w * wr] }, { char: ']' },
		{ char: '/', params: [jitter()] },
		{ char: 'B', params: [l * r1, w * wr] }
	]
};


function rotateAroundAxis(v, axis, angleDeg) {
	// ... (function is unchanged) ...
	const angleRad = radians(angleDeg);
	const cosA = cos(angleRad);
	const sinA = sin(angleRad);
    
	// v*cos(theta)
	const term1 = v.copy().mult(cosA);
    
	// (axis x v) * sin(theta)
	const term2 = axis.cross(v).mult(sinA);
    
	// axis * (axis . v) * (1 - cos(theta))
	const term3 = axis.copy().mult(axis.dot(v) * (1 - cosA));
    
	return p5.Vector.add(term1, term2).add(term3);
}



function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL);
	
	// --- MODIFIED ---
	// Create our tree and store it in the global variable
	trees.push(new Tree(0, 0, 0));
}


function addCylinder(geom, startPos, endPos, radius, detail = 6, colorStart, colorEnd) {
	// ... (function is unchanged) ...
	// --- 1. Calculate Orientation Vectors ---
	const axis = p5.Vector.sub(endPos, startPos);
	axis.normalize();

	let tempVec = createVector(0, 1, 0);
	if (abs(axis.dot(tempVec)) > 0.999) {
		tempVec = createVector(1, 0, 0);
	}

	const ortho1 = p5.Vector.cross(axis, tempVec).normalize();
	const ortho2 = p5.Vector.cross(axis, ortho1).normalize();
    
	// --- 2. Calculate Vertices ---
	const baseIndex = geom.vertices.length;

	for (let i = 0; i < detail; i++) {
		const angle = (i / detail) * TWO_PI;
        
		const x = cos(angle) * radius;
		const y = sin(angle) * radius;
        
		const offsetTerm1 = ortho1.copy().mult(x);
		const offsetTerm2 = ortho2.copy().mult(y);
		const pointOffset = p5.Vector.add(offsetTerm1, offsetTerm2);
        
		const bottomVertex = p5.Vector.add(startPos, pointOffset);
		geom.vertices.push(bottomVertex);
        
		const topVertex = p5.Vector.add(endPos, pointOffset);
		geom.vertices.push(topVertex);

		// --- MODIFIED ---
		// Apply start color to bottom vertex, end color to top vertex
		geom.vertexColors.push(...colorStart._array); 
		geom.vertexColors.push(...colorEnd._array); 
	}
    
	// --- 3. Add Side Faces ---
	for (let i = 0; i < detail; i++) {
		const i0 = baseIndex + i * 2;
		const i1 = baseIndex + i * 2 + 1;
		const next_i = (i + 1) % detail;
		const i2 = baseIndex + next_i * 2 + 1;
		const i3 = baseIndex + next_i * 2;

		geom.faces.push([i0, i1, i2]);
		geom.faces.push([i0, i2, i3]);
	}

	// --- 4. Add Cap Faces ---
	const bottomCapCenterIndex = geom.vertices.length;
	geom.vertices.push(startPos.copy());
    
	const topCapCenterIndex = geom.vertices.length;
	geom.vertices.push(endPos.copy());
    
	// --- MODIFIED ---
	// Apply start color to bottom cap, end color to top cap
	geom.vertexColors.push(...colorStart._array);
	geom.vertexColors.push(...colorEnd._array);

	for (let i = 0; i < detail; i++) {
		const next_i = (i + 1) % detail;

		const i_bottom_current = baseIndex + i * 2;
		const i_bottom_next = baseIndex + next_i * 2;

		const i_top_current = baseIndex + i * 2 + 1;
		const i_top_next = baseIndex + next_i * 2 + 1;

		geom.faces.push([bottomCapCenterIndex, i_bottom_next, i_bottom_current]);
		geom.faces.push([topCapCenterIndex, i_top_current, i_top_next]);
	}
}



function draw() {
	background(50);
	orbitControl(); // Let the user move the camera
	
	// --- ADDED: Set up the scene lights ---
	ambientLight(300);
	noStroke(); 

	// --- ADDED: Global translation ---
	// This moves the "ground" down, so we can see the tree(s)
	translate(0, height / 3, 0); 
	
	// --- MODIFIED ---
	// Tell each tree to draw itself
	for (let tree of trees) {
		tree.draw();
	}
	
	// In the next step, we'll add code here to update the button positions
}


function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}