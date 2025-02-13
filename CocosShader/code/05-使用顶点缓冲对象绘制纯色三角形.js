import initShaders from "./initShaders.js";
const gl = document.getElementById("webgl").getContext("webgl");
const vertexShader = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;
const fragmentShader = `
precision mediump float;
void main() {
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`;
initShaders(gl, vertexShader, fragmentShader);
gl.clearColor(0.5, 0.5, 0.5, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// 定义三角形三个顶点的vec2(xy)坐标(z=0)
const positions = [
  -0.5, 0.0,
  0.5, 0.0,
  0.0, 0.8,
];
// 【1】createBuffer 创建顶点缓冲对象
const vertexBuffer = gl.createBuffer();
// 【2】bindBuffer 将顶点缓冲对象绑定到 ARRAY_BUFFER 字段上
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
// 【3】bufferData 将顶点数据存入缓冲(vertexBuffer)中
// 需要指明数据大小用于分配GPU内存，这里的每个分量都是 32 位浮点型数据
// 最后一个参数用于提示 WebGL 数据的使用方式：
//  gl.STATIC_DRAW: 数据不变或几乎不变
//  gl.DYNAMIC_DRAW: 数据会较多改变
//  gl.STREAM_DRAW: 数据每次绘制时都会改变
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
// 【4】把带有数据的buffer赋值给attribute
const a_position = gl.getAttribLocation(gl.program, "a_position");
gl.enableVertexAttribArray(a_position); // 确认赋值
// 【5】指定缓冲数据的解析方式，本案例为每2个float一组
/**
 * @function gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)
 * @param positionAttributeLocation 顶点着色器上的"a_position"属性的位置指针
 * @param size 一个顶点数据的获取长度，本案例每个顶点包含2个位置分量(xy)
 * @param type 数据缓冲类型，本案例顶点数据类型为 float32，因此使用 gl.FLOAT
 * @param normalize 归一化，如 [1,2]=>[1/√5,2/√5]，通常为 false
 * @param stride 数据存储方式，单位是字节，0 表示连续存放，非 0 表示一个顶点数据占的字节长度(步长)
 * @param offset 当前输入数据在一个顶点数据里的偏移字节数，由于本案例一组数据只有 position 的两个值，因此偏移量为0，若还包含其他值，如顶点颜色、纹理坐标等则需要设置
 */
gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);
// 【6】执行绘制，本案例为从0开始，每次取3个点绘制三角形
/**
 * @function gl.drawArrays(primitiveType, offset, count)
 * @param primitiveType 指定图元绘制形式，共七种，如 gl.POINTS / gl.LINE_STRIP / gl.TRIANGLES / ...
 * @param offset 起始索引
 * @param count 本次绘制使用的点的数量，也表示顶点着色器的运行次数(顶点着色器每次只处理一个顶点)
 */
gl.drawArrays(gl.TRIANGLES, 0, 3);
