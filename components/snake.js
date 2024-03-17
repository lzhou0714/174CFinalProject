import {tiny, defs} from '../examples/common.js';
import { Simulation, Spring } from './particle_spring_sim.js';
import { ParticleShapeRender, SpringShapeRender } from './shape_renders.js';
import { SnakeHead } from './snake_head.js';

const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

export class Snake {
    constructor(game, snake_length = 3) {
        this.game = game;
        this.length = snake_length;
        // Default values for particles and springs
        this.particle_mass = 10;
        this.spring_ks = 2500;
        this.spring_kd = 100;
        this.spring_length = 1.5;
        this.particle_radius = 1;
        this.particle_head_radius = 1.3;

        this.color_mode = 1;
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
        for (let i = 0; i < this.sim.particles.length; i++) {
            let particle_color  = color(1,1,1,1);

            if (this.color_mode ===true){
                particle_color = color(1,0,0,1);
            }
            this.color_mode = !this.color_mode;

            if (i === 0) {
                // Copy the material used by ParticleShapeRender
                const temp = new ParticleShapeRender(
                    {particle: this.sim.particles[0], 
                    particle_color: color(1,0,0,1)});

                this.snake_head = new SnakeHead(this.sim.particles[0], this.game, temp.material, this.particle_head_radius);
                this.renders.push(this.snake_head);
            } else {
                this.renders.push(new ParticleShapeRender(
                    {particle: this.sim.particles[i], 
                    particle_color: particle_color, particle_radius: this.particle_radius}));
            }
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
        this.game.score += 1;
        this.game.pass_score_to_dom();
        if ((this.game.score - 2) % 4 === 0 && this.game.score < 15) {
            this.game.increase_difficulty(15);
        }

        let particle_color  = color(1,1,1,1);
            if (this.color_mode ===true){
                particle_color = color(1,0,0,1);
            }
            this.color_mode = !this.color_mode;
        this.sim.append_spring_and_particle(
            this.particle_mass, 
            this.sim.particles[this.length - 1].position[0], 
            2, 
            this.sim.particles[this.length - 1].position[2] + 1, 
            0, 
            0, 
            0, 
            this.length - 1, 
            this.length, 
            this.spring_ks, 
            this.spring_kd, 
            this.spring_length
        );

        this.renders.push(new ParticleShapeRender({particle: this.sim.particles[this.sim.particles.length - 1],
            particle_color: particle_color}));
        this.renders.push(new SpringShapeRender(this.sim.springs[this.sim.springs.length - 1]));

        this.length += 1;
    }

    is_overlapping_obstacle(obstacle) {

        if (obstacle.position === null) {
            return false;
        }
        for (let i = 0; i < this.sim.particles.length; i++) {
            let snake_particle_radius = this.particle_radius
            if (i === 0) {
                snake_particle_radius = this.particle_head_radius;
            } 

            const snake_particle_pos = vec3(this.sim.particles[i].position[0], 1, this.sim.particles[i].position[2]);

            const other_pos = vec3(obstacle.position[0], 1, obstacle.position[2]);
            if (snake_particle_pos.minus(other_pos).norm() <= obstacle.radius + snake_particle_radius) {
                return true;
            }
        }
        return false;
    }

}