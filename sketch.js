let trees = []; // An array to hold all our trees

// --- NEW Tree Class ---
class Tree {
	constructor(x, y, z, type = 'honda', params = {}) { // <-- MODIFIED: Added 'type' and renamed 'params'
		// 1. Store the tree's base position
		this.basePosition = createVector(x, y, z);
		this.type = type; // <-- NEW: Store the type

		// 3. Each tree gets its own 3D model
		this.treeGeometry = null; // Will be a p5.Geometry object

		// 4. Each tree gets its own button
		this.button = createButton(`Generate ${this.type}`); // <-- MODIFIED: Button label
		
		// Tell the button to call THIS tree's generate method
		this.button.mousePressed(() => this.generate());

		// --- NEW: Type-based setup ---
		if (this.type === 'honda') {
			// --- Setup for Honda (Sympodial) model ---
			this.r1 = params.r1 || 0.9;
			this.r2 = params.r2 || 0.6;
			this.a0 = params.a0 || 45; // Renamed from a0 to match your code
			this.a2 = params.a2 || 45;
			this.s = params.s || 137.5; // 's' is 's' (spread angle)
			this.wr = params.wr || 0.707;
			const defaultT = createVector(0, 0, 1);
			this.T = params.T || defaultT;
			this.T.normalize(); // We only need the direction
			this.e = params.e || 0; // Susceptibility to bending

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
		}


		// Build the initial geometry (Gen 0)
		this.generateTreeGeometry();
	}
	
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


	generateTreeGeometry() {
		// Use 'this' to access class properties
		this.treeGeometry = new p5.Geometry(); // Use this.treeGeometry
		
		// Start at the tree's base position
		let currentPosition = createVector(0, 0, 0);
		let stack = [];
		
		// --- NEW: Tapered width logic ---
		// Initialize to -1 as a flag, as you suggested.
		let currentWidth = -1; 
		let previousWidth = -1;
		
		let heading = createVector(0, 0, -1);
		let up = createVector(0, 1, 0);
		let left = createVector(-1, 0, 0); 
		
		// ... (Rotation functions applyYaw, applyPitch, applyRoll, applyLevelingRoll are unchanged) ...
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
		const applyLevelingRoll = () => {
			const g = createVector(0, 0, -1).normalize();
			let newLeft = p5.Vector.cross(g, heading).normalize();
			if (newLeft.magSq() < 1e-8) {
				return;
			}
			let newUp = p5.Vector.cross(heading, newLeft).normalize();
			left = newLeft;
			up = newUp;
		};
		
		// Use this.sentence
		for (const module of this.sentence) {
			switch (module.char) {
				case '!':
					// --- MODIFIED: Implement your logic ---
					const newWidth = module.params[0];
					if (currentWidth === -1) {
						// This is the first width module encountered.
						currentWidth = newWidth;
						previousWidth = newWidth;
					} else {
						// This is a subsequent width update.
						previousWidth = currentWidth; // The "start" width is the previous "end" width
						currentWidth = newWidth;   // The "end" width is the new one
					}
					console.log(previousWidth, currentWidth);
					break;
				
				case 'F':
					const len = module.params[0];
					
					// --- MODIFIED: Use two radii ---
					// Default to 0 if width hasn't been set (safety)
					const radius1 = (previousWidth === -1) ? 0 : previousWidth / 2;
					const radius2 = (currentWidth === -1) ? 0 : currentWidth / 2;
					
					const startPos = currentPosition.copy();
					const endPos = p5.Vector.add(startPos, heading.copy().mult(len));

					// Call our modified cylinder function with two radii
					addCylinder(this.treeGeometry, startPos, endPos, radius1, radius2, 6);
					
					currentPosition = endPos;

					// --- NEW: Update previousWidth for next segment ---
					// This ensures the next 'F' segment connects to this one.
					previousWidth = currentWidth;
					// --- NEW: Apply Tropism ---
					// This implements the bending logic from Figure 2.9
					if (this.e > 0) {
						const H = heading; // Current heading vector
	
						// Calculate rotation axis: H x T
						const axis = p5.Vector.cross(H, this.T);
						const magn = axis.mag();

						// Only apply if H and T are not parallel
						if (magn > 1e-8) {
							// Calculate angle (in radians): e * |H x T|
							const angleInRadians = this.e * magn;
		
							// Convert to degrees for our rotateAroundAxis function
							const angleInDegrees = degrees(angleInRadians);

							// Normalize the axis vector for rotateAroundAxis
							axis.mult(1.0 / magn);
		
							// Apply the rotation to all orientation vectors
							heading = rotateAroundAxis(heading, axis, angleInDegrees);
							up = rotateAroundAxis(up, axis, angleInDegrees);
							left = rotateAroundAxis(left, axis, angleInDegrees);
						}
					}
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
					applyLevelingRoll();
					break;
				}

				case '[':
					stack.push({
						pos: currentPosition.copy(),
						heading: heading.copy(),
						up: up.copy(),
						left: left.copy(),
						width: currentWidth, // <-- MODIFIED: Store currentWidth
						prevWidth: previousWidth // <-- NEW: Store previousWidth
					});
					break;
				case ']':
					const state = stack.pop();
					currentPosition = state.pos;
					heading = state.heading;
					up = state.up;
					left = state.left;
					currentWidth = state.width; // <-- MODIFIED: Restore currentWidth
					previousWidth = state.prevWidth; // <-- NEW: Restore previousWidth
					break;
			}
		}
		
