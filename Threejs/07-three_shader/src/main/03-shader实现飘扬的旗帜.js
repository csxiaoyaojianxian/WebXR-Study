/**
 * shader实现飘扬的旗帜
 *
 * glsl: 顶点着色器vertex => 片元着色器fragment
 * 二维uv是一个正方形，转四维对应 rgba
 * 四个角对应关系 (0,1,0,1)绿 (1,1,0,1)黄 (1,0,0,1)红 (0,0,0,1)黑
 */
import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// 顶点着色器
import basicVertexShader from "../shader/raw/vertex.glsl";
// 片元着色器
import basicFragmentShader from "../shader/raw/fragment.glsl";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(90, window.innerHeight / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 2);
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
scene.add(camera);
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// 创建纹理加载器对象
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load("./texture/ca.jpeg");
const params = {
  uFrequency: 10,
  uScale: 0.1,
};

// const material = new THREE.MeshBasicMaterial({ color: "#00ff00" });
// 创建原始着色器材质
const rawShaderMaterial = new THREE.RawShaderMaterial({
  vertexShader: basicVertexShader,
  fragmentShader: basicFragmentShader,
  //   wireframe: true,
  side: THREE.DoubleSide,
  uniforms: {
    uTime: {
      value: 0,
    },
    uTexture: {
      value: texture,
    },
  },
});

// 创建平面
const floor = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(1, 1, 64, 64),
  rawShaderMaterial
);

console.log(floor);
scene.add(floor);

// 初始化渲染器
const renderer = new THREE.WebGLRenderer({ alpha: true });
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.BasicShadowMap;
// renderer.shadowMap.type = THREE.VSMShadowMap;

// 设置渲染尺寸大小
renderer.setSize(window.innerWidth, window.innerHeight);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
});
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);

const clock = new THREE.Clock();
function animate(t) {
  const elapsedTime = clock.getElapsedTime();
  //   console.log(elapsedTime);
  rawShaderMaterial.uniforms.uTime.value = elapsedTime;
  requestAnimationFrame(animate);
  // 使用渲染器渲染相机看这个场景的内容渲染出来
  renderer.render(scene, camera);
}

animate();
