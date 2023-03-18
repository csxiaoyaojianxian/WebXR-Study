import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
// 初始化场景
const scene = new THREE.Scene();

// 导入hdr纹理
const hdrLoader = new RGBELoader();
hdrLoader.loadAsync("./textures/023.hdr").then((texture) => {
  scene.background = texture;
  scene.environment = texture;
  // 使用圆柱体映射，默认为 cube
  scene.environment.mapping = THREE.EquirectangularReflectionMapping;
});

// 添加平行光
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 100, 10);
scene.add(light);

export default scene;
