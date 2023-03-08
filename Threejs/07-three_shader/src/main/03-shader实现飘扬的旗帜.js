/**
 * shader实现飘扬的旗帜
 *
 * glsl: 顶点着色器vertex => 片元着色器fragment
 * 详情参见 /shader/raw/vertex.glsl
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";

// 顶点着色器
import basicVertexShader from "../shader/raw/vertex.glsl";
// 片元着色器
import basicFragmentShader from "../shader/raw/fragment.glsl";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerHeight / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 2);
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
scene.add(camera);

// 创建纹理加载器对象
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load("./texture/ca.jpeg");
const params = {
  uFrequency: 10,
  uScale: 0.1,
};

// 创建原始着色器材质
const rawShaderMaterial = new THREE.RawShaderMaterial({
  vertexShader: basicVertexShader,
  fragmentShader: basicFragmentShader,
  // 传入uniform变量
  uniforms: {
    // 时间，用于动画，在animate中更新
    uTime: {
      value: 0,
    },
    // 纹理
    uTexture: {
      value: texture,
    },
    // 波浪的频率
    uFrequency: {
      value: params.uFrequency,
    },
    // 波浪的幅度
    uScale: {
      value: params.uScale,
    },
  },
  // wireframe: true,
  side: THREE.DoubleSide,
});

// ShaderMaterial 和 RawShaderMaterial 的区别在于 ShaderMaterial 默认包含通用的 uniform, attribute等
//   如 position/uv/modelMatrix/viewMatrix/projectionMatrix 可以直接在 ShaderMaterial 中使用，无需定义
/*
const ShaderMaterial = new THREE.ShaderMaterial({
  vertexShader: basicVertexShader,
  fragmentShader: basicFragmentShader,
  uniforms: {
    uTime: {
      value: 0,
    },
    uTexture: {
      value: texture,
    },
    uFrequency: {
      value: params.uFrequency,
    },
    uScale: {
      value: params.uScale,
    },
    uColor: {
      value: new THREE.Color("purple"),
    },
  },
  // wireframe: true,
  side: THREE.DoubleSide,
});
*/

// 创建旗帜平面
const floor = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(1, 1, 64, 64),
  rawShaderMaterial,
);
scene.add(floor);

// 创建gui参数调节
const gui = new dat.GUI();
gui
  .add(params, "uFrequency")
  .min(0)
  .max(50)
  .step(0.1)
  .onChange((value) => {
    rawShaderMaterial.uniforms.uFrequency.value = value;
  });
gui
  .add(params, "uScale")
  .min(0)
  .max(1)
  .step(0.01)
  .onChange((value) => {
    rawShaderMaterial.uniforms.uScale.value = value;
  });

// 初始化渲染器
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
});
const clock = new THREE.Clock();
function animate(t) {
  const elapsedTime = clock.getElapsedTime();
  // 更新uniform时间
  rawShaderMaterial.uniforms.uTime.value = elapsedTime;
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
