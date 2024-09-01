// 扭曲实现之————屏幕抓取 GrabPass
Shader "Unlit/GrabPass"
{
    SubShader
    {
        // 注意渲染顺序，需要最后渲染，设置为半透明，否则只能采样到背景环境或造成其他异常
        Tags{"Queue" = "Transparent"}
        // GrabPass { "NAME" } 自动截图上一帧
        // GrabPass {} // 可以不传NAME，每次使用shader都会抓取，不推荐
        GrabPass{"_GrabTex"} // 抓取图片后保存为指定NAME，针对上面的优化，避免不同物体间使用shader的重复抓取，需要和下面定义的变量对应

        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"

            struct v2f
            {
                float2 uv : TEXCOORD0;
            };

            // GrabPass 截图
            sampler2D _GrabTex;

            v2f vert (
                float4 vertex : POSITION,
                out float4 pos: SV_POSITION
            )
            {
                v2f o;
                pos = UnityObjectToClipPos(vertex);
                return o;
            }

            fixed4 frag (v2f i, UNITY_VPOS_TYPE screenPos: VPOS) : SV_Target
            {
                fixed2 screenUV = screenPos.xy / _ScreenParams.xy;

                // 抓取图处理
                fixed4 grabTex = tex2D(_GrabTex, screenUV);

                return 1 - grabTex;
            }
            ENDCG
        }
    }
}
