import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import gsap from "gsap";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import eventHub from "@/utils/eventHub";
import cameraModule from "../camera";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer";

export default class City {
  constructor(scene) {
    // 载入模型
    this.scene = scene;
    this.loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("./draco/");
    this.loader.setDRACOLoader(dracoLoader);
    this.loader.load("./model/floor2.glb", (gltf) => {
      console.log(gltf);
      scene.add(gltf.scene);
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.material.emissiveIntensity = 5;
        }

        if (child.type == "Object3D" && child.children.length == 0) {
          // console.log(child);
          this.createTag(child);
        }
      });
    });
  }

  createTag(object3d) {
    const element = document.createElement("div");
    element.className = "elementTag";
    element.innerHTML = `
      <div class="elementContent">
        <h3>${object3d.name}</h3>
        <p>温度：26°</p>
        <p>湿度：50%</p>
      </div>
    `;

    const objectCSS3D = new CSS3DObject(element);
    objectCSS3D.scale.set(0.2, 0.2, 0.2);
    objectCSS3D.position.copy(object3d.position);
    this.scene.add(objectCSS3D);
  }
}
