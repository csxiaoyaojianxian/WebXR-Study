<template>
  <div id="UIContainer" style="display: flex; flex-direction: column; width: 100%; padding: 10px;">
    <div class="item">
      <span class="item-text">发色(材质)：</span>
      <t-color-picker v-model="color2" format="HEX" :color-modes="['monochrome']" :show-primary-color-preview="false"
        @change="onHairColor" />
    </div>
    <div class="item">
      <span class="item-text">左耳(骨骼)：</span>
      <t-slider v-model="leftear" :show-tooltip="true" :step="0.1" :min="0" :max="3" @change="onLeftEarChange" />
    </div>
    <div class="item">
      <span class="item-text">右耳(骨骼)：</span>
      <t-slider v-model="rightear" :show-tooltip="true" :step="0.1" :min="0" :max="3" @change="onRightEarChange" />
    </div>
    <div class="item">
      <span class="item-text">表情(形态键)：</span>
      <t-select v-model="value1" :options="options1" @change="onFaceChange" placeholder="默认"></t-select>
    </div>
  </div>
</template>


<script setup>
import { onMounted, ref } from 'vue'
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

defineProps({
  msg: String,
})

const leftear = ref(1.5);
const rightear = ref(1.5);
const value1 = ref('');
const color2 = ref('#A0BED5');
let options1 = ref([]);
let bone_left_ear = null;
let bone_right_ear = null;

/////////////////3D scene start/////////////////////////////////////
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(24, window.innerWidth / window.innerHeight, 0.1, 1000);

const controls = new OrbitControls(camera, renderer.domElement);
// 禁用缩放
controls.enableZoom = false;
// 禁用垂直旋转
controls.minPolarAngle = Math.PI / 2;
controls.maxPolarAngle = Math.PI / 2;

const loader = new GLTFLoader();

const clock = new THREE.Clock();

// 天空盒
const skyboxLoader = new THREE.CubeTextureLoader();

let charAni = function () { };
scene.background = skyboxLoader.load([
  './skybox/posx.jpg',
  './skybox/negx.jpg',
  './skybox/posy.jpg',
  './skybox/negy.jpg',
  './skybox/posz.jpg',
  './skybox/negz.jpg'
]);

loader.load('./ruskdemo/neko222.glb', function (gltf) {
  console.log('loadmodel', gltf);
  gltf.scene.animations = gltf.animations;
  // three.js - .gltf模型加载出来为黑色解决办法
  // https://blog.csdn.net/qq_34272760/article/details/120530944
  gltf.scene.traverse(function (child) {
    if (child.isMesh) {
      child.frustumCulled = false;
      // 阴影
      child.castShadow = true;
      // 自发光
      child.material.emissive = child.material.color;
      child.material.emissiveMap = child.material.map;
    }
    if (child.name == 'Body_1') {
      let optionValue = [];
      Object.keys(child.morphTargetDictionary).forEach(item => {
        optionValue.push({ label: item, value: child.morphTargetDictionary[item] });
      });
      options1.value = optionValue;
    }
    if (child instanceof THREE.Bone && child.name == 'rusk_ear_L') {
      bone_left_ear = child;
    }
    if (child instanceof THREE.Bone && child.name == 'rusk_ear_R') {
      bone_right_ear = child;
    }
  });
  scene.add(gltf.scene);
  window.mygltf = gltf;
  gltf.scene.position.y = -0.6;
  initCharAnimation(gltf);
}, undefined, function (error) {
  console.error(error);
});

//controls.update() must be called after any manual changes to the camera's transform
// , y: , z: 
// , _y: , _z: 
// , _y: , _z: , _w: 
camera.position.set(-0.08166475507374084, 0.10263183816145098, 3.316699952298128);
camera.rotation.set(-0.03093409135498338, -0.024605545422694945, -0.0007613160955268186);
camera.quaternion.set(-0.015460574926967993, -0.01230687691653529, -0.00019030855642054707, 0.9998047185256441);
window.camera = camera;
controls.update();

function initCharAnimation(mesh) {
  // Create an AnimationMixer, and get the list of AnimationClip instances
  const mixer = new THREE.AnimationMixer(mesh.scene);
  const clips = mesh.animations;

  // Update the mixer on each frame
  charAni = function update() {
    let deltaTime = clock.getDelta();
    mixer.update(deltaTime);
  }

  // Play a specific animation
  const clip = THREE.AnimationClip.findByName(clips, 'rusk_ArmatureAction.002');
  const action = mixer.clipAction(clip);
  action.play();

  // Play all animations
  // clips.forEach(function (clip) {
  //   mixer.clipAction(clip).play();
  // });
}

function animate() {
  requestAnimationFrame(animate);
  // required if controls.enableDamping or controls.autoRotate are set to true
  controls.update();
  charAni();
  renderer.render(scene, camera);
}

animate();
/////////////////3D scene end/////////////////////////////////////
onMounted(() => {
  console.log(window.mygltf);

});

const onHairColor = (hexColor) => {
  console.log(hexColor);
  window.mygltf && window.mygltf.scene.traverse(child => {
    if (child.name == 'hair' || child.name == 'nemomimi') {
      let newMaterial = new THREE.MeshBasicMaterial({
        color: hexColor, //可修改报警时的闪烁颜色
        transparent: true,
        opacity: 0.8, //可修改报警闪烁是的透明度
        wireframe: false,
        // depthWrite: false,
        side: THREE.DoubleSide,
      });
      child.material = newMaterial;
    }
  });
};

const onFaceChange = (val) => {
  console.log("val", val);
  window.mygltf && window.mygltf.scene.traverse(child => {
    if (child.name == 'Body_1') {
      Object.keys(child.morphTargetInfluences).forEach((item, index) => {
        if (item != 0) {
          child.morphTargetInfluences[index] = 0;
        }
      });
      child.morphTargetInfluences[val] = 1;
    }
  });
};

const onLeftEarChange = (val) => {
  console.log(bone_left_ear.rotation);
  if (!bone_left_ear) {
    alert('bone data loss: left ear');
    return;
  }
  bone_left_ear.rotation.x = val;
};

const onRightEarChange = (val) => {
  console.log(bone_right_ear.rotation);
  if (!bone_right_ear) {
    alert('bone data loss: right ear');
    return;
  }
  bone_right_ear.rotation.x = val;
};


// 测试用
const onTest = () => {
  window.mygltf && window.mygltf.scene.traverse(child => {
    console.log(child);
  });
};
</script>

<style scoped>
.item {
  margin-top: 1em;
}

.item-text {
  width: 10em;
}
</style>
