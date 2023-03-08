/**
 * threejs 基础
 * requestAnimationFrame 时间参数 控制物体动画
 */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 10);
scene.add(camera);
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);

// 和时间关联后形成连续动画
function render(time) { // time 当前毫秒时间戳
  // s=vt 路程=速度x时间
  let t = (time / 1000) % 5; // 当前时间秒数
  cube.position.x = t * 3; // 时间 x 速度

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();
