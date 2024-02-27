import {tiny, defs} from './examples/common.js';

// Pull these names into this module's scope for convenience:
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

// TODO: you should implement the required classes here or in another file.
//Euler

function 
visco_force(ks, kd, natural_length, p1, p2)
//f = ma --> acceleration = force/mass
{
  let v1= p1.velocity;
  let v2 = p2.velocity;
  let distance = p2.position.minus(p1.position).norm();
  let dir_vec =  p2.position.minus(p1.position).normalized();
  let spr_force = dir_vec.times((distance - natural_length)*(ks));
  let damp_force = (dir_vec).times(((v2.minus(v1)).dot(dir_vec))*ks);
  return spr_force.plus(damp_force);
}

class Particle {
  constructor(position = null, velocity = null, mass = null) {
      this.velocity = velocity;
      this.position = position;
      this.mass = mass;
      this.applied_force = vec3(0, 0, 0);
      this.acceleration = vec3(0, 0, 0);

  }
  set_velocity(velocity) {
    this.velocity = velocity;
  }
  set_position(position) {
    this.position = position;
    this.prev_pos = position;
  }
  set_mass(mass) {
    this.mass = mass;
  }

  update(dt, integration_method) {
    this.acceleration = this.applied_force.times(1 / this.mass);
    const old_position = this.position;
    const old_velocity = this.velocity;
    let new_pos = this.position;
    if (integration_method === "euler") {
      this.prev_pos = this.position;
      this.position.add_by(this.velocity.times(dt)); //update position using old vel
      this.velocity.add_by(this.acceleration.times(dt));

      this.position = new_pos;
    }
    else if (integration_method === "symplectic") {
      this.velocity.add_by(this.acceleration.times(dt));
      this.prev_pos = this.position;
      this.position.add_by(this.velocity.times(dt)); //update position using new val
      
    }
    else if (integration_method === "verlet") {
      let new_pos = this.position.times(2).minus(this.prev_pos).plus(this.acceleration.times(dt*dt));
      this.velocity = this.position.minus(old_position).times(1/dt);
      this.prev_pos = this.position;
     this.position = new_pos;


    }
  
  }

}

class Spring{
  constructor(){
    this.particle1 = null; //pt 1
    this.particle2 = null;// pt2
    this.ks = null;//spring constant
    this.kd = null;// dampling
    this.length = null; //naftural length
    this.prev_pos   = null;

  }
  link(particle1, particle2, ks, kd, length){
    this.particle1 = particle1;
    this.particle2 = particle2;
    this.ks = ks;
    this.kd = kd;

    if (length  > 0 ){
      this.length = length;
    }
    else{
      this.length = (this.particle1.position.minus(this.particles2.position)).norm();
    }
  }
  update(){
    const f_ij = visco_force(this.ks, this.kd, this.length,  this.particle1, this.particle2);
    this.particle1.applied_force.add_by(f_ij);
    this.particle2.applied_force.subtract_by(f_ij);
  }
}
class Simulation{
  constructor() {
    this.particles = [];
    this.num_particles = 0;
    this.draw_particles = false;

    this.springs = [];
    this.num_springs = 0;
    this.draw_springs = false;
    
    this.ground_ks = 0;
    this.ground_kd = 0;

    this.integration_method = null;
    this.g_acc = vec3(0,0 ,0);
    
  }
  create_particles(num_particles){
    this.particles = [];
    this.num_particles = num_particles;
    for (let i = 0; i < num_particles; i++) {
      this.particles.push(new Particle());
    }
  }
  set_particle(index, position, velocity, mass){
    this.particles[index].set_position(position);
    this.particles[index].set_velocity(velocity);
    this.particles[index].set_mass(mass);
  }
  set_all_particle_velocities(velocity){
    for (let i = 0; i < this.num_particles; i++) {
      this.particles[i].set_velocity(velocity);
    }
  }
  
  create_springs(num_springs){
    this.springs = [];
    this.num_springs = num_springs;
    for (let i = 0; i < num_springs; i++) {
      this.springs.push(new Spring());
    }
  }

