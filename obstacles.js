import {tiny, defs} from './examples/common.js';
import { Path } from './components/paths.js';
// Pull these names into this module's scope for convenience:
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;
const max_spawn_dist = 100;

export class Collidable {
    constructor(snake_position, radius = 1) {
        const phong = new defs.Phong_Shader();
        this.shapes = {'ball': new defs.Subdivision_Sphere(4)};
        this.material_default = { shader: phong, ambient: .2, diffusivity: 1, specularity: .5, color: color( .9,.5,.9,1 ) };
        this.position = null;
        this.radius = radius;
        this.transform = null;
        this.set_new_position(snake_position, radius);
    }

    set_new_position(snake_position, sphere_radius) {
        this.position = vec3(
            Math.floor((Math.random()-0.5)*max_spawn_dist) + snake_position[0], 
            1, 
            Math.floor((Math.random()-0.5)*max_spawn_dist) + snake_position[2]
        );

        this.transform = Mat4.translation(this.position[0], this.position[1], this.position[2])
                            .times(Mat4.scale(sphere_radius, sphere_radius, sphere_radius));

        // if (this.)
            // If this position is too close to the snake, respawn

    }

    draw(webgl_manager, uniforms, material_override) {
        this.shapes.ball.draw(webgl_manager, uniforms, this.transform ,material_override ?? this.material_default);
    }

    destroy_and_respawn(snake_position) {
        this.set_new_position(snake_position, this.radius);
    }
}

export class Food extends Collidable{
    do_something(snake) {
        snake.add_segment();
        this.destroy_and_respawn(snake.sim.particles[0].position);
    }
}

export class Powerup extends Collidable {
    constructor(snake_position, radius = 1.5){
        super(snake_position, radius);
        let id = Math.floor(Math.random() * 4);
        console.log("id", id);
        console.log("position", this.position);
        this.spline = new Path(id, this.position[0], this.position[2]).spline;
    }
    update(dt, t){
        let t_norm =(Math.cos(t*0.3) + 1)/2;
        this.position = this.spline.get_position(t_norm);
    }

    do_something(snake) {
        // snake.add_segment();

        // add a powerup function
        this.destroy_and_respawn(snake.sim.particles[0].position);
    }
}

export class Obstacle extends Collidable {
    do_something(snake) {
        // add code to game over
    }
}