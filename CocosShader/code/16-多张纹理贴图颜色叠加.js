import initShaders from "./initShaders.js";
const gl = document.getElementById("webgl").getContext("webgl");
const vertexShader = `
attribute vec3 a_position;
attribute vec2 a_uv;
varying vec2 v_uv;
void main() {
    v_uv = a_uv;
    gl_Position = vec4(a_position, 1.0);
}`;
const fragmentShader = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_sampler1;
uniform sampler2D u_sampler2;
void main() {
    vec4 color1 = texture2D(u_sampler1, v_uv);
    vec4 color2 = texture2D(u_sampler2, v_uv);
    // 纹理色值相乘，黑色xRGB=黑色，白色xRGB=白色
    // gl_FragColor = color1 * color2;
    // 颜色叠加 PS混合模式-变量
    gl_FragColor = color1 * (vec4(1.0, 1.0, 1.0, 2.0) - color2);
}`;
initShaders(gl, vertexShader, fragmentShader);
initVertexBuffers(gl);
initTextures(gl);
function initTextures(gl) {
  const texture1 = gl.createTexture();
  const texture2 = gl.createTexture();
  const u_sampler1 = gl.getUniformLocation(gl.program, "u_sampler1");
  const u_sampler2 = gl.getUniformLocation(gl.program, "u_sampler2");

  const image1 = new Image();
  image1.src = "./imgs/logo.jpg";
  const image2 = new Image();
  image2.src = "./imgs/bg.jpg";

  let unit0 = false, unit1 = false;
  image1.onload = function () {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image1);
    gl.uniform1i(u_sampler1, 0); // 0单元
    unit0 = true;
    if (unit0 && unit1) draw(gl);
  };
  image2.onload = function () {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image2);
    gl.uniform1i(u_sampler2, 1); // 1单元
    unit1 = true;
    if (unit0 && unit1) draw(gl);
  };
}

function initVertexBuffers(gl) {
  const positions = new Float32Array([
    -0.5, -0.5, 0.0,
    0.5, -0.5, 0.0,
    0.5, 0.5, 0.0,
    -0.5, 0.5, 0.0,
  ]);
  const uvs = new Float32Array([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0]);
  const FSIZE = positions.BYTES_PER_ELEMENT; // Float32 Size = 4
  const positionsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  const a_position = gl.getAttribLocation(gl.program, "a_position");
  gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, FSIZE * 3, 0);
  gl.enableVertexAttribArray(a_position);
  const uvsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
  const a_uv = gl.getAttribLocation(gl.program, "a_uv");
  gl.vertexAttribPointer(a_uv, 2, gl.FLOAT, false, FSIZE * 2, 0);
  gl.enableVertexAttribArray(a_uv);
}

function draw(gl) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  gl.drawArrays(gl.POINTS, 0, 4);
}