  draw(webgl_manager, uniforms, shapes, materials){
    const white = color(1,1,1,1);
    const red = color(1,0,0,1);

    if (this.draw_particles){

      for (const p of this.particles){
        const pos = p.position;
        const transform = Mat4.translation(pos[0], pos[1], pos[2]).
          times(Mat4.scale(0.1, 0.1, 0.1));
        shapes.ball.draw(webgl_manager, uniforms, transform, {...materials.plastic, color: red});
      }
    }

    if (this.draw_springs){ //rotations based on quaternions?
      for (const s of this.springs){
        console.log("draw springs");
        const p1 = s.particle1.position;
        const p2 = s.particle2.position;
        const len = (p2.minus(p1)).norm();
        const pos = (p1.plus(p2)).times(0.5); 

        let model_transform = Mat4.scale(0.05, len/2, 0.05);
        const p = p1.minus(p2).normalized(); //unit vector that tells us the direction of the vector between paticles
        let v = vec3(0, 1, 0); //v used to unify dufference vector p
        //use one existing 3d axiz to represent our unit vector p
        //v helps us to find the axis of rotation (kind of) to base unit vector p on?
        if (Math.abs(v.cross(p).norm()) < 0.1){
          v = vec3(0, 0, 1);
          model_transform  = Mat4.scale(0.05, 0.05, len/2);
        }
        const w = v.cross(p).normalized();

      const theta = Math.acos(v.dot(p));
      model_transform.pre_multiply(Mat4.rotation(theta, w[0], w[1], w[2]));
      model_transform.pre_multiply(Mat4.translation(pos[0], pos[1], pos[2]));
      shapes.box.draw(webgl_manager, uniforms, model_transform, { ...materials.plastic, color: white});
      }
    }
  }

  update (dt) {
    for (const p of this.particles){ //update forces on particles

      p.applied_force = this.g_acc.times(p.mass);
      if (p.position[1] <=0){
        const normal = vec3(0, 1, 0);
        const v = p.velocity;
        const ground_pos = vec3(0, 0, 0);
        const ground_damp = normal.times(this.ground_kd * v.dot(normal));
        const ground_spring = normal.times(this.ground_ks * (ground_pos.minus(p.position)).dot(normal));
        console.log("line 4")
        p.applied_force.add_by(ground_spring.minus(ground_damp));
      }
    }
    for (const s of this.springs){
      s.update();
    }
    for (const p of this.particles){ //update function of particles
      p.update(dt, this.integration_method);
    }
    //update functions of springs
  }
}
export
const Part_two_spring_base = defs.Part_two_spring_base =
    class Part_two_spring_base extends Component
    {                                          // **My_Demo_Base** is a Scene that can be added to any display canvas.
                                               // This particular scene is broken up into two pieces for easier understanding.
                                               // The piece here is the base class, which sets up the machinery to draw a simple
                                               // scene demonstrating a few concepts.  A subclass of it, Part_one_hermite,
                                               // exposes only the display() method, which actually places and draws the shapes,
                                               // isolating that code so it can be experimented with on its own.
      init()
      {
        console.log("init")

        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        this.hover = this.swarm = false;
        // At the beginning of our program, load one of each of these shape
        // definitions onto the GPU.  NOTE:  Only do this ONCE per shape it
        // would be redundant to tell it again.  You should just re-use the
        // one called "box" more than once in display() to draw multiple cubes.
        // Don't define more than one blueprint for the same thing here.
        this.shapes = { 
          'box'  : new defs.Cube(),
          'ball' : new defs.Subdivision_Sphere( 4 ),
          'axis' : new defs.Axis_Arrows() };

        // *** Materials: ***  A "material" used on individual shapes specifies all fields
        // that a Shader queries to light/color it properly.  Here we use a Phong shader.
        // We can now tweak the scalar coefficients from the Phong lighting formulas.
        // Expected values can be found listed in Phong_Shader::update_GPU().
        const phong = new defs.Phong_Shader();
        const tex_phong = new defs.Textured_Phong();
        this.materials = {};
        this.materials.plastic = { shader: phong, ambient: .2, diffusivity: 1, specularity: .5, color: color( .9,.5,.9,1 ) }
        this.materials.metal   = { shader: phong, ambient: .2, diffusivity: 1, specularity:  1, color: color( .9,.5,.9,1 ) }
        this.materials.rgb = { shader: tex_phong, ambient: .5, texture: new Texture( "assets/rgb.jpg" ) }

        this.ball_location = vec3(1, 1, 1);
        this.ball_radius = 0.25;

        // TODO: you should create the necessary shapes
        this.simulation = new Simulation();
        this.start_simulation = false;
        this.t_step = 1/1000;
      }


      render_animation( caller )
      {                                                // display():  Called once per frame of animation.  We'll isolate out
        // the code that actually draws things into Part_one_hermite, a
        // subclass of this Scene.  Here, the base class's display only does
        // some initial setup.

        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if( !caller.controls )
        { this.animated_children.push( caller.controls = new defs.Movement_Controls( { uniforms: this.uniforms } ) );
          caller.controls.add_mouse_controls( caller.canvas );

          // Define the global camera and projection matrices, which are stored in shared_uniforms.  The camera
          // matrix follows the usual format for transforms, but with opposite values (cameras exist as
          // inverted matrices).  The projection matrix follows an unusual format and determines how depth is
          // treated when projecting 3D points onto a plane.  The Mat4 functions perspective() or
          // orthographic() automatically generate valid matrices for one.  The input arguments of
          // perspective() are field of view, aspect ratio, and distances to the near plane and far plane.

          // !!! Camera changed here
          Shader.assign_camera( Mat4.look_at (vec3 (10, 10, 10), vec3 (0, 0, 0), vec3 (0, 1, 0)), this.uniforms );
        }
        this.uniforms.projection_transform = Mat4.perspective( Math.PI/4, caller.width/caller.height, 1, 100 );

        // *** Lights: *** Values of vector or point lights.  They'll be consulted by
        // the shader when coloring shapes.  See Light's class definition for inputs.
        const t = this.t = this.uniforms.animation_time/1000;
        const angle = Math.sin( t );

        // const light_position = Mat4.rotation( angle,   1,0,0 ).times( vec4( 0,-1,1,0 ) ); !!!
        // !!! Light changed here
        const light_position = vec4(20 * Math.cos(angle), 20,  20 * Math.sin(angle), 1.0);
        this.uniforms.lights = [ defs.Phong_Shader.light_source( light_position, color( 1,1,1,1 ), 1000000 ) ];

        // draw axis arrows.
        this.shapes.axis.draw(caller, this.uniforms, Mat4.identity(), this.materials.rgb);
      }
    }


