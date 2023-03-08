/**
 * 使用cannon引擎
 * 
 * https://schteppe.github.io/cannon.js
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// 导入connon引擎
import * as CANNON from "cannon-es";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 300);
camera.position.set(0, 0, 18);
scene.add(camera);

// 添加环境光和平行光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
dirLight.castShadow = true;
scene.add(dirLight);

// 创建球和平面
const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
const sphereMaterial = new THREE.MeshStandardMaterial();
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.castShadow = true;
scene.add(sphere);

const floor = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(20, 20),
  new THREE.MeshStandardMaterial()
);
floor.position.set(0, -5, 0);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// 创建物理世界
const world = new CANNON.World(); // CANNON.World({ gravity: 9.8 })
world.gravity.set(0, -9.8, 0);

// 创建半径为1的物理小球形状
const sphereShape = new CANNON.Sphere(1);
// 设置物体材质
const sphereWorldMaterial = new CANNON.Material();
// 创建物理世界的物体
const sphereBody = new CANNON.Body({
  shape: sphereShape,
  position: new CANNON.Vec3(0, 0, 0),
  mass: 1, // 小球质量
  material: sphereWorldMaterial, // 物体材质
});

// 将物体添加至物理世界
world.addBody(sphereBody);

// 创建物理世界地面
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
floorBody.mass = 0; // 当质量为0的时候，可以使物体保持不动
floorBody.addShape(floorShape);
floorBody.position.set(0, -5, 0); // 地面位置
// 旋转地面的位置
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
world.addBody(floorBody);

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
  // cannon物理引擎计算物体位置，three拿到位置信息负责渲染
  // 更新物理引擎里世界的物体
  world.step(1 / 120, deltaTime);
  // 复制物理世界位置到three
  sphere.position.copy(sphereBody.position);

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
