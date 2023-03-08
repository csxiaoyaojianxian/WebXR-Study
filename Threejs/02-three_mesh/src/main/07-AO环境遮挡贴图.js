/**
 * AO环境遮挡贴图
 * 用于遮挡环境光,白色为不遮挡,黑色为全遮挡
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
const doorAplhaTexture = textureLoader.load("./textures/door/alpha.jpg");
// AO环境遮挡贴图，环境光黑色遮挡，白色穿透
const doorAoTexture = textureLoader.load("./textures/door/ambientOcclusion.jpg");

// 材质
const basicMaterial = new THREE.MeshBasicMaterial({
  color: "#ffff00",
  map: doorColorTexture,
  alphaMap: doorAplhaTexture,
  transparent: true,
  aoMap: doorAoTexture, // AO环境遮挡贴图，文档中写明需要第二组UV
  aoMapIntensity: 1, // 强度
  side: THREE.DoubleSide,
});

const cubeGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
// 【重要】在 new THREE.Mesh 前给几何体添加第二组uv
cubeGeometry.setAttribute(
  "uv2",
  // 将原来的几何体自带的uv复制过来，按照 vector2 解析，BufferAttribute用于存储属性值
  new THREE.BufferAttribute(cubeGeometry.attributes.uv.array, 2)
);

const planeGeometry = new THREE.PlaneBufferGeometry(1, 1);
planeGeometry.setAttribute( // 同上，给平面设置第二组uv
  "uv2",
  new THREE.BufferAttribute(planeGeometry.attributes.uv.array, 2)
);

const cube = new THREE.Mesh(cubeGeometry, basicMaterial);
scene.add(cube);

const plane = new THREE.Mesh(planeGeometry, basicMaterial);
plane.position.set(3, 0, 0);
scene.add(plane);

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