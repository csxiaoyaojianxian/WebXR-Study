import initShaders from "./initShaders.js";
const gl = document.getElementById("webgl").getContext("webgl");
const vertexShader = `
attribute vec2 a_position; // 从js接收顶点位置数据
uniform float u_size; // 从js接收顶点尺寸数据
varying vec2 v_ab; // 向片段着色器提供 vec2 两个数据

void main() {
    v_ab = a_position;
    gl_Position = vec4(a_position, 0.0, 1.0); // 顶点坐标需要接收vec4
    gl_PointSize = u_size;
}
`;
const fragmentShader = `
precision mediump float; // 精度设置
uniform vec3 u_color; // 从js接收片段颜色数据
varying vec2 v_ab; // 从顶点着色器接收 vec2 两个数据

void main() {
    gl_FragColor = vec4(u_color, 1.0);
    // gl_FragColor = vec4(v_ab, 0.0, 1.0);
}
`;
initShaders(gl, vertexShader, fragmentShader);

// 【1】attribute (js=>vertexShader)
const a_position = gl.getAttribLocation(gl.program, "a_position"); // 获取内存地址指针
gl.vertexAttrib2f(a_position, 0.5, 0.5);

// 【2】uniform (js=>vertexShader/fragmentShader)
const u_color = gl.getUniformLocation(gl.program, "u_color");
gl.uniform3f(u_color, 1.0, 0.0, 0.0);
const u_size = gl.getUniformLocation(gl.program, "u_size");
gl.uniform1f(u_size, 10.0);

// 【3】varying (vertexShader=>fragmentShader)

gl.clearColor(0.5, 0.5, 0.5, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.POINTS, 0, 1);
