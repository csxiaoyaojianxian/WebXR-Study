import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";
import deepVertexShader from "../shader/deep/vertex.glsl";
import deepFragmentShader from "../shader/deep/fragment.glsl";
const gui = new dat.GUI();
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
const texture = textureLoader.load("./texture/da.jpeg");
const params = {
  uFrequency: 10,
  uScale: 0.1,
};

// 创建着色器材质
const shaderMaterial = new THREE.ShaderMaterial({
  vertexShader: deepVertexShader,
  fragmentShader: deepFragmentShader,
  uniforms: {
    uColor: {
      value: new THREE.Color("purple"),
    },
    uFrequency: {
      value: params.uFrequency,
    },
    uScale: {
      value: params.uScale,
    },
    uTime: {
      value: 0,
    },
    uTexture: {
      value: texture,
    },
  },
  side: THREE.DoubleSide,
  transparent: true,
});

gui
  .add(params, "uFrequency")
  .min(0)
  .max(50)
  .step(0.1)
  .onChange((value) => {
    shaderMaterial.uniforms.uFrequency.value = value;
  });
gui
  .add(params, "uScale")
  .min(0)
  .max(1)
  .step(0.01)
  .onChange((value) => {
    shaderMaterial.uniforms.uScale.value = value;
  });

// 创建平面
const floor = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(1, 1, 64, 64),
  shaderMaterial
);
scene.add(floor);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
});
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
const clock = new THREE.Clock();
function animate(t) {
  const elapsedTime = clock.getElapsedTime();
  shaderMaterial.uniforms.uTime.value = elapsedTime;
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();