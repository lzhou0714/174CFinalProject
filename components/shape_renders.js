import {tiny, defs} from '../examples/common.js';

const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

export class CurveShape extends Shape {
    constructor (curve_lookup_table, SAMPLE_COUNT, curve_color=color(1, 0, 0, 1)) {
      super("position", "normal");
  
      this.material = {shader: new defs.Phong_Shader, ambient: 1.0, color: curve_color}
  
      if (curve_lookup_table && SAMPLE_COUNT) {
        for (let i = 0; i < SAMPLE_COUNT + 1; i++) {
          let t = 1.0 * i / SAMPLE_COUNT;
          const point = curve_lookup_table.get(t);
          this.arrays.position.push(point);
          this.arrays.normal.push(vec3(0, 0, 0));
        }
      } else {
        throw "No table passed into curve shape";
      }
    }
  
    draw(webgl_manager, uniforms) {
      super.draw(webgl_manager, uniforms, Mat4.identity(), this.material, "LINE_STRIP");
    }
  }

export class ParticleShapeRender extends defs.Subdivision_Sphere {
    constructor(particle, particle_color = color(1, 0, 0, 1)) {
        super(4);
        this.particle_object = particle;
        this.radius = 1;
        this.material = { shader: new defs.Phong_Shader, ambient: .2, diffusivity: 1, specularity:  1, color: particle_color }
    }

    draw(webgl_manager, uniforms) {
        const particle_transform = Mat4.translation(this.particle_object.position[0], this.particle_object.position[1], this.particle_object.position[2])
          .times(Mat4.scale(this.radius, this.radius, this.radius));
        super.draw(webgl_manager, uniforms, particle_transform, this.material, "LINE_STRIP")
    }
}

export class SpringShapeRender extends defs.Cube {
  constructor(spring, spring_color = color(0, 0, 1, 1)) {
    super(10, 10, [[0, 0], [0, 0]]);
    this.material = { shader: new defs.Phong_Shader, ambient: .2, diffusivity: 1, specularity:  1, color: spring_color }

    if (spring) {
      this.spring = spring
    } else {
      throw "spring not passed into renderer";
    }
  }
  
  draw(webgl_manager, uniforms) {
    const p1 = this.spring.particle_i.position;
    const p2 = this.spring.particle_j.position;
    const len = (p2.minus(p1)).norm();
    const center = (p1.plus(p2)).times(0.5);

    let model_transform = Mat4.scale(0.05, len / 2.0, 0.05);

    const p = p1.minus(p2).normalized();
    let v = vec3(0, 1, 0);
    if (Math.abs(v.cross(p).norm() < 0.1)) {
      v = vec3(0, 0, 1);
      model_transform = Mat4.scale(0.05, 0.05, len / 2.0);
    }
    const w = v.cross(p).normalized();

    const theta = Math.acos(v.dot(p));
    model_transform.pre_multiply(Mat4.rotation(theta, w[0], w[1], w[2]));
    model_transform.pre_multiply(Mat4.translation(center[0], center[1], center[2]));
    super.draw(webgl_manager, uniforms, model_transform, this.material);
  }
}