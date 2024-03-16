import {tiny, defs} from '../examples/common.js';
import { slerp } from '../part_three_chain.js';

// Pull these names into this module's scope for convenience:
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

const shapes = {
    'sphere': new defs.Subdivision_Sphere( 5 ),
};

export class SnakeHead {
    constructor(particle, game, material, head_size) {
        this.particle = particle;
        this.game = game;
        this.material = material;
        this.head_size = head_size;
        // 3. Model Human
        const sphere_shape = shapes.sphere;

        const head_transform = Mat4.scale(this.head_size, this.head_size, this.head_size);
        this.head_node = new Node("head", sphere_shape, head_transform);
        const root_location = Mat4.translation(0, 0, 0);
        this.root = new Arc("root", null, this.head_node, root_location);

        const left_antenna_transform = Mat4.scale(0.1, 0.6, 0.1).pre_multiply(Mat4.translation(0, 0.3, 0));
        this.left_antenna = new Node("left_antenna", sphere_shape, left_antenna_transform);
        const left_antenna_arc_location = Mat4.translation(1.0, this.head_size - 0.3, 0.4);
        this.left_antenna_arc = new Arc("left_antenna_arc", this.head_node, this.left_antenna, left_antenna_arc_location);
        this.head_node.children_arcs.push(this.left_antenna_arc);
        this.left_antenna_arc.set_dof(true, false, true);

        const left_antenna2_transform = Mat4.scale(0.1, 0.6, 0.1).pre_multiply(Mat4.translation(0, 0.3, 0));
        this.left_antenna2 = new Node("left_antenna", sphere_shape, left_antenna2_transform);
        const left_antenna_joint_location = Mat4.translation(0, 1.2, 0);
        this.left_antenna_joint = new Arc("left_antenna_joint", this.left_antenna, this.left_antenna2, left_antenna_joint_location);
        this.left_antenna.children_arcs.push(this.left_antenna_joint);
        this.left_antenna_joint.set_dof(true, true, true);
        
        const left_antenna_end_transform = Mat4.scale(0.25, 0.25, 0.25);
        this.left_antenna_end = new Node("left_antenna_end", sphere_shape, left_antenna_end_transform);
        const left_antenna_end_joint_location = Mat4.translation(0, 1.1, 0);
        this.left_antenna_end_joint = new Arc("left_antenna_end_joint", this.left_antenna2, this.left_antenna_end, left_antenna_end_joint_location);
        this.left_antenna2.children_arcs.push(this.left_antenna_end_joint);

        const left_antenna_local_pos = vec4(0, 0.1, 0, 1);
        this.end_effector = new End_Effector("antenna_end", this.left_antenna_end_joint, left_antenna_local_pos);
        this.left_antenna_end_joint.end_effector = this.end_effector;

        const right_antenna_transform = Mat4.scale(0.1, 0.6, 0.1).pre_multiply(Mat4.translation(0, 0.3, 0));
        this.right_antenna = new Node("right_antenna", sphere_shape, right_antenna_transform);
        const right_antenna_arc_location = Mat4.translation(1.0, this.head_size - 0.3, -0.4);
        this.right_antenna_arc = new Arc("right_antenna_arc", this.head_node, this.right_antenna, right_antenna_arc_location);
        this.head_node.children_arcs.push(this.right_antenna_arc);
        this.right_antenna_arc.set_dof(true, false, true);

        const right_antenna2_transform = Mat4.scale(0.1, 0.6, 0.1).pre_multiply(Mat4.translation(0, 0.3, 0));
        this.right_antenna2 = new Node("right_antenna", sphere_shape, right_antenna2_transform);
        const right_antenna_joint_location = Mat4.translation(0, 1.2, 0);
        this.right_antenna_joint = new Arc("right_antenna_joint", this.right_antenna, this.right_antenna2, right_antenna_joint_location);
        this.right_antenna.children_arcs.push(this.right_antenna_joint);
        this.right_antenna_joint.set_dof(true, true, true);

        const right_antenna_end_transform = Mat4.scale(0.25, 0.25, 0.25);
        this.right_antenna_end = new Node("right_antenna_end", sphere_shape, right_antenna_end_transform);
        const right_antenna_end_joint_location = Mat4.translation(0, 1.1, 0);
        this.right_antenna_end_joint = new Arc("right_antenna_end_joint", this.right_antenna2, this.right_antenna_end, right_antenna_end_joint_location);
        this.right_antenna2.children_arcs.push(this.right_antenna_end_joint);

        this.dof = 5;
        this.Jacobian = null;
        this.theta = [0, -0.7, 0, -1.9, -1.4, 0, 0];
        this.theta_magnitude_max = [0.5, 1, 1, 100,  100, 2, 2, 100];
        // this.theta_max_value = [1000, 1000, ]
        this.apply_theta();
    }

