import {tiny, defs} from './examples/common.js';

// Pull these names into this module's scope for convenience:
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

// TODO: you should implement the required classes here or in another file.

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
  link (particle1, particle2, ks, kd, length){
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
    
    this.ground_ks = 100000;
    this.ground_kd = 10;

    this.integration_method = "symplectic";
    this.g_acc = vec3(0,-50 ,0);

    this.spline = null;
    
  }
  create_particles(num_particles){
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

  update (dt, t) {
    
    for (let i  = 1; i < this.particles.length; i++){
      let p = this.particles[i];
      p.applied_force = this.g_acc.times(p.mass);
      if (p.position[1] <= 0){
        const normal = vec3(0, 1, 0);
        const v = p.velocity;
        const ground_pos = vec3(0, 0, 0);
        const ground_damp = normal.times(this.ground_kd * v.dot(normal));
        const ground_spring = normal.times(this.ground_ks * (ground_pos.minus(p.position)).dot(normal));

        p.applied_force.add_by(ground_spring.minus(ground_damp));
      }
    }
    for (const s of this.springs){
      s.update();
    }
    //make first partucle move along spline
    // let t_norm =(Math.cos(t*0.3) + 1)/2;
    // this.particles[0].position = this.spline.get_position(t_norm);
    for (let i  = 0; i < this.particles.length; i++){ //update function of particles
      let p  = this.particles[i];

      p.update(dt, this.integration_method);
    }
    //update functions of springs
  }
}
class Spline {
  constructor(){
    this.points = [];
    this.tangents = [];
    this.table = {};
    this.size = 0;
  }
  add_points(x, y, z, tx, ty, tz){
    this.points.push(vec3(x, y, z));
    this.tangents.push(vec3(tx, ty, tz));
    this.size++;
  }

  set_tangent(index, tx, ty, tz){
    this.tangents[index] = vec3(tx, ty, tz);
    this._get_arc_length();
  }
  set_point(index, x, y, z){
    this.points[index] = vec3(x, y, z);
    this._get_arc_length();
  }

  h0(t){
    return 2*t**3 - 3*t**2 + 1;
  }

  h1(t){
    return t**3 -2*t**2 +t;
  }
  h2(t){
    return -2*t**3 + 3*t**2;
  }
  h3(t){
    return t**3 - t**2;
  }
  function 
  get_position(t) {
    if (this.size < 2){
      return vec3(0, 0, 0);
    }

    //get index of first and second control point
    const A = Math.floor(t*(this.size-1));
    const B = Math.ceil(t*(this.size-1));
    const s = (t*(this.size-1))%1.0; //scale to from 0 to 1 within the segment of the twocontrol points
    
    //get points 
    let a = this.points[A].copy();
    let c = this.points[B].copy();
    //get tangents
    let b = this.tangents[A].copy().times(1/(this.size-1));
    let d = this.tangents[B].copy().times(1/(this.size-1));



    return a.times(this.h0(s))
      .plus(b.times(this.h1(s)))
      .plus(c.times(this.h2(s)))
      .plus(d.times(this.h3(s)));
  }
  function 
  _get_arc_length(){
    this.table = {};
    let length = 0;
    let sample_cnt = 1000;
    let prev = this.get_position(0);
    for (let i = 1; i <= sample_cnt; i++){
      const t = i/sample_cnt //lookup table index
      let curr = this.get_position(t); //look up table parametirc entry 
      length += curr.minus(prev).norm(); //lookup table arc lengt
      prev = curr;
      this.table[t] = (curr, length)
    }
    return length;
  }
  
}

class Curve_Shape extends Shape{
  constructor(curve_function, sample_count, curve_table, curve_color = color(1,0,0,1)){
    super("position", "normal");

    this.material = {shader: new defs.Phong_Shader(), ambient: 1.0, color: curve_color};
    this.sample_count = sample_count;

    if (curve_function && this.sample_count){
      for (let i = 0; i < this.sample_count; i++){
        const t = 1.0*i/this.sample_count;
        this.arrays.position.push(curve_function(t));
        this.arrays.normal.push(vec3(0, 0, 0));
      }
    }

  }