		// ... (The entire "NEW POST-PROCESS COLORING CODE" section is unchanged) ...
		
		// 1. Define the colors for our gradient
		const baseColor = color(69, 36, 21); // Brown for the base (z=0)
		const tipColor = color(238, 142, 4); // Light green for the tips (negative z)

		// 2. Find the min and max Z-values (height)
		let minZ = 0;
		let maxZ = 0;
		
		if (this.treeGeometry.vertices.length > 0) {
			minZ = this.treeGeometry.vertices[0].z;
			maxZ = this.treeGeometry.vertices[0].z;
			
			for (const v of this.treeGeometry.vertices) {
				if (v.z < minZ) minZ = v.z;
				if (v.z > maxZ) maxZ = v.z;
			}
		}

		// 3. Apply colors based on height
		this.treeGeometry.vertexColors = []; 
		
		for (const v of this.treeGeometry.vertices) {
			const t = map(v.z, maxZ, minZ, 0, .5);
			const vertexColor = lerpColor(baseColor, tipColor, t);
			this.treeGeometry.vertexColors.push(...vertexColor._array);
		}
		
		// Recalculate normals for THIS tree's geometry
		this.treeGeometry.computeNormals();
	}

	draw() {
		//Position tree's button.
		let screenPos = worldToScreen(this.basePosition.x, this.basePosition.y, this.basePosition.z);
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
	
	// // Create our tree and store it in the global variable
	trees.push(new Tree(0, 0, 0, "honda",
		{
			r1: 0.9,   // Shorter trunk segments
			r2: 0.6,   // Longer main branches
			a0: 45,    // Narrower trunk branching
			a2: 45,    // Wider lateral branching
			s: 137.5,     // Different branching pattern (90 degrees)
			wr: 0.707    // Branches get thinner slightly slower
		}
	));
	trees.push(new Tree(300, 0, 0, "honda",
		{
			r1: 0.9,   // Shorter trunk segments
			r2: 0.9,   // Longer main branches
			a0: 45,    // Narrower trunk branching
			a2: 45,    // Wider lateral branching
			s: 137.5,     // Different branching pattern (90 degrees)
			wr: 0.707    // Branches get thinner slightly slower
		}
	));
	trees.push(new Tree(600, 0, 0, "honda",
		{
			r1: 0.9,   // Shorter trunk segments
			r2: 0.8,   // Longer main branches
			a0: 45,    // Narrower trunk branching
			a2: 45,    // Wider lateral branching
			s: 137.5,     // Different branching pattern (90 degrees)
			wr: 0.707    // Branches get thinner slightly slower
		}
	));
	trees.push(new Tree(900, 0, 0, "honda",
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



// --- MODIFIED addCylinder function ---
// This version uses radius1 for the start and radius2 for the end.

function addCylinder(geom, startPos, endPos, radius1, radius2, detail = 6) {
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
        
		const x = cos(angle); // We'll multiply by radius inside
		const y = sin(angle); // We'll multiply by radius inside
        
		// --- MODIFIED: Use radius1 for bottom ---
		const offsetTerm1_bottom = ortho1.copy().mult(x * radius1);
		const offsetTerm2_bottom = ortho2.copy().mult(y * radius1);
		const pointOffset_bottom = p5.Vector.add(offsetTerm1_bottom, offsetTerm2_bottom);
        
		const bottomVertex = p5.Vector.add(startPos, pointOffset_bottom);
		geom.vertices.push(bottomVertex);
        
		// --- MODIFIED: Use radius2 for top ---
		const offsetTerm1_top = ortho1.copy().mult(x * radius2);
		const offsetTerm2_top = ortho2.copy().mult(y * radius2);
		const pointOffset_top = p5.Vector.add(offsetTerm1_top, offsetTerm2_top);

		const topVertex = p5.Vector.add(endPos, pointOffset_top);
		geom.vertices.push(topVertex);
	}
    
	// --- 3. Add Side Faces (No change needed here) ---
	for (let i = 0; i < detail; i++) {
		const i0 = baseIndex + i * 2;
		const i1 = baseIndex + i * 2 + 1;
		const next_i = (i + 1) % detail;
		const i2 = baseIndex + next_i * 2 + 1;
		const i3 = baseIndex + next_i * 2;

		geom.faces.push([i0, i1, i2]);
		geom.faces.push([i0, i2, i3]);
	}

	// --- 4. Add Cap Faces (No change needed here) ---
	const bottomCapCenterIndex = geom.vertices.length;
	geom.vertices.push(startPos.copy());
    
	const topCapCenterIndex = geom.vertices.length;
	geom.vertices.push(endPos.copy());
    

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
	
	
	// Tell each tree to draw itself
	for (let tree of trees) {
		tree.draw();
	}

	strokeWeight(3);
	stroke(255, 0, 0); line(0, 0, 0, 50, 0, 0); // +X
	stroke(0, 255, 0); line(0, 0, 0, 0, 50, 0); // +Y
	stroke(0, 0, 255); line(0, 0, 0, 0, 0, 50); // +Z
}


function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}