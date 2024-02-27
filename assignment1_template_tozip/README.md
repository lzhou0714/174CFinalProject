Part 1
1.1
starting line 7 is the spline class which contains the points and info on each spline object
starting line 346 is the _parse_line function which parses the input commands
1.2
line 14 add_points function implements the add point command
line 20 set_tangent function implements the set tangent command
line 24 set_point function implements the set point command
1.3
line 42-83 are the get position and get arclength functions which are used to get the arclength of the spline
the get_arc_length also updates the lookup table for the spline and is called whe the spline is edited to update the lookup table
1.4
line 309 load_spline function is used to parse input information about a spline and load the spline
line 328 is the export function for outputthing the information of the spline
1.5
line 85 the Curve_Shape class and its draw function are implemented to help render the spline
line 303 update_scene is called when the draw button is pressed and loads a curve_shape to be drawn
line 240 calls the curve's draw function

should see: red line displaying the spline

part 2
line 413 onwards is the parseline function which parses the inputs
draw function for spring is imp
2.1
create particles is implemented by line 119-123 create_particles function which intializes an array fo n particles
2.2
particle command is implemented by ine 125-128 set_particle which sets the properties of a specific particle
2.3
all_velocities
implemented by line 130 set_all_particle_velocities
2.4
create springs implemented in line 136-141
2.5
link implemented in line 83-85
2.6
integration is implemented in the update function of the Particle class (line 42-70)
2.7
ground implemented in parse words and sets the ground ks and kd in the Simulation class
2.8
gravity implemented in parsewords class and sets the g_acc in the simulation class

drawing and updating the positions of the particles is done through the draw and update functions of the Simulation class (lines 143-206) 

should see: red particles and white spring should bounce when hit ground

Part3
the points of the spline are as follows
1.0, 8.0, -5.0, -5.0, 0.0, 5.0
7.0, 7.0, -3.0, -10.0, 0.0, -10.0
5.0, 6.0, 3.0, 20.0, 0.0, -20.0
3.0, 5.0, 5.0, 10.0, 0.0, 5.0
1.0, 4.0, 0.0, 0.0, 0.0, 0.0

The chain consisted of 9 particles starting at the start point of the spline. The chain moves along the spine and drags along the ground .
The ks for the springs are 70 and the kd for the springs are 10


You can write your readme here.

hermite spline
add point 0.0 5.0 0.0 -20.0, 0.0, 20.0
add point 0.0 5.0 5.0 20.0, 0.0, 20.0
add point 5.0 5.0 5.0 20.0, 0.0, -20.0
add point 5.0 5.0 0.0 -20.0, 0.0, -20.0
add point 0.0 5.0 0.0 -20.0, 0.0, 20.0
get_arc_length

arclength 22.109


add point 0.0 0.0 0.0 -20.0, 0.0, 20.0
add point 0.0 5.0 5.0 20.0, 0.0, 20.0
add point 5.0 5.0 5.0 20.0, 0.0, -20.0
add point 5.0 5.0 0.0 -20.0, 0.0, -20.0
add point 0.0 5.0 0.0 -20.0, 0.0, 20.0
get_arc_length
set point 0 0.0 5.0 0.0

21
0.0 0.0 0.0 -20.0 0.0 20.0
0.0 1.0 1.0 -20.0 0.0 20.0
0.0 2.0 2.0 -20.0 0.0 20.0
0.0 3.0 3.0 -20.0 0.0 20.0
0.0 4.0 4.0 -20.0 0.0 20.0
0.0 5.0 5.0 20.0 0.0 20.0
1.0 5.0 5.0 20.0 0.0 20.0
2.0 5.0 5.0 20.0 0.0 20.0
3.0 5.0 5.0 20.0 0.0 20.0
4.0 5.0 5.0 20.0 0.0 20.0
5.0 5.0 5.0 20.0 0.0 -20.0
5.0 5.0 4.0 20.0 0.0 20.0
5.0 5.0 3.0 20.0 0.0 20.0
5.0 5.0 2.0 20.0 0.0 20.0
5.0 5.0 1.0 20.0 0.0 20.0
5.0 5.0 0.0 -20.0 0.0 -20.0
4.0 5.0 0.0 -20.0 0.0 20.0
3.0 5.0 0.0 -20.0 0.0 20.0
2.0 5.0 0.0 -20.0 0.0 20.0
1.0 5.0 0.0 -20.0 0.0 20.0
0.0 5.0 0.0 -20.0 0.0 20.0


create particles 4
particle 0  1.0  0 5 0   0  5  0
particle 1  1.0  0 5 5   0  5  0
particle 2  1.0  5 5 5   0  5  0
particle 3  1.0  5 5 0   0  5  0
create springs 4
link 0  0 1  5  0.1  3
link 1  1 2  5  0.1  3
link 2  2 3  5  0.1  3
link 3  3 0  5  0.1  3
ground 5000 1
gravity 9.8
integration verlet 0.001


create particles 4
particle 0  1.0  0 5 0  -2  5  2
particle 1  1.0  0 5 5   2  5  2
particle 2  1.0  5 5 5   2  5 -2
particle 3  1.0  5 5 0  -2  5 -2
create springs 4
link 0  0 1  30  5    2
link 1  1 2  50  2    3
link 2  2 3  80  0.4  4
link 3  3 0  150 0    5
ground 5000 10
gravity 9.8
integration euler 0.001


create particles 4
particle 0  1.0   0  3  0   5  5  5
particle 1  1.0   3  6  0   0  5  0
particle 2  1.0   0  6  3   0  5  0
particle 3  1.0   0  6  0   0  5  0
create springs 6
link 0  3 1  500  10  3
link 1  3 2  500  10  3
link 2  3 0  500  10  3
link 3  1 2  500  10  4.24264
link 4  1 0  500  10  4.24264
link 5  2 0  500  10  4.24264
ground 15000 10
gravity 9.8
integration euler 0.0033




part3 path
add point 1.0 5.0 0.0 -20.0, 0.0, 20.0
add point 2.0 3.0 5.0 20.0, 0.0, 20.0
add point 3.0 5.0 5.0 20.0, 0.0, -20.0
add point 5.0 5.0 3.0 -20.0, 0.0, -20.0
add point 4.0 7.0 3.0 -20.0, 0.0, 20.0