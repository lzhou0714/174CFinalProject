import {tiny, defs} from './examples/common.js';
import { Path } from './components/paths.js';
// Pull these names into this module's scope for convenience:
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;
export const max_spawn_dist = 100;
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

    update() {
        // called every frame
    }

    destroy_and_respawn(snake_position) {
        this.set_new_position(snake_position, this.radius);
    }

    check_out_of_range(snake) {
        if (snake.sim.particles[0].position.minus(this.position).norm() > max_spawn_dist ||
        snake.is_overlapping_obstacle(this)) {
            this.destroy_and_respawn(snake.sim.particles[0].position);
        }
    }
}

export class Food extends Collidable{
    constructor(snake_position, radius = 1) {
        super(snake_position, radius);
        this.material = { shader: phong, ambient: .2, diffusivity: 1, specularity: .5, color: color( 0, 0, 1, 1 ) };
    }

    do_something(snake) {
        snake.add_segment();
    }
}

export class Powerup extends Collidable {
    constructor(snake_position, radius = 1.5){
        super(snake_position, radius);
        let id = Math.floor(Math.random() * 4) + 1;
        this.spline = new Path(id).spline;
        this.t = Math.random() * 100;
        this.delta = 0.0001;
        this.dist_moved_per_frame = Math.random() * 0.2 + 0.05;
        this.material = { shader: phong, ambient: .2, diffusivity: 1, specularity: .5, color: color( 1, 1, 0, 1 ) };
    }
    update(freeze_powerups = false){
        let t_norm =(Math.cos(this.t*0.3) + 1)/2;
        this.position = this.spline.get_position(t_norm).plus(this.permanent_position);
        this.transform = Mat4.translation(this.position[0], this.position[1], this.position[2])
                        .times(Mat4.scale(this.radius, this.radius, this.radius));

        const prev_pos = this.spline.get_position(t_norm);
        let new_pos = this.spline.get_position((Math.cos(this.t*0.3) + 1)/2);

        if (!freeze_powerups) {
            while (prev_pos.minus(new_pos).norm() < this.dist_moved_per_frame) {
                this.t += this.delta;
                new_pos = this.spline.get_position((Math.cos(this.t*0.3) + 1)/2);
            }
        }
    }

    set_new_position(snake_position, sphere_radius, min_spawn_dist = 30) {
        super.set_new_position(snake_position, sphere_radius, min_spawn_dist + 30);
        this.permanent_position = this.position;

    }

    check_out_of_range(snake) {
        if (snake.sim.particles[0].position.minus(this.permanent_position).norm() > max_spawn_dist ||
        snake.is_overlapping_obstacle(this)) {
            this.destroy_and_respawn(snake.sim.particles[0].position);
        }
    }
    
    destroy_and_respawn(snake_position) {
        this.set_new_position(snake_position, this.radius);
        let id = Math.floor(Math.random() * 4) + 1;
        this.spline = new Path(id).spline;
        this.t = Math.random() * 100;
    }
}

export class Powerup_SpeedUp extends Powerup {
    constructor(snake_position) {
        super(snake_position);
        this.material = { shader: phong, ambient: .2, diffusivity: 1, specularity: .5, color: color( 1, 0, 1, 1 ) };
    }

    do_something(snake) {
        console.log("speed up");
        snake.game.player_velocity = 0.2;
        setTimeout(() => {snake.game.player_velocity = 0.1}, 2000);
    }
}

export class Powerup_PlusThree extends Powerup {
    constructor(snake_position) {
        super(snake_position);
        this.material = { shader: phong, ambient: .2, diffusivity: 1, specularity: .5, color: color( 0, 1, 0, 1 ) };
    }

    do_something(snake) {
        console.log("plus three");
        snake.add_segment();
        snake.add_segment();
        snake.add_segment();
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