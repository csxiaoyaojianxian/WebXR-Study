/**
 * 创建曲线
 * 设置月球绕轨迹运动，而不是绕地球对象运动
 * 设置摄像机轨迹和朝向
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let camera, scene, renderer;

const clock = new THREE.Clock();
const textureLoader = new THREE.TextureLoader();

let moon;
let earth;
let curve;
init();
animate();

function init() {
  const EARTH_RADIUS = 1;
  const MOON_RADIUS = 0.27;
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 20, -20);
  scene = new THREE.Scene();
  const dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.position.set(0, 0, -1);
  scene.add(dirLight);
  const light = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(light);
  const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 16, 16);
  const earthMaterial = new THREE.MeshPhongMaterial({
    specular: 0x333333,
    shininess: 5,
    map: textureLoader.load("textures/planets/earth_atmos_2048.jpg"),
    specularMap: textureLoader.load("textures/planets/earth_specular_2048.jpg"),
    normalMap: textureLoader.load("textures/planets/earth_normal_2048.jpg"),
    normalScale: new THREE.Vector2(0.85, 0.85),
  });
  earth = new THREE.Mesh(earthGeometry, earthMaterial);
  scene.add(earth);
  const moonGeometry = new THREE.SphereGeometry(MOON_RADIUS, 16, 16);
  const moonMaterial = new THREE.MeshPhongMaterial({
    shininess: 5,
    map: textureLoader.load("textures/planets/moon_1024.jpg"),
  });
  moon = new THREE.Mesh(moonGeometry, moonMaterial);
  scene.add(moon);

  // 【1】根据点创建曲线对象
  curve = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(-10, 0, 10),
      new THREE.Vector3(-5, 5, 5),
      new THREE.Vector3(0, 0, 5),
      new THREE.Vector3(5, -5, 5),
      new THREE.Vector3(10, 0, 10),
    ],
    true
  );

  // 【2】在曲线里getPoints获取51个点，注意，参数是指分割段数，50段对应51个点
  const points = curve.getPoints(50);

  // 【3】创建曲线对象
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
  const curveObject = new THREE.Line(geometry, material);
  scene.add(curveObject);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 5;
  controls.maxDistance = 100;
  window.addEventListener("resize", onWindowResize);
}
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
function animate() {
  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();
  // [0, 1]   %1
  const time = elapsed/10 % 1;
  // 获取曲线上点位置，传入参数 [0, 1]
  const point = curve.getPoint(time);
  // 注意，position只读，不能直接赋值，需要使用copy方法
  moon.position.copy(point);

  // camera.position.copy(point);

  // 设置摄像机朝向
  camera.lookAt(earth.position);

  renderer.render(scene, camera);
}
