/**
 * 设置cube跟着旋转
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// 导入connon引擎
import * as CANNON from "cannon-es";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 300);
camera.position.set(0, 0, 18);
scene.add(camera);

const cubeArr = [];
// 创建击打声音
const hitSound = new Audio("assets/metalHit.mp3");

// CANNON 设置cube物体材质
const cubeWorldMaterial = new CANNON.Material("cube");

function createCube() {
  // THREE 创建立方体和平面
  const cubeGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
  const cubeMaterial = new THREE.MeshStandardMaterial();
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.castShadow = true;
  scene.add(cube);

  // CANNON 创建物理cube形状
  const cubeShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
  // 创建物理世界的物体
  const cubeBody = new CANNON.Body({
    shape: cubeShape,
    position: new CANNON.Vec3(0, 0, 0),
    mass: 1, // 小球质量
    material: cubeWorldMaterial, // 物体材质
  });
  // 【重要】对小球施加一个初始力
  cubeBody.applyLocalForce(
    new CANNON.Vec3(100, 100, 100), // 添加的力向量（大小和方向）
    new CANNON.Vec3(0, 0, 0) // 被施加力的物体局部点
  );

  // 将物体添加至物理世界
  world.addBody(cubeBody);

  // 添加监听碰撞事件
  function HitEvent(e) {
    // 获取碰撞的强度
    // console.log("hit", e);
    const impactStrength = e.contact.getImpactVelocityAlongNormal();
    if (impactStrength > 2) {
      // 重新从零开始播放
      hitSound.currentTime = 0;
      hitSound.volume = impactStrength / 12;
      hitSound.play();
    }
  }
  cubeBody.addEventListener("collide", HitEvent);

  cubeArr.push({
    mesh: cube,
    body: cubeBody,
  });
}

// 监听点击动作
window.addEventListener("click", createCube);

const floor = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(20, 20),
  new THREE.MeshStandardMaterial()
);
floor.position.set(0, -5, 0);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// 创建物理世界
const world = new CANNON.World(); // const world = new CANNON.World({ gravity: 9.8 });
world.gravity.set(0, -9.8, 0);

// 物理世界创建地面
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
const floorMaterial = new CANNON.Material("floor");
floorBody.material = floorMaterial;
floorBody.mass = 0; // 当质量为0的时候，可以使得物体保持不动
floorBody.addShape(floorShape);
floorBody.position.set(0, -5, 0); // 地面位置
// 旋转地面的位置（沿着X轴方向逆时针旋转90度）
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
world.addBody(floorBody);

// 设置2种材质碰撞的参数
const defaultContactMaterial = new CANNON.ContactMaterial(
  cubeWorldMaterial,
  floorMaterial,
  {
    friction: 0.1, // 摩擦力
    restitution: 0.7, // 弹性
  }
);

// 将材料的关联设置添加到物理世界
world.addContactMaterial(defaultContactMaterial);

// 设置世界碰撞的默认材料，如果材料没有设置，都用这个
world.defaultContactMaterial = defaultContactMaterial;

// 添加环境光和平行光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
dirLight.castShadow = true;
scene.add(dirLight);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
const clock = new THREE.Clock();

function render() {
  let deltaTime = clock.getDelta();
  // 更新物理引擎里世界的物体
  world.step(1 / 60, deltaTime);
  cubeArr.forEach((item) => {
    item.mesh.position.copy(item.body.position);
    // 设置渲染的物体跟随物理的物体旋转（四元数）
    item.mesh.quaternion.copy(item.body.quaternion);
  });

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
});
