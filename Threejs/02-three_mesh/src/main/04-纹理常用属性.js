/**
 * 纹理常用属性
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

// 设置纹理偏移
// doorColorTexture.offset.x = 0.5;
// doorColorTexture.offset.y = 0.5;
doorColorTexture.offset.set(0.5, 0.5);
// 纹理旋转
doorColorTexture.center.set(0.5, 0.5); // 设置旋转的原点
doorColorTexture.rotation = Math.PI / 4; // 旋转45deg
// 设置纹理的重复次数
doorColorTexture.repeat.set(2, 3);
// 纹理重复的模式
/*
  THREE.ClampToEdgeWrapping 默认，切割推至边缘
  THREE.RepeatWrapping 无限重复
  THREE.MirroredRepeatWrapping 镜像重复
 */
doorColorTexture.wrapS = THREE.MirroredRepeatWrapping; // U 水平方向上将如何包裹
doorColorTexture.wrapT = THREE.RepeatWrapping; // V 垂直方向上将如何包裹

const cubeGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
const basicMaterial = new THREE.MeshBasicMaterial({
  color: "#ffff00",
  map: doorColorTexture, // 材质贴图
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