class Game{
  constructor(){

    // webgl 兼容性检测
    if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
    
    this.container;
    this.stats;
    this.camera;
    this.scene;
    this.renderer;
    this.debug = true;
    this.debugPhysics = true;
    this.fixedTimeStep = 1.0/60.0;

    // 车身尺寸
    // this.carBodySize = new THREE.Vector3(4.52, 2.26, 1.08);
    
    this.container = document.createElement( 'div' );
    this.container.style.height = '100%';
    document.body.appendChild( this.container );
    
    const game = this;

    // 操纵杆  上下前进 / 左右转向 -1～1
    this.js = { forward:0, turn:0 };
    this.clock = new THREE.Clock();

    this.init();
    
    window.onError = function(error){
      console.error(JSON.stringify(error));
    }
  }
  
  init() {

    // 初始化相机、场景、渲染器
    this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
    this.camera.position.set( 10, 10, 10 );
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xa0a0a0 );
    this.renderer = new THREE.WebGLRenderer( { antialias: true } ); // 抗锯齿
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild( this.renderer.domElement );
    window.addEventListener( 'resize', function(){ game.onWindowResize(); }, false );

    // ?
    this.helper = new CannonHelper(this.scene);
    // 初始化灯光
    this.helper.addLights(this.renderer);
        
    // stats
    if (this.debug){
      this.stats = new Stats();
      this.container.appendChild( this.stats.dom );
    }
    
    // 初始化操纵杆
    this.joystick = new JoyStick({
      game:this,
      onMove:this.joystickCallback // 移动回调
    });
    
