/*
-------- 角度相关的函数 --------
sin(x)     弧度  正弦函数
cos(x)     弧度  余弦函数
tan(x)     弧度  正切函数
asin(x)    弧度  反正弦函数
acos(x)    弧度  反余弦函数
atan(x)    弧度  反正切函数
radians(x) 角度  角度转换为弧度
degrees(x) 弧度  弧度转换为角度

-------- 数学函数 指数对数幂函数的操作 --------
pow(x,y)    x的y次方。如果x小于0，结果是未定义的。同样，如果x=0并且y<=0，结果也是未定义的
exp(x)      e的x次方
log(x)      计算满足x等于e的y次方的y的值。如果x的值小于0，结果是未定义的
exp2(x)     计算2的x次方
log2(x)     计算满足x等于2的y次方的y的值。如果x的值小于0，结果是未定义的
sqrt(x)     计算x的开方。如果x小于0，结果是未定义的
inversesqrt(x)  计算x的开方之一的值，如果x小于等于0，结果是未定义的

-------- 常用函数 --------
abs(x)      返回x的绝对值
sign(x)     如果x>0，返回1.0；如果x=0，返回0，如果x<0，返回-1.0
floor(x)    返回小于等于x的最大整数值
ceil(x)     返回大于等于x的最小整数值
fract(x)    返回x-floor(x)，即返回x的小数部分
mod(x, y)   返回x和y的模
min(x, y)   返回x和y的值较小的那个值。
max(x, y)   返回x和y的值较大的那个值。
clamp(x, minVal, maxVal)    将x值钳于minVal和maxVal之间，意思就是当x<minVal时返回minVal，当x>maxVal时返回maxVal，当x在minVal和maxVal之间时，返回x
mix(x, y, a)                返回线性混合的x和y，如：x*(1−a)+y*a
step(edge, x)               如果x < edge，返回0.0，否则返回1.0
smoothstep(edge0, edge1, x) 如果x <= edge0，返回0.0 ；如果x >= edge1 返回1.0；如果edge0 < x < edge1，则执行0~1之间的平滑埃尔米特差值。如果edge0 >= edge1，结果是未定义的

-------- 几何函数 --------
length(x)               返回向量x的长度
distance(p0,p1)         计算向量p0，p1之间的距离
dot                     向量x，y之间的点积
cross(x, y)             向量x，y之间的叉积
normalize(x)            标准化向量，返回一个方向和x相同但长度为1的向量
faceforward(N, I, Nref) 如果Nref和I的点积小于0，返回N；否则，返回-N；
reflect(I, N)           返回反射向量
refract(I, N, eta)      返回折射向量
*/

// shader参考网站
// https://thebookofshaders.com/?lan=ch
// https://shadertoy.com

precision lowp float;
uniform float uTime;
uniform float uScale;
varying vec2 vUv;

#define PI 3.1415926535897932384626433832795

// 伪随机函数
float random (vec2 st) {
    return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);
}

// 旋转函数
vec2 rotate(vec2 uv, float rotation, vec2 mid) {
    return vec2(
        cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
        cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
    );
}

// 噪声函数
float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

// 置换函数
vec4 permute(vec4 x)
{
    return mod(((x*34.0)+1.0)*x, 289.0);
}

vec2 fade(vec2 t)
{
    return t*t*t*(t*(t*6.0-15.0)+10.0);
}

float cnoise(vec2 P)
{
    vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
    vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
    Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
    vec4 ix = Pi.xzxz;
    vec4 iy = Pi.yyww;
    vec4 fx = Pf.xzxz;
    vec4 fy = Pf.yyww;
    vec4 i = permute(permute(ix) + iy);
    vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
    vec4 gy = abs(gx) - 0.5;
    vec4 tx = floor(gx + 0.5);
    gx = gx - tx;
    vec2 g00 = vec2(gx.x,gy.x);
    vec2 g10 = vec2(gx.y,gy.y);
    vec2 g01 = vec2(gx.z,gy.z);
    vec2 g11 = vec2(gx.w,gy.w);
    vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
    g00 *= norm.x;
    g01 *= norm.y;
    g10 *= norm.z;
    g11 *= norm.w;
    float n00 = dot(g00, vec2(fx.x, fy.x));
    float n10 = dot(g10, vec2(fx.y, fy.y));
    float n01 = dot(g01, vec2(fx.z, fy.z));
    float n11 = dot(g11, vec2(fx.w, fy.w));
    vec2 fade_xy = fade(Pf.xy);
    vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
    float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
    return 2.3 * n_xy;
}


