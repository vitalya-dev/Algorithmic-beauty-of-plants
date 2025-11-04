let trees = [];

// ========================================
//  Tree Class
// ========================================

class Tree {
	constructor(x, y, z, type = 'honda', params = {}) {

		this.basePosition = createVector(x, y, z);
		this.type = type;

		this.treeGeometry = null;
		this.button = createButton(`Generate ${this.type}`);
		this.button.mousePressed(() => this.generate());

		if (this.type === 'honda') {

			this.r1 = params.r1 || 0.9;
			this.r2 = params.r2 || 0.6;
			this.a0 = params.a0 || 45;
			this.a2 = params.a2 || 45;
			this.s = params.s || 137.5;
			this.wr = params.wr || 0.707;
			const defaultT = createVector(0, 0, 1);
			this.T = params.T || defaultT;
			this.T.normalize();
			this.e = params.e || 0;

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

			this.axiom = [{ char: 'A', params: [100, 10] }];
			this.sentence = this.axiom;
			this.generation = 0;
		}

		this.generateTreeGeometry();
	}

	generate() {
		this.generation++;
		let nextSentence = [];

		for (const module of this.sentence) {
			const rule = this.rules[module.char];
			if (rule) {
				const newModules = rule(...module.params);
				nextSentence.push(...newModules);
			} else {
				nextSentence.push(module);
			}
		}
		this.sentence = nextSentence;
		console.log(`Generation ${this.generation}:`, this.sentence);

		this.generateTreeGeometry();
	}

	generateTreeGeometry() {
		this.treeGeometry = new p5.Geometry();

		// --- State Variables ---
		let currentPosition = createVector(0, 0, 0);
		let stack = [];
		let currentWidth = -1;
		let previousWidth = -1;

		// --- Turtle Orientation ---
		let heading = createVector(0, 0, -1);
		let up = createVector(0, 1, 0);
		let left = createVector(-1, 0, 0);

		// --- Rotation Helpers ---
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

		// --- Process L-System Sentence ---
		for (const module of this.sentence) {
			switch (module.char) {
				case '!': // Set Width
					const newWidth = module.params[0];
					if (currentWidth === -1) {
						currentWidth = newWidth;
						previousWidth = newWidth;
					} else {
						previousWidth = currentWidth;
						currentWidth = newWidth;
					}
					console.log(previousWidth, currentWidth);
					break;

				case 'F': // Draw Forward
					const len = module.params[0];
					const radius1 = (previousWidth === -1) ? 0 : previousWidth / 2;
					const radius2 = (currentWidth === -1) ? 0 : currentWidth / 2;

					const startPos = currentPosition.copy();
					const endPos = p5.Vector.add(startPos, heading.copy().mult(len));

					addCylinder(this.treeGeometry, startPos, endPos, radius1, radius2, 6);

					currentPosition = endPos;
					previousWidth = currentWidth;

					// Apply tropism (gravity)
					if (this.e > 0) {
						const H = heading;
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
				case '$': // Leveling Roll
					applyLevelingRoll();
					break;

				case '[': // Push State
					stack.push({
						pos: currentPosition.copy(),
						heading: heading.copy(),
						up: up.copy(),
						left: left.copy(),
						width: currentWidth,
						prevWidth: previousWidth
					});
					break;
				case ']': // Pop State
					const state = stack.pop();
					currentPosition = state.pos;
					heading = state.heading;
					up = state.up;
					left = state.left;
					currentWidth = state.width;
					previousWidth = state.prevWidth;
					break;
			}
		}

		// --- Apply Vertex Colors ---
		const baseColor = color(69, 36, 21); // Brown
		const tipColor = color(238, 142, 4); // Lighter color

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

		this.treeGeometry.vertexColors = [];

		for (const v of this.treeGeometry.vertices) {
			// Map z-value to a 0-0.5 range for a subtler gradient
			const t = map(v.z, maxZ, minZ, 0, 0.5); 
			const vertexColor = lerpColor(baseColor, tipColor, t);
			this.treeGeometry.vertexColors.push(...vertexColor._array);
		}

		this.treeGeometry.computeNormals();
	}

	draw() {
		// Position the tree's button
		let screenPos = worldToScreen(this.basePosition.x, this.basePosition.y, this.basePosition.z);
		this.button.position(screenPos.x - this.button.width / 2, screenPos.y + 10);

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

// ========================================
//  p5.js Main Functions
// ========================================

function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL);

	trees.push(new Tree(0, 0, 0, "honda", {
		r1: 0.9,
		r2: 0.6,
		a0: 45,
		a2: 45,
		s: 137.5,
		wr: 0.707,
		e: 0.01,
		T: createVector(0, 0, 1)
	}));

	trees.push(new Tree(300, 0, 0, "honda", {
		r1: 0.9,
		r2: 0.8,
		a0: 45,
		a2: 45,
		s: 137.5,
		wr: 0.707,
		T: createVector(0, 0, -1),
		e: 0.11
	}));

	trees.push(new Tree(600, 0, 0, "honda", {
		r1: 0.9,
		r2: 0.8,
		a0: 45,
		a2: 45,
		s: 137.5,
		wr: 0.707,
		e: 0.02,
	}));

	trees.push(new Tree(900, 0, 0, "honda", {
		r1: 0.9,
		r2: 0.7,
		a0: 30,
		a2: -30,
		s: 137.5,
		wr: 0.707,
		e: 0.01
	}));
}

function draw() {
	background(50);
	orbitControl();
	ambientLight(300);
	noStroke();

	// --- Setup Scene View ---
	// 1. Move the "ground" down
	translate(0, height / 3, 0);
	// 2. Rotate the whole world to get a better view
	rotateX(-PI / 2);

	// --- Draw Trees ---
	for (let tree of trees) {
		tree.draw();
	}

	// --- Draw World Axes ---
	strokeWeight(3);
	stroke(255, 0, 0); line(0, 0, 0, 50, 0, 0); // +X (Red)
	stroke(0, 255, 0); line(0, 0, 0, 0, 50, 0); // +Y (Green)
	stroke(0, 0, 255); line(0, 0, 0, 0, 0, 50); // +Z (Blue)
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

// ========================================
//  Helper Functions
// ========================================

/**
 * Creates a tapered cylinder (frustum) and adds it to a p5.Geometry object.
 */
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
		const x = cos(angle);
		const y = sin(angle);

		// Bottom vertex
		const offsetTerm1_bottom = ortho1.copy().mult(x * radius1);
		const offsetTerm2_bottom = ortho2.copy().mult(y * radius1);
		const pointOffset_bottom = p5.Vector.add(offsetTerm1_bottom, offsetTerm2_bottom);
		const bottomVertex = p5.Vector.add(startPos, pointOffset_bottom);
		geom.vertices.push(bottomVertex);

		// Top vertex
		const offsetTerm1_top = ortho1.copy().mult(x * radius2);
		const offsetTerm2_top = ortho2.copy().mult(y * radius2);
		const pointOffset_top = p5.Vector.add(offsetTerm1_top, offsetTerm2_top);
		const topVertex = p5.Vector.add(endPos, pointOffset_top);
		geom.vertices.push(topVertex);
	}

