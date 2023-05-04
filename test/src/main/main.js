/**
 * 模型加载
 * 模型动画播放
 * hdr环境纹理
 * 镜头拉近
 */
import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.5, 100000);
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
camera.position.set(1000, 1000, 1000);
scene.add(camera);

// 添加hdr环境纹理
const loader = new RGBELoader();
loader.load("./texture/env.hdr", function (texture) {
  // 环境反射贴图envMap的映射方式，这里用的是等量矩形投影映射方法
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
});

// 加载压缩的glb模型
const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("./draco/");
dracoLoader.setDecoderConfig({ type: "js" });
dracoLoader.preload();
gltfLoader.setDRACOLoader(dracoLoader);
let mixer;
let gltfModel = null;
gltfLoader.load("./model/ship4.glb", function (gltf) {
  console.log(gltf);
  gltfModel = gltf;
  scene.add(gltf.scene);
  // gltf.scenes[0].position = new Vector3(100, 100, 0);
  // gltf.scene.traverse(function (child) {
  //   if (child.name == "Body") {
  //     console.log(child);
  //   }
  //   // if (child.name == "Floor") {
  //   //   child.material = new THREE.MeshStandardMaterial({
  //   //     color: 0xffffff,
  //   //   });
  //   //   console.log(child);
  //   // }
  //   if (child.isMesh) {
  //     child.material.depthWrite = true;
  //     child.material.normalScale = new THREE.Vector2(1, 1);
  //     child.material.side = THREE.FrontSide;
  //     child.material.transparent = false;
  //     // 【重要】顶点着色器需要设为false
  //     child.material.vertexColors = false;
  //   }
  // });
  // 设置动画
  mixer = new THREE.AnimationMixer(gltf.scene);
  let action = mixer.clipAction(gltf.animations[0]);
  action.play();
  action = mixer.clipAction(gltf.animations[1]);
  action.play();

  const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 3);
  scene.add(hemisphereLight);

  // 添加平行光;
  const light = new THREE.DirectionalLight(0xffffff, 5);
  light.position.set(0, 100, 100);
  scene.add(light);

  // 添加点光源
  // const pointLight = new THREE.PointLight(0xffffff, 5);
  // pointLight.position.set(0, 100, 100);

});



// 创建一个金属球添加到场景中，观察颜色
const geometry = new THREE.SphereGeometry(1, 32, 32);
const material1 = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  metalness: 1,
  roughness: 1,
});
const sphere = new THREE.Mesh(geometry, material1);
sphere.position.set(-2, 2, 2);
scene.add(sphere);

// 创建投射光线对象
const raycaster = new THREE.Raycaster();
// 鼠标的位置对象 二维
const mouse = new THREE.Vector2();
// 监听鼠标的位置
window.addEventListener("click", (event) => {
  // [-1, 1]
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  // [-1, 1] 注意二维的Y和三维的Y方向不同，需要添加 - 号
  mouse.y = -((event.clientY / window.innerHeight) * 2 - 1);
  // 设置射线从相机投射
  raycaster.setFromCamera(mouse, camera);
  // 获取相交元素
  let result = raycaster.intersectObjects([sphere]);
  // result[0].object.material = redMaterial;
  result.forEach((item) => {
    console.log('click');
    // 镜头拉近
    const womenPosition = gltfModel.scene.position.clone();
    // 切换控制器中心
    gsap.to(controls.target, {
      x: womenPosition.x,
      y: womenPosition.y,
      z: womenPosition.z,
      duration: 0.5,
      onComplete: () => {
        // 切换摄像机位置
        gsap.to(camera.position, {
          x: womenPosition.x + 3,
          y: womenPosition.y + 3,
          z: womenPosition.z + 3,
          duration: 2,
        });
      },
    });
  });
});

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.physicallyCorrectLights = true;
renderer.setClearColor(0xcccccc, 1);

document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target = sphere.position.clone();

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
const clock = new THREE.Clock();
function render() {
  let time = clock.getDelta();
  if (mixer) {
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