    // 初始化物理世界
    this.initPhysics();
  }
  
  /**
   * 初始化物理世界
   */
  initPhysics(){
    this.physics = {};
    
    const game = this;
    const world = new CANNON.World();
    this.world = world;
    
    world.broadphase = new CANNON.SAPBroadphase(world);
    world.gravity.set(0, -10, 0);
    world.defaultContactMaterial.friction = 0;

    const groundMaterial = new CANNON.Material("groundMaterial");
    const wheelMaterial = new CANNON.Material("wheelMaterial");
    const wheelGroundContactMaterial = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
      friction: 0.3,
      restitution: 0,
      contactEquationStiffness: 1000 // 接触刚度
    });

    // We must add the contact materials to the world
    world.addContactMaterial(wheelGroundContactMaterial);

    // 底盘形状
    const chassisShape = new CANNON.Box(new CANNON.Vec3(1, 0.5, 2));
    // const chassisShape = new CANNON.Box(new CANNON.Vec3(carBodySize.x/2, carBodySize.y/2, carBodySize.z/2));
  
    // 底盘刚体 摩擦/形变恢复
    const chassisBody = new CANNON.Body({ mass: 150, material: groundMaterial });
    chassisBody.addShape(chassisShape);
    chassisBody.position.set(0, 4, 0);

    setTimeout(() => {
      chassisBody.applyLocalForce(
        new CANNON.Vec3(10000, 10000, 0), // 添加的力向量（大小和方向）
        chassisBody.position // 被施加力的物体局部点
      );
    }, 3000);

    // ? 添加辅助线
    this.helper.addVisual(chassisBody, 'car');
    
    // 摄像机
    this.followCam = new THREE.Object3D();
    this.followCam.position.copy(this.camera.position);
    this.scene.add(this.followCam);
    // ? 相机跟随底盘
    this.followCam.parent = chassisBody.threemesh;
    // 设置平行光投影目标
    this.helper.shadowTarget = chassisBody.threemesh;

    /**
     * 汽车参数
     */
    const options = {
      radius: 0.5, // 车轮半径
      directionLocal: new CANNON.Vec3(0, -1, 0), // 车轮的下方方向（垂直车身向下）
      suspensionStiffness: 30, // 悬架刚度
      suspensionRestLength: 0.3, // 悬架静止长度（未受任何力）
      // suspensionMaxLength: 2,// 悬挂最大长度，限制计算出的suspensionLength
      frictionSlip: 5, // 滑动摩檫系数（用于计算车轮所能提供的最大摩檫力）
      dampingRelaxation: 2.3, // 阻尼复原阻尼
      dampingCompression: 4.4, // 阻尼压缩阻尼
      maxSuspensionForce: 100000, // 最大悬吊力 限制计算出的suspensionForce
      rollInfluence:  0.01, // 施加侧向力时的位置系数，越小越接近车身，防止侧翻
      axleLocal: new CANNON.Vec3(-1, 0, 0), // 车轴方向
      chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0), // 底盘连接点坐标(车轮连接底盘位置)，相对于chassisBody（也是发射射线的起点）
      maxSuspensionTravel: 0.3, // 最大悬架行程，悬挂可伸长或压缩的最大距离
      customSlidingRotationalSpeed: -30, // 自定义滑动转速
      useCustomSlidingRotationalSpeed: true // 使用自定义滑动旋转速度
    };

    /**
     * RaycastVehicle 车辆辅助类
     * 将光线从车轮位置投射到地面并施加力，决定车的位置、角度、质量等信息
     * 后面三个参数决定了车辆的前面、右面、上面
     */
    // Create the vehicle
    const vehicle = new CANNON.RaycastVehicle({
      chassisBody: chassisBody, // 车身刚体
      indexRightAxis: 0, // 前轴索引 0 = x，1 = y，2 = z
      indexUpAxis: 1,
      indeForwardAxis: 2
    });

    // 添加4个车轮
    options.chassisConnectionPointLocal.set(1, 0, -1);
    vehicle.addWheel(options);

    options.chassisConnectionPointLocal.set(-1, 0, -1);
    vehicle.addWheel(options);

    options.chassisConnectionPointLocal.set(1, 0, 1);
    vehicle.addWheel(options);

    options.chassisConnectionPointLocal.set(-1, 0, 1);
    vehicle.addWheel(options);

    // addToWorld
    vehicle.addToWorld(world);

    /**
     * WheelInfo 车轮类
     * 包含了十分丰富的信息：车轮相对于车的位置、车轮半径、滚动影响、转弯滑动等
     */
    const wheelBodies = []; // 车轮刚体
    vehicle.wheelInfos.forEach( function(wheel){
      // 添加圆柱体车轮刚体
      const cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20);
      const wheelBody = new CANNON.Body({ mass: 1, material: wheelMaterial });
      const q = new CANNON.Quaternion();
      q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
      wheelBody.addShape(cylinderShape, new CANNON.Vec3(), q);
      wheelBodies.push(wheelBody);
      // ?
      game.helper.addVisual(wheelBody, 'wheel');
    });

    // Update wheels 位置、旋转角度
    world.addEventListener('postStep', function(){
      let index = 0;
      game.vehicle.wheelInfos.forEach(function(wheel){
        game.vehicle.updateWheelTransform(index);
        const t = wheel.worldTransform;
        wheelBodies[index].threemesh.position.copy(t.position);
        wheelBodies[index].threemesh.quaternion.copy(t.quaternion);
        index++; 
      });
    });
    
    this.vehicle = vehicle;

    // Heightfield高度场
    // 创建构造高度场的数组 64 x 64
    let matrix = [];
    let sizeX = 64, sizeY = 64;

    for (let i = 0; i < sizeX; i++) {
      matrix.push([]);
      for (var j = 0; j < sizeY; j++) {
        var height = Math.cos(i / sizeX * Math.PI * 5) * Math.cos(j/sizeY * Math.PI * 5) * 2 + 2;
        if(i===0 || i === sizeX-1 || j===0 || j === sizeY-1)
          height = 3;
        matrix[i].push(height);
      }
    }

    var hfShape = new CANNON.Heightfield(matrix, {
      elementSize: 100 / sizeX // 数据点的距离
    });
    var hfBody = new CANNON.Body({ mass: 0 });
    hfBody.addShape(hfShape);
    hfBody.position.set(-sizeX * hfShape.elementSize / 2, -4, sizeY * hfShape.elementSize / 2);
    hfBody.quaternion.setFromAxisAngle( new CANNON.Vec3(1,0,0), -Math.PI/2);
    world.add(hfBody);
    // ?
    this.helper.addVisual(hfBody, 'landscape');
    
    this.animate();
  }

  /**
   * 操纵杆回调
   */
  joystickCallback( forward, turn ){
    this.js.forward = forward;
    this.js.turn = -turn;
  }
  
  /**
   * 更新
   */
  updateDrive(forward=this.js.forward, turn=this.js.turn){
    
    const maxSteerVal = 0.5; // 最大转向阀
    const maxForce = 1000; // 最大作用力
    const brakeForce = 10; // 刹车制动力
    
    const force = maxForce * forward; // 前进力
    const steer = maxSteerVal * turn; // 转向
    // const steer = Math.PI / 2.5; // 转向
    
    if (forward!=0){
      this.vehicle.setBrake(0, 0);
      this.vehicle.setBrake(0, 1);
      this.vehicle.setBrake(0, 2);
      this.vehicle.setBrake(0, 3);
      // 施加后轮牵引力 function(value, wheelIndex)
      this.vehicle.applyEngineForce(force, 2);
      this.vehicle.applyEngineForce(force, 3);
     }else{
      // 四轮制动
      this.vehicle.setBrake(brakeForce, 0);
      this.vehicle.setBrake(brakeForce, 1);
      this.vehicle.setBrake(brakeForce, 2);
      this.vehicle.setBrake(brakeForce, 3);
    }
    // 设置前轮转向角（弧度）function(value, wheelIndex)
    this.vehicle.setSteeringValue(steer, 0);
    this.vehicle.setSteeringValue(steer, 1);

    // this.vehicle.setSteeringValue(-steer, 2);
    // this.vehicle.setSteeringValue(-steer, 3);

    // this.vehicle.applyEngineForce(500, 2);
    // this.vehicle.applyEngineForce(500, 3);
    // this.vehicle.applyEngineForce(500, 0);
    // this.vehicle.applyEngineForce(500, 1);
  }
  
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
  }

  updateCamera(){
    this.camera.position.lerp(this.followCam.getWorldPosition(new THREE.Vector3()), 0.05); // 朝着某方向插值
    this.camera.lookAt(this.vehicle.chassisBody.threemesh.position);
    // 修改光线位置
    if (this.helper.sun!=undefined){
      this.helper.sun.position.copy( this.camera.position );
      this.helper.sun.position.y += 10;
    }
  }
                   
  animate() {
    const game = this;
    
    requestAnimationFrame( function(){ game.animate(); } );
    
    const now = Date.now();
    if (this.lastTime===undefined) this.lastTime = now;
    const dt = (Date.now() - this.lastTime)/1000.0;
    this.FPSFactor = dt;
    this.lastTime = now;
    
    this.world.step(this.fixedTimeStep, dt);
    this.helper.updateBodies(this.world);
    
    this.updateDrive();
    this.updateCamera();
    
    this.renderer.render( this.scene, this.camera );

    if (this.stats!=undefined) this.stats.update();

  }
}

