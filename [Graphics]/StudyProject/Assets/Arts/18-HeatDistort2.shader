// 扭曲实现的优化 ComputeScreenPos
Shader "Unlit/HeatDistort2"
{
    Properties
    {
        _DistortTex("DistortTex", 2D) = "white"{}
        _Distort("SpeedX(X) SpeedX(Y) Distort(Z)", vector) = (0,0,0,0)
    }
    SubShader
    {
        Tags{"Queue" = "Transparent"}
        GrabPass{"_GrabTex"}

        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"

            // 调整为结构体，而非形参
            struct appdata
            {
                float4 vertex : POSITION;
                float2 uv: TEXCOORD;
            };

            struct v2f
            {
                float2 uv : TEXCOORD0;
                float4 pos: SV_POSITION;
                float4 screenUV: TEXCOORD1;
            };

            sampler2D _GrabTex;
            sampler2D _DistortTex; float4 _DistortTex_ST;
            float4 _Distort;

            // 参数整理
            v2f vert (appdata v)
            {
                v2f o;
                o.uv = TRANSFORM_TEX(v.uv, _DistortTex) + _Distort.xy * _Time.y;
                o.pos = UnityObjectToClipPos(v.vertex);
                // pos 为裁剪空间下的位置，返回某个投影点下的屏幕坐标位置，由于这个函数返回的坐标值未除以齐次坐标，所以使用时需要:
                // tex2D(_Tex, uv.xy / uv.w) 也可以直接用 tex2Dproj(_Tex, uv.xyw)
                // o.screenUV = o.pos;
                o.screenUV = ComputeScreenPos(o.pos);
                return o;
            }

            // 参数整理
            fixed4 frag (v2f i) : SV_Target
            {
                // 见上，*0.5+0.5实现将坐标原点从左下角移动到中心，不建议自己处理，因为 opengl 和 directx 的坐标系不同，上面的 ComputeScreenPos 中已经处理
                // float2 uv = i.screenUV.xy / i.screenUV.w * float2(1,-1) * 0.5 + 0.5;
                // fixed4 grabTex = tex2Dproj(_GrabTex, i.screenUV);

                fixed4 distortTex = tex2D(_DistortTex, i.uv);
                float2 uv = lerp(i.screenUV.xy / i.screenUV.w, distortTex, _Distort.z);
                fixed4 grabTex = tex2D(_GrabTex, uv);

                return grabTex;
            }
            ENDCG
        }
    }
}
