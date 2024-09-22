// Upgrade NOTE: replaced '_LightMatrix0' with 'unity_WorldToLight'

// 结合26
Shader "Unlit/28-Lambert"
{
    Properties
    {
        //
        _DiffuseIntensity("Diffuse Intensity", float) = 1
    }
    SubShader
    {
        Tags { "RenderType"="Opaque" }

        // ForwardBase
        Pass
        {
            // ForwardBase 仅用于平行灯
            Tags {"LightMode"="ForwardBase"}
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"
            // 使用内置变量
            #include "Lighting.cginc"

            struct appdata
            {
                float4 vertex : POSITION;
                float2 uv : TEXCOORD0;
                // 法线向量
                half3 normal: NORMAL;
            };

            struct v2f
            {
                float2 uv : TEXCOORD0;
                float4 vertex : SV_POSITION;
                // 法线向量
                half3 worldNormal: TEXCOORD1;
            };

            //
            half _DiffuseIntensity;

            v2f vert (appdata v)
            {
                v2f o;
                o.vertex = UnityObjectToClipPos(v.vertex);
                //
                o.worldNormal = UnityObjectToWorldNormal(v.normal);
                return o;
            }

            fixed4 frag (v2f i) : SV_Target
            {
                // 参考笔记26
                // _LightColor0 内置主平行灯的颜色值 rgb颜色x亮度 a亮度
                // _WorldSpaceLightPos0 世界坐标系下的灯位置，平行灯(xyz=位置，z=0)，其他类型灯(xyz=位置，z=1)
                // unity_AmbientSky 环境光(Gradient)中的Sky Color
                // unity_AmbientEquator 环境光(Gradient)中的Equator Color
                // unity_AmbientGround 环境光(Gradient)中的Ground Color

                // Lambert公式: Diffuse = Ambient + Kd * LightColor * max(0,dot(N,L))
                fixed4 Ambient = unity_AmbientSky;
                half Kd = _DiffuseIntensity;
                fixed4 LightColor = _LightColor0;
                fixed3 N = normalize(i.worldNormal);
                fixed3 L = _WorldSpaceLightPos0;
                fixed4 Diffuse = Ambient + Kd * LightColor * max(0, dot(N,L));

                return Diffuse;
            }
            ENDCG
        }


        // ForwardAdd
        Pass
        {
            // ForwardAdd 可用于非平行灯
            Tags {"LightMode"="ForwardAdd"}
            // 修改混合模式
            Blend One one

            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            // 定义灯光宏，用于后面区分灯光类型
            #pragma multi_compile_fwdadd
            // 剔除不需要的变体
            #pragma skip_variants DIRECTIONAL DIRECTIONAL_COOKIE POINT_COOKIE
            #include "UnityCG.cginc"
            #include "Lighting.cginc"
            // 用于使用衰减的textrue
            #include "AutoLight.cginc"


            struct appdata
            {
                float4 vertex : POSITION;
                float2 uv : TEXCOORD0;
                half3 normal: NORMAL;
            };

            struct v2f
            {
                float2 uv : TEXCOORD0;
                float4 vertex : SV_POSITION;
                half3 worldNormal: TEXCOORD1;
                //
                float3 worldPos: TEXCOORD2;
            };

            half _DiffuseIntensity;

            v2f vert (appdata v)
            {
                v2f o;
                o.vertex = UnityObjectToClipPos(v.vertex);
                o.worldNormal = UnityObjectToWorldNormal(v.normal);
                // unity_WorldToLight 从世界空间转换到灯光空间下，等同于旧版的 _LightMatrix0
                o.worldPos = mul(unity_WorldToLight, v.vertex);
                return o;
            }

            fixed4 frag (v2f i) : SV_Target
            {
                // #if DIRECTIONAL // 平行灯走到ForwardBase了，没有走到这个paas
                // return 1;
                // #elif POINT
                // return fixed4(0,1,0,1); // green
                // #elif SPOT
                // return fixed4(0,0,1,1); // blue
                // #endif

                // 处理衰减
                // float2 lightCoord = mul(unity_WorldToLight, float4(i.worldPos, 1)).xyz;
                // fixed atten = tex2D(_LightTexture0, i.uv); // 衰减纹理图，从左到右，白到黑
                // 使用内置函数实现上面的衰减
                UNITY_LIGHT_ATTENUATION(atten, 0, i.worldPos);

                fixed4 LightColor = _LightColor0 * atten;
                fixed3 N = normalize(i.worldNormal);
                fixed3 L = _WorldSpaceLightPos0;
                fixed4 Diffuse = LightColor * max(0, dot(N,L));

                return Diffuse;
            }
            ENDCG
        }
    }
}
