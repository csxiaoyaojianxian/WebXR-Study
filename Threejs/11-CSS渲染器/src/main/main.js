/**
 * DOM 与 canvas 结合
 * CSS2DRenderer / CSS3DRenderer 渲染器
 * 当"中国"转到地球背面时不展示
 * 使用射线碰撞来检测标签显示隐藏
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";

// webgl-3D渲染器 css-2D渲染器
let camera, scene, renderer, labelRenderer;

const clock = new THREE.Clock();
const textureLoader = new THREE.TextureLoader();

let moon;
let chinaLabel;
// 实例化射线
const raycaster = new THREE.Raycaster();

init();
animate();

// 创建射线
function init() {
  // 地球半径
  const EARTH_RADIUS = 1;
  // 月球半径
  const MOON_RADIUS = 0.27;

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 5, -10);
  scene = new THREE.Scene();

  // 灯光
  const dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.position.set(0, 0, 1);
  scene.add(dirLight);
  const light = new THREE.AmbientLight(0xffffff, 0.5); // soft white light
  scene.add(light);

  // 地球
  const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 16, 16);
  const earthMaterial = new THREE.MeshPhongMaterial({
    specular: 0x333333,
    shininess: 5,
    map: textureLoader.load("textures/planets/earth_atmos_2048.jpg"),
    specularMap: textureLoader.load("textures/planets/earth_specular_2048.jpg"),
    normalMap: textureLoader.load("textures/planets/earth_normal_2048.jpg"),
    normalScale: new THREE.Vector2(0.85, 0.85),
  });
  const earth = new THREE.Mesh(earthGeometry, earthMaterial);
  scene.add(earth);

  // 月球
  const moonGeometry = new THREE.SphereGeometry(MOON_RADIUS, 16, 16);
  const moonMaterial = new THREE.MeshPhongMaterial({
    shininess: 5,
    map: textureLoader.load("textures/planets/moon_1024.jpg"),
  });
  moon = new THREE.Mesh(moonGeometry, moonMaterial);
  scene.add(moon);

  /**
   * 【css2D】地球添加提示标签 CSS2DObject
   * [-1, 1]
   */
  const earthDiv = document.createElement('div');
  earthDiv.className = "label";
  earthDiv.innerHTML = "地球";
  const earthLabel = new CSS2DObject(earthDiv);
  earthLabel.position.set(0,1,0);
  earth.add(earthLabel); // 注意追加位置

  /**
   * 【css2D】中国标签 CSS2DObject
   * [-1, 1]
   */
  const chinaDiv = document.createElement('div');
  chinaDiv.className = "label1";
  chinaDiv.innerHTML = "中国";
  chinaLabel = new CSS2DObject(chinaDiv);
  chinaLabel.position.set(-0.3,0.5,-0.9);
  earth.add(chinaLabel); // 注意追加位置

  /**
   * 【css2D】月球标签 CSS2DObject
   * [-1, 1]
   */
  const moonDiv = document.createElement('div');
  moonDiv.className = "label";
  moonDiv.innerHTML = "月球";
  const moonLabel = new CSS2DObject(moonDiv);
  moonLabel.position.set(0,0.3,0);
  moon.add(moonLabel); // 注意追加位置

  /**
   * 【重要】实例化css2d的渲染器
   * 注意：CSS2DRenderer 在前！
   */
  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(labelRenderer.domElement)
  labelRenderer.domElement.style.position = 'fixed';
  labelRenderer.domElement.style.top = '0px';
  labelRenderer.domElement.style.left = '0px';
  labelRenderer.domElement.style.zIndex = '10';

  // 常规webgl渲染器
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, labelRenderer.domElement);
  controls.minDistance = 5;
  controls.maxDistance = 100;
  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  // css2d渲染器更新
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
}



//帧处理
function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();
  moon.position.set(Math.sin(elapsed) * 5, 0, Math.cos(elapsed) * 5); // 月球运动

  // 注意：向量坐标用复制
  const chinaPosition = chinaLabel.position.clone();
  
  /**
   * 【重要】将向量(坐标)从世界空间投影到相机的标准化设备坐标 (NDC) 空间
   * 因为此时的 chinaPosition 是 [-1, 1] 的标准值
   */
  chinaPosition.project(camera); // 坐标转换 [-1, 1]
  // 使用一个新的原点和方向来更新射线，设置射线从相机投射（鼠标[-1,1]、相机）
  raycaster.setFromCamera(chinaPosition,camera);

  // 射线碰撞检测
  const intersects = raycaster.intersectObjects(scene.children, true)
  
  // 如果没有碰撞到任何物体，让中国标签显示
  if(intersects.length == 0){ // 无遮挡
    chinaLabel.element.classList.add('visible');
  }else{
    // 计算出标签跟摄像机的距离
    const labelDistance = chinaPosition.distanceTo(camera.position);
    const minDistance = intersects[0].distance; // 遮挡物距离
    if(minDistance<labelDistance){
      chinaLabel.element.classList.remove('visible');
    }else{
      chinaLabel.element.classList.add('visible');
    }
    
  }
  
  renderer.render(scene, camera);
  // 标签渲染器更新渲染
  labelRenderer.render(scene,camera);
}
