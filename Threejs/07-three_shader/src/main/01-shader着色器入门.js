/**
 * shader着色器入门

ShaderMaterial着色器材质是一个使用GLSL编写的小程序，在GPU上运行，能提供materials之外的效果，也可以将许多对象组合成单个Geometry或BufferGeometry以提高性能

每个着色器可以指定两种不同类型的shaders，顶点着色器和片元着色器(Vertex shaders and fragment shaders)
• 顶点着色器首先运行，接收attributes，计算/操纵每个单独顶点的位置，并将其他数据 (varyings) 传递给片元着色器
• 片元(像素)着色器后运行，它设置渲染到屏幕的每个单独的"片元"(像素)的颜色

shader中有三种类型的变量：uniforms, attributes 和 varyings
• uniforms 是所有顶点都具有相同的值的变量，比如灯光、雾、和阴影贴图就是被储存在uniforms中的数据，可以通过顶点着色器和片元着色器来访问
• attributes 是与每个顶点关联的变量，如顶点位置、法线和顶点颜色都是存储在attributes中的数据，只可以在顶点着色器中访问
• varyings 是从顶点着色器传递到片元着色器的变量，对于每一个片元，每一个 varying 的值将是相邻顶点值的平滑插值
注意：在 shader 内部，uniforms 和 attributes 就像常量，只能使用 JavaScript 代码通过缓冲区来修改它们的值

*/
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(90, window.innerHeight / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 2);
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
scene.add(camera);
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// const material = new THREE.MeshBasicMaterial({ color: "#00ff00" });
// 创建着色器材质
const shaderMaterial = new THREE.ShaderMaterial({
  // 顶点着色器：顶点三维坐标转四维 -> 模型矩阵转换(位移旋转缩放) -> 视图矩阵转换 -> 投影矩阵转换(转设备二维)
  vertexShader: `
        void main(){
            gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 ) ;
        }
    `,
  // 片元着色器
  fragmentShader: `
        void main(){
            gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
        }
  `,
});

// 创建平面
const floor = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(1, 1, 64, 64),
  shaderMaterial // 着色器
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
function animate(t) {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
