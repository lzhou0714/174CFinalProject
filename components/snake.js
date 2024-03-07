import {tiny, defs} from '../examples/common.js';
import { Simulation, Spring } from './particle_spring_sim.js';
import { ParticleShapeRender, SpringShapeRender } from './shape_renders.js';

const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

export class Snake {
    constructor(snake_length = 3) {
        this.length = snake_length;
        // Default values for particles and springs
        this.particle_mass = 10;
        this.spring_ks = 2500;
        this.spring_kd = 100;
        this.spring_length = 1;

        // Create simulation
        this.sim = new Simulation();
        this.sim.gravity = 9.8;
        this.sim.ground_kd = 1000;
        this.sim.ground_ks = 50000;
        this.sim.integration = "verlet";
        this.sim.create_particles(this.length);
        this.sim.create_springs(this.length - 1);
        this.sim.set_particle(0, this.particle_mass, 5, 1, 0, 0, 0, 0);
        this.sim.set_particle(1, this.particle_mass, 4, 1, 0, 0, 0, 0);
        this.sim.set_particle(2, this.particle_mass, 3, 1, 0, 0, 0, 0);

        this.sim.set_spring(0, 0, 1, this.spring_ks, this.spring_kd, this.spring_length);
        this.sim.set_spring(1, 1, 2, this.spring_ks, this.spring_kd, this.spring_length);

        // Initialize shapes for drawing
        this.renders = [];
        for (const particle of this.sim.particles) {
            this.renders.push(new ParticleShapeRender(particle));
          }
          for (const spring of this.sim.springs) {
            this.renders.push(new SpringShapeRender(spring));
          }
    }

    draw(webgl_manager, uniforms) {
        for (const render of this.renders) {
            render.draw(webgl_manager, uniforms);
        }
    }

    advance_frame(time_step, head_position_delta) {
        this.sim.particles[0].position = this.sim.particles[0].position.plus(head_position_delta);
        this.sim.advance_frame(time_step);
    }

    // Add a new segment to the snake
    add_segment() {
        this.sim.append_spring_and_particle(
            this.particle_mass, 
            this.sim.particles[this.length - 1].position[0], 
            this.sim.particles[this.length - 1].position[1] + 2, 
            this.sim.particles[this.length - 1].position[2], 
            0, 
            0, 
            0, 
            this.length - 1, 
            this.length, 
            this.spring_ks, 
            this.spring_kd, 
            this.spring_length
        );

        this.renders.push(new ParticleShapeRender(this.sim.particles[this.sim.particles.length - 1]));
        this.renders.push(new SpringShapeRender(this.sim.springs[this.sim.springs.length - 1]));

        this.length += 1;
    }

}