/**
 * 操纵杆
 * game
 * onMove 移动回调，返回 forwarn/turn
 * maxRadius 最大半径
 * rotationDamping 旋转阻尼
 * moveDamping 移动阻尼
 */
class JoyStick{
  constructor(options){
    const circle = document.createElement("div");
    circle.style.cssText = "position:absolute; bottom:35px; width:80px; height:80px; background:rgba(126, 126, 126, 0.5); border:#444 solid medium; border-radius:50%; left:50%; transform:translateX(-50%);";
    const thumb = document.createElement("div");
    thumb.style.cssText = "position: absolute; left: 20px; top: 20px; width: 40px; height: 40px; border-radius: 50%; background: #fff;";
    circle.appendChild(thumb);
    document.body.appendChild(circle);
    this.domElement = thumb;
    this.maxRadius = options.maxRadius || 40;
    this.maxRadiusSquared = this.maxRadius * this.maxRadius;
    this.onMove = options.onMove;
    this.game = options.game;
    this.origin = { left:this.domElement.offsetLeft, top:this.domElement.offsetTop };
    this.rotationDamping = options.rotationDamping || 0.06;
    this.moveDamping = options.moveDamping || 0.01;
    if (this.domElement!=undefined){
      const joystick = this;
      if ('ontouchstart' in window){
        this.domElement.addEventListener('touchstart', function(evt){ joystick.tap(evt); });
      }else{
        this.domElement.addEventListener('mousedown', function(evt){ joystick.tap(evt); });
      }
    }
  }
  
