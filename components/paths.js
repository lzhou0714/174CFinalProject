import { HermiteSpline } from "./hermite_spline.js";


export class Path{
    constructor(path_id, x, z){
        this.spline = new HermiteSpline();
        this.generate_path(path_id, x, z);
    }
    generate_path(path_id, x, z){
        if (path_id === 1){
            this.create_path1(x, z);
        } else if (path_id === 2){
            this.create_path2(x, z);
        } else if (path_id === 3){
            this.create_path3(x, z);
        } else if (path_id === 4){
            this.create_path4(x, z);
        }
    }
    create_path1(x,z){
        // Create a new path
        this.spline.add_point(-10.0 + x, 1.0, -5.0 + z, 50.0, 0.0, 100.0);
        this.spline.add_point(0.0 + x, 1.0, 10.0 + z, 100.0, 0.0, -100.0);
        this.spline.add_point(10.0 + x, 1.0, -10.0 + z, -50.0, 0.0, 100.0);
        this.spline.add_point(20.0 + x, 1.0, 0.0 + z, -100.0, 0.0, -100.0);
        this.spline.add_point(30.0 + x, 1.0, 10.0 + z, 50.0, 0.0, 100.0);
        this.spline.add_point(40.0 + x, 1.0, -10.0 + z, 100.0, 0.0, -100.0);
        this.spline.add_point(50.0 + x, 1.0, 0.0 + z, -50.0, 0.0, 100.0);
        this.spline.add_point(60.0 + x, 1.0, 10.0 + z, -100.0, 0.0, -100.0);

    }

    create_path2(x,z){
        this.spline.add_point(-4.0 + x, 1.0, -4.0 + z, 0.0, 0.0, -100.0);
        this.spline.add_point(4.0 + x, 1.0, 4.0 + z, 0.0, 0.0, 100.0);
        this.spline.add_point(12.0 + x, 1.0, -4.0 + z, 0.0, 0.0, -100.0);
        this.spline.add_point(20.0 + x, 1.0, 4.0 + z, 6.0, 0.0, 100.0);
        this.spline.add_point(28.0 + x, 1.0, -4.0 + z, -6.0, 0.0, -100.0);
        this.spline.add_point(36.0 + x, 1.0, 4.0 + z, 6.0, 0.0, 100.0);
        this.spline.add_point(42.0 + x, 1.0, -4.0 + z, -6.0, 0.0, -100.0);
        this.spline.add_point(50.0 + x, 1.0, 4.0 + z, 6.0, 0.0, 100.0);
    }

    create_path3(x,z){
        this.spline.add_point(0.0 + x, 1.0, 0.0 + z, 100.0, 0.0, 100.0);
        this.spline.add_point(50.0 + x, 1.0, 100.0 + z, -200.0, 0.0, -100.0);
        this.spline.add_point(-50.0 + x, 1.0, 200.0 + z, 300.0, 0.0, 200.0);
        this.spline.add_point(100.0 + x, 1.0, -100.0 + z, -400.0, 0.0, -200.0);
        this.spline.add_point(-100.0 + x, 1.0, -200.0 + z, 500.0, 0.0, 300.0);
        this.spline.add_point(0.0 + x, 1.0, 0.0 + z, -100.0, 0.0, -100.0); 
    }

    create_spline4(x,z){
        this.spline.add_point(0.0 + x, 1.0, 10.0 + z, 100.0, 0.0, 0.0);
        this.spline.add_point(7.0 + x, 1.0, 7.0 + z, 0.0, 0.0, 50.0);
        this.spline.add_point(10.0 + x, 1.0, 0.0 + z, -100.0, 0.0, 0.0);
        this.spline.add_point(7.0 + x, 1.0, -7.0 + z, 0.0, 0.0, 5.0);
        this.spline.add_point(0.0 + x, 1.0, -10.0 + z, -120.0, 0.0, 0.0);
        this.spline.add_point(-7.0 + x, 1.0, -7.0 + z, 0.0, 0.0, -80.0);
        this.spline.add_point(-10.0 + x, 1.0, 0.0 + z, 95.0, 0.0, 0.0);
        this.spline.add_point(-7.0 + x, 1.0, 7.0 + z, 0.0, 0.0, 35.0);
        this.spline.add_point(0.0 + x, 1.0, 10.0 + z, 65.0, 0.0, 0.0);
    }
}