void main(){

    // 1. 通过顶点对应的uv，决定每一个像素在uv图像的位置，通过这个位置x,y决定rgb颜色
    // uv是一个正方形，四个角对应关系 (0,1,0,1)绿 (1,1,0,1)黄 (1,0,0,1)红 (0,0,0,1)黑
    gl_FragColor =vec4(vUv, 0, 1);

    // 2. 对第一种变形，增加第三位蓝色Blue，更好看
    gl_FragColor = vec4(vUv,1,1);

    // 3. 利用uv实现渐变效果,从左黑到右白
    float strength1 = vUv.x; // [0,1]
    gl_FragColor =vec4(strength1,strength1,strength1,1); // 0,0,0,1 => 1,1,1,1

    // 4. 利用uv实现渐变效果,从下到上
    float strength2 = vUv.y;
    gl_FragColor =vec4(strength2,strength2,strength2,1);

    // 5. 利用uv实现渐变效果,从上到下
    float strength3 = 1.0-vUv.y;
    gl_FragColor =vec4(strength3,strength3,strength3,1);

    // 6. 利用uv实现短范围内渐变
    float strength4 = vUv.y * 10.0; // vUv.x * 10.0;
    gl_FragColor =vec4(strength4,strength4,strength4,1);

    // 7. 利用通过取模达到反复效果，反复横条
    float strength5 = mod(vUv.y * 10.0 , 1.0);
    gl_FragColor =vec4(strength5,strength5,strength5,1);

    // 8. 利用step(edge, x)如果x < edge，返回0.0，否则返回1.0，横向斑马线
    float strength6 =  mod(vUv.y * 10.0 , 1.0);
    strength6 = step(0.5,strength6);
    gl_FragColor =vec4(strength6,strength6,strength6,1);

    // 9. 利用step(edge, x)如果x < edge，返回0.0，否则返回1.0，横向斑马线
    float strength7 =  mod(vUv.y * 10.0 , 1.0);
    strength7 = step(0.8,strength7);
    gl_FragColor =vec4(strength7,strength7,strength7,1);

    // 10. 利用step(edge, x)如果x < edge，返回0.0，否则返回1.0，纵向斑马线
    float strength8 =  mod(vUv.x * 10.0 , 1.0);
    strength8 = step(0.8,strength8);
    gl_FragColor =vec4(strength8,strength8,strength8,1);

    // 11. 条纹相加/相减
    float strength9 = step(0.8, mod(vUv.x * 10.0 , 1.0));
    strength9 += step(0.8, mod(vUv.y * 10.0 , 1.0));
    // strength9 -= step(0.8, mod(vUv.y * 10.0 , 1.0));
    gl_FragColor =vec4(strength9,strength9,strength9,1);

    // 12. 条纹相乘
    float strength10 = step(0.8, mod(vUv.x * 10.0 , 1.0));
    strength10 *= step(0.8, mod(vUv.y * 10.0 , 1.0));
    gl_FragColor =vec4(strength10,strength10,strength10,1);

    // 13. 方块图形
    float strength11 = step(0.2, mod(vUv.x * 10.0 , 1.0));
    strength11 *= step(0.2, mod(vUv.y * 10.0 , 1.0));
    gl_FragColor =vec4(strength11,strength11,strength11,1);

    // 14. T型图
    float barX = step(0.4, mod((vUv.x+uTime*0.1) * 10.0 , 1.0))*step(0.8, mod(vUv.y * 10.0 , 1.0));
    // float barX = step(0.4, mod(vUv.x * 10.0 - 0.2 , 1.0))*step(0.8, mod(vUv.y * 10.0 , 1.0));
    float barY = step(0.4, mod(vUv.y * 10.0 , 1.0))*step(0.8, mod(vUv.x * 10.0 , 1.0));
    float strength12 = barX+barY;
    gl_FragColor = vec4(vUv,1,strength12);

    // 15. 利用绝对值
    float strength13 = abs(vUv.x - 0.5);
    gl_FragColor =vec4(strength13,strength13,strength13,1);

    // 16. 取2个值的最小值
    float strength14 =min(abs(vUv.x - 0.5), abs(vUv.y - 0.5)) ;
    gl_FragColor =vec4(strength14,strength14,strength14,1);

    // 17. 取最大值
    float strength15 =max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)) ;
    gl_FragColor =vec4(strength15,strength15,strength15,1);

    // 18. step
    float strength16 =step(0.2,max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)))  ;
    gl_FragColor =vec4(strength16,strength16,strength16,1);

    // 19. 小正方形
    float strength17 =1.0-step(0.2,max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)))  ;
    gl_FragColor =vec4(strength17,strength17,strength17,1);

    // 20. 利用取整，实现条纹渐变
    float strength18 = floor(vUv.x*10.0)/10.0;
    gl_FragColor =vec4(strength18,strength18,strength18,1);
    float strength19 = floor(vUv.y*10.0)/10.0;
    gl_FragColor =vec4(strength19,strength19,strength19,1);

    // 21. 条纹相乘，实现渐变格子
    float strength20 = floor(vUv.x*10.0)/10.0*floor(vUv.y*10.0)/10.0;
    gl_FragColor =vec4(strength20,strength20,strength20,1);

    // 22. 向上取整
    float strength21 = ceil(vUv.x*10.0)/10.0*ceil(vUv.y*10.0)/10.0;
    gl_FragColor =vec4(strength21,strength21,strength21,1);

    // 23. 随机效果
    float strength22 = random(vUv);
    gl_FragColor =vec4(strength22,strength22,strength22,1);

    // 24. 随机+格子效果
    float strength23 = ceil(vUv.x*10.0)/10.0*ceil(vUv.y*10.0)/10.0;
    strength23 = random(vec2(strength23,strength23));
    gl_FragColor =vec4(strength23,strength23,strength23,1);

    // 25. 依据length返回向量长度
    float strength24 = length(vUv);
    gl_FragColor =vec4(strength24,strength24,strength24,1);

    // 26. 根据distance技术2个向量的距离
    float strength25 =1.0 - distance(vUv,vec2(0.5,0.5));
    gl_FragColor =vec4(strength25,strength25,strength25,1);

    // 27. 根据相除，实现星星
    float strength26 =0.15 / distance(vUv,vec2(0.5,0.5)) - 1.0;
    gl_FragColor =vec4(strength26,strength26,strength26,strength26);

    // 28. 设置vUv水平或者竖直变量
    float strength27 =0.15 / distance(vec2(vUv.x,(vUv.y-0.5)*5.0),vec2(0.5,0.5)) - 1.0;
    gl_FragColor =vec4(strength27,strength27,strength27,strength27);

    // 29. 十字交叉的星星
    float strength28 = 0.15 / distance(vec2(vUv.x,(vUv.y-0.5)*5.0+0.5),vec2(0.5,0.5)) - 1.0;
    strength28 += 0.15 / distance(vec2(vUv.y,(vUv.x-0.5)*5.0+0.5),vec2(0.5,0.5)) - 1.0;
    gl_FragColor =vec4(strength28,strength28,strength28,strength28);

    // 30. 旋转飞镖，旋转uv
    // vec2 rotateUv = rotate(vUv,3.14*0.25,vec2(0.5));
    vec2 rotateUv1 = rotate(vUv,-uTime*5.0,vec2(0.5));
    float strength29 = 0.15 / distance(vec2(rotateUv1.x,(rotateUv1.y-0.5)*5.0+0.5),vec2(0.5,0.5)) - 1.0;
    strength29 += 0.15 / distance(vec2(rotateUv1.y,(rotateUv1.x-0.5)*5.0+0.5),vec2(0.5,0.5)) - 1.0;
    gl_FragColor =vec4(strength29,strength29,strength29,strength29);

    // 31. 小日本国旗
    float strength30 = step(0.5,distance(vUv,vec2(0.5))+0.25);
    gl_FragColor =vec4(strength30,strength30,strength30,1);

    // 32. 绘制圆
    float strength31 = 1.0 - step(0.5,distance(vUv,vec2(0.5))+0.25);
    gl_FragColor =vec4(strength31,strength31,strength31,1);

    // 33. 圆环
    float strength32 = step(0.5,distance(vUv,vec2(0.5))+0.35);
    strength32 *= (1.0 - step(0.5,distance(vUv,vec2(0.5))+0.25));
    gl_FragColor =vec4(strength32,strength32,strength32,1);
    
    // 34. 渐变环
    float strength33 =  abs(distance(vUv,vec2(0.5))-0.25);
    gl_FragColor =vec4(strength33,strength33,strength33,1);

    // 35. 打靶
    float strength34 = step(0.1,abs(distance(vUv,vec2(0.5))-0.25))  ;
    gl_FragColor =vec4(strength34,strength34,strength34,1);

    // 36. 圆环
    float strength35 = 1.0 - step(0.1,abs(distance(vUv,vec2(0.5))-0.25))  ;
    gl_FragColor =vec4(strength35,strength35,strength35,1);

    // 37. 波浪环
    vec2 waveUv1 = vec2(
        vUv.x,
        vUv.y+sin(vUv.x*30.0)*0.1
    );
    float strength36 = 1.0 - step(0.01,abs(distance(waveUv1,vec2(0.5))-0.25))  ;
    gl_FragColor =vec4(strength36,strength36,strength36,1);

    // 38
    vec2 waveUv2 = vec2(
        vUv.x+sin(vUv.y*30.0)*0.1,
        vUv.y+sin(vUv.x*30.0)*0.1
    );
    float strength37 = 1.0 - step(0.01,abs(distance(waveUv2,vec2(0.5))-0.25))  ;
    gl_FragColor =vec4(strength37,strength37,strength37,1);

    // 39
    vec2 waveUv3 = vec2(
        vUv.x+sin(vUv.y*100.0)*0.1,
        vUv.y+sin(vUv.x*100.0)*0.1
    );
    float strength38 = 1.0 - step(0.01,abs(distance(waveUv3,vec2(0.5))-0.25))  ;
    gl_FragColor =vec4(strength38,strength38,strength38,1);

    // 40. 根据角度显示视图
    float angle1 = atan(vUv.x,vUv.y);
    float strength39 = angle1;
    gl_FragColor =vec4(strength39,strength39,strength39,1);

    // 41. 根据角度实现螺旋渐变
    float angle2 = atan(vUv.x-0.5,vUv.y-0.5);
    float strength40 = (angle2+3.14)/6.28;
    gl_FragColor =vec4(strength40,strength40,strength40,1);

    // 42. 实现雷达扫射
    float alpha1 =  1.0 - step(0.5,distance(vUv,vec2(0.5)));
    float angle3 = atan(vUv.x-0.5,vUv.y-0.5);
    float strength41 = (angle3+3.14)/6.28;
    gl_FragColor =vec4(strength41,strength41,strength41,alpha1);

    // 43. 通过时间实现动态选择
    // vec2 rotateUv2 = rotate(vUv,3.14*0.25,vec2(0.5));
    vec2 rotateUv2 = rotate(vUv,-uTime*5.0,vec2(0.5));
    float alpha2 =  1.0 - step(0.5,distance(vUv,vec2(0.5)));
    float angle4 = atan(rotateUv2.x-0.5,rotateUv2.y-0.5);
    float strength42 = (angle4+3.14)/6.28;
    gl_FragColor =vec4(strength42,strength42,strength42,alpha2);

    // 44. 万花筒
    float angle5 = atan(vUv.x-0.5,vUv.y-0.5)/PI;
    float strength43 = mod(angle5*10.0,1.0);
    gl_FragColor =vec4(strength43,strength43,strength43,1);

    // 45. 光芒四射
    float angle6 = atan(vUv.x-0.5,vUv.y-0.5)/(2.0*PI);
    float strength44 = sin(angle6*100.0);
    gl_FragColor =vec4(strength44,strength44,strength44,1);

    // 46. 使用噪声实现烟雾、波纹效果
    float strength45 = noise(vUv);
    gl_FragColor =vec4(strength45,strength45,strength45,1);

    float strength46 = noise(vUv * 10.0);
    gl_FragColor =vec4(strength46,strength46,strength46,1);

    float strength47 = step(0.5,noise(vUv * 100.0));
    gl_FragColor =vec4(strength47,strength47,strength47,1);

    // 47. 通过时间设置波形
    float strength48 = step(uScale,cnoise(vUv * 10.0+uTime));
    gl_FragColor =vec4(strength48,strength48,strength48,1);

    float strength49 = abs(cnoise(vUv * 10.0));
    gl_FragColor =vec4(strength49,strength49,strength49,1);

    // 48. 发光路径
    float strength50 =1.0 - abs(cnoise(vUv * 10.0));
    gl_FragColor =vec4(strength50,strength50,strength50,1);

    // 49. 波纹效果
    float strength51 = sin(cnoise(vUv * 10.0)*5.0+uTime);
    gl_FragColor =vec4(strength51,strength51,strength51,1);

    float strength52 = step(0.9,sin(cnoise(vUv * 10.0)*20.0)) ;
    gl_FragColor =vec4(strength52,strength52,strength52,1);

    // 50. 使用混合函数混颜色
    vec3 purpleColor = vec3(1.0, 0.0, 1.0);
    vec3 greenColor = vec3(1.0, 1.0, 1.0);
    vec3 uvColor = vec3(vUv,1.0);
    float strength53 = step(0.9,sin(cnoise(vUv * 10.0)*20.0)) ;
    vec3 mixColor =  mix(greenColor,uvColor,strength53);
    gl_FragColor =vec4(mixColor,1.0);
}