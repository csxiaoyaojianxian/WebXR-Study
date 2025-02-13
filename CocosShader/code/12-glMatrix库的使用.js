import initShaders from "./initShaders.js";
import { mat4, glMatrix } from "./gl_matrix/esm/index.js";

const gl = document.getElementById("webgl").getContext("webgl");
const vertexShader = `
attribute vec2 a_position;
uniform mat4 u_tMatrix;
uniform mat4 u_rMatrix;
uniform mat4 u_sMatrix;
void main() {
  gl_Position = u_tMatrix * u_rMatrix * u_sMatrix * vec4(a_position, 0.0, 1.0);
}`;
const fragmentShader = `
precision mediump float;
void main() {
  gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
}`;
initShaders(gl, vertexShader, fragmentShader);

initVertexBuffers(gl);
function initVertexBuffers(gl) {
  let vertices = [-0.5, -0.5, 0.5, -0.5, 0.0, 0.5];
  vertices = new Float32Array(vertices);
  const FSIZE = vertices.BYTES_PER_ELEMENT;
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  const a_position = gl.getAttribLocation(gl.program, "a_position");
  gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 2 * FSIZE, 0);
  gl.enableVertexAttribArray(a_position);
}

function draw(gl) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);
}

// glMatrix 的两种使用方式
/*
【1】直接修改原矩阵 matrix
mat4.fromTranslation(matrix, [Tx, Ty, Tz]);
mat4.fromRotation(matrix, deg, [X, Y, Z]);
mat4.fromScaling(matrix, [Sx, Sy, Sz]);

【2】传入原矩阵 matrix1 修改矩阵 matrix2
mat4.translate(matrix2, matrix1, [Tx, Ty, Tz]);
mat4.rotate(matrix2, matrix1, matrix, deg, [X, Y, Z]);
mat4.scale(matrix2, matrix1, [Sx, Sy, Sz]);
 */

// 创建单位矩阵
const translate_matrix = mat4.create();
const rotate_matrix = mat4.create();
const scale_matrix = mat4.create();

function tick() {
  // 平移
  /*
  mat4.fromTranslation(translate_matrix, [-0.01, 0.01, 0]);
   */
  mat4.translate(translate_matrix, translate_matrix, [-0.01, 0.01, 0]);
  const u_tMatrix = gl.getUniformLocation(gl.program, "u_tMatrix");
  gl.uniformMatrix4fv(u_tMatrix, false, new Float32Array(translate_matrix));

  // 旋转
  // glMatrix.toRadian 角度转弧度，10° => 10 / 180 * Math.PI
  /*
  mat4.fromRotation(rotate_matrix, glMatrix.toRadian(10), [0, 0, 1]);
  mat4.fromXRotation(rotate_matrix, glMatrix.toRadian(10));
  mat4.fromYRotation(rotate_matrix, glMatrix.toRadian(10));
  mat4.fromZRotation(rotate_matrix, glMatrix.toRadian(10));
   */
  mat4.rotate(rotate_matrix, rotate_matrix, glMatrix.toRadian(10), [0, 0, 1]);
  const u_rMatrix = gl.getUniformLocation(gl.program, "u_rMatrix");
  gl.uniformMatrix4fv(u_rMatrix, false, rotate_matrix);

  // 缩放
  /*
  mat4.fromScaling(scale_matrix, [0.01, 0.01, 1]);
   */
  mat4.scale(scale_matrix, scale_matrix, [0.9, 0.9, 1]);
  const u_sMatrix = gl.getUniformLocation(gl.program, "u_sMatrix");
  gl.uniformMatrix4fv(u_sMatrix, false, new Float32Array(scale_matrix));

  draw(gl);
  requestAnimationFrame(tick);
}
tick();
