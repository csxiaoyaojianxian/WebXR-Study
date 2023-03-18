/**
 * 效果合成器的使用
 * 后期处理，支持多效果合成
 * 
 * 使用shader处理效果合成器：静态rgb、法向、动态水波纹
 */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

// 导入后期效果合成器
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';

// three框架本身自带效果，更多效果官网查看，参考 postprocessing 下的 pass
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import {DotScreenPass} from 'three/examples/jsm/postprocessing/DotScreenPass';
import {SMAAPass} from 'three/examples/jsm/postprocessing/SMAAPass'
import {SSAARenderPass} from 'three/examples/jsm/postprocessing/SSAARenderPass'
import {GlitchPass} from 'three/examples/jsm/postprocessing/GlitchPass'
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerHeight / window.innerHeight, 1, 50);
camera.position.set(0, 0, 3);
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
scene.add(camera);
const cubeTextureLoader = new THREE.CubeTextureLoader();
const envMapTexture = cubeTextureLoader.load([
  "textures/environmentMaps/0/px.jpg",
  "textures/environmentMaps/0/nx.jpg",
  "textures/environmentMaps/0/py.jpg",
  "textures/environmentMaps/0/ny.jpg",
  "textures/environmentMaps/0/pz.jpg",
  "textures/environmentMaps/0/nz.jpg",
]);
scene.background  = envMapTexture;
scene.environment = envMapTexture;
const directionLight = new THREE.DirectionalLight('#ffffff',1);
directionLight.castShadow = true;
directionLight.position.set(0,0,200)
scene.add(directionLight)

const gltfLoader = new GLTFLoader();
gltfLoader.load('./models/DamagedHelmet/glTF/DamagedHelmet.gltf',(gltf)=>{
  const mesh = gltf.scene.children[0];
  scene.add(mesh)
});

// 【1】初始化渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

// 【2】创建效果合成器
const effectComposer = new EffectComposer(renderer);
effectComposer.setSize(window.innerWidth, window.innerHeight);

// 【3】添加渲染通道 renderPass
const renderPass = new RenderPass(scene, camera);
effectComposer.addPass(renderPass)

// 【4】添加效果

// 点效果
const dotScreenPass = new DotScreenPass();
dotScreenPass.enabled = false; // 禁用
effectComposer.addPass(dotScreenPass);

// 抗锯齿效果
const smaaPass = new SMAAPass();
effectComposer.addPass(smaaPass);

// 生化危机闪烁效果
const glitchPass = new GlitchPass();
effectComposer.addPass(glitchPass)

// 发光效果
const unrealBloomPass = new UnrealBloomPass();
effectComposer.addPass(unrealBloomPass);
// 设置参数，后面使用gui控制
unrealBloomPass.exposure = 1;
unrealBloomPass.strength = 1;
unrealBloomPass.radius = 0;
unrealBloomPass.threshold = 1;

// 【webgl色调运算】
renderer.toneMapping = THREE.ACESFilmicToneMapping; // 电影色调运算
renderer.toneMappingExposure = 1;

// 【5】控制合成效果参数
const gui = new dat.GUI();
gui.add(renderer,'toneMappingExposure').min(0).max(2).step(0.01)
gui.add(unrealBloomPass,'strength').min(0).max(2).step(0.01)
gui.add(unrealBloomPass,'radius').min(0).max(2).step(0.01)
gui.add(unrealBloomPass,'threshold').min(0).max(2).step(0.01)

// 【6】着色器写渲染通道
// shader1: rgb调整
const colorParams = { r:0, g:0, b:0 };
const shaderPass = new ShaderPass(
  {
    uniforms:{
      // 必设，将整个屏幕作为uv传递
      tDiffuse: {
        value: null,
      },
      uColor: {
        value: new THREE.Color(colorParams.r, colorParams.g, colorParams.b),
      },
    },
    vertexShader:`
      varying vec2 vUv;
      void main(){
        vUv = uv;
        gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);
      }
    `,
    fragmentShader:`
      varying vec2 vUv;
      uniform sampler2D tDiffuse;
      uniform vec3 uColor;
      void main(){
        vec4 color = texture2D(tDiffuse,vUv);
        // gl_FragColor = vec4(vUv,0.0,1.0); // uv rgb色
        color.xyz += uColor;
        gl_FragColor = color;
      }
    `,
  },
)
effectComposer.addPass(shaderPass);

gui.add(colorParams,'r').min(-1).max(1).step(0.01).onChange((value)=>{
  shaderPass.uniforms.uColor.value.r = value;
});
gui.add(colorParams,'g').min(-1).max(1).step(0.01).onChange((value)=>{
  shaderPass.uniforms.uColor.value.g = value;
});
gui.add(colorParams,'b').min(-1).max(1).step(0.01).onChange((value)=>{
  shaderPass.uniforms.uColor.value.b = value;
});

// shader2: 动态shader，钢铁侠头盔视角 + 水波纹
const techPass = new ShaderPass({
  uniforms:{
    // 必设，将整个屏幕作为uv传递
    tDiffuse:{
      value:null
    },
    // 法向贴图
    uNormalMap:{
      value:null
    },
    uTime:{
      value:0
    }
  },
  vertexShader:`
    varying vec2 vUv;
    void main(){
      vUv = uv;
      gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);
    }
  `,
  fragmentShader:`
    varying vec2 vUv;
    uniform sampler2D tDiffuse;
    uniform sampler2D uNormalMap;
    uniform float uTime;
    void main(){
      vec2 newUv = vUv;

      // 设置动画，水波纹效果
      newUv += sin(newUv.x*10.0+uTime*0.5)*0.03;

      // 当前场景
      vec4 color = texture2D(tDiffuse, newUv);
      
      // 法向用于控制光
      vec4 normalColor = texture2D(uNormalMap, vUv);
      // 设置光线的角度，使用 normalize 转换 vec3 为单位向量
      vec3 lightDirection = normalize(vec3(-5,5,2));
      // 点积，使用 clamp 限制在 [0, 1]
      float lightness = clamp(dot(normalColor.xyz, lightDirection), 0.0 , 1.0) ;

      color.xyz += lightness;
      gl_FragColor = color;
    }
  `
});
// 传入法向贴图材质
const textureLoader = new THREE.TextureLoader();
const normalTexture = textureLoader.load('./textures/interfaceNormalMap.png');
techPass.material.uniforms.uNormalMap.value = normalTexture;
effectComposer.addPass(techPass);


window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  // 更新合成效果渲染器 size 和 ratio
  effectComposer.setSize(window.innerWidth, window.innerHeight);
  effectComposer.setPixelRatio(window.devicePixelRatio);
});

document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
const clock = new THREE.Clock();
function animate(t) {
  controls.update();
  requestAnimationFrame(animate);

  const time = clock.getElapsedTime();
  // 更新shader中的time，用于水波纹动画
  techPass.material.uniforms.uTime.value = time;
  // 不再使用webgl渲染器，使用合成效果渲染器
  // renderer.render(scene, camera);
  effectComposer.render()
}
animate();
