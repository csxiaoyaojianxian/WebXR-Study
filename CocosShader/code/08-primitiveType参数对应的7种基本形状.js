import initShaders from "./initShaders.js";
const gl = document.getElementById("webgl").getContext("webgl");
const vertexShader = `
attribute vec2 a_position;
attribute vec3 a_color;
varying vec3 v_color;
void main() {
  v_color = a_color;
  gl_Position = vec4(a_position, 0.0, 1.0);
  gl_PointSize = 10.0; // 在绘制点时需要指定点大小
}
`;
const fragmentShader = `
precision mediump float;
varying vec3 v_color;
void main() {
  gl_FragColor = vec4(v_color, 1.0);
}
`;
initShaders(gl, vertexShader, fragmentShader);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// x y r g b
let vertices = [
  -0.5, 0.0, 1.0, 0.0, 0.0, // 0
  0.5, 0.0, 0.0, 1.0, 0.0, // 1
  0.0, 0.8, 0.0, 0.0, 1.0, // 2
  0.0, -0.8, 0.0, 0.0, 1.0, // 3
];
vertices = new Float32Array(vertices);
const FSIZE = vertices.BYTES_PER_ELEMENT;
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
const a_position = gl.getAttribLocation(gl.program, "a_position");
const a_color = gl.getAttribLocation(gl.program, "a_color");
gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 5 * FSIZE, 0);
gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 5 * FSIZE, 2 * FSIZE);
gl.enableVertexAttribArray(a_position);
gl.enableVertexAttribArray(a_color);

// gl.drawArrays(primitiveType, offset, count)

/**
 * WebGL基本形状
 */
// gl.drawArrays(gl.POINTS, 0, 4); // 点(顶点着色器中需要设置gl_PointSize)
// gl.drawArrays(gl.LINES, 0, 4); // 线(两个点一组，多余的舍弃)
// gl.drawArrays(gl.LINE_STRIP, 0, 4); // 线(开口不闭环)
// gl.drawArrays(gl.LINE_LOOP, 0, 4); // 线(闭环)
// gl.drawArrays(gl.TRIANGLES, 0, 4); // 三角形(三个点一组)，此处最后一个点舍弃
// gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); // 循环连接 (012/123/234/...) 一个点最多被三个三角形共享，相比 gl.TRIANGLES 可以用更少的信息绘制同样的效果
gl.drawArrays(gl.TRIANGLE_FAN, 0, 4); // 扇面 (012/023/034/...) 第一个点会被所有三角形共用
