/**
 * threejs 基础，了解 three 基础模式
 */

import * as THREE from "three";

// 1. 创建场景
const scene = new THREE.Scene();

// 2. 创建相机
const camera = new THREE.PerspectiveCamera(
  75, // fov 摄像机视锥体垂直视野角度
  window.innerWidth / window.innerHeight, // aspect 摄像机视锥体长宽比
  0.1, // near 摄像机视锥体近端面
  1000, // far 摄像机视锥体远端面
);
// 设置相机位置
camera.position.set(0, 0, 10);
scene.add(camera);

// 3. 添加物体
// 创建几何体
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
// 根据几何体和材质创建物体
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
// 将几何体添加到场景中
scene.add(cube);

// 4. 初始化渲染器
const renderer = new THREE.WebGLRenderer();
// 设置渲染的尺寸大小
renderer.setSize(window.innerWidth, window.innerHeight);
// 将webgl渲染的canvas内容添加到body
document.body.appendChild(renderer.domElement);
// 使用渲染器，通过相机将场景渲染进来
renderer.render(scene, camera);
