/**
 * 标准网格材质(MeshStandardMaterial)
 * 基础灯光
 * 置换贴图、粗糙度贴图、金属贴图、法线贴图
 * 
 * 素材下载网站：https://www.poliigon.com
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 10);
scene.add(camera);

// 导入纹理
const textureLoader = new THREE.TextureLoader();
const doorColorTexture = textureLoader.load("./textures/door/color.jpg");
// 导入透明度贴图
const doorAplhaTexture = textureLoader.load("./textures/door/alpha.jpg");
// 导入环境光遮罩贴图，记录透光
const doorAoTexture = textureLoader.load("./textures/door/ambientOcclusion.jpg");
// 导入置换贴图，记录高度，黑高白低
const doorHeightTexture = textureLoader.load("./textures/door/height.jpg");
// 导入粗糙度贴图，黑色0粗糙白色1光滑
const roughnessTexture = textureLoader.load("./textures/door/roughness.jpg");
// 导入金属贴图，黑色不像金属白色接近金属
const metalnessTexture = textureLoader.load("./textures/door/metalness.jpg");
// 导入法线贴图，记录面的切线方向，rgb彩色表示xyz朝向
const normalTexture = textureLoader.load("./textures/door/normal.jpg");

// 添加物体
const cubeGeometry = new THREE.BoxBufferGeometry(1, 1, 1, 100, 100, 100);
// 材质
const material = new THREE.MeshStandardMaterial({
  color: "#ffff00",
  map: doorColorTexture,
  side: THREE.DoubleSide,
  // 透明度贴图
  transparent: true,
  alphaMap: doorAplhaTexture,
  // AO环境光遮挡贴图
  aoMap: doorAoTexture,
  aoMapIntensity: 1,
  // 置换贴图
  displacementMap: doorHeightTexture,
  displacementScale: 0.1, // 突出强度
  // 粗糙度贴图
  roughness: 1,
  roughnessMap: roughnessTexture,
  // 金属贴图
  metalness: 1,
  metalnessMap: metalnessTexture,
  // 法线贴图
  normalMap: normalTexture,
});

// 环境光
const light = new THREE.AmbientLight(0xffffff, 0.5); // soft white light
scene.add(light);
// 平行光(直线光源，如太阳)
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
