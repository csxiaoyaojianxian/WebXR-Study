import initShaders from "./initShaders.js";
const gl = document.getElementById("webgl").getContext("webgl");
const vertexShader = `
attribute vec2 a_position;
uniform vec4 u_translate;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0) + u_translate; // 
}
`;
const fragmentShader = `
precision mediump float;
void main() {
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`;
initShaders(gl, vertexShader, fragmentShader);

let vertices = [ // x y
  -0.5, -0.5,
  0.5, -0.5,
  0.0, 0.5,
];
vertices = new Float32Array(vertices);
let FSIZE = vertices.BYTES_PER_ELEMENT;
let buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
let a_position = gl.getAttribLocation(gl.program, "a_position");
gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 2 * FSIZE, 0);
gl.enableVertexAttribArray(a_position);

// 绘制调用
function draw(gl) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);
}

let tx = 0, ty = 0;
let speed_x = 0.01, speed_y = 0.02;
function tick() {
  tx += speed_x;
  ty += speed_y;
  // 触底换向
  if (tx > 0.5 || tx < -0.5) speed_x *= -1;
  if (ty > 0.5 || ty < -0.5) speed_y *= -1;

  const u_translate = gl.getUniformLocation(gl.program, "u_translate");
  gl.uniform4f(u_translate, tx, ty, 0.0, 0.0);

  draw(gl);
  // 逐帧渲染
  requestAnimationFrame(tick);
}
tick();
