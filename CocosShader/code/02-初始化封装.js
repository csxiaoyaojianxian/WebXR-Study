import initShaders from "./initShaders.js";
const gl = document.getElementById("webgl").getContext("webgl");
const vertexShader = `
void main() {
  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
  gl_PointSize = 10.0;
}
`;
const fragmentShader = `
void main() {
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`;
initShaders(gl, vertexShader, fragmentShader);
// 【可选】设置视口尺寸，将视口和画布尺寸同步
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); 
// 默认透明色，此处设置灰色为了方便观察
gl.clearColor(0.5, 0.5, 0.5, 1.0);
// 渲染管线每帧绘制内容前需要清除画布，否则会出现花屏
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.POINTS, 0, 1);
