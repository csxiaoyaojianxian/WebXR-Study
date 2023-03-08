/**
 * 光线投射 raycaster
 * 获取鼠标事件操作的元素
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 300);
camera.position.set(0, 0, 20);
scene.add(camera);

const cubeGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
// 初始cube材质
const material = new THREE.MeshBasicMaterial({
  wireframe: true,
});
// 选中cube材质
const redMaterial = new THREE.MeshBasicMaterial({
  color: "#ff0000",
});

// 1000立方体
let cubeArr = [];
for (let i = -5; i < 5; i++) {
  for (let j = -5; j < 5; j++) {
    for (let z = -5; z < 5; z++) {
      const cube = new THREE.Mesh(cubeGeometry, material);
      cube.position.set(i, j, z);
      scene.add(cube);
      cubeArr.push(cube);
    }
  }
}

// 创建投射光线对象
const raycaster = new THREE.Raycaster();

// 鼠标的位置对象 二维
const mouse = new THREE.Vector2();

// 监听鼠标的位置
window.addEventListener("mousemove", (event) => {
  // [-1, 1]
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  // [-1, 1] 注意二维的Y和三维的Y方向不同，需要添加 - 号
  mouse.y = -((event.clientY / window.innerHeight) * 2 - 1);
  // 设置射线从相机投射
  raycaster.setFromCamera(mouse, camera);
  // 获取相交元素
  let result = raycaster.intersectObjects(cubeArr);
  // result[0].object.material = redMaterial;
  result.forEach((item) => {
    item.object.material = redMaterial;
  });
});

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
function render() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();
