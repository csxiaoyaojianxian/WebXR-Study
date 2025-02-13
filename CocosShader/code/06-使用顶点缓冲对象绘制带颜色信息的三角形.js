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
let vertices = [
  -0.5, 0.0, 1.0, 0.0, 0.0, // node1
  0.5, 0.0, 0.0, 1.0, 0.0, // node2
  0.0, 0.8, 0.0, 0.0, 1.0, // node3
];
vertices = new Float32Array(vertices);
const FSIZE = vertices.BYTES_PER_ELEMENT;

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
const a_position = gl.getAttribLocation(gl.program, "a_position");
const a_color = gl.getAttribLocation(gl.program, "a_color");
gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false,
  5 * FSIZE, // stride 每个点的信息所占 BYTES，当前一个顶点的步长是 (2+3)*4=20
  0, // offset 起始索引 BYTES
);
gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 5 * FSIZE,
  2 * FSIZE, // offset 起始索引 BYTES，当前起始索引为 2*4=8
);
gl.enableVertexAttribArray(a_position);
gl.enableVertexAttribArray(a_color);
gl.drawArrays(gl.TRIANGLES, 0, 3);