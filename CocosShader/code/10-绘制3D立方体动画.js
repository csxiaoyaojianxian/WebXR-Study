import initShaders from './initShaders.js';
import { mat4 } from './gl_matrix/esm/index.js';
/**
 *    y
 *    ↑
 *    o → x
 *  ↙z
 *     v5----- v8
 *   /|      /|
 *  v1------v4|
 *  | |     | |
 *  | |v6---|-|v7
 *  |/      |/
 *  v2------v3
 */
const v1 = [-0.5, 0.5, 0.5];
const v2 = [-0.5, -0.5, 0.5];
const v3 = [0.5, -0.5, 0.5];
const v4 = [0.5, 0.5, 0.5];
const v5 = [-0.5, 0.5, -0.5];
const v6 = [-0.5, -0.5, -0.5];
const v7 = [0.5, -0.5, -0.5];
const v8 = [0.5, 0.5, -0.5];
const positions = [
  ...v1, ...v2, ...v3, ...v4, // 前面
  ...v5, ...v6, ...v7, ...v8, // 后面
  ...v5, ...v6, ...v2, ...v1, // 左面
  ...v4, ...v3, ...v7, ...v8, // 右面
  ...v5, ...v1, ...v4, ...v8, // 上面
  ...v6, ...v2, ...v3, ...v7, // 下面
];
const c1 = [1.0, 0.0, 0.0];
const c2 = [0.0, 1.0, 0.0];
const c3 = [0.0, 0.0, 1.0];
const c4 = [0.0, 1.0, 1.0];
const c5 = [1.0, 0.0, 1.0];
const c6 = [1.0, 1.0, 0.0];
const colors = [
  ...c1, ...c1, ...c1, ...c1, //前面
  ...c2, ...c2, ...c2, ...c2, //后面
  ...c3, ...c3, ...c3, ...c3, //左面  
  ...c4, ...c4, ...c4, ...c4,//右面
  ...c5, ...c5, ...c5, ...c5, //上面
  ...c6, ...c6, ...c6, ...c6, //下面
];

const vertexShader = /*glsl*/`
attribute vec3 a_position;
uniform mat4 u_rotateMatrix;
attribute vec3 a_color;
varying vec3 v_color;
void main() {
  v_color = a_color;
  gl_Position = u_rotateMatrix * vec4(a_position, 1.0);
}`;

const fragmentShader = /*glsl*/`
precision mediump float;
varying vec3 v_color;
void main() {
  gl_FragColor = vec4(v_color, 1.0);
}`;

const gl = document.getElementById('webgl').getContext('webgl');
initShaders(gl, vertexShader, fragmentShader);
initVertexBuffers(gl);
const rotateMatrix = mat4.create();
const u_rotateMatrix = gl.getUniformLocation(gl.program, 'u_rotateMatrix');

let time = Date.now();
let deg = 0;
function tick() {
  const newTime = Date.now();
  const deltaTime = newTime - time;
  time = newTime;
  deg += deltaTime / 50;
  mat4.fromRotation(rotateMatrix, deg / 180 * Math.PI, [1, 0.5, 0]);
  gl.uniformMatrix4fv(u_rotateMatrix, false, rotateMatrix);
  draw(gl);
  requestAnimationFrame(tick);
}
tick();

function initVertexBuffers(gl) {
  const FSIZE = positions.BYTES_PER_ELEMENT;
  const positionsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  const a_position = gl.getAttribLocation(gl.program, 'a_position');
  gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, FSIZE * 3, 0);
  gl.enableVertexAttribArray(a_position);
  const colorsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  const a_color = gl.getAttribLocation(gl.program, 'a_color');
  gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, FSIZE * 3, 0);
  gl.enableVertexAttribArray(a_color);
}
function draw(gl) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  for (let i = 0; i < 24; i += 4) {
    gl.drawArrays(gl.TRIANGLE_FAN, i, 4);
  }
}