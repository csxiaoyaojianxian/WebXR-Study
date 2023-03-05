/**
 * points、点材质、纹理
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 10);
scene.add(camera);

// 创建球几何体
const sphereGeometry = new THREE.SphereBufferGeometry(3, 30, 30);
// 先试试普通材质
const material = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  wireframe: true, // 线框模式
});
const mesh = new THREE.Mesh(sphereGeometry, material);
// scene.add(mesh);

// 设置point点材质
const pointsMaterial = new THREE.PointsMaterial();
pointsMaterial.size = 0.1; // 点大小，默认1
pointsMaterial.color.set(0xfff000);
// 相机深度而衰减
pointsMaterial.sizeAttenuation = true;

// 载入纹理
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load("./textures/particles/2.png");
// 设置点材质纹理
pointsMaterial.map = texture;
pointsMaterial.alphaMap = texture;
pointsMaterial.transparent = true; //【重要】
pointsMaterial.depthWrite = false; // 默认后方遮挡的粒子不展示
pointsMaterial.blending = THREE.AdditiveBlending; // 叠加算法，避免后面的点过亮

const points = new THREE.Points(sphereGeometry, pointsMaterial);
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