  getMousePosition(evt){
    let clientX = evt.targetTouches ? evt.targetTouches[0].pageX : evt.clientX;
    let clientY = evt.targetTouches ? evt.targetTouches[0].pageY : evt.clientY;
    return { x:clientX, y:clientY };
  }
  
  tap(evt){
    evt = evt || window.event;
    // get the mouse cursor position at startup:
    this.offset = this.getMousePosition(evt);
    const joystick = this;
    if ('ontouchstart' in window){
      document.ontouchmove = function(evt){ joystick.move(evt); };
      document.ontouchend =  function(evt){ joystick.up(evt); };
    }else{
      document.onmousemove = function(evt){ joystick.move(evt); };
      document.onmouseup = function(evt){ joystick.up(evt); };
    }
  }
  
  move(evt){
    evt = evt || window.event;
    const mouse = this.getMousePosition(evt);
    // calculate the new cursor position:
    let left = mouse.x - this.offset.x;
    let top = mouse.y - this.offset.y;
    //this.offset = mouse;
    
    const sqMag = left*left + top*top;
    if (sqMag>this.maxRadiusSquared){
      //Only use sqrt if essential
      const magnitude = Math.sqrt(sqMag);
      left /= magnitude;
      top /= magnitude;
      left *= this.maxRadius;
      top *= this.maxRadius;
    }
    // set the element's new position:
    this.domElement.style.top = `${top + this.domElement.clientHeight/2}px`;
    this.domElement.style.left = `${left + this.domElement.clientWidth/2}px`;
    
    // 上下前进 / 左右转向 -1～1
    const forward = -(top - this.origin.top + this.domElement.clientHeight/2)/this.maxRadius;
    const turn = (left - this.origin.left + this.domElement.clientWidth/2)/this.maxRadius;
    
    if (this.onMove!=undefined) this.onMove.call(this.game, forward, turn);
  }
  
  up(evt){
    if ('ontouchstart' in window){
      document.ontouchmove = null;
      document.touchend = null;
    }else{
      document.onmousemove = null;
      document.onmouseup = null;
    }
    this.domElement.style.top = `${this.origin.top}px`;
    this.domElement.style.left = `${this.origin.left}px`;
    
    this.onMove.call(this.game, 0, 0);
  }
}

/**
 * CannonHelper
 * 传入场景
 */
class CannonHelper{
    constructor(scene){
        this.scene = scene;
    }
    
    addLights(renderer){
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

        // LIGHTS
        const ambient = new THREE.AmbientLight( 0x888888 );
        this.scene.add( ambient );

        const light = new THREE.DirectionalLight( 0xdddddd );
        light.position.set( 3, 10, 4 );
        light.target.position.set( 0, 0, 0 );

        light.castShadow = true;

        const lightSize = 10;
        light.shadow.camera.near = 1;
        light.shadow.camera.far = 50;
        light.shadow.camera.left = light.shadow.camera.bottom = -lightSize;
        light.shadow.camera.right = light.shadow.camera.top = lightSize;

        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;

        // sun
        this.sun = light;
        this.scene.add(light);    
    }
    
