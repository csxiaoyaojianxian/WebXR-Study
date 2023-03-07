// 计算精度：三档精度
// highp  -2^16 - 2^16
// mediump -2^10 - 2^10
// lowp -2^8 - 2^8
precision lowp float; // 低精度

// 导入属性
attribute vec3 position;
attribute vec2 uv;

// 通用：每个顶点相同的四维矩阵
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform float uTime; // 获取时间

// 传递：将顶点着色器的uv数据传递给片元着色器
varying vec2 vUv; // 二维uv
varying float vElevation;

void main(){
    vUv = uv;
    vec4 modelPosition = modelMatrix * vec4( position, 1.0 );
    // modelPosition.x += 1.0;
    // modelPosition.z += 1.0;
    // modelPosition.z += modelPosition.x;

    // 沿x轴方向增加z轴的起伏
    modelPosition.z = sin((modelPosition.x+uTime) * 10.0)*0.05; // 10控制频率 0.05控制z轴幅度
    // 沿y轴方向增加z轴的起伏
    modelPosition.z += sin((modelPosition.y+uTime)  * 10.0)*0.05;
    vElevation = modelPosition.z;

    gl_Position = projectionMatrix * viewMatrix * modelPosition;
}