// 扭曲实现的优化 简单的屏幕坐标实现
Shader "Unlit/HeatDistort3"
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
                return o;
            }

            // 参数整理
            fixed4 frag (v2f i) : SV_Target
            {
                // 简单做法：SV_POSITION 返回齐次裁剪坐标，除以屏幕尺寸，可以得到 [0,1] 屏幕坐标
                fixed2 screenUV = i.pos.xy / _ScreenParams.xy;
                fixed4 distortTex = tex2D(_DistortTex, i.uv);
                float2 uv = lerp(screenUV, distortTex, _Distort.z);
                fixed4 grabTex = tex2D(_GrabTex, uv);

                return grabTex;
            }
            ENDCG
        }
    }
}