export class Part_two_spring extends Part_two_spring_base //define update function here
{                                                    // **Part_one_hermite** is a Scene object that can be added to any display canvas.
                                                     // This particular scene is broken up into two pieces for easier understanding.
                                                     // See the other piece, My_Demo_Base, if you need to see the setup code.
                                                     // The piece here exposes only the display() method, which actually places and draws
                                                     // the shapes.  We isolate that code so it can be experimented with on its own.
                                                     // This gives you a very small code sandbox for editing a simple scene, and for
                                                     // experimenting with matrix transformations.
  render_animation( caller )
  {                                                // display():  Called once per frame of animation.  For each shape that you want to
    // appear onscreen, place a .draw() call for it inside.  Each time, pass in a
    // different matrix value to control where the shape appears.

    // Variables that are in scope for you to use:
    // this.shapes.box:   A vertex array object defining a 2x2x2 cube.
    // this.shapes.ball:  A vertex array object defining a 2x2x2 spherical surface.
    // this.materials.metal:    Selects a shader and draws with a shiny surface.
    // this.materials.plastic:  Selects a shader and draws a more matte surface.
    // this.lights:  A pre-made collection of Light objects.
    // this.hover:  A boolean variable that changes when the user presses a button.
    // shared_uniforms:  Information the shader needs for drawing.  Pass to draw().
    // caller:  Wraps the WebGL rendering context shown onscreen.  Pass to draw().

    // Call the setup code that we left inside the base class:
    super.render_animation( caller );

    /**********************************
     Start coding down here!!!!
     **********************************/
        // From here on down it's just some example shapes drawn for you -- freely
        // replace them with your own!  Notice the usage of the Mat4 functions
        // translation(), scale(), and rotation() to generate matrices, and the
        // function times(), which generates products of matrices.

    const blue = color( 0,0,1,1 ), yellow = color( 1,1,0,1 );

    const t = this.t = this.uniforms.animation_time/1000;
    const dt = this.dt = this.uniforms.animation_delta_time/1000;
    // !!! Draw ground
    let floor_transform = Mat4.translation(0, 0, 0).times(Mat4.scale(10, 0.01, 10));
    this.shapes.box.draw( caller, this.uniforms, floor_transform, { ...this.materials.plastic, color: yellow } );

    // !!! Draw ball (for reference)
    let ball_transform = Mat4.translation(this.ball_location[0], this.ball_location[1], this.ball_location[2])
        .times(Mat4.scale(this.ball_radius, this.ball_radius, this.ball_radius));
    this.shapes.ball.draw( caller, this.uniforms, ball_transform, { ...this.materials.metal, color: blue } );
    
    
    // calculate spline at 1/1000
    if (this.start_simulation){
      let t_last = t;
      let t_sim = t;
      let dt_adj = Math.min(dt, 1/60);
      let t_next = t_last + dt_adj;
      while (t_sim < t_next){
        this.simulation.update(this.t_step);
        t_sim += this.t_step;
      }
    }
    this.simulation.draw(caller, this.uniforms, this.shapes, this.materials);
  }

