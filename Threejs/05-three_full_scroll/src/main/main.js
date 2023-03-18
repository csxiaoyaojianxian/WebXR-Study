/**
 * 3D翻屏效果
 */
import * as THREE from "three";
import gsap from "gsap";
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 300);
camera.position.set(0, 0, 18);
scene.add(camera);

// 页面1: 创建1000个立方体，参考前面raycaster
const cubeGeometry = new THREE.BoxBufferGeometry(2, 2, 2);
const material = new THREE.MeshBasicMaterial({
  wireframe: true,
});
const redMaterial = new THREE.MeshBasicMaterial({
  color: "#ff0000",
});
let cubeArr = [];
// 【重要】组，方便后续操作旋转等
let cubeGroup = new THREE.Group();
for (let i = 0; i < 5; i++) {
  for (let j = 0; j < 5; j++) {
    for (let z = 0; z < 5; z++) {
      const cube = new THREE.Mesh(cubeGeometry, material);
      cube.position.set(i * 2 - 4, j * 2 - 4, z * 2 - 4);
      cubeGroup.add(cube);
      cubeArr.push(cube);
    }
  }
}
// 添加组
scene.add(cubeGroup);

const raycaster = new THREE.Raycaster();
// 创建鼠标二维坐标，后面render中也会使用
const mouse = new THREE.Vector2();
window.addEventListener("click", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -((event.clientY / window.innerHeight) * 2 - 1);
  raycaster.setFromCamera(mouse, camera);
  let result = raycaster.intersectObjects(cubeArr);
  result.forEach((item) => {
    item.object.material = redMaterial;
  });
});

// 页面2: 创建三角形酷炫物体，参考前面 mesh->02-批量创建几何体
var triangleGroup = new THREE.Group();
for (let i = 0; i < 50; i++) {
  const geometry = new THREE.BufferGeometry();
  const positionArray = new Float32Array(9);
  for (let j = 0; j < 9; j++) {
    positionArray[j] = Math.random() * 10 - 5;
  }
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positionArray, 3)
  );
  let color = new THREE.Color(Math.random(), Math.random(), Math.random());
  const material = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
  });
  let triangleMesh = new THREE.Mesh(geometry, material);
  triangleGroup.add(triangleMesh);
}
triangleGroup.position.set(0, -30, 0); // 一页30
scene.add(triangleGroup);

// 页面3: 弹跳小球，参考前面 mesh->15-点光源
const sphereGroup = new THREE.Group();
const sphereGeometry = new THREE.SphereBufferGeometry(1, 20, 20);
const spherematerial = new THREE.MeshStandardMaterial({
  side: THREE.DoubleSide,
});
const sphere = new THREE.Mesh(sphereGeometry, spherematerial);
sphere.castShadow = true;
sphereGroup.add(sphere);
const planeGeometry = new THREE.PlaneBufferGeometry(20, 20);
const plane = new THREE.Mesh(planeGeometry, spherematerial);
plane.position.set(0, -1, 0);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
sphereGroup.add(plane);
// 环境光
const light = new THREE.AmbientLight(0xffffff, 0.5); // soft white light
sphereGroup.add(light);
const smallBall = new THREE.Mesh(
  new THREE.SphereBufferGeometry(0.1, 20, 20),
  new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
smallBall.position.set(2, 2, 2);
// 直线光源
const pointLight = new THREE.PointLight(0xff0000, 3);
pointLight.position.set(2, 2, 2);
pointLight.castShadow = true;
pointLight.shadow.radius = 20;
pointLight.shadow.mapSize.set(512, 512);
smallBall.add(pointLight);
sphereGroup.add(smallBall);
sphereGroup.position.set(0, -60, 0); // 一页30
scene.add(sphereGroup);


let arrGroup = [cubeGroup, triangleGroup, sphereGroup];

// 循环动画
gsap.to(cubeGroup.rotation, {
  x: "+=" + Math.PI * 2,
  y: "+=" + Math.PI * 2,
  duration: 10,
  ease: "power2.inOut",
  repeat: -1,
});
gsap.to(triangleGroup.rotation, {
  x: "-=" + Math.PI * 2,
  z: "+=" + Math.PI * 2,
  duration: 12,
  ease: "power2.inOut",
  repeat: -1,
});
gsap.to(smallBall.position, {
  x: -3,
  duration: 6,
  ease: "power2.inOut",
  repeat: -1,
  yoyo: true,
});
gsap.to(smallBall.position, {
  y: 0,
  duration: 0.5,
  ease: "power2.inOut",
  repeat: -1,
  yoyo: true,
});

// 设置当前页
let currentPage = 0;
// 监听滚动事件
window.addEventListener("scroll", () => {
  // 当前页计算
  const newPage = Math.round(window.scrollY / window.innerHeight);
  if (newPage != currentPage) {
    currentPage = newPage;
    console.log("改变页面，当前是:" + currentPage);
    gsap.to(arrGroup[currentPage].rotation, {
      z: "+=" + Math.PI * 2,
      x: "+=" + Math.PI * 2,
      duration: 2,
      onComplete: () => {
        console.log("旋转完成");
      },
    });
    // gsap操作css，文本进入旋转
    gsap.fromTo(
      `.page${currentPage} h1`,
      { x: -360, rotate: 0 },
      { x: 0, rotate: "+=360", duration: 1 }
    );
  }
});


const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const clock = new THREE.Clock();

function render() {
  let deltaTime = clock.getDelta();

  // 以下设置与滚动监听处冲突
  /*
  let time = clock.getElapsedTime();

  cubeGroup.rotation.x = time * 0.5;
  cubeGroup.rotation.y = time * 0.5;

  triangleGroup.rotation.x = time * 0.4;
  triangleGroup.rotation.z = time * 0.3;

  smallBall.position.x = Math.sin(time) * 3;
  smallBall.position.z = Math.cos(time) * 3;
  smallBall.position.y = 2 + Math.sin(time * 10) / 2;
  sphereGroup.rotation.z = Math.sin(time) * 0.05;
  sphereGroup.rotation.x = Math.sin(time) * 0.05;
  */

  // 【重要】移动canvas视角，根据当前滚动的scroll-y，设置相机移动的位置，一页30
  camera.position.y = -(window.scrollY / window.innerHeight) * 30;
  // 【重要】左右晃动
  camera.position.x += (mouse.x * 10 - camera.position.x) * deltaTime * 5;

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

window.addEventListener("mousemove", (event) => {
  // [-0.5, 0.5]
  mouse.x = event.clientX / window.innerWidth - 0.5;
});