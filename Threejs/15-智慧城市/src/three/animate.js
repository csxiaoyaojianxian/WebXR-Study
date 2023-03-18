import * as THREE from "three";
import camera from "./camera";
import renderer from "./renderer";
import controls from "./controls";
import scene from "./scene";

const clock = new THREE.Clock();
function animate(t) {
  controls.update();
  const time = clock.getElapsedTime();
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

export default animate;
