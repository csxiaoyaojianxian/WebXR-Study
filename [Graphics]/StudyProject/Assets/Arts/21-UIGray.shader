// UI去色
Shader "Unlit/UIGray"
{
    Properties
    {
        // UI 必须用内置的一些变量，关联贴图，对应 Source Image
        // PerRendererData 配合 GetPropertyBlock/SetPropertyBlock 使用，用于统一修改全部用到该Shader的材质，此处设置后在面板中参数置灰，因为已经对应 Source Image
        [PerRendererData]_MainTex("MainTex", 2D) = "white"{}
    }
    SubShader
    {
        Tags{"Queue" = "Transparent"}
        // 固定使用此 Blend
        Blend SrcAlpha OneMinusSrcAlpha

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
