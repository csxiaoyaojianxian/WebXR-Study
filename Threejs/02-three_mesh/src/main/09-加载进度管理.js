/**
 * 纹理加载进度
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 10);
scene.add(camera);

// 设置加载进度展示DOM
var div = document.createElement("div");
div.style.width = "200px";
div.style.height = "200px";
div.style.position = "fixed";
div.style.right = 0;
div.style.top = 0;
div.style.color = "#fff";
document.body.appendChild(div);

// 设置加载管理器
const loadingManager = new THREE.LoadingManager(
  // onLoad
  () => {
    console.log("图片加载完成");
  },
  // onProgress
  (url, num, total) => {
    console.log("图片加载完成:", url);
    console.log("图片加载进度:", num);
    console.log("图片总数:", total);
    let value = ((num / total) * 100).toFixed(2) + "%";
    console.log("加载进度的百分比：", value);
    div.innerHTML = value;
  },
  // onError
  (e) => {
    console.log("图片加载出现错误");
    console.log(e);
  },
);
// 导入纹理
const textureLoader = new THREE.TextureLoader(loadingManager);
const doorColorTexture = textureLoader.load(
  "./textures/door/color.jpg",
  // onLoad,
  // onProgress,
  // onError
);

const doorAplhaTexture = textureLoader.load("./textures/door/alpha.jpg");
const doorAoTexture = textureLoader.load("./textures/door/ambientOcclusion.jpg");
const doorHeightTexture = textureLoader.load("./textures/door/height.jpg");
const roughnessTexture = textureLoader.load("./textures/door/roughness.jpg");
const metalnessTexture = textureLoader.load("./textures/door/metalness.jpg");
const normalTexture = textureLoader.load("./textures/door/normal.jpg");
const cubeGeometry = new THREE.BoxBufferGeometry(1, 1, 1, 100, 100, 100);
const material = new THREE.MeshStandardMaterial({
  color: "#ffff00",
  map: doorColorTexture,
  alphaMap: doorAplhaTexture,
  transparent: true,
  side: THREE.DoubleSide,
  aoMap: doorAoTexture,
  aoMapIntensity: 1,
  displacementMap: doorHeightTexture,
  displacementScale: 0.1,
  roughness: 1,
  roughnessMap: roughnessTexture,
  metalness: 1,
  metalnessMap: metalnessTexture,
  normalMap: normalTexture,
});
const light = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(light);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);
const cube = new THREE.Mesh(cubeGeometry, material);
scene.add(cube);
cubeGeometry.setAttribute("uv2", new THREE.BufferAttribute(cubeGeometry.attributes.uv.array, 2));
const planeGeometry = new THREE.PlaneBufferGeometry(1, 1, 200, 200);
const plane = new THREE.Mesh(planeGeometry, material);
plane.position.set(1.5, 0, 0);
scene.add(plane);
planeGeometry.setAttribute("uv2", new THREE.BufferAttribute(planeGeometry.attributes.uv.array, 2));
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