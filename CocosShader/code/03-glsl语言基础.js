import initShaders from "./initShaders.js";
const gl = document.getElementById("webgl").getContext("webgl");
const vertexShader = /*glsl*/`
attribute vec3 a_position;
void main() {
  float deg = radians(45.0); // 内置函数radians
  mat4 rotateMatrix = mat4(
    cos(deg), sin(deg), 0.0, 0.0, // 内置函数sin/cos
    -sin(deg), cos(deg), 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
  );
  gl_Position = rotateMatrix * vec4(a_position, 1.0);
}`;

const fragmentShader = /*glsl*/ `
precision mediump float;
// glsl函数，计算两个点的距离
float getDiatance(vec2 p1, vec2 p2) {
  return pow(pow(p1.x - p2.x, 2.0) + pow(p1.y - p2.y, 2.0), 0.5);
}
void main() {
  float x = (gl_FragCoord.x / 400.0 - 0.5) * 2.0;
  float y = (gl_FragCoord.y / 400.0 - 0.5) * 2.0;
  vec3 color1 = vec3(1.0, 1.0, 1.0);
  vec3 color2 = vec3(0.0, 0.0, 1.0);
  float dis = distance(vec2(x, y), vec2(0.0, 0.0));
  /* 循环 */
  for (int i = 0; i < 10; i++) {
    //
  }
  /* 条件判断 */
  if (dis > 0.4) {
    gl_FragColor = vec4(color1 - color2, 1.0);
  } else {
    gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
  }
}`;

initShaders(gl, vertexShader, fragmentShader);
initVertexBuffers(gl);
draw(gl);

function initVertexBuffers(gl) {
  const positions = new Float32Array([
    -0.5, -0.5, 0.0,
    0.5, -0.5, 0.0,
    0.5, 0.5, 0.0,
    -0.5, 0.5, 0.0,
  ]);
  const FSIZE = positions.BYTES_PER_ELEMENT;
  const positionsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  const a_position = gl.getAttribLocation(gl.program, "a_position");
  gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, FSIZE * 3, 0);
  gl.enableVertexAttribArray(a_position);
}
function draw(gl) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  gl.drawArrays(gl.POINTS, 0, 4);
}
