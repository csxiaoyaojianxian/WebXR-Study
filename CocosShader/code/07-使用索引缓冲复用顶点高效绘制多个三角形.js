import initShaders from "./initShaders.js";
const gl = document.getElementById("webgl").getContext("webgl");
const vertexShader = `
attribute vec2 a_position;
attribute vec3 a_color;
varying vec3 v_color; // 颜色传递
void main() {
  v_color = a_color;
  gl_Position = vec4(a_position, 0.0, 1.0);
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
const vertices = [
  -0.5, 0.0, 1.0, 0.0, 0.0, // 0
  0.5, 0.0, 0.0, 1.0, 0.0, // 1
  0.0, 0.8, 0.0, 0.0, 1.0, // 2
  0.0, -0.8, 0.0, 0.0, 1.0, // 3
];
const FSIZE = 4; // float占4个Byte
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
const a_position = gl.getAttribLocation(gl.program, "a_position");
const a_color = gl.getAttribLocation(gl.program, "a_color");
gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 5 * FSIZE, 0);
gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 5 * FSIZE, 2 * FSIZE);
gl.enableVertexAttribArray(a_position);
gl.enableVertexAttribArray(a_color);

// 两个三角形的顶点索引顺序
const indices = [
  0, 1, 2, // 三角形1
  1, 0, 3  // 三角形2
];
const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
// 合理分配内存：因为索引不会有小数点，所以取用无符号16位整型
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

// gl.drawArrays(gl.TRIANGLES, 0, 6); // 改为 gl.drawElements
/**
 * @function gl.drawElements(primitiveType, count, indexType, offset)
 * @param primitiveType 同gl.drawArrays
 * @param indexType 指定元素数组缓冲区中的值类型，gl.UNSIGNED_BYTE / gl.UNSIGNED_SHORT / 扩展类型
 *        gl.UNSIGNED_BYTE 最大索引值为 255 而 gl.UNSIGNED_SHORT 最大索引值为 65535
 */
gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);