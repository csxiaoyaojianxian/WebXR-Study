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
uniform sampler2D u_sampler;
void main() {
  // 纹理采样
  vec4 color = texture2D(u_sampler, v_uv);
  // 着色
  gl_FragColor = color;
}`;

initShaders(gl, vertexShader, fragmentShader);
initVertexBuffers(gl);
initTextures(gl);

function initTextures(gl) {
  const texture = gl.createTexture();
  const u_sampler = gl.getUniformLocation(gl.program, "u_sampler");
  const image = new Image();
  image.crossOrigin = ''; // 处理跨域
  image.src = "./imgs/logo.jpg"; // 注意图片尺寸为512倍数
  // 异步加载完成回调
  image.onload = function () {
    // 翻转图片Y轴，默认不翻转，即采样原点为左上角(0,0)，启用翻转Y后原点为左下角(0,0)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    // 激活贴图，放置0号纹理单元上(通用设备支持最少支持8个单元，现代中高端设备支持会更多) gl.TEXTURE0～8
    gl.activeTexture(gl.TEXTURE0);
    // 绑定贴图(贴图类型)
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // 设置贴图参数 gl.texParameteri(贴图类型，参数名，参数值)
    // 【1】设置纹理过滤方式
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); // 大图贴小形状，临近过滤
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); // 小图贴大形状，线性过滤
    // 【2】设置ST方向的纹理的环绕方式 gl.REPEAT / gl.MIRRORED_REPEAT / gl.CLAMP_TO_EDGE
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // gl.texImage2D(target, level, internalformat, format, type, HTMLImageElement? pixels);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_sampler, 0); // 0单元
    draw(gl);
  };
}

function initVertexBuffers(gl) {
  // shader目标位置，此案例为右上角
  const positions = new Float32Array([
    -0.5, -0.5, 0.0,
    1, -0.5, 0.0,
    1, 1, 0.0,
    -0.5, 1, 0.0,
  ]);

  // 图片采样位置，默认原点为左上角(0,0)，启用翻转Y后为左下角(0,0)，此案例采样左下角
  const uvs = new Float32Array([
    0.0, 0.0,
    0.5, 0.0,
    0.5, 0.5,
    0.0, 0.5,
  ]);
  // 纹理采样超出 0~1
  /*
  const uvs = new Float32Array([
    -1.5, -1.5,
    1.0, -1.5,
    1.0, 1.0,
    -1.5, 1.0,
  ]);
  */
  const FSIZE = positions.BYTES_PER_ELEMENT; // Float32 Size = 4
  const positionsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  const a_position = gl.getAttribLocation(gl.program, "a_position");
  gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, FSIZE * 3, 0);
  gl.enableVertexAttribArray(a_position);
  // 第二个 buffer 用于存储uv，也可以合并到同一个顶点缓冲
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
