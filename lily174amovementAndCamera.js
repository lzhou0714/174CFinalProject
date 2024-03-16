// import { defs, tiny } from './examples/common.js';
// import { Curve_Collider } from './colliders/CurveCollider.js';
// import { Box_Collider } from './colliders/BoxCollider.js';
// import { Base_Scene } from './base-scene.js';
// // import { makeTimer } from '../util/setTimer.js';
// import { Trigger_Collider } from './colliders/TriggerCollider.js';
// const {
// 	Vector,
// 	Vector3,
// 	vec,
// 	vec3,
// 	vec4,
// 	color,
// 	hex_color,
// 	Matrix,
// 	Mat4,
// 	Light,
// 	Texture,
// 	Shape,
// 	Material,
// 	Scene,
// } = tiny;

// export class BaseMap extends Base_Scene {
// 	/**
// 	 * This Scene object can be added to any display canvas.
// 	 * We isolate that code so it can be experimented with on its own.
// 	 * This gives you a very small code sandbox for editing a simple scene, and for
// 	 * experimenting with matrix transformations.
// 	 */

// 	constructor(x) {
// 		super();

// 		// Sound
// 		// this.map_sound = new Audio(sound); // buffers automatically when created
// 		// this.map_sound.play();

// 		this.set_colors();
// 		this.outline = false;
// 		this.sway = true;

// 		this.timer = makeTimer(120, this.map_sound);
// 		// Transform

// 		this.x = 0;
// 		this.z = 1;
// 		this.y = 0;
// 		this.rotx = 0;
// 		this.roty = 0;
// 		this.rotz = 0;

// 		this.lastrotx = 0;

// 		// Physics (Local space)
// 		this.velx = 0;
// 		this.vely = 0;
// 		this.velz = 0;

// 		// Colliders
// 		this.colliders = new Array();
// 		this.mapOrientation = 0;
// 		this.horizontal = false;

// 		// Coins
// 		this.num_coins = 5;
// 		this.rad = 1.25;
// 		this.coin_collected = {};
// 		this.score = 0;

// 		this.road_counter = 0;
// 		this.collided = false;
// 		// Key presses
// 		this.lap = 1;
// 		this.keyListeners = {};

// 		this.turnBuffer = 0;
// 		this.brakePressed = false;

// 		// Transformation matrix for building roads
// 		this.model_transform = Mat4.identity();

// 		this.trigger_count = 1;
// 		this.trigger_check = { 0: true };
// 		// This sets up traction for the car
// 		// If w or d is pressed ignore traction
// 		window.setInterval(() => {
// 			if (!this.keyListeners['w'] && this.vely > 0) {
// 				this.vely -= 0.005;
// 				if (this.vely < 0) {
// 					this.vely = 0;
// 				}
// 			} else if (!this.keyListeners['d'] && this.vely < 0) {
// 				this.vely += 0.005;
// 				if (this.vely > 0) {
// 					this.vely = 0;
// 				}
// 			}
// 		}, 500);
// 	}

// 	set_colors() {
// 		// TODO:  Create a class member variable to store your cube's colors.
// 		// Hint:  You might need to create a member variable at somewhere to store the colors, using `this`.
// 		// Hint2: You can consider add a constructor for class Assignment2, or add member variables in Base_Scene's constructor.
// 		this.colors = [];
// 		this.colors.push(
// 			color(Math.random(), Math.random(), Math.random(), 1)
// 		);
// 		for (let i = 1; i < 8; i++) {
// 			let new_color = color(
// 				Math.random(),
// 				Math.random(),
// 				Math.random(),
// 				1
// 			);
// 			while (color === this.colors[i - 1]) {
// 				new_color = color(
// 					Math.random(),
// 					Math.random(),
// 					Math.random(),
// 					1
// 				);
// 			}
// 			this.colors.push(new_color);
// 		}
// 	}

// 	make_control_panel() {
// 		this.addHoldKey(
// 			'w',
// 			() => {
// 				if (!this.collided) {
// 					this.vely += 0.002;
// 				} else {
// 					this.vely = this.vely > 0.03 ? 0.03 : this.vely;
// 				}
// 			},

// 			'Accelerate',
// 			125
// 		);

