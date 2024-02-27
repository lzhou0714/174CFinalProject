import {tiny, defs} from '../examples/common.js';

const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

export const SAMPLE_COUNT = 1000;
export class HermiteSpline {

    constructor() {
      this.points = [];
      this.tangents = [];
      this.size = 0;
  
      // Lookup table to approximate position of spline at sample intervals
      this.lookup_table = new Map();
    }
  
    add_point(x, y, z, sx, sy, sz) {
      this.points.push(vec3(x, y, z));
      this.tangents.push(vec3(sx, sy, sz));
      this.size = this.size + 1;
  
      // Update the lookup table
      this._calculate_lookup_table();
    }
  
    set_point(index, x, y, z) {
      if (index >= this.size) {
        throw "Set Point: Index out of bounds";
      }
      this.points[index] = vec3(x, y, z);
  
      // Update the lookup table
      this._calculate_lookup_table();
    }
  
    set_tangent(index, tx, ty, tz) {
      if (index >= this.size) {
        throw "Set Tangent: Index out of bounds";
      }
      this.tangents[index] = vec3(tx, ty, tz);
  
      // Update the lookup table
      this._calculate_lookup_table();
    }
  
    get_position(t) {
      if (this.size < 2) {
        throw "Not enough points";
      }
  
      // Find the 2 adjacent points and tangents to the t
      const lower_index = Math.floor(t * (this.size - 1));
      const upper_index = Math.ceil(t * (this.size - 1));
      const lower_point = this.points[lower_index].copy();
      const upper_point = this.points[upper_index].copy();
      const lower_tangent = this.tangents[lower_index].copy();
      const upper_tangent = this.tangents[upper_index].copy();
      // new_t: where t is located between the 2 adjacent points scaled to interval [0, 1]
      const new_t = (t * (this.size - 1))%1.0;
  
      // Use formula
      // (2s^3 - 3s^2 + 1)*p_0 + (s^3 - 2s^2 + s)*m_0/this.size + (-2s^3 + 3s^2)*p_1 + (s^3 - s^2)*m_1/this.size
      return lower_point.times(this.h0(new_t))
        .plus(lower_tangent.times(this.h1(new_t)))
        .plus(upper_point.times(this.h2(new_t)))
        .plus(upper_tangent.times(this.h3(new_t)));
    }
  
    _calculate_lookup_table() {
      if (this.size < 2) {
        return;
      }
      // Add SAMPLE_COUNT number of samples to table
      // Interval of 1/SAMPLE_COUNT
      for (let i = 0; i <= SAMPLE_COUNT; i++) {
        const t = i / SAMPLE_COUNT;
        const position = this.get_position(t);
        this.lookup_table.set(t, position);
      }
    }
  
    h0(t) {
      return 2 * t**3 - 3 * t**2 + 1;
    }
    h1(t) {
      return (t**3 - 2*t**2 + t)/(this.size - 1);
    }
    h2(t) {
      return -2*t**3 + 3*t**2;
    }
    h3(t) {
      return (t**3 - t**2)/(this.size - 1);
    }
  
  }