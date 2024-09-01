// 扭曲实现之————获取屏幕坐标 _ScreenParams
Shader "Unlit/screenPos"
{
    SubShader
    {
        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"

            // struct appdata
            // {
            //     float4 vertex : POSITION;
            //     float2 uv : TEXCOORD0;
            // };

            struct v2f
            {
                float2 uv : TEXCOORD0;
            };

            // 
            v2f vert (
                // appdata v
                float4 vertex : POSITION,
                out float4 pos: SV_POSITION // 输出
            )
            {
                v2f o;
                // o.vertex = UnityObjectToClipPos(v.vertex);
                pos = UnityObjectToClipPos(vertex);
                return o;
            }

            // 不同平台 VPOS 不同，所以不用 float4/float2，用 UNITY_VPOS_TYPE
            fixed4 frag (v2f i, UNITY_VPOS_TYPE screenPos: VPOS) : SV_Target
            {
                // 屏幕坐标获取
                fixed2 screenUV = screenPos.xy / _ScreenParams.xy; // _ScreenParams为内置变量，获取屏幕宽高
                return fixed4(screenUV, 0, 1);
            }
            ENDCG
        }
    }
}
