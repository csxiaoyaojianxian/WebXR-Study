// 模版缓冲区、模版测试
// 模版测试是基于模版缓冲区和自身区域值进行对比，如UI中的遮罩
// 需要在mask节点上添加mask组件，指定为遮罩
// 模版测试公式：
// (Ref & ReadMask) Comp (StencilBufferValue & ReadMask)
// Ref 为Shader中自定义的值，StencilBufferValue 为模版缓冲区中的值

Shader "Unlit/Stencil"
{
    Properties
    {
        [PerRendererData]_MainTex("MainTex", 2D) = "white"{}
        // 模版测试参数
        _Ref("Stencil Ref", int) = 0
        [Enum(UnityEngine.Rendering.CompareFunction)]_StencilComp("Stencil Comp", int) = 0
        [Enum(UnityEngine.Rendering.StencilOp)]_StencilOp("Stencil OP", int) = 0
    }
    SubShader
    {
        Tags{"Queue" = "Transparent"}
        Blend SrcAlpha OneMinusSrcAlpha

        // 模版测试
        Stencil {
            Ref [_Ref] // 0 1
            // ReadMask
            // WriteMask
            Comp [_StencilComp] // Equal
            Pass [_StencilOp] // Keep
            // Fail
            // ZFail
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
