// three.js cannon.js物理引擎之制作拥有物理特性的汽车 cannon-vehicle

import './style.css'
import * as THREE from 'three'
import CANNON from 'cannon'
import Stats from "three/examples/jsm/libs/stats.module";
import { GUI } from "three/examples/jsm/libs/dat.gui.module";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// 车身尺寸
var carBodySize = new THREE.Vector3(4.52, 2.26, 1.08);

// cannon RaycastVehicle 类对象
var vehicle;

var world, timeStep=1/60, controls, stats, camera, scene, renderer, geometry, material, gui;
var size = 200;

var carMesh, wheelMeshes = [], meshes = [], bodies = [];

// 车轮半径
var wheelRadius = 0.5;
var params = {
    maxForce: 1000,
    mass: 150,
    customSlidingRotationalSpeed: -30,
    dampingCompression: 4.4,
    dampingRelaxation: 2.3,
    engineForce: 0,
    forwardImpulse: 0,
    frictionSlip: 5,
    maxSuspensionForce: 100000,
    maxSuspensionTravel: 0.3, 
    rollInfluence: 0.01,
    sideImpulse: 0,
    suspensionForce: 0,
    suspensionLength: 0,
    suspensionMaxLength: 1,
    suspensionRelativeVelocity: 1,
    suspensionRestLength: 0.3,
    suspensionStiffness: 30,
};

var globalID;

var maxSteerVal = 0.5;
var brakeForce = 1000000;


/**
 * 全局初始化
 */
function init() {
    initCannon();
    initThree();
    initGui();
    animation();
}

/**
 * 初始化物理世界
 */
function initCannon() {
    world = new CANNON.World();
    world.quatNormalizeSkip = 0;
    world.quatNormalizeFast = false;
    world.gravity.set(0, 0, -9.8);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;
    world.defaultContactMaterial.friction = 0; // 摩擦力

    // 底盘形状
    var chassisShape = new CANNON.Box(new CANNON.Vec3(carBodySize.x/2, carBodySize.y/2, carBodySize.z/2));
    // 底盘刚体 摩擦/形变恢复
    var chassisBody = new CANNON.Body({mass: 150, material: new CANNON.Material({friction: 0, restitution: 0})})
    chassisBody.addShape(chassisShape);
    chassisBody.position.set(0, 0, 5);
    // 角速度
    chassisBody.angularVelocity.set(0, 0, 0.5);

    /**
     * RaycastVehicle 车辆辅助类
     * 将光线从车轮位置投射到地面并施加力，决定车的位置、角度、质量等信息
     * 后面三个参数决定了车辆的前面、右面、上面
     */
    vehicle = new CANNON.RaycastVehicle({
        chassisBody, // 车身刚体
        indexForwardAxis: 0, // 前轴索引 0 = x，1 = y，2 = z
        indexRightAxis: 1,
        indexUpAxis: 2
    });

    
    var options = {
        radius: wheelRadius,
        directionLocal: new CANNON.Vec3(0, 0, -wheelRadius * 2), // ? 本地方向
        suspensionStiffness: 30, // 悬架刚度
        suspensionRestLength: 0.3, // 悬架静止长度
        frictionSlip: 5, // 摩擦滑动
        dampingRelaxation: 2.3,
        dampingCompression: 4.4,
        maxSuspensionForce: 100000,
        rollInfluence:  0.01,
        axleLocal: new CANNON.Vec3(0, 1, 0),
        chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
        maxSuspensionTravel: 0.3,
        customSlidingRotationalSpeed: -30,
        useCustomSlidingRotationalSpeed: true
    };
    
    options.chassisConnectionPointLocal.set(1.13, 0.95, -0.1);
    vehicle.addWheel(options);

    options.chassisConnectionPointLocal.set(1.13, -0.95, -0.1);
    vehicle.addWheel(options);

    options.chassisConnectionPointLocal.set(-1.47, 0.95, -0.05);
    vehicle.addWheel(options);

    options.chassisConnectionPointLocal.set(-1.47, -0.95, -0.05);
    vehicle.addWheel(options);

    vehicle.addToWorld(world);

    var matrix = [];
    for (var i = 0; i < size; i++) {
        matrix.push([]);
        for (var j = 0; j < size; j++) {
            var height = Math.cos(i / size * Math.PI * (size / 10)) * Math.cos(j / size * Math.PI * (size / 10)) / 2;
            matrix[i].push(height)
        }
    }
    var hfShape = new CANNON.Heightfield(matrix, {
        elementSize: 1
    });
    var hfBody = new CANNON.Body({ mass: 0, material: new CANNON.Material({friction: 0.5, restitution: 0})});
    hfBody.addShape(hfShape, new CANNON.Vec3(-size / 2, - size / 2, 0), new CANNON.Quaternion());
    world.addBody(hfBody);

    // this
    document.onkeydown = handler;
    document.onkeyup = handler;
}