    set shadowTarget(obj){
        if (this.sun!==undefined) this.sun.target = obj;    
    }
    
    createCannonTrimesh(geometry){
    if (!geometry.isBufferGeometry) return null;
    
    const posAttr = geometry.attributes.position;
    const vertices = geometry.attributes.position.array;
    let indices = [];
    for(let i=0; i<posAttr.count; i++){
      indices.push(i);
    }
    
    return new CANNON.Trimesh(vertices, indices);
  }
  
  createCannonConvex(geometry){
    if (!geometry.isBufferGeometry) return null;
    
    const posAttr = geometry.attributes.position;
    const floats = geometry.attributes.position.array;
    const vertices = [];
    const faces = [];
    let face = [];
    let index = 0;
    for(let i=0; i<posAttr.count; i+=3){
      vertices.push( new CANNON.Vec3(floats[i], floats[i+1], floats[i+2]) );
      face.push(index++);
      if (face.length==3){
        faces.push(face);
        face = [];
      }
    }
    
    return new CANNON.ConvexPolyhedron(vertices, faces);
  }
    
    addVisual(body, name, castShadow=true, receiveShadow=true){
    body.name = name;
    if (this.currentMaterial===undefined) this.currentMaterial = new THREE.MeshLambertMaterial({color:0x888888});
    if (this.settings===undefined){
      this.settings = {
        stepFrequency: 60,
        quatNormalizeSkip: 2,
        quatNormalizeFast: true,
        gx: 0,
        gy: 0,
        gz: 0,
        iterations: 3,
        tolerance: 0.0001,
        k: 1e6,
        d: 3,
        scene: 0,
        paused: false,
        rendermode: "solid",
        constraints: false,
        contacts: false,  // Contact points
        cm2contact: false, // center of mass to contact points
        normals: false, // contact normals
        axes: false, // "local" frame axes
        particleSize: 0.1,
        shadows: false,
        aabbs: false,
        profiling: false,
        maxSubSteps:3
      }
      this.particleGeo = new THREE.SphereGeometry( 1, 16, 8 );
      this.particleMaterial = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
    }
    // What geometry should be used?
    let mesh;
    if(body instanceof CANNON.Body) mesh = this.shape2Mesh(body, castShadow, receiveShadow);

    if(mesh) {
      // Add body
      body.threemesh = mesh;
            mesh.castShadow = castShadow;
            mesh.receiveShadow = receiveShadow;
      this.scene.add(mesh);
    }
  }
  