  draw(webgl_manager, uniforms){
    super.draw(webgl_manager, uniforms, Mat4.identity(), this.material, "LINE_STRIP");
  }

}
export
const Part_three_chain_base = defs.Part_three_chain_base =
    class Part_three_chain_base extends Component
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
        this.shapes = { 'box'  : new defs.Cube(),
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
        this.spline = new Spline();
        this.create_spline();
        this.sample_cnt = 1000;
        const curve_fn = (t) => this.spline.get_position(t);
        this.curve = new Curve_Shape(curve_fn, this.sample_cnt);
      
        this.simulation = new Simulation();
        this.add_particles();
        
        this.t_step = 1/1000;
        this.simulation.spline = this.spline;

        this.simulation.draw_particles = true;
        this.simulation.draw_springs = true;
        this.start_simulation = true;


      }

      create_spline(){
        console.log("create spline")
        this.spline.add_points(1.0, 8.0, -5.0, -5.0, 0.0, 5.0);
        this.spline.add_points(7.0, 7.0, -3.0, -10.0, 0.0, -10.0);
        this.spline.add_points(5.0, 6.0, 3.0, 20.0, 0.0, -20.0);
        this.spline.add_points(3.0, 5.0, 5.0, 10.0, 0.0, 5.0);
        this.spline.add_points(1.0, 4.0, 0.0, 0.0, 0.0, 0.0);


   

         console.log(this.spline)
      }
    
      add_particles(){
        this.simulation.create_particles(9); 
        this.simulation.set_particle(0, vec3(1, 9, 0),
          vec3(0, 0, 0) 
          , 5);
        for (let i = 1; i < 9; i++){
          this.simulation.set_particle(i, 
            vec3(1, 9-0.3*i, 0)
            , vec3(0, 0, 0), 2);
        }
        this.simulation.create_springs(8);
        for (let i = 0; i < 8; i++){
          this.simulation.springs[i].link(
            this.simulation.particles[i], 
            this.simulation.particles[i+1], 
            700, 10, 0.3);
        }
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


export class Part_three_chain extends Part_three_chain_base
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

    const blue = color( 0,0,1,1 ), yellow = color( 0.7,1,0,1 );

    const t = this.t = this.uniforms.animation_time/1000;

    // !!! Draw ground
    let floor_transform = Mat4.translation(0, 0, 0).times(Mat4.scale(10, 0.01, 10));
    this.shapes.box.draw( caller, this.uniforms, floor_transform, { ...this.materials.plastic, color: yellow } );

    // !!! Draw ball (for reference)
    let ball_transform = Mat4.translation(this.ball_location[0], this.ball_location[1], this.ball_location[2])
        .times(Mat4.scale(this.ball_radius, this.ball_radius, this.ball_radius));
    this.shapes.ball.draw( caller, this.uniforms, ball_transform, { ...this.materials.metal, color: blue } );

    // TODO: you should draw spline here.
    this.sample_cnt = 1000;
    if (this.curve && this.sample_cnt){
      this.curve.draw(this, this.uniforms);
    }
    


    const dt = this.dt = this.uniforms.animation_delta_time/1000;
    if (this.start_simulation){
      let t_last = t;
      let t_sim = t;
      let dt_adj = Math.min(dt, 1/60);
      let t_next = t_last + dt_adj;
      while (t_sim < t_next){
        this.simulation.update(this.t_step, this.t);
        t_sim += this.t_step;
      }
    }
    this.simulation.draw(caller, this.uniforms, this.shapes, this.materials);
  }

  render_controls()
  {                                 // render_controls(): Sets up a panel of interactive HTML elements, including
    // buttons with key bindings for affecting this scene, and live info readouts.
    this.control_panel.innerHTML += "Part Three: (no buttons)";
    this.new_line();
  }


}