// 		this.addHoldKey(
// 			's',
// 			() => {
// 				if (!this.collided) {
// 					this.vely -= 0.002;
// 				}
// 			},
// 			'Brake',
// 			125
// 		);
// 		this.addHoldKey(
// 			'd',
// 			() => {
// 				this.rotx -=
// 					(Math.PI / 24) *
// 					(1 - 1.5 * this.vely) *
// 					(1 + this.turnBuffer);
// 				if (this.vely > 0) {
// 					this.vely -= 0.00075;
// 					if (this.vely < 0) {
// 						this.vely = 0;
// 					}
// 				} else if (this.vely < 0) {
// 					this.vely += 0.00075;
// 					if (this.vely > 0) {
// 						this.vely = 0;
// 					}
// 				}
// 			},
// 			'Steer Right',
// 			125
// 		);
// 		this.addHoldKey(
// 			'a',
// 			() => {
// 				this.rotx +=
// 					(Math.PI / 24) *
// 					(1 - 1.5 * this.vely) *
// 					(1 + this.turnBuffer);
// 				if (this.vely > 0) {
// 					this.vely -= 0.00075;
// 					if (this.vely < 0) {
// 						this.vely = 0;
// 					}
// 				} else if (this.vely < 0) {
// 					this.vely += 0.00075;
// 					if (this.vely > 0) {
// 						this.vely = 0;
// 					}
// 				}
// 			},
// 			'Steer Left',
// 			125
// 		);
// 	}

// 	// addHoldKey - add a key to the control panel that is meant for holding down
// 	// Parameters
// 	// key - key pressed
// 	// callback - what you want to happen when the key is held down
// 	// name - name you want to give the button
// 	// interval - how often you want the callback to be called in ms
// 	addHoldKey(key, callback, name, interval = 100) {
// 		this.key_triggered_button(name, [key], () => {});

// 		window.setInterval(() => {
// 			if (this.keyListeners[name]) {
// 				callback();
// 			}
// 		}, interval);

// 		document.addEventListener('keydown', (e) => {
// 			if (e.key === key) {
// 				this.keyListeners[name] = true;
// 			}
// 		});

// 		document.addEventListener('keyup', (e) => {
// 			if (e.key == key) {
// 				this.keyListeners[name] = false;
// 			}
// 		});
// 	}

// 	draw_box(context, program_state, model_transform, index) {
// 		const angle = ((0.05 * Math.PI * index) / 7) * 2;

// 		model_transform = model_transform
// 			.times(Mat4.translation(-1, 1.5, 0))
// 			.times(Mat4.rotation(angle, 45, 0, 1))
// 			.times(Mat4.translation(1, 1.5, 0))
// 			.times(Mat4.scale(1, 1.5, 1));

// 		this.shapes.triangle.draw(
// 			context,
// 			program_state,
// 			model_transform,
// 			this.materials.plastic.override({
// 				color: this.colors[index],
// 			}),
// 			'TRIANGLE_STRIP'
// 		);

// 		return model_transform.times(Mat4.scale(1, 1 / 1.5, 1)); // Unscale before return
// 	}

// 	sphere_collider(radius, x, y) {
// 		let dist = Math.sqrt(
// 			Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2)
// 		);

// 		if (dist < radius + this.rad) {
// 			return true;
// 		}
// 		return false;
// 	}

// 	collect_coin(radius, x, y, index) {
// 		if (
// 			this.sphere_collider(radius, x, y) &&
// 			!this.coin_collected[index]
// 		) {
// 			this.score += 1;
// 			this.coin_collected[index] = true;
// 		}
// 	}

// 	move_with_collision(deltax, deltay) {
// 		let newx = this.x + deltax;
// 		let newy = this.y + deltay;
// 		let len = this.colliders.length;
// 		let collided = false;
// 		this.collided = false;

// 		for (let i = 0; i < len; i++) {
// 			// console.log(this.colliders[i]);
// 			let res = this.colliders[i].check_collision(newx, newy);

// 			if (res.resx != newx || res.resy != newy) {
// 				this.x = res.resx;

// 				this.y = res.resy;

// 				collided = true;
// 				// return;
// 				this.collided = true;
// 				return;
// 			}
// 		}