    // 4. Inverse kinematic solver with pseudoinverse approach
    move_end_effector_to_p(p_goal) {
        const delta = 0.04;
        let count = 0;
        let error_vector = p_goal.minus(this.get_end_effector_position());

        while (error_vector.norm() > delta * 2 && count < 2) {
            count++;
            const J = this.calculate_Jacobian();

            error_vector = p_goal.minus(this.get_end_effector_position());
            const step_vector = error_vector.normalized().times(delta)

            let delta_x = Array(3);
            delta_x[0] = step_vector[0];
            delta_x[1] = step_vector[1];
            delta_x[2] = step_vector[2];


            const delta_theta = this.calculate_delta_theta(J, delta_x);
            for (let j = 0; j < this.dof; j++) {
                if (Math.abs(this.theta[j] + delta_theta._data[j][0]) > this.theta_magnitude_max[j]) {
                    continue;
                } else {
                    this.theta[j] += delta_theta._data[j][0];
                }
            }
            this.apply_theta();
        }

        // if (delta_theta._data[0][0]) {
        this.theta[0] += -this.theta[0]/Math.abs(this.theta[0]) * Math.abs(this.theta[0] * 0.2);
        this.theta[2] += -this.theta[2]/Math.abs(this.theta[2]) * Math.abs(this.theta[0] * 0.2);
        this.apply_theta();
        // }
    }

    // mapping from global theta to each joint theta
    apply_theta() {
        const cut_off1 = this.left_antenna_arc.num_dof;
        const cut_off2 = this.left_antenna_arc.num_dof + this.left_antenna_joint.num_dof;
        this.left_antenna_arc.update_articulation(this.theta.slice(0, cut_off1));
        this.left_antenna_joint.update_articulation(this.theta.slice(cut_off1, cut_off2));
        this.left_antenna_end_joint.update_articulation(this.theta.slice(cut_off2, this.dof));
        this.right_antenna_arc.update_articulation(this.theta.slice(0, cut_off1));
        this.right_antenna_joint.update_articulation(this.theta.slice(cut_off1, cut_off2));
        this.right_antenna_end_joint.update_articulation(this.theta.slice(cut_off2, this.dof));
    }

    calculate_Jacobian() {
        let J = new Array(3);
        for (let i = 0; i < 3; i++) {
            J[i] = new Array(this.dof);
        }

        const delta = 0.01;
        const old_p = this.get_end_effector_position();
        for (let i = 0; i < this.dof; i++) {
            this.theta[i] += delta;
            this.apply_theta();
            const new_p = this.get_end_effector_position();

            J[0][i] = (new_p[0] - old_p[0])/delta;
            J[1][i] = (new_p[1] - old_p[1])/delta;
            J[2][i] = (new_p[2] - old_p[2])/delta;
            this.theta[i] -= delta;
        }
        this.apply_theta();

        return J; // 3x7 in my case.
    }

    calculate_delta_theta(J, dx) {
        const A = math.multiply(math.transpose(J), J);
        const A_invertible = math.add(math.identity(this.dof), A);
        const b = math.multiply(math.transpose(J), dx);
        const x = math.lusolve(A_invertible, b)

        return x;
    }

    get_end_effector_position() {
        // in this example, we only have one end effector.
        this.matrix_stack = [];
        this._rec_update(this.root, Mat4.identity());
        const v = this.end_effector.global_position; // vec4
        return vec3(v[0], v[1], v[2]);
    }

    _rec_update(arc, matrix) {
        if (arc !== null) {
            const L = arc.location_matrix;
            const A = arc.articulation_matrix;
            matrix.post_multiply(L.times(A));
            this.matrix_stack.push(matrix.copy());

            if (arc.end_effector !== null) {
                arc.end_effector.global_position = matrix.times(arc.end_effector.local_position);
            }

            const node = arc.child_node;
            const T = node.transform_matrix;
            matrix.post_multiply(T);

            matrix = this.matrix_stack.pop();
            for (const next_arc of node.children_arcs) {
                this.matrix_stack.push(matrix.copy());
                this._rec_update(next_arc, matrix);
                matrix = this.matrix_stack.pop();
            }
        }
    }

