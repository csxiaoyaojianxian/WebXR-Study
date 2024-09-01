// 遮罩
Shader "Unlit/Mask"
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
        // 遮罩贴图
        _MaskTex("MaskTex", 2D) = "white"{}
        _MaskUVSpeedX("MaskUVSpeedX", float) = 0
        _MaskUVSpeedY("MaskUVSpeedY", float) = 0
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
        Tags{"Queue" = "Transparent"}
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
                float4 uv     : TEXCOORD0;
            };

            sampler2D _MainTex;
            float4 _MainTex_ST;
            sampler2D _MaskTex;
            float4 _MaskTex_ST;
            fixed4 _Color;
            half _Intensity;

            // 声明
            float _MainUVSpeedX,_MainUVSpeedY;
            float _MaskUVSpeedX,_MaskUVSpeedY;

            v2f vert (appdata v)
            {
                v2f o;
                o.vertex = UnityObjectToClipPos(v.vertex);
                o.uv.xy = TRANSFORM_TEX(v.uv,_MainTex) + float2(_MainUVSpeedX,_MainUVSpeedY) * _Time.y;
                // zw
                o.uv.zw = TRANSFORM_TEX(v.uv,_MaskTex) + float2(_MaskUVSpeedX,_MaskUVSpeedY) * _Time.y;

                return o;
            }

            fixed4 frag (v2f i) : SV_Target
            {
                fixed4 c = tex2D(_MainTex, i.uv.xy);
                c *= _Color * _Intensity;

                fixed4 maskTex = tex2D(_MaskTex, i.uv.zw);
                c *= maskTex;
                return c;
            }
            ENDCG
        }
    }
}
