// CustomData 将自定义变量传入shader的appdata
// demo: 本案例将粒子的speed传入，当start speed为0时，呈现黑色，调大后逐渐变白

Shader "Unlit/CustomData"
{

    Properties
    {
        _MainTex("Texture", 2D) = "white"{}
        _MainUVSpeedX("MainUVSpeedX", float) = 0
        _MainUVSpeedY("MainUVSpeedY", float) = 0
    }

    SubShader
    {
        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"

            struct appdata
            {
                float4 vertex : POSITION;
                // uv.z 从customData传入speed数据，详见图片，类型也从 float2 改为 float4
                float4 uv     : TEXCOORD0;
                float4 color  : TEXCOORD1;
            };

            struct v2f
            {
                float4 vertex : SV_POSITION;
                float2 uv     : TEXCOORD0;
                // customData 相关
                float speed   : TEXCOORD1;
                float4 color  : TEXCOORD2;
            };

            sampler2D _MainTex;
            float4 _MainTex_ST;
            float _MainUVSpeedX,_MainUVSpeedY;

            v2f vert (appdata v)
            { 
                v2f o;
                o.vertex = UnityObjectToClipPos(v.vertex);
                o.uv.xy = TRANSFORM_TEX(v.uv,_MainTex) + float2(_MainUVSpeedX,_MainUVSpeedY) * _Time.y;

                // customData 相关
                o.speed = v.uv.z;
                o.color = half4(v.uv.w, v.color.xyz);

                return o;
            }

            fixed4 frag (v2f i) : SV_Target
            {
                // customData 相关
                return i.speed;
            }
            ENDCG
        }
    }
}
