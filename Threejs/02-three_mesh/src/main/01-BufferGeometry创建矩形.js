/**
 * BufferGeometry 通过缓冲区几何体6个顶点参数创建一个矩形
 * 
 * BufferGeometry 是面片、线或点几何体的有效表述。包括顶点位置，面片索引、法相量、颜色值、UV 坐标和自定义缓存属性值
 * 使用 BufferGeometry 可以有效减少向 GPU 传输上述数据所需的开销
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 10);
scene.add(camera);


/*
一个矩形由两个三角形组成，包含6个顶点

***********
*       * *
*     *   *
*   *     *
* *       *
***********

*/

// 创建几何体
const geometry = new THREE.BufferGeometry();
// 定义顶点，每三个为一组xyz，使用32位浮点数数组创建
const vertices = new Float32Array([
  // 右下三角形
  -1.0, -1.0, 1.0,
  1.0, -1.0, 1.0,
  1.0, 1.0, 1.0,
  // 左上三角形
  1.0, 1.0, 1.0,
  -1.0, 1.0, 1.0,
  -1.0, -1.0, 1.0,
]);
// 用缓冲区属性对象为几何体设置位置属性
geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

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
