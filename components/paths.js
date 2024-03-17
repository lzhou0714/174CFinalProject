import { HermiteSpline } from "./hermite_spline.js";


export class Path{
    constructor(path_id, x, z){
        this.spline = new HermiteSpline();
        this.generate_path(path_id);
    }
    generate_path(path_id){
        if (path_id === 1){
            this.create_path1();
        } else if (path_id === 2){
            this.create_path2();
        } else if (path_id === 3){
            this.create_path3();
        } else if (path_id === 4){
            this.create_path4();
        }
    }
    create_path1(){
        // Create a new path
        this.spline.add_point(-10.0, 1.0, -5.0 , 50.0, 0.0, 100.0);
        this.spline.add_point(0.0 , 1.0, 10.0 , 100.0, 0.0, -100.0);
        this.spline.add_point(10.0 , 1.0, -10.0 , -50.0, 0.0, 100.0);
        this.spline.add_point(20.0 , 1.0, 0.0 , -100.0, 0.0, -100.0);
        this.spline.add_point(30.0 , 1.0, 10.0 , 50.0, 0.0, 100.0);
        this.spline.add_point(40.0 , 1.0, -10.0 , 100.0, 0.0, -100.0);
        this.spline.add_point(50.0 , 1.0, 0.0 , -50.0, 0.0, 100.0);
        this.spline.add_point(60.0 , 1.0, 10.0 , -100.0, 0.0, -100.0);
    }

    create_path2(){
        this.spline.add_point(-4.0 , 1.0, -4.0 , 0.0, 0.0, -100.0);
        this.spline.add_point(4.0 , 1.0, 4.0 , 0.0, 0.0, 100.0);
        this.spline.add_point(12.0 , 1.0, -4.0 , 0.0, 0.0, -100.0);
        this.spline.add_point(20.0 , 1.0, 4.0 , 6.0, 0.0, 100.0);
        this.spline.add_point(28.0 , 1.0, -4.0 , -6.0, 0.0, -100.0);
        this.spline.add_point(36.0 , 1.0, 4.0 , 6.0, 0.0, 100.0);
        this.spline.add_point(42.0 , 1.0, -4.0 , -6.0, 0.0, -100.0);
        this.spline.add_point(50.0 , 1.0, 4.0 , 6.0, 0.0, 100.0);
    }

    create_path3(){
        this.spline.add_point(0.0 , 1.0, 0.0 , 100.0, 0.0, 100.0);
        this.spline.add_point(50.0 , 1.0, 100.0 , -200.0, 0.0, -100.0);
        this.spline.add_point(-50.0 , 1.0, 200.0 , 300.0, 0.0, 200.0);
        this.spline.add_point(100.0 , 1.0, -100.0 , -400.0, 0.0, -200.0);
        this.spline.add_point(-100.0 , 1.0, -200.0 , 500.0, 0.0, 300.0);
        this.spline.add_point(0.0 , 1.0, 0.0 , -100.0, 0.0, -100.0); 
    }

    create_path4(){
        this.spline.add_point(0.0 , 1.0, 10.0 , 100.0, 0.0, 0.0);
        this.spline.add_point(7.0 , 1.0, 7.0 , 0.0, 0.0, 50.0);
        this.spline.add_point(10.0 , 1.0, 0.0 , -100.0, 0.0, 0.0);
        this.spline.add_point(7.0 , 1.0, -7.0 , 0.0, 0.0, 5.0);
        this.spline.add_point(0.0 , 1.0, -10.0 , -120.0, 0.0, 0.0);
        this.spline.add_point(-7.0 , 1.0, -7.0 , 0.0, 0.0, -80.0);
        this.spline.add_point(-10.0 , 1.0, 0.0 , 95.0, 0.0, 0.0);
        this.spline.add_point(-7.0 , 1.0, 7.0 , 0.0, 0.0, 35.0);
        this.spline.add_point(0.0 , 1.0, 10.0 , 65.0, 0.0, 0.0);
    }
}