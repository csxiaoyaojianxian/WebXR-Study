/**
 * 使用pointes设置随机顶点打造星河
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 10);
scene.add(camera);

// 创建5000个随机顶点
const particlesGeometry = new THREE.BufferGeometry();
const count = 5000;

// 设置缓冲区数组
const positions = new Float32Array(count * 3);
// 设置粒子顶点颜色
const colors = new Float32Array(count * 3);
// 设置顶点
for (let i = 0; i < count * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 100; // -50～50
  colors[i] = Math.random();
}
particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);
particlesGeometry.setAttribute(
  "color",
  new THREE.BufferAttribute(colors, 3)
);

// 设置点材质
const pointsMaterial = new THREE.PointsMaterial();
pointsMaterial.size = 0.5;
pointsMaterial.color.set(0xfff000);
pointsMaterial.sizeAttenuation = true; // 大小随相机深度而衰减
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load("./textures/particles/zs2.png");
pointsMaterial.map = texture;
pointsMaterial.alphaMap = texture;
pointsMaterial.transparent = true;
pointsMaterial.depthWrite = false;
pointsMaterial.blending = THREE.AdditiveBlending;
// 设置启动顶点颜色
pointsMaterial.vertexColors = true;
// 创建点
const points = new THREE.Points(particlesGeometry, pointsMaterial);
scene.add(points);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
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
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
});
