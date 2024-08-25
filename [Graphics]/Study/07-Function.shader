// [基本运算]
Shader "Unlit/Function"
{
    SubShader
    {
        Tags { "RenderType"="Opaque" }
        LOD 100

        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"

            struct appdata
            {
                // 顶点本地坐标
                float4 vertex : POSITION;
                float2 uv     : TEXCOORD0;
            };

            struct v2f
            {
                // 齐次裁剪空间下顶点坐标
                float4 vertex : SV_POSITION;
                float2 uv     : TEXCOORD0;
            };

            v2f vert (appdata v)
            {
                v2f o;
                o.vertex = UnityObjectToClipPos(v.vertex);
                o.uv = v.uv;
                return o;
            }

            fixed4 frag (v2f i) : SV_Target
            {
                // + - * /
                // float2 temp = float2(1,2);
                // float4 temp2 = float4(temp,3,4);

                // abs / frac(取小数)，f(x)=fractionalPart(x), f(2.5)=0.5
                float a = frac(i.uv.x * 2);
                // floor/ceil
                // max / min
                // pow / rcp(倒数)
                float b = rcp(i.uv.x * 10);
                // exp(e^n) / exp2(2^n)
                float c = exp(i.uv.x) - 1;
                // fmod(取余) / %(取余的另一种写法)
                float d = fmod(3,2) - 0.8;
                float e = 3 % 2 - 0.8;
                // saturate(归一化0～1截断) / clamp(归一化指定范围)
                float f = saturate(i.uv.x * 2) - 1; // 纯黑色
                float g = clamp(i.uv.x, 0, 1); // 此时等同于 saturate
                float h = clamp(i.uv.x, 0.3, 0.8);
                // sqrt / rsqrt(平方根倒数)
                float j = rsqrt(i.uv.x) - 1; // 等同于 pow(i.uv.x, -0.5) - 1
                // lerp(线性插值) --- lerp(A,B,alpha) return A+alpha*(B-A)
                fixed4 A = fixed4(1,0,0,1);
                fixed4 B = fixed4(0,0,1,1);
                float4 k = lerp(A, B, i.uv.x);
                // sin / cos


                return k;
            }
            ENDCG
        }
    }
}
