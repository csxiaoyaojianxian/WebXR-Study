/**
 * 材质的shader处理
 * 正确的光照处理：着色器中修改了顶点后要同步修改深度材质获得正确阴影
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerHeight / window.innerHeight, 1, 50);
camera.position.set(0, 0, 10);
scene.add(camera);
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
const envMapTexture = cubeTextureLoader.load([
  "textures/environmentMaps/0/px.jpg",
  "textures/environmentMaps/0/nx.jpg",
  "textures/environmentMaps/0/py.jpg",
  "textures/environmentMaps/0/ny.jpg",
  "textures/environmentMaps/0/pz.jpg",
  "textures/environmentMaps/0/nz.jpg",
]);
scene.environment = envMapTexture;
scene.background = envMapTexture;

const directionLight = new THREE.DirectionalLight('#ffffff',1);
directionLight.castShadow = true;
directionLight.position.set(0,0,200)
scene.add(directionLight)

// 加载模型纹理
const modelTexture = textureLoader.load('./models/LeePerrySmith/color.jpg');
// 加载模型的法向纹理
const normalTexture = textureLoader.load('./models/LeePerrySmith/normal.jpg')

const material = new THREE.MeshStandardMaterial({
  map: modelTexture,
  normalMap: normalTexture
})
const customUniforms = {
  uTime : {
    value:0
  }
}

// onBeforeCompile
material.onBeforeCompile = (shader)=>{
  console.log(shader.vertexShader);
  console.log(shader.fragmentShader);
  // 传递时间
  shader.uniforms.uTime = customUniforms.uTime;
  // 定义 rotate2d 等
  shader.vertexShader = shader.vertexShader.replace(
    '#include <common>',
    `
    #include <common>
    mat2 rotate2d(float _angle){
      return mat2(cos(_angle),-sin(_angle),
                  sin(_angle),cos(_angle));
    }
    uniform float uTime;
    `
  )
  // 处理法向，影响光影
  shader.vertexShader = shader.vertexShader.replace(
    '#include <beginnormal_vertex>',
    `
    #include <beginnormal_vertex>
    // float angle = PI;
    // 根据Y轴设置不同的旋转大小
    float angle = sin(position.y+uTime) *0.5;
    mat2 rotateMatrix = rotate2d(angle);
    objectNormal.xz = rotateMatrix * objectNormal.xz;
    `
  )
  // 处理变换，影响形变
  shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    `
    #include <begin_vertex>
    // float angle = transformed.y*0.5;
    // mat2 rotateMatrix = rotate2d(angle);
    
    transformed.xz = rotateMatrix * transformed.xz;
    `
  )
}

const depthMaterial = new THREE.MeshDepthMaterial({
  depthPacking:THREE.RGBADepthPacking
})
// 处理深度材质修正shader变形后的阴影异常问题
depthMaterial.onBeforeCompile = (shader)=>{
  shader.vertexShader = shader.vertexShader.replace(
    '#include <common>',
    `
    #include <common>
    mat2 rotate2d(float _angle){
      return mat2(cos(_angle),-sin(_angle),
                  sin(_angle),cos(_angle));
    }
    uniform float uTime;
    `
  );
  shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    `
    #include <begin_vertex>
    float angle = sin(position.y+uTime) *0.5;
    mat2 rotateMatrix = rotate2d(angle);
    
    transformed.xz = rotateMatrix * transformed.xz;
    `
  )
}

// 模型加载
const gltfLoader = new GLTFLoader();
gltfLoader.load('./models/LeePerrySmith/LeePerrySmith.glb',(gltf)=>{
  const mesh = gltf.scene.children[0];
  mesh.material = material;
  mesh.castShadow = true;
  // 设定自定义的深度材质
  mesh.customDepthMaterial = depthMaterial;
  scene.add(mesh);
})

const plane = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(20,20),
  new THREE.MeshStandardMaterial()
)
plane.position.set(0,0,-6);
plane.receiveShadow = true;
scene.add(plane)

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
});
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
const clock = new THREE.Clock()
function animate(t) {
  controls.update();
  const time = clock.getElapsedTime();
  // 传入shader时间
  customUniforms.uTime.value = time;
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
