/**
 * 透明纹理
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
// 透明材质，黑色0完全透明，白色1完全不透明
const doorAplhaTexture = textureLoader.load("./textures/door/alpha.jpg");
const cubeGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
const basicMaterial = new THREE.MeshBasicMaterial({
  color: "#ffff00",
  map: doorColorTexture,
  alphaMap: doorAplhaTexture,
  transparent: true, // 【重要】允许透明，否则透明材质不生效
  // opacity: 0.3,
  // side: THREE.DoubleSide, // 渲染面
});
basicMaterial.side = THREE.DoubleSide; // 渲染面

// 添加平面
const plane = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(1, 1),
  basicMaterial
);
plane.position.set(3, 0, 0);
scene.add(plane);

const cube = new THREE.Mesh(cubeGeometry, basicMaterial);
scene.add(cube);
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
