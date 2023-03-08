/**
 * 纹理显示算法
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 10);
scene.add(camera);

// 导入纹理
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load("./textures/minecraft.png");

// 设置当一个纹素覆盖小于一个像素时，贴图的采样方式 LinearFilter / NearestFilter
texture.minFilter = THREE.LinearFilter; // 默认值，返回距离指定的纹理坐标最近的四个纹理元素的加权平均值
texture.magFilter = THREE.LinearFilter;
// texture.minFilter = THREE.NearestFilter; // 返回与指定纹理坐标最接近的纹理元素的值
// texture.magFilter = THREE.NearestFilter;

const cubeGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
const basicMaterial = new THREE.MeshBasicMaterial({
  color: "#ffff00",
  map: texture,
});
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