// 		if (!collided) {
// 			this.x = newx;
// 			this.y = newy;
// 		}
// 	}

// 	draw_car(context, program_state, model_transform) {
// 		// model_transform = model_transform.times(Mat4.translation(this.x, this.y, this.z));
// 		this.vely = Math.max(Math.min(this.vely, 0.06), -0.01);

// 		// Linear Interpolation (for smoothing)
// 		let lerp_factor = 0.02;
// 		let lerp_rotx =
// 			this.lastrotx * (1 - lerp_factor) + this.rotx * lerp_factor;

// 		// Physics based movement: position calculations based on velocity (on xy plane)
// 		let deltax =
// 			this.vely *
// 			program_state.animation_delta_time *
// 			Math.sin(-1 * lerp_rotx);
// 		let deltay =
// 			this.vely *
// 			program_state.animation_delta_time *
// 			Math.cos(lerp_rotx);

// 		this.move_with_collision(deltax, deltay);

// 		this.z =
// 			0.5 +
// 			0.035 * Math.sin(this.vely * program_state.animation_time);

// 		// Extra handling at beginning of brake
// 		if ('Brake' in this.keyListeners && this.keyListeners['Brake']) {
// 			if (!this.brakePressed) {
// 				this.turnBuffer = 0.8;
// 				this.brakePressed = true;
// 			} else {
// 				if (this.turnBuffer > 0) {
// 					this.turnBuffer -= 0.04;
// 				} else {
// 					this.turnBuffer = 0;
// 				}
// 			}
// 		} else {
// 			this.brakePressed = false;
// 			this.turnBuffer = 0;
// 		}

// 		model_transform = Mat4.identity();
// 		model_transform = model_transform.times(
// 			Mat4.translation(this.x, this.y, this.z)
// 		);
// 		model_transform = model_transform.times(
// 			Mat4.rotation(lerp_rotx, 0, 0, 1)
// 		);

// 		for (let i of [0, 1, 2]) {
// 			let materials;
// 			//load texture and normal map for car
// 			if (i == 0) materials = this.materials.kart;
// 			else if (i == 1) materials = this.materials.kartM;
// 			else materials = this.materials.kartR;

// 			this.shapes.kart.draw(
// 				context,
// 				program_state,
// 				model_transform,
// 				materials
// 			);
// 		}

// 		let camFollowx = -1 * Math.sin(-1 * lerp_rotx);
// 		let camFollowy = -1 * Math.cos(lerp_rotx);
// 		let camFollowDistance = 16;

// 		let init_pos = Mat4.look_at(
// 			vec3(
// 				this.x + camFollowx * camFollowDistance,
// 				this.y + camFollowy * camFollowDistance,
// 				5
// 			),
// 			vec3(this.x, this.y, this.z),
// 			vec3(0, 0, 1)
// 		);

// 		program_state.set_camera(init_pos);

// 		this.lastrotx = lerp_rotx;
// 	}

// 	draw_coins(context, program_state) {
// 		let t, dt;
// 		(t = program_state.animation_time / 1000),
// 			(dt = program_state.animation_delta_time / 1000);
// 		const cx =
// 			this.model_transform[0][this.model_transform.length - 1];
// 		const cy =
// 			this.model_transform[1][this.model_transform.length - 1];
// 		const z =
// 			this.model_transform[2][this.model_transform.length - 1];

// 		for (let i = 0; i < 5; i++) {
// 			const coin_num = this.road_counter * 5 + i + 1;
// 			if (!(coin_num in this.coin_collected)) {
// 				this.coin_collected[coin_num] = false;
// 			}

// 			const coin_pos = this.model_transform
// 				.times(Mat4.translation(0, 0, 1.35))
// 				.times(Mat4.translation(0, 5 * i + 1, 0))
// 				.times(Mat4.rotation(t, 0, 0, 1));

// 			this.collect_coin(
// 				1.3,
// 				coin_pos[0][coin_pos.length - 1],
// 				coin_pos[1][coin_pos.length - 1],
// 				coin_num
// 			);

// 			if (!this.coin_collected[coin_num]) {
// 				this.shapes.coin.draw(
// 					context,
// 					program_state,
// 					coin_pos,
// 					this.materials.coin
// 				);
// 			}
// 		}
// 	}

