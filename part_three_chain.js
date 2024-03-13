import {tiny, defs} from './examples/common.js';
import { HermiteSpline, SAMPLE_COUNT } from './components/hermite_spline.js';
import { CurveShape} from './components/shape_renders.js';
import { Snake } from './components/snake.js';
import { Obstacle } from './obstacles.js';

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
        this.materials = {};
        this.materials.plastic = { shader: phong, ambient: .2, diffusivity: 1, specularity: .5, color: color( .9,.5,.9,1 ) }
        this.materials.metal   = { shader: phong, ambient: .2, diffusivity: 1, specularity:  1, color: color( .9,.5,.9,1 ) }
        this.materials.rgb = { shader: tex_phong, ambient: .5, texture: new Texture( "assets/rgb.jpg" ) }

        this.snake = new Snake();


        this.turn_direction = vec3(0,0,0);
        this.player_velocity = 0.05;
        this.current_direction = vec3(0,0,0);
        this.keyListeners = {};
        this.turn_speed = 1;

        this.obstacles = [];
        const max_num = 50
        const max_dist = 100; 
        for (let i = 0; i < max_num; i++){
          this.obstacles[i] = new Obstacle(Math.floor((Math.random()-0.5)*max_dist), Math.floor((Math.random()-0.5)*max_dist));
        }

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

    const blue = color( 0,0,1,1 ), yellow = color( 0.7,1,0,1 );

    const t = this.t = this.uniforms.animation_time/1000;

    // !!! Draw ground
    let floor_transform = Mat4.translation(0, 0.7, 0).times(Mat4.scale(1000, 0.01, 1000));
    this.shapes.box.draw( caller, this.uniforms, floor_transform, { ...this.materials.plastic, color: yellow } );
    this.shapes.axis.draw( caller, this.uniforms, Mat4.identity(), { ...this.materials.plastic,color: color( 0,0,0,1 ) } );


    //draw sky box
    let sky_transform = Mat4.translation(0, 0, 0).times(Mat4.scale(1000, 1000, 1000));
    this.shapes.ball.draw( caller, this.uniforms, sky_transform, { ...this.materials.plastic, color: color(1,1,1,1) } );


    // this.sim.advance_frame_part3(this.sim.time_step, this.spline);
    // this.current_direction += this.sim.lerpAngle(this.current_direction, this.turn_direction, this.turn_speed);
    this.current_direction = this.turn_direction;

    this.debug = true;
    if (!this.debug){
      Shader.assign_camera(
        Mat4.look_at (
          vec3( this.snake.sim.get_head_position()[0]
          , 10, this.snake.sim.get_head_position()[2] - 35), 
        vec3 (this.snake.sim.get_head_position()[0],
          0, 
          this.snake.sim.get_head_position()[2]), 
        vec3 (0, 0, 1)), 
        this.uniforms );
    }
      // Shader.assign_camera(Mat4.look_at(vec3 (10, 10, 10), vec3 (0, 0, 0), vec3(0, 1, 0)), this.uniforms);
    for (let i = 0; i < this.obstacles.length; i++){
      console.log(this.obstacles[i])
      this.obstacles[i].draw(caller, this.uniforms,{ ...this.materials.plastic, color: blue });
    }
    this.snake.draw(caller, this.uniforms);
    this.snake.advance_frame(this.snake.sim.time_step, vec3(this.player_velocity * this.current_direction[0], 0, this.player_velocity * this.current_direction[2]));
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
        this.turn_direction = vec3(0, 0, 0);
			}
		});

    window.setInterval(() => {
			if (this.keyListeners[name]) {
        console.log("running");
				callback();
			}
		}, interval);
	}

  render_controls()
  {                                 // render_controls(): Sets up a panel of interactive HTML elements, including
    // buttons with key bindings for affecting this scene, and live info readouts.
    this.key_triggered_button("Add Segment", ["Enter"], () => {this.snake.add_segment();});
    this.new_line();
    this.addHoldKey(
			'w', //move in z direction
			() => {
        
					// this.spline.move_particle(this.sim.time_step, 0.1, 0);
          this.turn_direction.add_by(vec3(0,0,1));

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
          this.turn_direction.add_by(vec3(0,0,-1));
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
        this.turn_direction.add_by(vec3(-1,0,0));
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
        this.turn_direction.add_by(vec3(1,0,0));
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

    /* Some code for your reference
    this.key_triggered_button( "Copy input", [ "c" ], function() {
      let text = document.getElementById("input").value;
      console.log(text);
      document.getElementById("output").value = text;
    } );
    this.new_line();
    this.key_triggered_button( "Add Segment", [ "V" ], () => {this.snake.add_segment();} );
  }

  parse_commands() {
    document.getElementById("output").value = "parse_commands";
    //TODO
  }

  start() { // callback for Run button
    document.getElementById("output").value = "start";
    //TODO
  }
}
*/