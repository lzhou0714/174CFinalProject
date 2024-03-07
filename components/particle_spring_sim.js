import {tiny, defs} from '../examples/common.js';

const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

export class Particle {
    constructor() {
      this.mass = 0;
      this.position = vec3(0, 0, 0);
      this.old_position = vec3(0, 0, 0);
      this.velocity = vec3(0, 0, 0);
      this.net_force = vec3(0, 0, 0);
      this.collided = false;
    }
  
    set(input_mass, x, y, z, vx, vy, vz) {
      this.mass = input_mass;
      this.position = vec3(x, y, z);
      this.old_position = vec3(x, y, z);
      this.velocity = vec3(vx, vy, vz);
    }
  
    set_velocity(vx, vy, vz) {
      this.velocity = vec3(vx, vy, vz);
    }

    set_position(x, y, z) {
      this.old_position = this.position;
      this.position = vec3(x, y, z);
    }
  
    reset_net_force() {
      this.net_force = vec3(0, 0, 0);
    }
  
    add_to_net_force(force) {
      this.net_force = this.net_force.plus(force);
    }
  
    advance_time_step_euler(delta_t) {
      const acceleration = this.net_force.times(1/this.mass);
      const old_velocity = this.velocity;
      this.velocity = this.velocity.plus(acceleration.times(delta_t));
      this.position = this.position.plus(old_velocity.times(delta_t));
    }
  
    advance_time_step_symplectic(delta_t) {
      const acceleration = this.net_force.times(1/this.mass);
      this.velocity = this.velocity.plus(acceleration.times(delta_t));
      this.position = this.position.plus(this.velocity.times(delta_t));
    }
  
    advance_time_step_verlet(delta_t) {
      const acceleration = this.net_force.times(1/this.mass);
      let temp_next_position = this.position.times(2);
      temp_next_position = temp_next_position.minus(this.old_position);
      temp_next_position = temp_next_position.plus(acceleration.times(delta_t * delta_t));
      this.old_position = this.position;
      this.position = temp_next_position;
    }
  
    advance_time_step_verlet_update_velocity(delta_t) {
      this.velocity = (this.position.minus(this.old_position)).times(1/delta_t);
    }
  }
  
export class Spring {
    constructor() {
      this.particle_i = null;
      this.particle_j = null;
      this.ks = 0;
      this.length = 0;
      this.kd = 0;
    }
  
    set(particle1, particle2, ks, kd, length) {
      this.particle_i = particle1;
      this.particle_j = particle2;
      this.ks = ks;
      this.kd = kd;
      this.length = length < 0 ? this.particle_i.position.minus(this.particle_j.position).norm() : length;
    }
  
    force_on_particle_i() {
      const d_ij = this.particle_j.position.minus(this.particle_i.position);
      const d_ij_norm = d_ij.norm();
      const d_ij_unit = d_ij.times(1/d_ij_norm);
      const v_ij = this.particle_j.velocity.minus(this.particle_i.velocity);
  
      // Calculate spring force
      const spring_force = d_ij_unit.times(d_ij_norm - this.length).times(this.ks);
  
      // Calculate damper force
      const damping_force = d_ij_unit.times(v_ij.dot(d_ij_unit)).times(this.kd);

      // Make force only in the direction of the spring so snake moves more in line
      const total_force = spring_force.plus(damping_force);
      const force_in_direction_of_spring = d_ij_unit.times(total_force.dot(d_ij_unit));
  
      return force_in_direction_of_spring;
    }
  
    force_on_particle_j() {
      return (this.force_on_particle_i()).times(-1);
    }
  }
  
const GROUND_POINT = vec3(0, 0.9, 0);
const GROUND_NORMAL = vec3(0, 1, 0);
// Assume frames per second = 60
const FPS = 60;
  
export class Simulation {
    constructor() {
      this.particles = []
      this.springs = []
      this.gravity = 9.8;
      this.ground_ks = 0;
      this.ground_kd = 0;
      this.integration = "euler";
      this.time_step = 0.001;
      this.time = 0;
      this.started = false;
      this.mu_s = 1;
      this.mu_k = 0.5;
    }
  
