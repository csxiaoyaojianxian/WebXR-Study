// 【重点】扭曲实现
Shader "Unlit/HeatDistort"
{
    Properties
    {
        _DistortTex("DistortTex", 2D) = "white"{}
        // _Distort("Distort", Range(0,1)) = 0
        // _SpeedX("SpeedX", float) = 0
        // _SpeedY("SpeedY", float) = 0
        _Distort("SpeedX(X) SpeedX(Y) Distort(Z)", vector) = (0,0,0,0) // 合并，提升性能
    }
    SubShader
    {
        Tags{"Queue" = "Transparent"}
        Cull Off

        GrabPass{"_GrabTex"}

        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"

            struct v2f
            {
                float2 uv : TEXCOORD0;
            };

            sampler2D _GrabTex;
            sampler2D _DistortTex; float4 _DistortTex_ST;
            // fixed _Distort;
            // float _SpeedX,_SpeedY;
            float4 _Distort;

            v2f vert (
                float4 vertex : POSITION,
                float2 uv: TEXCOORD, // 传入uv
                out float4 pos: SV_POSITION
            )
            {
                v2f o;
                // o.uv = uv; // uv 增加流动效果
                // o.uv = TRANSFORM_TEX(uv, _DistortTex) + float2(_SpeedX,_SpeedY)*_Time.y; // 前面章节有实现
                o.uv = TRANSFORM_TEX(uv, _DistortTex) + _Distort.xy*_Time.y; // 前面章节有实现
                pos = UnityObjectToClipPos(vertex);
                return o;
            }

            fixed4 frag (v2f i, UNITY_VPOS_TYPE screenPos: VPOS) : SV_Target
            {
                fixed2 screenUV = screenPos.xy / _ScreenParams.xy;

                // 扭曲的核心实现
                fixed4 distortTex = tex2D(_DistortTex, i.uv);
                float2 uv = lerp(screenUV, distortTex, _Distort.x);
                fixed4 grabTex = tex2D(_GrabTex, uv);

                return grabTex;
            }
            ENDCG
        }
    }
}
