// 低精度
precision lowp float;
// 从vertex传值
varying vec2 vUv;
varying float vElevation;

uniform sampler2D uTexture; 

void main(){
    // 二维uv是一个正方形，转四维对应 rgba
    // 四个角对应关系 (0,1,0,1)绿 (1,1,0,1)黄 (1,0,0,1)红 (0,0,0,1)黑
    // gl_FragColor = vec4(vUv, 0.0, 1.0);
   
    // gl_FragColor = vec4(1.0*vElevation + 0.5, 0.0, 0.0, 1.0);

    // 根据UV,取出对应的颜色
    vec4 textureColor = texture2D(uTexture,vUv);
    float height = vElevation + 0.05 * 20.0; // vertex中计算得到的
    textureColor.rgb *= height;
    gl_FragColor = textureColor;
}