/**
 * threejs 基础，控制3d物体移动、缩放、旋转
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
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

function render() {

  // 修改物体位置
  // cube.position.set(5, 0, 0);
  // cube.position.x = 3;
  // 缩放
  // cube.scale.set(3, 2, 1);
  // cube.scale.x = 5;
  // 旋转
  // cube.rotation.set(Math.PI / 4, 0, 0, "XZY");

  cube.position.x += 0.01;
  cube.rotation.x += 0.01;
  if (cube.position.x > 5) {
    cube.position.x = 0;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();
