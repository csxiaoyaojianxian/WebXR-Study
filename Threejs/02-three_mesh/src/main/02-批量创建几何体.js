/**
 * 打造酷炫的三角形
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 10);
scene.add(camera);

// 添加物体
// 创建50个三角形几何体
for (let i = 0; i < 50; i++) {
  const geometry = new THREE.BufferGeometry();
  // 每一个三角形，需要3个顶点，每个顶点需要3个值
  const positionArray = new Float32Array(9);
  for (let j = 0; j < 9; j++) {
    // 随机 0-5 
    positionArray[j] = Math.random() * 10 - 5;
  }
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positionArray, 3)
  );
  // 生成随机颜色 rgb
  let color = new THREE.Color(Math.random(), Math.random(), Math.random());
  const material = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.5,
  });
  // 根据几何体和材质创建物体
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
}

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
