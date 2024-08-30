// blend 混合模式  混合是为了实现各种半透明效果
// cull 面剔除  Cull Off
// 如何区分正反面?根据顶点顺序
Shader "Unlit/blend"
{

    Properties
    {
        // 混合模式——源因子  Zero / One / ...
        [Enum(UnityEngine.Rendering.BlendMode)]_SrcBlend("Src Blend", int) = 0
        // 混合模式——目标因子
        [Enum(UnityEngine.Rendering.BlendMode)]_DstBlend("Dst Blend", int) = 0
        // 面剔除模式 CullMode  Off / Front / Back
        [Enum(UnityEngine.Rendering.CullMode)]_Cull("Cull", int) = 0

        _MainTex("Texture", 2D) = "white"{}

        _Color("Color",Color) = (1,1,1,1)
    }

    SubShader
    {
        // 渲染队列 Tags{"TagName1"="Value1""TagName2"="Value2"}
        //    Queue 渲染队列<2500的对象认为不透明，从前向后渲染，>2500认为半透明，从后向前渲染，可通过 "Queue"="Geometry+1"在值后加数字的方式改变队列
        //    "Queue"="Background" 值为1000，最先渲染
        //    "Queue"="Geometry" 默认值 2000
        //    "Queue"="AlphaTest" 值为2450，透贴
        //    "Queue"="Transparent" 值为3000，放半透明混合对象
        //    "Queue"="Overlay" 值为4000，叠加效果，最后渲染的内容，如镜头光晕等
        Tags{"Queue" = "Geometry"}
        Blend [_SrcBlend] [_DstBlend] // Blend One Zero 混合模式[源因子][目标因子]
        Cull [_Cull] // Off / Front / Back

        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"

            struct appdata
            {
                // 顶点本地坐标
                float4 vertex : POSITION;
                float2 uv     : TEXCOORD0;
            };

            struct v2f
            {
                // 齐次裁剪空间下顶点坐标
                float4 vertex : SV_POSITION;
                float2 uv     : TEXCOORD0;
            };

            sampler2D _MainTex;
            fixed4 _Color;

            v2f vert (appdata v)
            {
                v2f o;
                o.vertex = UnityObjectToClipPos(v.vertex);
                o.uv = v.uv;
                return o;
            }

            fixed4 frag (v2f i) : SV_Target
            {
               fixed4 tex = tex2D(_MainTex, i.uv.xy);
               fixed4 c = tex * _Color;
               return c;
            }
            ENDCG
        }
    }
}
