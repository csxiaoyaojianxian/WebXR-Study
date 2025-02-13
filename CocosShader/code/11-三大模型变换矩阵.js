import initShaders from "../WebGL教程代码/initShaders.js";
const gl = document.getElementById("webgl").getContext("webgl");
const vertexShader = `
attribute vec2 a_position;
uniform mat4 u_tMatrix;
uniform mat4 u_rMatrix;
uniform mat4 u_sMatrix;
void main() {
  // 变换矩阵 x 向量
  // OpenGL中的乘法顺序为从左向右: P * V * M平移 * M旋转 * M缩放 * 3DPoint
  // 实际执行顺序为从右向左: 3DPoint * M缩放 * M旋转 * M平移 * V * P
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
  let vertices = [
    -0.5, -0.5,
    0.5, -0.5,
    0.0, 0.5,
  ];
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

// 平移
const Tx = 0, Ty = 0, Tz = 0;
const translate_matrix = [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  Tx, Ty, Tz, 1, // 注意：js在写矩阵时，行列需要互换转置(AT)
];

// 旋转
const deg = 30;
const cos = Math.cos((deg / 180) * Math.PI), sin = Math.sin((deg / 180) * Math.PI);
const rotate_matrix = [
  cos, sin, 0, 0,
  -sin, cos, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
];

// 缩放
const Sx = 1, Sy = 1, Sz = 1;
const scale_matrix = [
  Sx, 0, 0, 0,
  0, Sy, 0, 0,
  0, 0, Sz, 0,
  0, 0, 0, 1,
];

// 传入变换矩阵
const u_tMatrix = gl.getUniformLocation(gl.program, "u_tMatrix");
gl.uniformMatrix4fv(u_tMatrix, false, new Float32Array(translate_matrix));
const u_rMatrix = gl.getUniformLocation(gl.program, "u_rMatrix");
gl.uniformMatrix4fv(u_rMatrix, false, new Float32Array(rotate_matrix)); // 传入旋转矩阵，旋转30度
const u_sMatrix = gl.getUniformLocation(gl.program, "u_sMatrix");
gl.uniformMatrix4fv(u_sMatrix, false, new Float32Array(scale_matrix));

draw(gl);
