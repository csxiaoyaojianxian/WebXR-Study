// [ shader_feature 变体的适应 ]
// 1. 无论如何会被编译的变体 multi_compile
// 2. 通过材质的使用情况来决定是否编译的变体 shader_feature
// 在unity-inspector的shader面板中能看到compiled code包含的variants变体
Shader "Unlit/shader_feature"
{

    Properties
    {
        [Header(RenderingMode)]
        [Enum(UnityEngine.Rendering.BlendMode)]_SrcBlend("Src Blend", int) = 0
        [Enum(UnityEngine.Rendering.BlendMode)]_DstBlend("Dst Blend", int) = 0
        [Enum(UnityEngine.Rendering.CullMode)]_Cull("Cull", int) = 0
        
        [Header(Base)]
        _MainTex("Texture", 2D) = "white"{}
        _Color("Color",Color) = (1,1,1,1)
        _Intensity("Intensity",Range(-4,4)) = 1
        _MainUVSpeedX("MainUVSpeedX", float) = 0
        _MainUVSpeedY("MainUVSpeedY", float) = 0

        [Header(Mask)]
        [Toggle]_MaskEnabled("Mask Enabled", int) = 0
        _MaskTex("MaskTex", 2D) = "white"{}
        _MaskUVSpeedX("MaskUVSpeedX", float) = 0
        _MaskUVSpeedY("MaskUVSpeedY", float) = 0

        [Header(Distort)]
        [Toggle]_DistortEnabled("Distort Enabled", int) = 0
        // UV扭曲贴图
        _DistortTex("DistortTex", 2D) = "white"{}
        _Distort("Distort", Range(0,1)) = 0
        _DistortUVSpeedX("DistortUVSpeedX", float) = 0
        _DistortUVSpeedY("DistortUVSpeedY", float) = 0
        
    }

    SubShader
    {
        Tags{"Queue" = "Transparent"}
        Blend [_SrcBlend] [_DstBlend]
        Cull [_Cull]

        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #pragma shader_feature _ _MASKENABLED_ON
            #pragma shader_feature _ _DISTORTENABLED_ON
            #include "UnityCG.cginc"

            struct appdata
            {
                float4 vertex : POSITION;
                float2 uv     : TEXCOORD0;
            };

            struct v2f
            {
                float4 vertex : SV_POSITION;
                float4 uv     : TEXCOORD0;
                float2 uv2    : TEXCOORD1; // uv的4维不够用了
            };

            sampler2D _MainTex;
            float4 _MainTex_ST;
            float _MainUVSpeedX,_MainUVSpeedY;

            sampler2D _MaskTex;
            float4 _MaskTex_ST;
            float _MaskUVSpeedX,_MaskUVSpeedY;

            sampler2D _DistortTex;
            float4 _DistortTex_ST;
            float _Distort;
            float _DistortUVSpeedX,_DistortUVSpeedY;

            fixed4 _Color;
            half _Intensity;

            v2f vert (appdata v)
            { 
                v2f o;
                o.vertex = UnityObjectToClipPos(v.vertex);
                o.uv.xy = TRANSFORM_TEX(v.uv,_MainTex) + float2(_MainUVSpeedX,_MainUVSpeedY) * _Time.y;
                o.uv.zw = TRANSFORM_TEX(v.uv,_MaskTex) + float2(_MaskUVSpeedX,_MaskUVSpeedY) * _Time.y;
                // uv的4维不够用了增加uv2变量
                o.uv2 = TRANSFORM_TEX(v.uv,_DistortTex) + float2(_DistortUVSpeedX,_DistortUVSpeedY) * _Time.y;
                return o;
            }

            fixed4 frag (v2f i) : SV_Target
            {
                fixed4 c;
                c = _Color * _Intensity;

                float2 distort = i.uv.xy; // 默认的纹理uv

                #if _DISTORTENABLED_ON
                    fixed4 distortTex = tex2D(_DistortTex, i.uv2);
                    distort = lerp(i.uv.xy,distortTex,_Distort); // 扭曲混合后的新uv
                #endif

                fixed4 mainTex = tex2D(_MainTex, distort);
                c *= mainTex;

                #if _MASKENABLED_ON
                    fixed4 maskTex = tex2D(_MaskTex, i.uv.zw);
                    c *= maskTex;
                #endif

                return c;
            }
            ENDCG
        }
    }
}
