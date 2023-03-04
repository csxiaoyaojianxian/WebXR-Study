/**
 * 加载hdr环境图
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// RGBELoader
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
const rgbeLoader = new RGBELoader();
rgbeLoader.loadAsync("textures/hdr/002.hdr").then((texture) => {
  // 指明贴图方式
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 10);
scene.add(camera);

const sphereGeometry = new THREE.SphereBufferGeometry(1, 20, 20);
const material = new THREE.MeshStandardMaterial({
  metalness: 0.7,
  roughness: 0.1,
  // envMap: envMapTexture,
});
const sphere = new THREE.Mesh(sphereGeometry, material);
scene.add(sphere);
const light = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(light);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);
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