    create_particles(n) {
      this.particles = []
      for (let i = 0; i < n; i++) {
        this.particles.push(new Particle());
      }
    }
  
    create_springs(n) {
      this.springs = []
      for (let i = 0; i < n; i++) {
        this.springs.push(new Spring());
      }
    }
  
    set_particle(index, mass, x, y, z, vx, vy, vz) {
      this.particles[index].set(mass, x, y, z, vx, vy, vz);
    }

    append_spring_and_particle(mass, x, y, z, vx, vy, vz, pindex1, pindex2, ks, kd, length) {
      this.particles.push(new Particle());
      this.set_particle(this.particles.length - 1, mass, x, y, z, vx, vy, vz);

      this.springs.push(new Spring());
      this.set_spring(this.springs.length - 1, pindex1, pindex2, ks, kd, length);
    }
  
    set_spring(sindex, pindex1, pindex2, ks, kd, length) {
      this.springs[sindex].set(this.particles[pindex1], this.particles[pindex2], ks, kd, length);
    }
  
    calculate_plane_collision(particle) {
      if ((particle.position.minus(GROUND_POINT).dot(GROUND_NORMAL)) >= 0) {
        return vec3(0, 0, 0);
      }
  
      
      const collision_force = GROUND_NORMAL.times(this.ground_ks * (GROUND_POINT.minus(particle.position)).dot(GROUND_NORMAL))
                              .minus(GROUND_NORMAL.times(this.ground_kd * (particle.velocity.dot(GROUND_NORMAL))));
      return collision_force;
    }

    calculate_friction(particle) {
      const normal_force = Math.abs(this.gravity) * particle.mass;
      const static_friction_force = normal_force * this.mu_s;
      const dynamic_friction_force = normal_force * this.mu_k;

      const velocity_mag = particle.velocity.norm();
      if(velocity_mag === 0) {
        return vec3(0,0,0);
      }
      else {
        const friction_dir = particle.velocity.normalized().times(-1);
        const dynamic_friction_total = friction_dir.times(dynamic_friction_force);
        return dynamic_friction_total;
      }
    }
  
    advance_time_step(delta_t, exclude_particle = null) {
      // Calculate net force on each particle
      for (const particle of this.particles) {
        if (particle != exclude_particle) {
          particle.reset_net_force();
          // Update velocities before net force if using verlet integration
          if (this.integration === "verlet") {
            particle.advance_time_step_verlet_update_velocity(delta_t);
          }
          particle.add_to_net_force(vec3(0, -this.gravity, 0));
          particle.add_to_net_force(this.calculate_plane_collision(particle));

          // add friction force
          const friction_force = this.calculate_friction(particle);
          particle.add_to_net_force(friction_force);
        }
      }
      // Calculate forces from springs
      for (const spring of this.springs) {
        spring.particle_i.add_to_net_force(spring.force_on_particle_i());
        spring.particle_j.add_to_net_force(spring.force_on_particle_j());
      }

  
      // Update positions and velocities after one time step
      for (const particle of this.particles) {
        if (particle != exclude_particle) {
          // Pick integration method
          if (this.integration === "euler") {
            particle.advance_time_step_euler(delta_t);
          } else if (this.integration === "symplectic") {
            particle.advance_time_step_symplectic(delta_t);
          } else if (this.integration === "verlet") {
            particle.advance_time_step_verlet(delta_t);
          }
        }
      }
    }
  
    advance_frame(delta_t) {
      // How many steps of delta_t to do per frame (assumed 60 FPS)
      const num_samples = 1/delta_t/FPS;
  
      for (let i = 0; i < num_samples; i++) {
          this.advance_time_step(delta_t, this.particles[0]);
      }
    }

    get_head_position(){
      return this.particles[0].position;
    }
    lerpAngle(current, target, turnspeed) {
      return (target - current) * turnspeed;
    }
  }