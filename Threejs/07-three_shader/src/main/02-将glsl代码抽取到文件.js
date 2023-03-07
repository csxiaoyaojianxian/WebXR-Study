/**
 * 将glsl代码抽取到文件
 * 注意安装 vscode shader 插件
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// 顶点着色器
import basicVertexShader from "../shader/basic/vertex.glsl";
// 片元着色器
import basicFragmentShader from "../shader/basic/fragment.glsl";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(90, window.innerHeight / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 2);
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
scene.add(camera);
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// 创建着色器
const shaderMaterial = new THREE.ShaderMaterial({
  vertexShader: basicVertexShader,
  fragmentShader: basicFragmentShader,
});

// 创建平面
const floor = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(1, 1, 64, 64),
  shaderMaterial // shader
);

scene.add(floor);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
});
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
function animate(t) {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
