// UI去色

Shader "Unlit/UI-Mask"
{
    Properties
    {
        [PerRendererData]_MainTex("MainTex", 2D) = "white"{}
        _Ref("Stencil Ref", int) = 0
        [Enum(UnityEngine.Rendering.CompareFunction)]_StencilComp("Stencil Comp", int) = 0
        [Enum(UnityEngine.Rendering.StencilOp)]_StencilOp("Stencil OP", int) = 0

        //
        [Toggle]_GrayEnabled("Gray Enabled", int) = 0
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
            //
            #pragma multi_compile _ _GRAYENABLED_ON

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

                #if _GRAYENABLED_ON
                    // 方式1 某通道颜色很多时可以勉强使用
                    // c.rgb = c.b;

                    // 方式2 去色公式 dot(rgb,fixed3(0.22,0.707,0.071))
                    // c.rgb = c.r * 0.22 + c.g * 0.707 + c.b * 0.071;

                    // 方式3 使用内置方法，原理同上
                    c.rgb = Luminance(c.rgb);
                #endif

                return c;
            }
            ENDCG
        }
    }
}
