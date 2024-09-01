// [ multi_compile 变体的使用 ] 参考结合12-shader_feature
// #pragma multi_compile _ NAME
Shader "Unlit/variants"
{
    // 变体
    Properties
    {
        _MainTex("MainTex", 2D) = "black"{}
        [Toggle]_DISSOLVEENABLED("Dissolve Enabled", int) = 0
        _DissolveTex("DissolveTex(R)", 2D) = "white"{}
        [NoScaleOffset]_RampTex("RampTex(RGB)", 2D) = "white"{}
        _Clip("Clip", Range(0,1)) = 0
    }
    SubShader
    {
        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            // pragma编译指令增加两个变体_和_DISSOLVEENABLED_ON，可通过添加 _ 来定义一个默认空的变体
            // 在unity-inspector的shader面板中能看到compiled code包含两个variants变体
            // 变体名必须为全大写，此处名为 _DISSOLVEENABLED_ON 且带 _ON 结尾，是为了和 properties 中的变量自动关联，除了开发用代码打开变体，美术也可以在面板中通过勾选打开变体
            #pragma multi_compile _ _DISSOLVEENABLED_ON
            #include "UnityCG.cginc"

            sampler2D _MainTex;
            sampler2D _DissolveTex;
            float4 _DissolveTex_ST;
            sampler _RampTex;
            fixed _Clip;

            struct appdata
            {
                float4 vertex   :POSITION;
                float4 uv       :TEXCOORD;
            };

            struct v2f
            {
                float4 vertex   :SV_POSITION;
                float4 uv       :TEXCOORD;
            };

            v2f vert (appdata v)
            {
                v2f o;
                o.vertex = UnityObjectToClipPos(v.vertex);
                o.uv.xy = v.uv.xy;
                o.uv.zw = TRANSFORM_TEX(v.uv.xy, _DissolveTex); // 相当于 v.uv * _DissolveTex_ST.xy + _DissolveTex_ST.zw
                return o;
            }

            fixed4 frag (v2f i):SV_Target
            {
                fixed4 tex = tex2D(_MainTex, i.uv.xy);
                fixed4 c = tex;
                
                // 变体使用
                #if _DISSOLVEENABLED_ON
                    fixed4 dissolveTex = tex2D(_DissolveTex, i.uv.zw);
                    clip(dissolveTex.r - _Clip);
                    fixed4 rampTex = tex1D(_RampTex, saturate((dissolveTex.r - _Clip)/(_Clip + 0.1 - _Clip)) - 0.001); // (x-min)/(max-min)
                    c += rampTex;
                #endif

                return c;
            }
            ENDCG
        }
    }
}