function initThree() {
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0x000000, 0, 500 );
    scene.background = new THREE.Color(0xbfd1e5)

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    // camera.position.x = 30;
    camera.position.y = -15;
    camera.position.z = 10;
    camera.lookAt(0,0,0);
    camera.up.set(0,0,1);
    scene.add( camera );

    scene.add(new THREE.AxesHelper(40)); 

    scene.add(new THREE.AmbientLight(0x999999));

    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(25, 25, 25);
    scene.add(light);
    
    var groundGeom = new THREE.ParametricBufferGeometry((u,v,target) => {
        var height = Math.cos(u * Math.PI * (size / 10)) * Math.cos(v * Math.PI * (size / 10)) / 2;
        // if(u == 0 || u == 1 || v == 0 || v == 1) height = 0;
        target.set(u * size - size / 2, v * size - size / 2, height);
    }, size, size)
    var groundMate = new THREE.MeshPhongMaterial({color: 0x6666666, side: THREE.DoubleSide, flatShading: true});
    var groundMesh = new THREE.Mesh(groundGeom, groundMate);
    scene.add(groundMesh);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    // this
    document.getElementById('box').appendChild( renderer.domElement );

    controls = new TrackballControls(camera, renderer.domElement);

    // let car = new THREE.Group(), orthoCar = new THREE.Group(), carHalfSize = new THREE.Vector3(), tyreArray = [], steering_wheel, buildObbArray = [];
    // let carHeight = 1, rotateMax = Math.PI / 6, speedCorrection = 0.04, rotateCorrection = 0.002, speed = 0, rotateTyre = 0, rotateRun = 0, rotateVector = new THREE.Vector3(1,0,0);
    // var carBodySize = new THREE.Vector3(4.52, 2.26, 1.08);
    // var wheelRadius = carBodySize.z / 2;
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/gltf/');
    loader.setDRACOLoader(dracoLoader);
    loader.load('/gltf/super_car.glb', gltf => {
        const model = gltf.scene.children[0];
        // model.rotation.y = -Math.PI / 2;
        const bodyMaterial = new THREE.MeshPhysicalMaterial({color: 0xff0000, metalness: 0.6, roughness: 0.4, clearcoat: 0.05, clearcoatRoughness: 0.05});
        const detailsMaterial = new THREE.MeshStandardMaterial({color: 0xffffff, metalness: 1.0, roughness: 0.5});
        const glassMaterial = new THREE.MeshPhysicalMaterial({color: 0xffffff, metalness: 0, roughness: 0.1, transparent: true, opacity: 0.1});
        model.getObjectByName( 'body' ).material = bodyMaterial;
        model.getObjectByName( 'rim_fl' ).material = detailsMaterial;
        model.getObjectByName( 'rim_fr' ).material = detailsMaterial;
        model.getObjectByName( 'rim_rr' ).material = detailsMaterial;
        model.getObjectByName( 'rim_rl' ).material = detailsMaterial;
        model.getObjectByName( 'trim' ).material = detailsMaterial;
        model.getObjectByName( 'glass' ).material = glassMaterial;
        
        let main =  model.getObjectByName( 'main' ).clone();
        let wheel_fr =  model.getObjectByName( 'wheel_fr' ).clone();
        let wheel_fl =  model.getObjectByName( 'wheel_fl' ).clone();
        let wheel_rr =  model.getObjectByName( 'wheel_rr' ).clone();
        let wheel_rl =  model.getObjectByName( 'wheel_rl' ).clone();

        carMesh = new THREE.Object3D();
        let frMesh = new THREE.Object3D();
        let flMesh = new THREE.Object3D();
        let rrMesh = new THREE.Object3D();
        let rlMesh = new THREE.Object3D();
        
        main.rotation.set(0,0,Math.PI);
        main.position.y = - 0;
        carMesh.add(main);

        wheel_fr.position.set(0,0,0);
        wheel_fr.rotation.set(0,0,Math.PI / 2)
        frMesh.add(wheel_fr)

        wheel_fl.position.set(0,0,0);
        wheel_fl.rotation.set(0,0,Math.PI / 2)
        flMesh.add(wheel_fl)

        wheel_rr.position.set(0,0,0);
        wheel_rr.rotation.set(0,0,Math.PI / 2)
        rrMesh.add(wheel_rr)

        wheel_rl.position.set(0,0,0);
        wheel_rl.rotation.set(0,0,Math.PI / 2)
        rlMesh.add(wheel_rl)

        scene.add(carMesh)
        scene.add(frMesh);
        scene.add(flMesh);
        scene.add(rrMesh);
        scene.add(rlMesh);

        wheelMeshes.push(frMesh, flMesh, rrMesh, rlMesh);
        setTimeout(() => {
            // this
            createMesh();
        }, 500)
    } );

    stats = new Stats();
    // this
    document.getElementById('box').appendChild(stats.dom);
}

