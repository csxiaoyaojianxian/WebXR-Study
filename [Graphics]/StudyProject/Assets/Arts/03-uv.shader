// [UV采样混合与舍弃] Clip(x)，当x<0则舍弃

// UV的(0,0)在左下角

// UV 的 Tilling / Offset
// Tilling: 默认1，重复次数，可用于增加噪音图的密度
// Offset: 默认0，偏移，可用于做瀑布等特效
// 优化，计算放到顶点着色器

// [自发光]应用场景
// 1. 自发光效果，不受灯光影响
// 2. 被击时闪白表现
// 3. 中毒时变绿，火烧时变红等
// 4. 死亡时溶解消失

Shader "Unlit/uv"
{
    Properties
    {
        // 1.面板中贴图属性
        [Header(Base)]
        _MainTex("MainTex", 2D) = "black"{} // 因为_MainTex是unity默认的贴图名，使用这个名字可以实现shader切换时贴图不丢失
        _Color("Color", color) = (0,0,0,0) // 叠加颜色

        [Space(10)]
        [Header(Dissolve)]
        _DissolveTex("DissolveTex(R)", 2D) = "white"{} // 溶解贴图(噪音图)，取R通道
        _Clip("Clip", Range(0,1)) = 0 // 片段的舍弃，Clip(x)，当x<0则舍弃
    }
    SubShader
    {
        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"

            // 2.声明
            sampler2D _MainTex;
            fixed4 _Color;
            sampler2D _DissolveTex;
            fixed _Clip;

            struct appdata
            {
                float4 vertex   :POSITION;
                // 3.输入uv信息，输入端对语义要求严格，必须指明，如 TEXCOORD
                float4 uv       :TEXCOORD; // TEXCOORD0,TEXCOOR1表示第一套、第二套UV，默认用TEXCOORD
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
                // 4.uv赋值
                o.uv = v.uv;
                return o;
            }

            fixed4 frag (v2f i):SV_Target
            {
                fixed4 c;
                // 5.着色器中采样
                fixed4 tex = tex2D(_MainTex, i.uv); // rgba

                // 6.混合
                c = tex;
                // c = c * _Color; // (1) 乘法
                c += _Color; // (2) 加法，实现闪白、中毒等效果，加黑色表示显示原来的颜色

                // 7.clip舍弃片段
                // clip(tex.r - _Clip); // 效果不满足要求
                fixed4 dissolveTex = tex2D(_DissolveTex, i.uv); // rgba
                clip(dissolveTex.r - _Clip);

                return c;
            }
            ENDCG
        }
    }
}
