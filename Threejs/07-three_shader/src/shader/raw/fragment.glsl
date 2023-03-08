// 高精度
precision highp float;
// 从vertex传值
varying vec2 vUv;
varying float vElevation; // z幅度

uniform sampler2D uTexture; // 传入纹理

void main(){
    // 二维uv是一个正方形，需要转四维对应 rgba 才能赋值给 gl_FragColor，四个角对应关系 (0,1,0,1)绿 (1,1,0,1)黄 (1,0,0,1)红 (0,0,0,1)黑
    // gl_FragColor = vec4(vUv, 0.0, 1.0);

    float alpha = (vElevation + 0.1) + 0.8; // vertex中计算得到的幅度

    // 根据UV,取出对应的颜色
    vec4 textureColor = texture2D(uTexture, vUv);
    textureColor.rgb *= alpha; // 调节亮度，如 000->777->...->fff，黑->灰->白
    gl_FragColor = textureColor;
}