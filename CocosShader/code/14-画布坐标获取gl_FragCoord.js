import initShaders from "../WebGL教程代码/initShaders.js";
const gl = document.getElementById("webgl").getContext("webgl");
const vertexShader = `
attribute vec3 a_position;
void main() {
  gl_Position = vec4(a_position, 1.0);
}`;
const fragmentShader = `
precision mediump float;
uniform float u_w;
uniform float u_h;

// gl_FragCoord: canvas画布的坐标
void main() {
  gl_FragColor = vec4(gl_FragCoord.x / u_w, gl_FragCoord.y / u_h, 0.0, 1.0);
}`;
initShaders(gl, vertexShader, fragmentShader);

const canvas_w = 400, canvas_h = 400;
const u_w = gl.getUniformLocation(gl.program, "u_w");
const u_h = gl.getUniformLocation(gl.program, "u_h");
gl.uniform1f(u_w, canvas_w);
gl.uniform1f(u_h, canvas_h);
let vertices = new Float32Array([
    -1.0, 1.0,
    -1.0, -1.0,
    1.0, -1.0,
    1.0, 1.0
]);
let buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
let a_position = gl.getAttribLocation(gl.program, "a_position");
gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(a_position);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
