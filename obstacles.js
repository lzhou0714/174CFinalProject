import {tiny, defs} from './examples/common.js';

// Pull these names into this module's scope for convenience:
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;
export const max_spawn_dist = 75;
const phong = new defs.Phong_Shader();

export class Collidable {
    constructor(snake_position, radius = 1) {
        this.shapes = {'ball': new defs.Subdivision_Sphere(4)};
        this.position = null;
        this.radius = radius;
        this.transform = null;
        this.set_new_position(snake_position, radius, 10);
    }

    set_new_position(snake_position, sphere_radius, min_spawn_dist = 30) {
        this.position = vec3(
            Math.floor((Math.random()-0.5)*max_spawn_dist) + snake_position[0], 
            1, 
            Math.floor((Math.random()-0.5)*max_spawn_dist) + snake_position[2]
        );

        if (snake_position.minus(this.position).norm() <= min_spawn_dist) {
            // If this position is too close to the snake, respawn
            this.set_new_position(snake_position, sphere_radius)
        }

        this.transform = Mat4.translation(this.position[0], this.position[1], this.position[2])
                            .times(Mat4.scale(sphere_radius, sphere_radius, sphere_radius));

    }

    draw(webgl_manager, uniforms) {
        this.shapes.ball.draw(webgl_manager, uniforms, this.transform , this.material);
    }

    destroy_and_respawn(snake_position) {
        this.set_new_position(snake_position, this.radius);
    }
}

export class Food extends Collidable{
    constructor(snake_position, radius = 1) {
        super(snake_position, radius);
        this.material = { shader: phong, ambient: .2, diffusivity: 1, specularity: .5, color: color( 0, 0, 1, 1 ) };
    }

    do_something(snake) {
        snake.add_segment();
        this.destroy_and_respawn(snake.sim.particles[0].position);
    }
}

export class Obstacle extends Collidable {
    constructor(snake_position, radius = 1) {
        super(snake_position, radius);
        this.material = { shader: phong, ambient: .2, diffusivity: 1, specularity: .5, color: color( 1, 0, 0, 1 ) };
    }

    do_something(snake) {
        snake.game.game_over = true;
    }
}