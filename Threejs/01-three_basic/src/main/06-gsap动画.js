/**
 * gsap库设置各种动画效果
 * https://greensock.com/get-started/#easing
 */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// 导入动画库
import gsap from "gsap";

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

// 设置360旋转动画
gsap.to(cube.rotation, { x: 2 * Math.PI, duration: 5 });

// 设置移动动画对象
var animate1 = gsap.to(cube.position, {
  x: 5,
  duration: 5,
  ease: "power1.inOut", // 重复的次数，无限次循环-1
  repeat: -1,
  yoyo: true, // 往返运动
  delay: 2, // s
  onComplete: () => {
    console.log("动画完成");
  },
  onStart: () => {
    console.log("动画开始");
  },
});

window.addEventListener("dblclick", () => {
  if (animate1.isActive()) {
    animate1.pause(); // 暂停
  } else {
    animate1.resume(); // 恢复
  }
});

function render() {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();
