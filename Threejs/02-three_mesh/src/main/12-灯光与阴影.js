/**
 * 灯光与阴影
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 10);
scene.add(camera);

// 阴影需要满足以下条件，缺一不可
// 1. [材质]要满足能够对光照有反应，如 MeshBasicMaterial 基础材质不受光照影响，推荐用 MeshStandardMaterial
// 2. 设置[渲染器]开启阴影的计算 renderer.shadowMap.enabled = true;
// 3. 设置[光照]投射阴影 directionalLight.castShadow = true;
// 4. 设置[物体]投射阴影 sphere.castShadow = true;
// 5. 设置[物体]接收阴影 plane.receiveShadow = true;

// 创建球体
const sphereGeometry = new THREE.SphereBufferGeometry(1, 20, 20);
const material = new THREE.MeshStandardMaterial();
const sphere = new THREE.Mesh(sphereGeometry, material);
// 4. 投射阴影
sphere.castShadow = true;
scene.add(sphere);

// 创建平面
const planeGeometry = new THREE.PlaneBufferGeometry(10, 10);
const plane = new THREE.Mesh(planeGeometry, material);
plane.position.set(0, -1, 0);
plane.rotation.x = -Math.PI / 2;
// 5. 接收阴影
plane.receiveShadow = true;
scene.add(plane);

// 环境光
const light = new THREE.AmbientLight(0xffffff, 0.5); // soft white light
scene.add(light);
// 直线光源
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(10, 10, 10);
// 3. 设置光照投射阴影
directionalLight.castShadow = true;
scene.add(directionalLight);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
// 2. 渲染器开启场景阴影计算，此时平行光能够投射阴影
renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
function render() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();
