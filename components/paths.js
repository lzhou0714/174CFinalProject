import { HermiteSpline } from "./hermite_spline";


export class Path = class Path{
    constructor(path_id, x, y, z){
        this.spline = new HermiteSpline();
        this.generate_path(path_id), x, y, z;
    }
    generate_path(path_id, x, y, z){

    }
    create_path1(x, y,z){
        // Create a new path
        this.spline.add_point(-10.0 + x, 1.0 + y, -5.0 + z, 50.0, 0.0, 100.0);
        this.spline.add_point(0.0 + x, 1.0 + y, 10.0 + z, 100.0, 0.0, -100.0);
        this.spline.add_point(10.0 + x, 1.0 + y, -10.0 + z, -50.0, 0.0, 100.0);
        this.spline.add_point(20.0 + x, 1.0 + y, 0.0 + z, -100.0, 0.0, -100.0);
        this.spline.add_point(30.0 + x, 1.0 + y, 10.0 + z, 50.0, 0.0, 100.0);
        this.spline.add_point(40.0 + x, 1.0 + y, -10.0 + z, 100.0, 0.0, -100.0);
        this.spline.add_point(50.0 + x, 1.0 + y, 0.0 + z, -50.0, 0.0, 100.0);
        this.spline.add_point(60.0 + x, 1.0 + y, 10.0 + z, -100.0, 0.0, -100.0);

    }

    create_path2(x, y, z){
        this.spline.add_point(-4.0 + x, 1.0 + y, -4.0 + z, 0.0, 0.0, -100.0);
        this.spline.add_point(4.0 + x, 1.0 + y, 4.0 + z, 0.0, 0.0, 100.0);
        this.spline.add_point(12.0 + x, 1.0 + y, -4.0 + z, 0.0, 0.0, -100.0);
        this.spline.add_point(20.0 + x, 1.0 + y, 4.0 + z, 6.0, 0.0, 100.0);
        this.spline.add_point(28.0 + x, 1.0 + y, -4.0 + z, -6.0, 0.0, -100.0);
        this.spline.add_point(36.0 + x, 1.0 + y, 4.0 + z, 6.0, 0.0, 100.0);
        this.spline.add_point(42.0 + x, 1.0 + y, -4.0 + z, -6.0, 0.0, -100.0);
        this.spline.add_point(50.0 + x, 1.0 + y, 4.0 + z, 6.0, 0.0, 100.0);
    }

    create_path3(x,y, z){
        this.spline.add_point(0.0 + x, 1.0 + y, 0.0 + z, 100.0, 0.0, 100.0);
        this.spline.add_point(50.0 + x, 1.0 + y, 100.0 + z, -200.0, 0.0, -100.0);
        this.spline.add_point(-50.0 + x, 1.0 + y, 200.0 + z, 300.0, 0.0, 200.0);
        this.spline.add_point(100.0 + x, 1.0 + y, -100.0 + z, -400.0, 0.0, -200.0);
        this.spline.add_point(-100.0 + x, 1.0 + y, -200.0 + z, 500.0, 0.0, 300.0);
        this.spline.add_point(0.0 + x, 1.0 + y, 0.0 + z, -100.0, 0.0, -100.0); 
    }

}