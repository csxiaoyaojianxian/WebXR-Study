// [使用黑白噪音图实现溶解效果]
Shader "Unlit/dissolveTexture"
{
    Properties
    {
        _MainTex("MainTex", 2D) = "black"{}
        _DissolveTex("DissolveTex(R)", 2D) = "white"{}
        _Clip("Clip", Range(0,1)) = 0
    }
    SubShader
    {
        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"

            sampler2D _MainTex;
            sampler2D _DissolveTex;
            // 声明
            float4 _DissolveTex_ST; // xyzw ===> (Tilling.x, Tilling.y, Offset.x, Offset.y)
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
                // float4 dissolveUV:TEXCOORD1; // 减少使用额外的参数，改为上面的uv的xy存储主贴图uv.xy，zw存储噪音图uv.xy
            };

            v2f vert (appdata v)
            {
                v2f o;
                o.vertex = UnityObjectToClipPos(v.vertex);
                // o.uv.xy = v.uv * _DissolveTex_ST.xy + _DissolveTex_ST.zw; // 不能修改主贴图uv，因为希望仅影响噪音图的uv
                o.uv.xy = v.uv.xy; // uv的xy存储主贴图uv.xy，zw存储噪音图uv.xy
                o.uv.zw = TRANSFORM_TEX(v.uv.xy, _DissolveTex); // 相当于 v.uv * _DissolveTex_ST.xy + _DissolveTex_ST.zw
                return o;
            }

            fixed4 frag (v2f i):SV_Target
            {
                fixed4 tex = tex2D(_MainTex, i.uv.xy);
                // 优化: uv计算放到顶点着色器中
                // fixed4 dissolveTex = tex2D(_DissolveTex, i.uv * _DissolveTex_ST.xy + _DissolveTex_ST.zw); // rgba
                fixed4 dissolveTex = tex2D(_DissolveTex, i.uv.zw); // 噪音图采样颜色 rgba
                // 0 <= dissolveTex.r <= 1
                // 0 <= _Clip <= 1
                // 当 dissolveTex.r - _Clip < 0 则舍弃
                clip(dissolveTex.r - _Clip);
                return tex;
            }
            ENDCG
        }
    }
}
