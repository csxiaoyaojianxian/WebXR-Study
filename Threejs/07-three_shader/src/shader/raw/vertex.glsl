// 计算精度：三档精度
// highp  -2^16 - 2^16
// mediump -2^10 - 2^10
// lowp -2^8 - 2^8
precision highp float; // 高精度

/*
shader中有三种类型的变量：uniforms, attributes 和 varyings
• uniforms 是所有顶点都具有相同的值的变量，比如灯光、雾、和阴影贴图就是被储存在uniforms中的数据，可以通过顶点着色器和片元着色器来访问
• attributes 是与每个顶点关联的变量，如顶点位置、法线和顶点颜色都是存储在attributes中的数据，只可以在顶点着色器中访问
• varyings 是从顶点着色器传递到片元着色器的变量，对于每一个片元，每一个 varying 的值将是相邻顶点值的平滑插值
注意：在 shader 内部，uniforms 和 attributes 就像常量，只能使用 JavaScript 代码通过缓冲区来修改它们的值
*/

// 导入属性
attribute vec3 position;       // 非raw，使用ShaderMaterial时不能重复定义
attribute vec2 uv;             // 非raw，使用ShaderMaterial时不能重复定义

// 通用传入变量，在vertex和fragment中都可直接引入
// 如每个顶点相同的四维矩阵
uniform mat4 modelMatrix;      // 非raw，使用ShaderMaterial时不能重复定义
uniform mat4 viewMatrix;       // 非raw，使用ShaderMaterial时不能重复定义
uniform mat4 projectionMatrix; // 非raw，使用ShaderMaterial时不能重复定义

uniform float uFrequency;
uniform float uScale; // 
uniform float uTime; // 时间

// 定义传递变量，从顶点着色器传递给片元着色器
varying vec2 vUv; // 二维uv数据，是一个正方形，需要转四维对应 rgba，四个角对应关系 (0,1,0,1)绿 (1,1,0,1)黄 (1,0,0,1)红 (0,0,0,1)黑
varying float vElevation;

void main(){
    vUv = uv;
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // 沿x轴方向增加z轴的起伏
    modelPosition.z += sin((modelPosition.x+uTime) * uFrequency)*uScale; // uFrequency控制频率 uScale控制z轴幅度
    // 沿y轴方向增加z轴的起伏
    modelPosition.z += sin((modelPosition.y+uTime) * uFrequency)*uScale;

    vElevation = modelPosition.z;

    gl_Position = projectionMatrix * viewMatrix * modelPosition;
}