function initGui() {
    gui = new GUI();
    
    
    gui.add(params, "maxForce", 0, 1000);
    gui.add(params, "customSlidingRotationalSpeed", -100, 100).onChange(e => {
        for(let i=0; i<vehicle.wheelInfos.length; i++) {
            vehicle.wheelInfos[i].customSlidingRotationalSpeed = e;
        }
    });
    gui.add(params, "mass", 0, 1000).onChange(e => {
        for(let i=0; i<vehicle.wheelInfos.length; i++) {
            vehicle.wheelInfos[i].dampingCompression = e;
        }
    });
    gui.add(params, "dampingRelaxation", 0, 100).onChange(e => {
        for(let i=0; i<vehicle.wheelInfos.length; i++) {
            vehicle.wheelInfos[i].dampingRelaxation = e;
        }
    });
    gui.add(params, "engineForce", 0, 100).onChange(e => {
        for(let i=0; i<vehicle.wheelInfos.length; i++) {
            vehicle.wheelInfos[i].engineForce = e;
        }
    });
    gui.add(params, "frictionSlip", 0, 100).onChange(e => {
        for(let i=0; i<vehicle.wheelInfos.length; i++) {
            vehicle.wheelInfos[i].frictionSlip = e;
        }
    });
    gui.add(params, "maxSuspensionForce", 0, 10000).onChange(e => {
        for(let i=0; i<vehicle.wheelInfos.length; i++) {
            vehicle.wheelInfos[i].maxSuspensionForce = e;
        }
    });
    gui.add(params, "maxSuspensionTravel", 0, 10).onChange(e => {
        for(let i=0; i<vehicle.wheelInfos.length; i++) {
            vehicle.wheelInfos[i].maxSuspensionTravel = e;
        }
    });
    gui.add(params, "rollInfluence", 0, 10).onChange(e => {
        for(let i=0; i<vehicle.wheelInfos.length; i++) {
            vehicle.wheelInfos[i].rollInfluence = e;
        }
    });
    gui.add(params, "sideImpulse", 0, 10).onChange(e => {
        for(let i=0; i<vehicle.wheelInfos.length; i++) {
            vehicle.wheelInfos[i].sideImpulse = e;
        }
    });
    gui.add(params, "suspensionForce", 0, 10).onChange(e => {
        for(let i=0; i<vehicle.wheelInfos.length; i++) {
            vehicle.wheelInfos[i].suspensionForce = e;
        }
    });
    gui.add(params, "suspensionLength", 0, 10).onChange(e => {
        for(let i=0; i<vehicle.wheelInfos.length; i++) {
            vehicle.wheelInfos[i].suspensionLength = e;
        }
    });
    gui.add(params, "suspensionMaxLength", 0, 10).onChange(e => {
        for(let i=0; i<vehicle.wheelInfos.length; i++) {
            vehicle.wheelInfos[i].suspensionMaxLength = e;
        }
    });
    gui.add(params, "suspensionRelativeVelocity", 0, 10).onChange(e => {
        for(let i=0; i<vehicle.wheelInfos.length; i++) {
            vehicle.wheelInfos[i].suspensionRelativeVelocity = e;
        }
    });
    gui.add(params, "suspensionRestLength", 0, 10).onChange(e => {
        for(let i=0; i<vehicle.wheelInfos.length; i++) {
            vehicle.wheelInfos[i].suspensionRestLength = e;
        }
    });
    gui.add(params, "suspensionStiffness", 0, 100).onChange(e => {
        for(let i=0; i<vehicle.wheelInfos.length; i++) {
            vehicle.wheelInfos[i].suspensionStiffness = e;
        }
    });


    gui.add(new function () {
        this.reset = function() {
            vehicle.chassisBody.quaternion.set(0, 0, 0, 1);
            vehicle.chassisBody.velocity.setZero();
            vehicle.chassisBody.position.set(0, 0, 5);
            vehicle.chassisBody.angularVelocity.set(0, 0, 0.5);
        }
    }, 'reset')
}

