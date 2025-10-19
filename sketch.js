// Constants for the Honda tree model from the book
const r1 = 0.9; // Contraction ratio for the trunk
const r2 = 0.6; // Contraction ratio for branches
const a0 = 45;  // Branching angle from the trunk
const a2 = 45;  // Branching angle for lateral axes
const s = 137.5; // Divergence angle
const wr = 0.707; // Width decrease rate

// The axiom is an array of objects
let axiom = [{ char: 'A', params: [100, 10] }]; // Start with length 100, width 10
let sentence = axiom;
let generation = 0;

let treeGeometry; // <-- ADDED: Will hold our 3D model

// Jitter setup
const JITTER_DEG = 30;                 // max jitter ±30°
const jitter = (amp = JITTER_DEG) => (Math.random() * 2 - 1) * amp;

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
	createCanvas(600, 600, WEBGL);
	const button = createButton('Generate Next');
	button.mousePressed(generate);

	// We build the geometry once at the start
	generateTreeGeometry(); 
}


/**
 * Adds a cylinder mesh to a p5.Geometry object.
 * @param {p5.Geometry} geom The geometry object to add to.
 * @param {p5.Vector} startPos The center of the bottom cap.
 * @param {p5.Vector} endPos The center of the top cap.
 * @param {number} radius The cylinder's radius.
 * @param {number} detail The number of sides (vertices) for the caps (e.g., 6 for a hexagon).
 */
function addCylinder(geom, startPos, endPos, radius, detail = 6) {
    
	// --- 1. Calculate Orientation Vectors ---
    
	// The main axis of the cylinder
	const axis = p5.Vector.sub(endPos, startPos);
	const len = axis.mag();
	axis.normalize();

	// Find a vector that is not parallel to the axis
	// This is a standard trick: if the axis is close to the world Y-axis,
	// use the world X-axis as the temporary vector. Otherwise, use Y.
	let tempVec = createVector(0, 1, 0);
	if (abs(axis.dot(tempVec)) > 0.999) {
		tempVec = createVector(1, 0, 0);
	}

	// Create the two perpendicular orientation vectors for the caps
	// using cross products.
	const ortho1 = p5.Vector.cross(axis, tempVec).normalize();
	const ortho2 = p5.Vector.cross(axis, ortho1).normalize();

	// --- 2. Calculate Vertices ---
    
	// Get the index of the first vertex we're about to add
	const baseIndex = geom.vertices.length;

	for (let i = 0; i < detail; i++) {
		// Calculate the angle for this point on the circle
		const angle = (i / detail) * TWO_PI;
        
		// Calculate the (x, y) offset in the circle's local 2D plane
		const x = cos(angle) * radius;
		const y = sin(angle) * radius;
        
		// Use the orientation vectors to find the 3D position of the offset
		const offsetTerm1 = ortho1.copy().mult(x);
		const offsetTerm2 = ortho2.copy().mult(y);
		const pointOffset = p5.Vector.add(offsetTerm1, offsetTerm2);
        
		// Add the vertex for the bottom cap
		const bottomVertex = p5.Vector.add(startPos, pointOffset);
		geom.vertices.push(bottomVertex);
        
		// Add the vertex for the top cap
		const topVertex = p5.Vector.add(endPos, pointOffset);
		geom.vertices.push(topVertex);
	}
    
	// --- 3. Add Side Faces ---
    
	for (let i = 0; i < detail; i++) {
		// Indices for the current pair of vertices (bottom and top)
		const i0 = baseIndex + i * 2;     // Current bottom vertex
		const i1 = baseIndex + i * 2 + 1; // Current top vertex
        
		// Indices for the next pair of vertices, wrapping around
		const next_i = (i + 1) % detail; // Wrap around to 0 at the end
		const i2 = baseIndex + next_i * 2 + 1; // Next top vertex
		const i3 = baseIndex + next_i * 2;     // Next bottom vertex

		// Add the two triangles that form the rectangular side
		// Face 1 (Triangle 1: bottom-current, top-current, top-next)
		geom.faces.push([i0, i1, i2]);
		// Face 2 (Triangle 2: bottom-current, top-next, bottom-next)
		geom.faces.push([i0, i2, i3]);
	}
    
	// Add the center vertices for the caps
	const bottomCapCenterIndex = geom.vertices.length;
	geom.vertices.push(startPos.copy());
    
	const topCapCenterIndex = geom.vertices.length;
	geom.vertices.push(endPos.copy());
    
	// Create the "fan" of triangles for each cap
	for (let i = 0; i < detail; i++) {
		const next_i = (i + 1) % detail;

		// Current and next vertex indices for the bottom circle
		const i_bottom_current = baseIndex + i * 2;
		const i_bottom_next = baseIndex + next_i * 2;

		// Current and next vertex indices for the top circle
		const i_top_current = baseIndex + i * 2 + 1;
		const i_top_next = baseIndex + next_i * 2 + 1;

		// Bottom cap face (counter-clockwise)
		geom.faces.push([bottomCapCenterIndex, i_bottom_next, i_bottom_current]);
        
		// Top cap face (counter-clockwise)
		geom.faces.push([topCapCenterIndex, i_top_current, i_top_next]);
	}
}
// --- END OF ADDED CODE ---

function generate() {
	generation++;
	let nextSentence = [];
	
	for (const module of sentence) {
		const rule = rules[module.char];
		if (rule) {
			const newModules = rule(...module.params);
			nextSentence.push(...newModules);
		} else {
			nextSentence.push(module);
		}
	}
	sentence = nextSentence;

	console.log(`Generation ${generation}:`, sentence); 
	
	// Re-build the geometry every time we generate
	generateTreeGeometry();
	// We don't call drawFractal() here, the main draw() 
	// loop will handle rendering the 'treeGeometry'
}

// ... (constants, axiom, rules, setup, generate functions are unchanged) ...

// ... (constants, axiom, rules, setup, generate functions are unchanged) ...

function generateTreeGeometry() {
	treeGeometry = new p5.Geometry();
	let currentPosition = createVector(0, 0, 0);
	let stack = [];
    
	let currentWidth = axiom[0].params[1]; 
	let heading = createVector(0, 0, -1);
	let up = createVector(0, 1, 0);
	let left = createVector(-1, 0, 0); 
    
	// Rotation functions (applyYaw, applyPitch, applyRoll)
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
    

	for (const module of sentence) {
		switch (module.char) {
			case '!': 
				currentWidth = module.params[0];
				break;
			case 'F': 
				// TODO: This is the next major step
				break;
            
			// --- ADDED FOR SUBTASK 1.5 ---
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
			// --- END OF ADDED CODE ---

			case '[': // Push state
				stack.push({
					pos: currentPosition.copy(),
					heading: heading.copy(),
					up: up.copy(),
					left: left.copy(),
					width: currentWidth 
				});
				break;
			case ']': // Pop state
				const state = stack.pop();
				currentPosition = state.pos;
				heading = state.heading;
				up = state.up;
				left = state.left;
				currentWidth = state.width;
				break;
		}
	}
    
	// ... (rest of function) ...
}

// ... (drawFractal, draw functions unchanged) ...


function drawFractal() {
	background(50);
	resetMatrix();
	
	// Move the starting point down.
	translate(0, 200, 0); 
	
	stroke(255);
	// TODO: This will be changed to 'model(treeGeometry)'
	// turtle(); // <-- REMOVED and will be replaced
}

function draw() {
	orbitControl();
	drawFractal();
}