// 	draw_road(
// 		context,
// 		program_state,
// 		coins = false,
// 		trigger = false,
// 		callback = () => {},
// 		width = 10,
// 		length = 10
// 	) {
// 		if (coins) {
// 			this.draw_coins(context, program_state);
// 		}

// 		if (false) {
// 			let temp_model_transform = this.model_transform.times(
// 				Mat4.translation(0, 10, 1)
// 			);
// 			const x =
// 				temp_model_transform[0][temp_model_transform.length - 1];
// 			const y =
// 				temp_model_transform[1][temp_model_transform.length - 1];
// 			const z =
// 				temp_model_transform[2][temp_model_transform.length - 1];

// 			const temp = this.trigger_count;
// 			const trigger = () => {
// 				this.trigger_check[temp] = this.trigger_check[temp - 1];
// 				console.log(this.trigger_check);
// 			};

// 			if (this.horizontal) {
// 				this.colliders.push(
// 					new Trigger_Collider(y, x - 12.5, 25, 1, trigger)
// 				);
// 			} else {
// 				this.colliders.push(
// 					new Trigger_Collider(x - 12.5, y, 25, 1, trigger)
// 				);
// 			}

// 			this.trigger_count += 1;
// 		}

// 		this.model_transform = this.model_transform.times(
// 			Mat4.translation(0, length, 0)
// 		);

// 		const road = this.model_transform.times(
// 			Mat4.scale(width, length, 1)
// 		);

// 		this.shapes.plane.draw(
// 			context,
// 			program_state,
// 			road,
// 			this.materials.road
// 		);

// 		let wally = -length + 1;
// 		let rightwall_transform = this.model_transform.times(
// 			Mat4.translation(length + 1, wally, 1)
// 		);
// 		let leftwall_transform = this.model_transform.times(
// 			Mat4.translation(-length - 1, wally, 1)
// 		);
// 		for (let i = 1; i <= 10; i++) {
// 			//leftside
// 			this.shapes.wall.draw(
// 				context,
// 				program_state,
// 				leftwall_transform.times(Mat4.rotation(Math.PI / 2, 1, 0, 0)),
// 				this.materials.wall
// 			);
// 			//right side
// 			this.shapes.wall.draw(
// 				context,
// 				program_state,
// 				rightwall_transform.times(
// 					Mat4.rotation(Math.PI / 2, 1, 0, 0)
// 				),
// 				this.materials.wall
// 			);
// 			wally += 2;
// 			rightwall_transform = this.model_transform.times(
// 				Mat4.translation(length + 1, wally, 1)
// 			);
// 			leftwall_transform = this.model_transform.times(
// 				Mat4.translation(-length - 1, wally, 1)
// 			);
// 		}

// 		const x =
// 			this.model_transform[0][this.model_transform.length - 1];
// 		const y =
// 			this.model_transform[1][this.model_transform.length - 1];
// 		const z =
// 			this.model_transform[2][this.model_transform.length - 1];

// 		if (trigger) {
// 			const temp = this.trigger_count;
// 			const trigger = () => {
// 				this.trigger_check[temp] = this.trigger_check[temp - 1];
// 				console.log(this.trigger_check);
// 			};

// 			if (this.horizontal) {
// 				this.colliders.push(
// 					new Trigger_Collider(
// 						x,
// 						y - width - 1,
// 						1,
// 						width * 2 + 2,
// 						trigger
// 					)
// 				);
// 			} else {
// 				this.colliders.push(
// 					new Trigger_Collider(
// 						x - width - 1,
// 						y,
// 						width * 2 + 2,
// 						1,
// 						trigger
// 					)
// 				);
// 			}

// 			this.trigger_count += 1;
// 		}
// 		// let colx, coly, colxw, colyw;

// 		// if (this.horizontal) {
// 		// 	coly = x - width - 1;
// 		// 	colx = y - length - 1;
// 		// 	colyw = 1.5;
// 		// 	colxw = length * 2 + 5;
// 		// } else {
// 		// 	colx = x - width - 1;
// 		// 	coly = y - length - 1;
// 		// 	colxw = 1.5;
// 		// 	colyw = length * 2 + 5;
// 		// }

