/**
 * 轻量级图形控制界面
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import gsap from "gsap";
// 导入dat.gui
import * as dat from "dat.gui";
import { color } from "dat.gui";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 10);
scene.add(camera);
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube);

const gui = new dat.GUI();
// 配置
const params = {
  color: "#ffff00", // 初始颜色
  fn: () => {
    // 点击事件：添加动画
    gsap.to(cube.position, { x: 5, duration: 2, yoyo: true, repeat: -1 });
  },
};

// 1. 添加一个数值控制选项
gui
  .add(cube.position, "x") // 控制内容
  .min(0)
  .max(5)
  .step(0.01)
  .name("移动x轴") // 命名
  .onChange((value) => {
    console.log("change", value);
  })
  .onFinishChange((value) => {
    console.log("finish", value);
  });
// 2. 添加一个颜色控制选项
gui.addColor(params, "color").onChange((value) => {
  cube.material.color.set(value);
}); 
// 3. 添加一个选项框
gui.add(cube, "visible").name("是否显示");
// 4. 添加折叠文件夹
var folder = gui.addFolder("设置立方体");
// 4.1 设置是否显示线框
folder.add(cube.material, "wireframe");
// 4.2 点击按钮触发事件，如运动动画
folder.add(params, "fn").name("立方体运动");

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
