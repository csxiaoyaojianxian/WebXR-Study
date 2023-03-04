/**
 * 阴影的属性与投影相机原理
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";
const gui = new dat.GUI();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 10);
scene.add(camera);
const sphereGeometry = new THREE.SphereBufferGeometry(1, 20, 20);
const material = new THREE.MeshStandardMaterial();
const sphere = new THREE.Mesh(sphereGeometry, material);
sphere.castShadow = true;
scene.add(sphere);
const planeGeometry = new THREE.PlaneBufferGeometry(10, 10);
const plane = new THREE.Mesh(planeGeometry, material);
plane.position.set(0, -1, 0);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);
const light = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(light);

// 平行光
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;

// 设置阴影贴图模糊度
directionalLight.shadow.radius = 20;
// 设置阴影贴图的分辨率
directionalLight.shadow.mapSize.set(4096, 4096);

// 设置平行光投射相机的属性
directionalLight.shadow.camera.near = 0.5; // 近端，超出则不展示
directionalLight.shadow.camera.far = 500; // 远端，超出则不展示
directionalLight.shadow.camera.top = 5;
directionalLight.shadow.camera.bottom = -5;
directionalLight.shadow.camera.left = -5;
directionalLight.shadow.camera.right = 5;
scene.add(directionalLight);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

gui
  .add(directionalLight.shadow.camera, "near")
  .min(0)
  .max(10)
  .step(0.1)
  .onChange(() => {
    directionalLight.shadow.camera.updateProjectionMatrix();
  });

document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
function render() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();