  render_controls()
  {                                 // render_controls(): Sets up a panel of interactive HTML elements, including
    // buttons with key bindings for affecting this scene, and live info readouts.
    this.control_panel.innerHTML += "Part Two:";
    this.new_line();
    this.key_triggered_button( "Config", [], this.parse_commands );
    this.new_line();
    this.key_triggered_button( "Run", [], this.start );
    this.new_line();

    /* Some code for your reference
    this.key_triggered_button( "Copy input", [ "c" ], function() {
      let text = document.getElementById("input").value;
      console.log(text);
      document.getElementById("output").value = text;
    } );
    this.new_line();
    this.key_triggered_button( "Relocate", [ "r" ], function() {
      let text = document.getElementById("input").value;
      const words = text.split(' ');
      if (words.length >= 3) {
        const x = parseFloat(words[0]);
        const y = parseFloat(words[1]);
        const z = parseFloat(words[2]);
        this.ball_location = vec3(x, y, z)
        document.getElementById("output").value = "success";
      }
      else {
        document.getElementById("output").value = "invalid input";
      }
    } );
     */
  }

  parse_commands() {
    //todo
    let text  = document.getElementById("input").value;

    const lines = text.split('\n');

    for (const line of lines){
      try{
      this._parse_line(line);
      }
      catch(error){
        document.getElementById("output").value = "invalid command: " + line;
        return;
      }
    } 
  }

  start() { // callback for Run button
    document.getElementById("output").value = "start";
    //TODO
    this.start_simulation = !this.start_simulation;
    this.simulation.draw_particles = true;
    this.simulation.draw_springs = true;
    console.log(this.start_simulation);
  }
  _parse_line(line){
    const words = line.trim().split(/\s+/);

    if (words[0] === "particle"){
      const index = parseFloat(words[1]);
      const mass = parseFloat(words[2]);
      const x = parseFloat(words[3]);
      const y = parseFloat(words[4]);
      const z = parseFloat(words[5]);
      const vx = parseFloat(words[6]);
      const vy = parseFloat(words[7]);
      const vz = parseFloat(words[8]);
      this.simulation.set_particle(index, vec3(x, y, z), vec3(vx, vy, vz), mass);    
    }
    else if (words[0] === "create" && words[1] === "particles"){
      const num_particles = parseFloat(words[2]);
      this.simulation.create_particles(num_particles);
    }
    else if (words[0] === "all_velocities"){
      const vx = parseFloat(words[1]);
      const vy = parseFloat(words[2]);
      const vz = parseFloat(words[3]);
      this.simulation.set_all_particle_velocities(vec3(vx, vy, vz));
    } 
    else if (words[0] === "create" && words[1] === "springs"){
      const num_springs = parseFloat(words[2]);
      this.simulation.create_springs(num_springs);
    }
    else if (words[0] === "link"){
      const index = parseFloat(words[1]);
      const pindex1 = parseFloat(words[2]);
      const pindex2 = parseFloat(words[3]);
      const ks = parseFloat(words[4]);
      const kd = parseFloat(words[5]);
      const length = parseFloat(words[6]);
      this.simulation.springs[index].link( 
        this.simulation.particles[pindex1],
        this.simulation.particles[pindex2], 
        ks, kd, length);
    }
    else if (words[0] === "integration"){
      let type = words[1];
      let time = parseFloat(words[2]);
      this.simulation.integration_method = type;
      // this.t_step = time;
    }
    else if (words[0] === "gravity"){
      let g =  parseFloat(words[1]);
      this.simulation.g_acc = vec3(0, -g, 0);

      
    }
    else if (words[0] === "ground"){
      this.simulation.ground_ks = parseFloat(words[1]);
      this.simulation.ground_kd = parseFloat(words[2]);
    }
    
    else{
      // console.log("inavlid command" + words[0]);
      throw "inavlid command" + word[0];
    }
  }
}
