// [使用噪音图+火焰图实现火焰溶解效果]
Shader "Unlit/ramp"
{
    Properties
    {
        _MainTex("MainTex", 2D) = "black"{}
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
            #include "UnityCG.cginc"

            sampler2D _MainTex;
            sampler2D _DissolveTex;
            float4 _DissolveTex_ST;
            // sampler2D _RampTex; // 因为只用到了火焰图U方向纹理，因此可以优化为sampler
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
                fixed4 dissolveTex = tex2D(_DissolveTex, i.uv.zw);
                clip(dissolveTex.r - _Clip);
                // 重点在于火焰图uv的采样，目标：根据噪音图黑白变化，从火焰图采样，从噪音图黑色开始溶解，对应采样到火焰图黄白色区，白色则采样黑色区即显示主贴图原色
                // case1: tex2D(_RampTex, dissolveTex.r)
                //        根据噪音图的黑0白1从火焰图U(水平)方向采样，0黄白色 0.5红色 1黑色，黄白色会叠加明显，也会首先clip溶解，黑色会显示原本颜色，最后clip溶解
                // case2: tex2D(_RampTex, smoothstep(0,1,dissolveTex.r))
                //        引入 smoothstep(min,max,x) 平滑阶梯函数，在[min,max]返回在0到1之间的平滑过度值，否则根据区间返回0或1
                //        表示当 dissolveTex.r <= 0 时即噪音图黑色区域返回0，从火焰图U方向采样到黄白色，此时和case1效果相似，只是多了些平滑效果
                // case3: tex2D(_RampTex, smoothstep(_Clip,1,dissolveTex.r))
                //        将 min 从 0 修改为 _Clip，即噪音图采样值在[_Clip,1]时返回[0,1]的平滑值，实现了溶解边缘始终从0开始采样，即溶解边缘为黄白色
                // case4: tex2D(_RampTex, smoothstep(_Clip,_Clip+0.1,dissolveTex.r))
                //        _Clip+0.1 将溶解范围限制在临界值附近，实现溶解处附近出现过渡效果，而远离溶解处从火焰图采样到黑色，因此显示主贴图颜色
                //        注意: 噪音图不能出现死黑，否则_Clip=0也会出现溶解
                // case5: 优化1:smoothstep 性能消耗大，可以不用平滑插值，saturate 线性插值即可，可以参考 smoothstep 的公式
                // case6: 优化2:因为只用到了火焰图U方向纹理，因此变量可以优化为sampler，采样方式tex2D优化为tex1D
                // TODO: 不知为何火焰图U方向采样值为1时得到灰色，因此U方向采样值-0.001

                // fixed4 rampTex = tex2D(_RampTex, smoothstep(_Clip, _Clip + 0.1, dissolveTex.r) - 0.01);
                fixed4 rampTex = tex1D(_RampTex, saturate((dissolveTex.r - _Clip)/(_Clip + 0.1 - _Clip)) - 0.001); // (x-min)/(max-min)
                fixed4 c = tex + rampTex;
                return c;
            }
            ENDCG
        }
    }
}