// 		if (!this.horizontal) {
// 			this.colliders.push(
// 				new Box_Collider(
// 					x - width - 1,
// 					y - length - 1,
// 					2,
// 					length * 2 + 5
// 				)
// 			);

// 			this.colliders.push(
// 				new Box_Collider(
// 					x + width - 1,
// 					y - length - 1,
// 					2,
// 					length * 2 + 5
// 				)
// 			);
// 		} else {
// 			this.colliders.push(
// 				new Box_Collider(
// 					x - length - 1,
// 					y - width - 1,
// 					length * 2 + 2,
// 					2
// 				)
// 			);

// 			this.colliders.push(
// 				new Box_Collider(
// 					x - length - 1,
// 					y + width - 1,
// 					length * 2 + 2,
// 					2
// 				)
// 			);
// 		}

// 		this.model_transform = this.model_transform.times(
// 			Mat4.translation(0, length, 0)
// 		);

// 		this.road_counter += 1;
// 	}

// 	draw_flag(context, program_state, model_transform) {
// 		let left_pole_transform = model_transform
// 			.times(Mat4.translation(-11, 0, 0))
// 			.times(Mat4.scale(0.25, 0.25, 15));
// 		let right_pole_transform = model_transform
// 			.times(Mat4.translation(11, 0, 0))
// 			.times(Mat4.scale(0.25, 0.25, 15));
// 		let flag_transform = model_transform
// 			.times(Mat4.rotation(Math.PI / 2, 1, 0, 0))
// 			.times(Mat4.translation(0, 7, 0))
// 			.times(Mat4.scale(10, 1.25, 1));

// 		this.shapes.pole.draw(
// 			context,
// 			program_state,
// 			left_pole_transform,
// 			this.materials.metal
// 		);
// 		this.shapes.pole.draw(
// 			context,
// 			program_state,
// 			right_pole_transform,
// 			this.materials.metal
// 		);
// 		this.shapes.plane.draw(
// 			context,
// 			program_state,
// 			flag_transform,
// 			this.materials.flag
// 		);
// 	}

// 	draw_win(context, program_state) {
// 		let prev = this.materials.road;
// 		this.materials.road = this.materials.win;
// 		this.draw_road(context, program_state);

// 		let temp_model_transform = this.model_transform.times(
// 			Mat4.translation(0, -10, 1)
// 		);
// 		this.draw_flag(context, program_state, temp_model_transform);

// 		const x =
// 			temp_model_transform[0][temp_model_transform.length - 1];
// 		const y =
// 			temp_model_transform[1][temp_model_transform.length - 1];
// 		const z =
// 			temp_model_transform[2][temp_model_transform.length - 1];

// 		const trigger = () => {
// 			console.log(this.trigger_check);
// 			const keys = Object.keys(this.trigger_check);
// 			console.log(keys);
// 			if (
// 				keys.length > 2 &&
// 				this.trigger_check[keys[keys.length - 1]]
// 			) {
// 				console.log(`lap ${this.lap} finished`);
// 				const laps = document.querySelector('.laps');
// 				console.log(laps);
// 				this.lap += 1;
// 				if (this.lap == 4) {
// 					laps.textContent = `Laps: Done`;
// 				} else {
// 					laps.textContent = `Laps: ${this.lap}/3`;
// 				}

// 				this.trigger_check = { 0: true };
// 				this.trigger_count = 1;
// 				if (this.lap == 4) {
// 					this.map_sound.pause();
// 					const victory = new Audio('../assets/victory.mp3');
// 					victory.play();

// 					let modal = document.getElementById('myModal');
// 					let score = document.querySelector('.final-score');
// 					let time = document.querySelector('.time');
// 					let time_left = document.querySelector('.time-left');
// 					score.textContent = `Score: ${this.score}`;

// 					time.textContent = time_left.textContent;
// 					clearInterval(this.timer);

// 					modal.style.display = 'block';
// 				}
// 			}
// 		};

// 		this.colliders.push(
// 			new Trigger_Collider(x - 10, y, 20, 1, trigger)
// 		);
// 		this.materials.road = prev;
// 	}