	// --- 3. Create Cylinder Wall Faces ---
	for (let i = 0; i < detail; i++) {
		const i0 = baseIndex + i * 2;
		const i1 = baseIndex + i * 2 + 1;
		const next_i = (i + 1) % detail;
		const i2 = baseIndex + next_i * 2 + 1;
		const i3 = baseIndex + next_i * 2;
		geom.faces.push([i0, i1, i2]); // Triangle 1
		geom.faces.push([i0, i2, i3]); // Triangle 2
	}

	// --- 4. Create End Cap Faces ---
	const bottomCapCenterIndex = geom.vertices.length;
	geom.vertices.push(startPos.copy());
	const topCapCenterIndex = geom.vertices.length;
	geom.vertices.push(endPos.copy());

	for (let i = 0; i < detail; i++) {
		const next_i = (i + 1) % detail;

		// Indices for the ring vertices
		const i_bottom_current = baseIndex + i * 2;
		const i_bottom_next = baseIndex + next_i * 2;
		const i_top_current = baseIndex + i * 2 + 1;
		const i_top_next = baseIndex + next_i * 2 + 1;

		// Bottom cap face (note the winding order for correct normal)
		geom.faces.push([bottomCapCenterIndex, i_bottom_next, i_bottom_current]);
		// Top cap face
		geom.faces.push([topCapCenterIndex, i_top_current, i_top_next]);
	}
}

/**
 * Rotates a vector 'v' around a given 'axis' by 'angleDeg' degrees.
 * Uses the Rodrigues' rotation formula.
 */
function rotateAroundAxis(v, axis, angleDeg) {
	const angleRad = radians(angleDeg);
	const cosA = cos(angleRad);
	const sinA = sin(angleRad);

	// v * cos(A)
	const term1 = v.copy().mult(cosA);
	// (axis x v) * sin(A)
	const term2 = axis.cross(v).mult(sinA);
	// axis * (axis . v) * (1 - cos(A))
	const term3 = axis.copy().mult(axis.dot(v) * (1 - cosA));

	return p5.Vector.add(term1, term2).add(term3);
}