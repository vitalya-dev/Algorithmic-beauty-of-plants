// Jitter setup
const JITTER_DEG = 60;                 // max jitter ±30°
const jitter = (amp = JITTER_DEG) => (Math.random() * 2 - 1) * amp;

let trees = []; // <-- MODIFIED: An array to hold all our trees

// --- NEW Tree Class ---
class Tree {
	constructor(x, y, z, hondaParams = {}) {
		// 1. Store the tree's base position
		this.basePosition = createVector(x, y, z);

		this.r1 = hondaParams.r1 || 0.9;
		this.r2 = hondaParams.r2 || 0.6;
		this.a0 = hondaParams.a0 || 45;
		this.a2 = hondaParams.a2 || 45;
		this.s = hondaParams.s || 137.5;
		this.wr = hondaParams.wr || 0.707;

		// This lets the rules access this.r1, this.a0, etc.
		this.rules = {
			A: (l, w) => [
				{ char: '!', params: [w] }, { char: 'F', params: [l] }, { char: '[' },
				{ char: '&', params: [this.a0] }, { char: 'B', params: [l * this.r2, w * this.wr] }, { char: ']' },
				{ char: '/', params: [this.s] }, { char: 'A', params: [l * this.r1, w * this.wr] }
			],
			B: (l, w) => [
				{ char: '!', params: [w] }, { char: 'F', params: [l] }, { char: '[' },
				{ char: '-', params: [this.a2] }, { char: '$' },
				{ char: 'C', params: [l * this.r2, w * this.wr] }, { char: ']' },
				{ char: 'C', params: [l * this.r1, w * this.wr] }
			],
			C: (l, w) => [
				{ char: '!', params: [w] }, { char: 'F', params: [l] }, { char: '[' },
				{ char: '+', params: [this.a2] }, { char: '$' },
				{ char: 'B', params: [l * this.r2, w * this.wr] }, { char: ']' },
				{ char: 'B', params: [l * this.r1, w * this.wr] }
			]
		};

		// 2. Each tree gets its own L-system state
		this.axiom = [{ char: 'A', params: [100, 10] }]; // Start with length 100, width 10
		this.sentence = this.axiom;
		this.generation = 0;
		this.maxWidth = this.axiom[0].params[1]; // Max width is the starting width

		// 3. Each tree gets its own 3D model
		this.treeGeometry = null; // Will be a p5.Geometry object

		// 4. Each tree gets its own button
		this.button = createButton('Generate');
		
		// Tell the button to call THIS tree's generate method
		this.button.mousePressed(() => this.generate());
		
		// Build the initial geometry (Gen 0)
		this.generateTreeGeometry();
	}
	
	// --- MOVED FUNCTION ---
	generate() {
		// Use 'this' to access class properties
		this.generation++;
		let nextSentence = [];
		
		for (const module of this.sentence) { // Use this.sentence
			const rule = this.rules[module.char]; // Use this.rules
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
					
					const nextWidth = currentWidth * this.wr;
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
				case '$': {
					// choose gravity; ABOP uses +Y as gravity. If your world uses Z-up,
					// switch to (0,0,1). You rotateX(-PI/2), so gravity in world space is +Y:
					const g = createVector(0, 0, -1).normalize();

					// Compute new left axis as g × H (perpendicular to gravity and heading)
					let newLeft = p5.Vector.cross(g, heading).normalize();

					// If heading ~ // to g, fall back to current left to avoid NaNs
					if (newLeft.magSq() < 1e-8) {
						break; // no change; heading nearly vertical
					}

					// Then new up is H × newLeft
					let newUp = p5.Vector.cross(heading, newLeft).normalize();

					left = newLeft;
					up = newUp;
					break;
				}

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
		//Position tree's button.
		let screenPos = worldToScreen(this.basePosition);
		this.button.position(screenPos.x - this.button.width / 2, screenPos.y + 10);
		

		// push() and pop() save/restore the drawing state
		push();
		
		// 1. Move to the tree's position in WORLD SPACE
		translate(this.basePosition.x, this.basePosition.y, this.basePosition.z);
		
		// 2. Render the pre-built 3D model (which is in OBJECT SPACE)
		if (this.treeGeometry) {
			model(this.treeGeometry);
		}
		
		pop();
	}
	
}
// --- END of Tree Class ---

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
	trees.push(new Tree(0, 0, 0,
		{
			r1: 0.9,   // Shorter trunk segments
			r2: 0.6,   // Longer main branches
			a0: 45,    // Narrower trunk branching
			a2: 45,    // Wider lateral branching
			s: 137.5,     // Different branching pattern (90 degrees)
			wr: 0.707    // Branches get thinner slightly slower
		}
	));
	trees.push(new Tree(300, 0, 0, 
		{
			r1: 0.9,   // Shorter trunk segments
			r2: 0.9,   // Longer main branches
			a0: 45,    // Narrower trunk branching
			a2: 45,    // Wider lateral branching
			s: 137.5,     // Different branching pattern (90 degrees)
			wr: 0.707    // Branches get thinner slightly slower
		}
	));
	trees.push(new Tree(600, 0, 0,
		{
			r1: 0.9,   // Shorter trunk segments
			r2: 0.8,   // Longer main branches
			a0: 45,    // Narrower trunk branching
			a2: 45,    // Wider lateral branching
			s: 137.5,     // Different branching pattern (90 degrees)
			wr: 0.707    // Branches get thinner slightly slower
		}
	));
	trees.push(new Tree(900, 0, 0, 
		{
			r1: 0.9,   // Shorter trunk segments
			r2: 0.7,   // Longer main branches
			a0: 30,    // Narrower trunk branching
			a2: -30,    // Wider lateral branching
			s: 137.5,     // Different branching pattern (90 degrees)
			wr: 0.707    // Branches get thinner slightly slower
		}
	));
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

	// --- SETUP THE SCENE/VIEW ---
	// 1. Move the "ground" down, so we can see the tree(s)
	translate(0, height / 3, 0); 
	// 2. Rotate the whole world to get a better view
	rotateX(-PI / 2); 
	// --- END SCENE SETUP ---
	
	
	// --- MODIFIED ---
	// Tell each tree to draw itself
	for (let tree of trees) {
		tree.draw();
	}
}


function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}