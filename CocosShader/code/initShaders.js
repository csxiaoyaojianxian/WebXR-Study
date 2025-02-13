export default function initShaders(gl, vertexSource, fragmentSource) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  // 将创建的顶点着色器和片元着色器绑定到着色程序上，顶点着色器和片段着色器需要成对提供
  const program = createProgram(gl, vertexShader, fragmentShader);
  if (program) {
    gl.useProgram(program);
    gl.program = program; // 挂载gl对象上方便获取
    return true;
  } else {
    console.log("create program error.");
    return false;
  }
}

/**
 * 创建着色器
 * @param gl WebGL上下文
 * @param type 着色器类型
 * @param source 着色器文本
 */
function createShader(gl, type, source) {
  // 根据 type 创建着色器
  const shader = gl.createShader(type);
  // 绑定内容文本 source
  gl.shaderSource(shader, source);
  // 编译着色器（将文本内容转换成着色器程序）
  gl.compileShader(shader);
  // 获取编译后的状态
  const state = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (state) {
    return shader;
  } else {
    // 获取当前着色器相关信息
    const error = gl.getShaderInfoLog(shader);
    console.log("compile shaders error: " + error);
    // 删除失败的着色器
    gl.deleteShader(shader);
    return null;
  }
}

/**
 * 创建着色程序
 * @param gl WebGL上下文
 * @param vertexShader 顶点着色器对象
 * @param fragmentShader 片元着色器对象
 */
function createProgram(gl, vertexShader, fragmentShader) {
  // 创建着色程序
  const program = gl.createProgram();
  if (!program) return null;
  // 使着色程序获取顶点/片段着色器
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  // 将两个着色器与着色程序绑定
  gl.linkProgram(program);
  const state = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (state) {
    return program;
  } else {
    const error = gl.getProgramInfoLog(program);
    console.log("link program error: " + error);
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }
}