  shape2Mesh(body, castShadow, receiveShadow){
    const obj = new THREE.Object3D();
    const material = this.currentMaterial;
    const game = this;
    let index = 0;
    
    body.shapes.forEach (function(shape){
      let mesh;
      let geometry;
      let v0, v1, v2;

      switch(shape.type){

      case CANNON.Shape.types.SPHERE:
        const sphere_geometry = new THREE.SphereGeometry( shape.radius, 8, 8);
        mesh = new THREE.Mesh( sphere_geometry, material );
        break;

      case CANNON.Shape.types.PARTICLE:
        mesh = new THREE.Mesh( game.particleGeo, game.particleMaterial );
        const s = this.settings;
        mesh.scale.set(s.particleSize,s.particleSize,s.particleSize);
        break;

      case CANNON.Shape.types.PLANE:
        geometry = new THREE.PlaneGeometry(10, 10, 4, 4);
        mesh = new THREE.Object3D();
        const submesh = new THREE.Object3D();
        const ground = new THREE.Mesh( geometry, material );
        ground.scale.set(100, 100, 100);
        submesh.add(ground);

        mesh.add(submesh);
        break;

      case CANNON.Shape.types.BOX:
        const box_geometry = new THREE.BoxGeometry(  shape.halfExtents.x*2,
                              shape.halfExtents.y*2,
                              shape.halfExtents.z*2 );
        mesh = new THREE.Mesh( box_geometry, material );
        break;

      case CANNON.Shape.types.CONVEXPOLYHEDRON:
        const geo = new THREE.Geometry();

        // Add vertices
        shape.vertices.forEach(function(v){
          geo.vertices.push(new THREE.Vector3(v.x, v.y, v.z));
        });

        shape.faces.forEach(function(face){
          // add triangles
          const a = face[0];
          for (let j = 1; j < face.length - 1; j++) {
            const b = face[j];
            const c = face[j + 1];
            geo.faces.push(new THREE.Face3(a, b, c));
          }
        });
        geo.computeBoundingSphere();
        geo.computeFaceNormals();
        mesh = new THREE.Mesh( geo, material );
        break;

      case CANNON.Shape.types.HEIGHTFIELD:
        geometry = new THREE.Geometry();

        v0 = new CANNON.Vec3();
        v1 = new CANNON.Vec3();
        v2 = new CANNON.Vec3();
        for (let xi = 0; xi < shape.data.length - 1; xi++) {
          for (let yi = 0; yi < shape.data[xi].length - 1; yi++) {
            for (let k = 0; k < 2; k++) {
              shape.getConvexTrianglePillar(xi, yi, k===0);
              v0.copy(shape.pillarConvex.vertices[0]);
              v1.copy(shape.pillarConvex.vertices[1]);
              v2.copy(shape.pillarConvex.vertices[2]);
              v0.vadd(shape.pillarOffset, v0);
              v1.vadd(shape.pillarOffset, v1);
              v2.vadd(shape.pillarOffset, v2);
              geometry.vertices.push(
                new THREE.Vector3(v0.x, v0.y, v0.z),
                new THREE.Vector3(v1.x, v1.y, v1.z),
                new THREE.Vector3(v2.x, v2.y, v2.z)
              );
              var i = geometry.vertices.length - 3;
              geometry.faces.push(new THREE.Face3(i, i+1, i+2));
            }
          }
        }
        geometry.computeBoundingSphere();
        geometry.computeFaceNormals();
        mesh = new THREE.Mesh(geometry, material);
        break;

      case CANNON.Shape.types.TRIMESH:
        geometry = new THREE.Geometry();

        v0 = new CANNON.Vec3();
        v1 = new CANNON.Vec3();
        v2 = new CANNON.Vec3();
        for (let i = 0; i < shape.indices.length / 3; i++) {
          shape.getTriangleVertices(i, v0, v1, v2);
          geometry.vertices.push(
            new THREE.Vector3(v0.x, v0.y, v0.z),
            new THREE.Vector3(v1.x, v1.y, v1.z),
            new THREE.Vector3(v2.x, v2.y, v2.z)
          );
          var j = geometry.vertices.length - 3;
          geometry.faces.push(new THREE.Face3(j, j+1, j+2));
        }
        geometry.computeBoundingSphere();
        geometry.computeFaceNormals();
        mesh = new THREE.Mesh(geometry, MutationRecordaterial);
        break;

      default:
        throw "Visual type not recognized: "+shape.type;
      }

      mesh.receiveShadow = receiveShadow;
      mesh.castShadow = castShadow;
            
            mesh.traverse( function(child){
                if (child.isMesh){
                    child.castShadow = castShadow;
          child.receiveShadow = receiveShadow;
                }
            });

      var o = body.shapeOffsets[index];
      var q = body.shapeOrientations[index++];
      mesh.position.set(o.x, o.y, o.z);
      mesh.quaternion.set(q.x, q.y, q.z, q.w);

      obj.add(mesh);
    });

    return obj;
  }
    
    updateBodies(world){
        world.bodies.forEach( function(body){
            if ( body.threemesh != undefined){
                body.threemesh.position.copy(body.position);
                body.threemesh.quaternion.copy(body.quaternion);
            }
        });
    }
}