function createMesh() {
    for(let i=0; i<5; i++) {
        for(let j=0; j<3; j++) {
            let x = j * 8 - 8;
            let y = 10;
            let z = i * 3 + 1;
            let mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(8, 4, 2), new THREE.MeshPhongMaterial({color: 0x6666666, flatShading: true}));
            let body = new CANNON.Body({
                mass: 5,
                position: new CANNON.Vec3(x, y, z),
                shape: new CANNON.Box(new CANNON.Vec3(4, 2, 1)),
                material: new CANNON.Material({friction: 0.5, restitution: 0})
            });
            world.addBody(body);
            bodies.push(body);
            scene.add(mesh);
            meshes.push(mesh);
        }
    }
}

function reset() {}




function handler(event) {
    var up = (event.type == 'keyup');
    if(!up && event.type !== 'keydown'){
        return;
    }

    vehicle.setBrake(0, 0);
    vehicle.setBrake(0, 1);
    vehicle.setBrake(0, 2);
    vehicle.setBrake(0, 3);

    switch(event.keyCode){
        case 38: // forward
            vehicle.applyEngineForce(up ? 0 : -params.maxForce, 2);
            vehicle.applyEngineForce(up ? 0 : -params.maxForce, 3);
            break;

        case 40: // backward
            vehicle.applyEngineForce(up ? 0 : params.maxForce, 2);
            vehicle.applyEngineForce(up ? 0 : params.maxForce, 3);
            break;

        case 66: // b
            vehicle.setBrake(brakeForce, 0);
            vehicle.setBrake(brakeForce, 1);
            vehicle.setBrake(brakeForce, 2);
            vehicle.setBrake(brakeForce, 3);
            break;

        case 39: // right
            vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 0);
            vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 1);
            break;

        case 37: // left
            vehicle.setSteeringValue(up ? 0 : maxSteerVal, 0);
            vehicle.setSteeringValue(up ? 0 : maxSteerVal, 1);
            break;
        }
}


function animation() {
    // this this
    globalID = requestAnimationFrame(animation);
    // this
    render();
}


function render() {
    stats.update();
    // this
    updatePhysics();
    controls.update();
    renderer.render( scene, camera );
}


function updatePhysics() {
    world.step(timeStep);
    if(carMesh) {
        carMesh.position.copy(vehicle.chassisBody.position);
        carMesh.quaternion.copy(vehicle.chassisBody.quaternion);

        for(let i=0; i<wheelMeshes.length; i++) {
            wheelMeshes[i].position.copy(vehicle.wheelInfos[i].worldTransform.position);
            wheelMeshes[i].quaternion.copy(vehicle.wheelInfos[i].worldTransform.quaternion);
        }   
    }
    for(let i=0; i<meshes.length; i++) {
        meshes[i].position.copy(bodies[i].position);
        meshes[i].quaternion.copy(bodies[i].quaternion);
    }
}



window.onresize = () => {
    // this this
    camera.aspect = document.getElementById('box').clientWidth / document.getElementById('box').clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(
        document.getElementById('box').clientWidth, // this
        document.getElementById('box').clientHeight
    );  
};

init()


// beforeDestroy() {
//     renderer.forceContextLoss();
//     renderer = null;
//     scene = null;
//     camera = null;
//     world = null;
//     controls = null;
//     document
//         .getElementsByClassName("ac")[0]
//         .removeChild(document.getElementsByClassName("main")[0]);
//     cancelAnimationFrame(this.globalID);
// }
