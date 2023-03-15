import * as THREE from "three";
// 初始化渲染器
const renderer = new THREE.WebGLRenderer({
  // 设置抗锯齿
  antialias: true,
  // depthbuffer
  logarithmicDepthBuffer: true, // 对数深度缓冲属性，避免草地、平面距离太近导致的闪烁
  physicallyCorrectLights: true, // 使用物理正确光照，影响性能，但效果好
});
// 设置渲染尺寸大小
renderer.setSize(window.innerWidth, window.innerHeight);
// 打开阴影计算
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5; // 调节渲染曝光程度(亮度) 更改色调映射曝光度

export default renderer;