    draw(webgl_manager, uniforms) {
        const dot_prod = this.game.current_direction.dot(this.game.turn_direction);
        const antenna_end_point = vec4(2.75, 1.2, 0, 1);
        if ( dot_prod < 0.9) {
            // snake is turning
            const theta = Math.acos(dot_prod);
            const cross_prod = this.game.current_direction.cross(this.game.turn_direction).normalized();
            const rotation_matrix = Mat4.rotation(theta, 0, cross_prod[1], 0);
            const adjusted_end_point = rotation_matrix.times(antenna_end_point).times(1, 1, 1);

            this.move_end_effector_to_p(adjusted_end_point.to3());
            this.move_end_effector_to_p(adjusted_end_point.to3());
            this.move_end_effector_to_p(adjusted_end_point.to3());
        } else {
            this.move_end_effector_to_p(antenna_end_point);
        }
        // const antenna_angle = Math.atan2(this.game.turn_direction[2], this.game.current_direction)

        this.matrix_stack = [];
        const angle = Math.atan2(this.game.current_direction[2], this.game.current_direction[0]);
        const transform = Mat4.rotation(-angle, 0, 1, 0).pre_multiply(Mat4.translation(this.particle.position[0], this.particle.position[1], this.particle.position[2]))
        this._rec_draw(this.root, transform, webgl_manager, uniforms, this.material);
    }

    _rec_draw(arc, matrix, webgl_manager, uniforms, material) {
        if (arc !== null) {
            const L = arc.location_matrix;
            const A = arc.articulation_matrix;
            matrix.post_multiply(L.times(A));
            this.matrix_stack.push(matrix.copy());

            const node = arc.child_node;
            const T = node.transform_matrix;
            matrix.post_multiply(T);
            node.shape.draw(webgl_manager, uniforms, matrix, material);

            matrix = this.matrix_stack.pop();
            for (const next_arc of node.children_arcs) {
                this.matrix_stack.push(matrix.copy());
                this._rec_draw(next_arc, matrix, webgl_manager, uniforms, material);
                matrix = this.matrix_stack.pop();
            }
        }
    }

    debug(arc=null, id=null) {

        // this.theta = this.theta.map(x => x + 0.01);
        // this.apply_theta();
        const J = this.calculate_Jacobian();
        let dx = [[0], [-0.02], [0]];
        if (id === 2)
            dx = [[-0.02], [0], [0]];
        const dtheta = this.calculate_delta_theta(J, dx);


        this.theta = this.theta.map((v, i) => v + dtheta[i][0]);
        this.apply_theta();
    }
}

class Node {
    constructor(name, shape, transform) {
        this.name = name;
        this.shape = shape;
        this.transform_matrix = transform;
        this.children_arcs = [];
    }
}

class Arc {
    constructor(name, parent, child, location) {
        this.name = name;
        this.parent_node = parent;
        this.child_node = child;
        this.location_matrix = location;
        this.articulation_matrix = Mat4.identity();
        this.end_effector = null;
        this.dof = {
            Rx: false,
            Ry: false,
            Rz: false,
        }
        this.num_dof = 0;
    }

    // Here I only implement rotational DOF
    set_dof(x, y, z) {
        this.dof.Rx = x;
        this.dof.Ry = y;
        this.dof.Rz = z;
        this.num_dof = x + y + z;
    }

    update_articulation(theta) {
        this.articulation_matrix = Mat4.identity();
        let index = 0;
        if (this.dof.Rx) {
            this.articulation_matrix.pre_multiply(Mat4.rotation(theta[index], 1, 0, 0));
            index += 1;
        }
        if (this.dof.Ry) {
            this.articulation_matrix.pre_multiply(Mat4.rotation(theta[index], 0, 1, 0));
            index += 1;
        }
        if (this.dof.Rz) {
            this.articulation_matrix.pre_multiply(Mat4.rotation(theta[index], 0, 0, 1));
        }
    }
}

class End_Effector {
    constructor(name, parent, local_position) {
        this.name = name;
        this.parent = parent;
        this.local_position = local_position;
        this.global_position = null;
    }
}