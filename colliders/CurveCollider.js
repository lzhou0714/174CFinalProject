import { Collider } from './Collider.js';

export class Curve_Collider extends Collider {
	// Note - cartesian quadrants: 1 = top right, 2 = top left, 3 = bot left, 4 = bot right
	constructor(x, y, radius, thickness, quadrant, snapMode = 0) {
		super();
		this.x = x;
		this.y = y;
		this.r = radius; // How big the curve is
		this.t = thickness; // How thick the curve line itself is
		this.quad = quadrant;
		this.snapMode = snapMode;
	}

	check_collision(x, y) {
		// console.log("checking");
		if (this.quad == 1) {
			if (!(x > this.x && y > this.y)) {
				return { resx: x, resy: y };
			}
		} else if (this.quad == 2) {
			if (!(x < this.x && y > this.y)) {
				return { resx: x, resy: y };
			}
		} else if (this.quad == 3) {
			if (!(x < this.x && y < this.y)) {
				return { resx: x, resy: y };
			}
		} else {
			if (!(x > this.x && y < this.y)) {
				return { resx: x, resy: y };
			}
		}
		// Get distance to center of curvature
		let distance = Math.sqrt(
			Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2)
		);
		// console.log(this.r);
		// console.log(Math.abs(this.r - distance) < this.t);
		if (Math.abs(this.r - distance) < this.t) {
			// Collided
			let ux = (x - this.x) / distance;
			let uy = (y - this.y) / distance;
			if (this.snapMode == 2) {  // Snap to outer
				return {
					resx: ux * (this.r + this.t) + this.x,
					resy: uy * (this.r + this.t) + this.y,
				};
			} else if (this.snapMode == 1) {  // Snap to inner
				return {
					resx: ux * (this.r - this.t) + this.x,
					resy: uy * (this.r - this.t) + this.y,
				};
			} else {  // Snap normally
				if (this.r - distance < 0) {
					// Outside the curve
					return {
						resx: ux * (this.r + this.t) + this.x,
						resy: uy * (this.r + this.t) + this.y,
					};
				} else {
					// Inside the curve
					return {
						resx: ux * (this.r - this.t) + this.x,
						resy: uy * (this.r - this.t) + this.y,
					};
				}
			}

		} else {
			return { resx: x, resy: y };
		}
	}
}