// 	draw_curve(context, program_state, direction) {
// 		// console.log("drawing");
// 		let xScale,
// 			xTrans,
// 			adjustAngle,
// 			adjustX,
// 			xWallOuter,
// 			xWallInner,
// 			quadrant;

// 		if (direction == 'r') {
// 			xTrans = 30;
// 			xScale = 20;
// 			xWallOuter = 21;
// 			xWallInner = 10;
// 			adjustAngle = -Math.PI / 2;
// 			adjustX = -30;
// 		} else {
// 			xTrans = -30;
// 			xScale = -20;
// 			xWallOuter = -21;
// 			xWallInner = -10;
// 			adjustAngle = Math.PI / 2;
// 			adjustX = 30;
// 		}

// 		if (this.mapOrientation == 0) {
// 			if (direction == 'r') {
// 				quadrant = 2;
// 			} else {
// 				quadrant = 1;
// 			}
// 		} else if (this.mapOrientation == (3 * Math.PI) / 2) {
// 			if (direction == 'r') {
// 				quadrant = 1;
// 			} else {
// 				quadrant = 4;
// 			}
// 		} else if (this.mapOrientation == Math.PI) {
// 			if (direction == 'r') {
// 				quadrant = 4;
// 			} else {
// 				quadrant = 3;
// 			}
// 		} else {
// 			if (direction == 'r') {
// 				quadrant = 3;
// 			} else {
// 				quadrant = 2;
// 			}
// 		}

// 		this.mapOrientation += adjustAngle;
// 		if (this.mapOrientation < 0) {
// 			this.mapOrientation = (3 * Math.PI) / 2;
// 		} else if (this.mapOrientation > (3 * Math.PI) / 2) {
// 			this.mapOrientation = 0;
// 		}

// 		this.model_transform = this.model_transform.times(
// 			Mat4.translation(xTrans, 0, 0)
// 		);

// 		this.shapes.quarter_curve.draw(
// 			context,
// 			program_state,
// 			this.model_transform.times(Mat4.scale(xScale, -20, 1)),
// 			this.materials.curve
// 		);
// 		this.shapes.outer_curved_wall.draw(
// 			context,
// 			program_state,
// 			this.model_transform.times(Mat4.scale(xWallOuter, -21, 1)),
// 			this.materials.curved_wall
// 		);

// 		this.shapes.inner_curved_wall.draw(
// 			context,
// 			program_state,
// 			this.model_transform.times(Mat4.scale(xWallInner, -10, 1)),
// 			this.materials.curved_wall
// 		);

// 		//adjust for next trackw
// 		const x =
// 			this.model_transform[0][this.model_transform.length - 1];
// 		const y =
// 			this.model_transform[1][this.model_transform.length - 1];
// 		const z =
// 			this.model_transform[2][this.model_transform.length - 1];

// 		this.colliders.push(
// 			new Curve_Collider(x, y, Math.abs(xScale) - 1, 2, quadrant, 2)
// 		);

// 		this.colliders.push(
// 			new Curve_Collider(
// 				x,
// 				y,
// 				Math.abs(xScale) + Math.abs(xWallOuter),
// 				2,
// 				quadrant,
// 				1
// 			)
// 		);

// 		//change orientation
// 		this.horizontal = !this.horizontal;
// 		//change position
// 		this.model_transform = this.model_transform
// 			.times(Mat4.rotation(adjustAngle, 0, 0, 1))
// 			.times(Mat4.translation(adjustX, 0, 0));
// 	}

// 	display(context, program_state) {
// 		super.display(context, program_state);
// 		let t, dt;
// 		(t = program_state.animation_time / 1000),
// 			(dt = program_state.animation_delta_time / 1000);
// 		let model_transform = Mat4.identity();

// 		this.draw_environment(context, program_state, model_transform);
// 		//player

// 		this.draw_car(context, program_state, model_transform);
// 		//radius of coin = 1.3

// 		this.model_transform = Mat4.identity();
// 		const score = document.querySelector('.score');
// 		score.textContent = `Score: ${this.score}`;

// 		this.model_transform = Mat4.identity();
// 		this.road_counter = 0;
// 		this.colliders = [];

// 		this.trigger_count = 1;

// 		this.mapOrientation = 0;
// 		this.horizontal = false;
// 	}
// }
