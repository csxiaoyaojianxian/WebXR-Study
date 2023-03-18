/**
 * three编译前修改shader着色器
 * 通过替换方式修改PBR材质
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(90, window.innerHeight / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 10);
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
scene.add(camera);
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// MeshBasicMaterial
let basicMaterial = new THREE.MeshBasicMaterial({
  color: "#00ff00",
  side: THREE.DoubleSide,
});
const basicUnifrom = {
  uTime:{
    value:0
  }
}
// 编译前处理，增加运动效果
basicMaterial.onBeforeCompile = (shader, renderer)=>{
  console.log(shader.vertexShader)
  console.log(shader.fragmentShader)
  
  shader.uniforms.uTime = basicUnifrom.uTime;
  shader.vertexShader = shader.vertexShader.replace(
    '#include <common>',
    `
    #include <common>
    uniform float uTime;
    `
  )
  shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    `
    #include <begin_vertex>
    transformed.x += sin(uTime)* 2.0;
    transformed.z += cos(uTime)* 2.0;
    `
  )
}

const floor = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(1, 1, 64, 64),
  // 使用basicMaterial
  basicMaterial
);
scene.add(floor);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);
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

  // 传入shader时间用于动画
  basicUnifrom.uTime.value = elapsedTime;

  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
