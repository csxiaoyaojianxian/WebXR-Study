import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import gsap from "gsap";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
camera.position.set(0, 0, 5);
scene.add(camera);

// 添加hdr环境纹理
const loader = new RGBELoader();
loader.load("./textures/Dosch-Space_0026_4k.hdr", function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
});

// 加载纹理
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load("./textures/cloth_pos.png");
const normalMap = textureLoader.load("./textures/cloth_norm.png");
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(0.2, 0.2);
normalMap.wrapS = THREE.RepeatWrapping;
normalMap.wrapT = THREE.RepeatWrapping;
normalMap.repeat.set(0.2, 0.2);
texture.offset.set(0, 0);

// 材质偏移动画，流动效果
gsap.to(texture.offset, {
  x: 1,
  y: 1,
  duration: 1,
  repeat: -1,
  onUpdate: function () {
    // console.log(texture.offset);
    texture.needsUpdate = true;
  },
});

// 加载压缩的glb模型
const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("./draco/gltf/");
dracoLoader.setDecoderConfig({ type: "js" });
dracoLoader.preload();
gltfLoader.setDRACOLoader(dracoLoader);
let mixer;
gltfLoader.load("./model/jianshen-min.glb", function (gltf) {
  console.log(gltf);
  scene.add(gltf.scene);
  gltf.scene.traverse(function (child) {
    if (child.isMesh) {
      // 重设材质
      child.material = new THREE.MeshStandardMaterial({
        map: texture,
        emissiveMap: texture,
        side: THREE.DoubleSide,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        normalMap: normalMap,
      });
    }
  });
  mixer = new THREE.AnimationMixer(gltf.scene);
  const action = mixer.clipAction(gltf.animations[0]);
  action.play();
  action.timeScale = 4; // 【动画加速】
  const light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(0, 100, -100);
  scene.add(light);
  const pointLight = new THREE.PointLight(0xffffff, 10);
  pointLight.position.set(0, 100, 100);
});

const geometry = new THREE.SphereGeometry(1, 32, 32);
const material1 = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  metalness: 0.5,
});
const sphere = new THREE.Mesh(geometry, material1);
sphere.position.set(-2, 0, 0);
scene.add(sphere);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.physicallyCorrectLights = true;
renderer.setClearColor(0xcccccc, 1);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
const clock = new THREE.Clock();
function render() {
  let time = clock.getDelta();
  if (mixer) {
    // console.log(mixer);
    mixer.update(time);
  }
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
});
