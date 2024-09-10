// RectMask2D遮罩
// 遮罩的两种实现方式
// 方式1: Mask组件，通过模版测试Stencil实现，参考 shader22
// 方式2: RectMask2D组件，通过Unity内置宏 UNITY_UI_CLIP_RECT 实现
// 在上层 mask 节点添加 RectMask2D 组件来激活，RectMask2D 组件可以控制 UNITY_UI_CLIP_RECT 宏的开关
// 使用前需手动定义变体 #pragma multi_compile _ UNITY_UI_CLIP_RECT
// 同时需要声明: _ClipRect(一个四维向量，四个分量分别表示 RectMask2D 的左下角点的xy坐标和右上角点的xy坐标)

Shader "Unlit/UI-Mask"
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

            //
            #pragma multi_compile _ UNITY_UI_CLIP_RECT

            #include "UnityCG.cginc"

            // 引用
            #include "UnityUI.cginc"

            struct appdata
            {
                float4 vertex : POSITION;
                float2 uv: TEXCOORD;
                //
                fixed4 color: COLOR;
            };

            struct v2f
            {
                float4 pos: SV_POSITION;
                float2 uv: TEXCOORD;
                //
                fixed4 color: COLOR;
                //
                float4 vertex: TEXCOORD1;
            };

            sampler2D _MainTex;
            // 四个分量分别表示 RectMask2D 的左下角点的xy坐标和右上角点的xy坐标
            float4 _ClipRect;

            v2f vert (appdata v)
            {
               v2f o;
               o.pos = UnityObjectToClipPos(v.vertex);
               o.uv = v.uv;
               o.color = v.color;
               o.vertex = v.vertex;
               return o;
            }

            fixed4 frag (v2f i): SV_TARGET
            {
                fixed4 c;
                fixed4 mainTex = tex2D(_MainTex, i.uv);
                c = mainTex;
                c *= i.color;

                #if UNITY_UI_CLIP_RECT
                    // 方法1 用if理解原理
                    // if (_ClipRect.x < i.vertex.x && i.vertex.x < _ClipRect.z && _ClipRect.y < i.vertex.y && i.vertex.y < _ClipRect.w) return 1;
                    // else return 0.5;

                    // 方法2.1 step优化掉if
                    // return step(_ClipRect.x, i.vertex.x) * step(i.vertex.x, _ClipRect.z) * step(_ClipRect.y, i.vertex.y) * step(i.vertex.y, _ClipRect.w);
                    
                    // 方法2.2 继续优化step数量
                    // fixed2 rect = step(_ClipRect.xy, i.vertex.xy) * step(i.vertex.xy, _ClipRect.zw);
                    // c.a *= rect.x * rect.y;

                    // 方式3 利用unity自带函数，原理同上
                    c.a *= UnityGet2DClipping(i.vertex, _ClipRect);
                #else
                    // return 0.5;
                    return 0;
                #endif

                return c;
            }
            ENDCG
        }
    }
}
