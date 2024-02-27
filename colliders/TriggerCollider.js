import { Collider } from './Collider.js';

export class Trigger_Collider extends Collider {
	constructor(
		x,
		y,
		xlen,
		ylen,
		callback = () => {
			console.log('collided');
		}
	) {
		super();
		this.x = x;
		this.y = y;
		this.w = xlen;
		this.l = ylen;
		this.callback = callback;
	}

	check_collision(x, y) {
		let resx = x;
		let resy = y;
		if (
			this.x < x &&
			this.x + this.w > x &&
			this.y < y &&
			this.y + this.l > y
		) {
			if (
				Math.min(x - this.x, this.x + this.w - x) <
				Math.min(y - this.y, this.y + this.l - y)
			) {
				// Get axis closest to edge of shape
				if (x - this.x > this.w / 2) {
					// Right side
					resx = this.x + this.w;
				} else {
					// Left side
					resx = this.x;
				}
			} else {
				if (y - this.y > this.l / 2) {
					// Right side
					resy = this.y + this.l;
				} else {
					// Left side
					resy = this.y;
				}
			}
		}

		if (resx != x || resy != y) {
			this.callback();
		}

		return { resx: x, resy: y };
	}
}
