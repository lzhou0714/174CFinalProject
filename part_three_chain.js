import {tiny, defs} from './examples/common.js';
import { HermiteSpline, SAMPLE_COUNT } from './components/hermite_spline.js';
import { CurveShape} from './components/shape_renders.js';
import { Snake } from './components/snake.js';
import { Food, Obstacle, Powerup_PlusThree, Powerup_SpeedUp, max_spawn_dist } from './obstacles.js';


// Pull these names into this module's scope for convenience:
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;



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
        const tex_ground = new defs.Textured_grass();
        this.materials = {
          plastic: { shader: phong, ambient: .2, diffusivity: 1, specularity: .5, color: color( .9,.5,.9,1 ) },
          metal: { shader: phong, ambient: .2, diffusivity: 1, specularity: .5, color: color( .9,.5,.9,1 ) },
          rgb: { shader: tex_phong, ambient: .5, texture: new Texture( "assets/rgb.jpg" ) },
          flat: {shader: phong, ambient: 1, diffusivity: 0, specularity: 0, color: color(0, 0, 0, 1)},
          sky: {shader: tex_phong, ambient: 1, diffusivity: 0, specularity: 0, texture: new Texture("./assets/sky.png")},
          ground: {shader: tex_ground, ambient: 1, diffusivity: 0, specularity: 0, texture: new Texture("./assets/ground.png")},

        };
        this.snake = new Snake(this);
        this.t_step = 1/1000;


        this.turn_direction = vec3(1,0,0);
        this.player_velocity = 0.1;
        this.current_direction = vec3(1,0,0);
        this.keyListeners = {};
        this.turn_speed = 1;
        this.score = 0;

        this.obstacles = [];
        const num_food = 10;
        const num_obstacle = 10;
        const num_powerups_speedup = 5;
        const num_powerups_plusthree = 5;
        for (let i = 0; i < num_food; i++){
          this.obstacles[i] = new Food(vec3(0, 0, 0));
        }
        for (let i = 0; i < num_obstacle; i++) {
          this.obstacles.push(new Obstacle(vec3(0, 0, 0)))
        }
        for (let i = 0; i < num_powerups_speedup; i++) {
          this.obstacles.push(new Powerup_SpeedUp(vec3(0, 0, 0)));
        }
        for (let i = 0; i < num_powerups_plusthree; i++) {
          this.obstacles.push(new Powerup_PlusThree(vec3(0, 0, 0)));
        }

        this.debug = false;
        this.camera_isometric = true;
        this.game_over = false;
        this.freeze_powerups = false;
      }

      render_animation( caller )
      {                                                // display():  Called once per frame of animation.  We'll isolate out
        // the code that actually draws things into Part_one_hermite, a
        // subclass of this Scene.  Here, the base class's display only does
        // some initial setup.

        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if( !caller.controls )
        { this.animated_children.push( 
          caller.controls = new defs.Movement_Controls( { uniforms: this.uniforms } ) 
          );
          caller.controls.add_mouse_controls( caller.canvas );

          // Define the global camera and projection matrices, which are stored in shared_uniforms.  The camera
          // matrix follows the usual format for transforms, but with opposite values (cameras exist as
          // inverted matrices).  The projection matrix follows an unusual format and determines how depth is
          // treated when projecting 3D points onto a plane.  The Mat4 functions perspective() or
          // orthographic() automatically generate valid matrices for one.  The input arguments of
          // perspective() are field of view, aspect ratio, and distances to the near plane and far plane.

          // !!! Camera changed here
      
        //   Shader.assign_camera(
        //      Mat4.look_at (vec3 (10, 10, 10), vec3 (0, 0, 0), vec3 (0, 1, 0)), this.uniforms );
        }
        this.uniforms.projection_transform = Mat4.perspective( Math.PI/4, caller.width/caller.height, 1, 10000000 );

        // *** Lights: *** Values of vector or point lights.  They'll be consulted by
        // the shader when coloring shapes.  See Light's class definition for inputs.
        const t = this.t = this.uniforms.animation_time/1000;
        const angle = Math.sin( t );

        // const light_position = Mat4.rotation( angle,   1,0,0 ).times( vec4( 0,-1,1,0 ) ); !!!
        // !!! Light changed here
        const light_position = vec4( 0, 500, 500, 1 );
        this.uniforms.lights = [ defs.Phong_Shader.light_source( light_position, color( 1,1,1,1 ), 10**10 ) ];
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

    if (this.game_over) {
      this.init();
    }

    const t = this.t = this.uniforms.animation_time/1000;

    // !!! Draw ground
    let floor_transform = Mat4.translation(0, 0.7, 0).times(Mat4.scale(1000, 0.01, 1000));
    this.shapes.box.draw( caller, this.uniforms, floor_transform, { ...this.materials.ground} );
    this.shapes.axis.draw( caller, this.uniforms, Mat4.identity(), { ...this.materials.plastic,color: color( 0,0,0,1 ) } );


    //draw sky box
    let sky_transform = Mat4.translation(0, 0, 0).times(Mat4.scale(1000, 1000, 1000));
    this.shapes.ball.draw( caller, this.uniforms, sky_transform, { ...this.materials.sky} );
    
    this.current_direction = slerp(this.current_direction, this.turn_direction, 0.01);


    if (!this.debug){
      if (this.camera_isometric) {
        Shader.assign_camera(
          Mat4.look_at (
            vec3( this.snake.sim.get_head_position()[0]
            , 10, this.snake.sim.get_head_position()[2] - 35), 
          vec3 (this.snake.sim.get_head_position()[0],
            0, 
            this.snake.sim.get_head_position()[2]), 
          vec3 (0, 1, 0)), 
          this.uniforms );
      } else {
        Shader.assign_camera(
          Mat4.look_at (
            vec3( this.snake.sim.get_head_position()[0]
            , 50, this.snake.sim.get_head_position()[2]), 
          vec3 (this.snake.sim.get_head_position()[0],
            0, 
            this.snake.sim.get_head_position()[2]), 
          vec3 (0, 0, 1)), 
          this.uniforms );
      }
    }

    for (let i = 0; i < this.obstacles.length; i++){
      if (this.snake.is_overlapping_obstacle(this.obstacles[i])) {
        this.obstacles[i].do_something(this.snake);
        this.obstacles[i].destroy_and_respawn(this.snake.sim.particles[0].position); 
      }

      this.obstacles[i].check_out_of_range(this.snake);

      this.obstacles[i].update(this.freeze_powerups);
    }

    for (const obstacle of this.obstacles) {
      obstacle.draw(caller, this.uniforms);
    }
    this.snake.draw(caller, this.uniforms);
    this.snake.advance_frame(this.snake.sim.time_step, vec3(this.player_velocity * this.current_direction[0], 0, this.player_velocity * this.current_direction[2]));

  }

  increase_difficulty(amt) {
    for (let i = 0; i < amt; i++) {
      this.obstacles.push(new Obstacle(vec3(0, 0, 0)));
    }
  }

  addHoldKey(key, callback, name, interval = 500) {
		this.key_triggered_button(name, [key], () => {});

		document.addEventListener('keydown', (e) => {
			if (e.key === key) {
				this.keyListeners[name] = true;
			}
		});

		document.addEventListener('keyup', (e) => {
			if (e.key == key) {
				this.keyListeners[name] = false;
        // this.turn_direction = vec3(0, 0, 0);
			}
		});

    window.setInterval(() => {
			if (this.keyListeners[name]) {
				callback();
			}
		}, interval);
	}

  render_controls()
  {                                 // render_controls(): Sets up a panel of interactive HTML elements, including
    // buttons with key bindings for affecting this scene, and live info readouts.
    this.key_triggered_button("Add Segment", ["Enter"], () => {this.snake.add_segment();});
    this.new_line();
    this.key_triggered_button("Toggle Debug", ["b"], () => {this.debug = !this.debug;});
    this.new_line();
    this.key_triggered_button("Toggle Camera", ["c"], () => {this.camera_isometric = !this.camera_isometric;});
    this.new_line();
    this.key_triggered_button("Toggle Freeze Powerups", ["f"], () => {this.freeze_powerups = !this.freeze_powerups;});
    this.new_line();
    this.addHoldKey(
			'w', //move in z direction
			() => {

					// this.spline.move_particle(this.sim.time_step, 0.1, 0);
          this.turn_direction = vec3(0,0,1);

          if (this.turn_direction.norm() > 1){
            this.turn_direction = this.turn_direction.normalized();
          }
			},
			'up',
			125
		);

		this.addHoldKey(
			's',
			() => {
          // this.spline.move_particle(this.sim.time_step, -0.1, 0);
          this.turn_direction = vec3(0,0,-1);
          if (this.turn_direction.norm() > 1){
            this.turn_direction = this.turn_direction.normalized();
          }          
			},
			'down',
			125
		);
		this.addHoldKey(
			'd',
			() => {
        this.turn_direction = vec3(-1,0,0);
        if (this.turn_direction.norm() > 1){
          this.turn_direction = this.turn_direction.normalized();
        }
			},
			'right',
			125
		);
		this.addHoldKey(
			'a',
			() => {
        this.turn_direction = vec3(1,0,0);
        if (this.turn_direction.norm() > 1){
          this.turn_direction = this.turn_direction.normalized();
        }        
          // this.spline.move_particle(this.sim.time_step, 0, 0.1);
				// this.rotx +=
				// 	(Math.PI / 24) *
				// 	(1 - 1.5 * this.vely) *
				// 	(1 + this.turnBuffer);
				// if (this.vely > 0) {
				// 	this.vely -= 0.00075;
				// 	if (this.vely < 0) {
				// 		this.vely = 0;
				// 	}
				// } else if (this.vely < 0) {
				// 	this.vely += 0.00075;
				// 	if (this.vely > 0) {
				// 		this.vely = 0;
				// 	}
				// }
			},
			'left',
			125
		);
  }
}

export function slerp(startVector, endVector, t) {
  startVector.normalized();
  endVector.normalized();
  var dotProduct = startVector.dot(endVector);
  if (dotProduct > 0.9999999) {
    // vectors are parallel
    return endVector;
  }
  if (dotProduct < -0.99999) {
    // vectors are nearly opposite
    // console.log(Mat4.rotation(0.0001, 0, 1, 0).times(startVector));
    return Mat4.rotation(0.001, 0, 1, 0).times(startVector).to3();
  }
  var theta = Math.acos(dotProduct);
  var interpolatedVector = startVector.times(Math.sin((1 - t) * theta)).plus(endVector.times(Math.sin(t * theta))).times(1/Math.sin(theta));
  interpolatedVector.normalized();

  return interpolatedVector;
}
