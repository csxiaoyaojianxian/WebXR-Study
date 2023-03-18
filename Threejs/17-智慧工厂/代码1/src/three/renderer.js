import * as THREE from "three";
import { CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer";
// 初始化渲染器
const renderer = new THREE.WebGLRenderer({
  // 设置抗锯齿
  antialias: true,
  // depthbuffer
  logarithmicDepthBuffer: true,
  physicallyCorrectLights: true,
});
// 设置渲染尺寸大小
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.8;

const css3drender = new CSS3DRenderer();
css3drender.setSize(window.innerWidth, window.innerHeight);
document.querySelector("#cssrender").appendChild(css3drender.domElement);

export default { renderer, css3drender };
