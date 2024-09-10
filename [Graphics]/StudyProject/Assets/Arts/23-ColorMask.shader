// 颜色遮罩，对颜色缓冲区的值过滤

Shader "Unlit/ColorMask"
{
    Properties
    {
        [PerRendererData]_MainTex("MainTex", 2D) = "white"{}
        _Ref("Stencil Ref", int) = 0
        [Enum(UnityEngine.Rendering.CompareFunction)]_StencilComp("Stencil Comp", int) = 0
        [Enum(UnityEngine.Rendering.StencilOp)]_StencilOp("Stencil OP", int) = 0
    }
    SubShader
    {
        Tags{"Queue" = "Transparent"}
        Blend SrcAlpha OneMinusSrcAlpha

        // ColorMask
        // ColorMask 0 // 什么都不显示
        // ColorMask RGBA // RGBA的任意组合
        ColorMask R // RGBA的任意组合

        Stencil {
            Ref [_Ref]
            Comp [_StencilComp]
            Pass [_StencilOp]
        }

        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"

            struct appdata
            {
                float4 vertex : POSITION;
                float2 uv: TEXCOORD;
            };

            struct v2f
            {
                float4 pos: SV_POSITION;
                float2 uv: TEXCOORD;
            };

            sampler2D _MainTex;

            v2f vert (appdata v)
            {
               v2f o;
               o.pos = UnityObjectToClipPos(v.vertex);
               o.uv = v.uv;
               return o;
            }

            fixed4 frag (v2f i): SV_TARGET
            {
                fixed4 mainTex = tex2D(_MainTex, i.uv);
                return mainTex;
            }
            ENDCG
        }
    }
}
