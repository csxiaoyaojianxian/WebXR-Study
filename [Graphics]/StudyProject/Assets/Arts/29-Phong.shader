// 结合26，在Lambert漫反射基础上加上高光处理
Shader "Unlit/29-Phong"
{
    Properties
    {
        _DiffuseIntensity("Diffuse Intensity", float) = 1
        // 高光参数
        _SpecularColor("Specular Color", Color) = (1,1,1,1)
        _SpecularIntensity("Specular Intensity", float) = 1
        _Shininess("Shininess", float) = 1
    }
    SubShader
    {
        Tags { "RenderType"="Opaque" }

        Pass
        {
            Tags {"LightMode"="ForwardBase"}
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"
            #include "Lighting.cginc"

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
                float3 worldPos: TEXCOORD2;
            };

            half _DiffuseIntensity;
            //
            fixed4 _SpecularColor;
            half _SpecularIntensity, _Shininess;

            v2f vert (appdata v)
            {
                v2f o;
                o.vertex = UnityObjectToClipPos(v.vertex);
                o.worldNormal = UnityObjectToWorldNormal(v.normal);
                o.worldPos = mul(unity_ObjectToWorld, v.vertex);
                return o;
            }

            fixed4 frag (v2f i) : SV_Target
            {
                // Lambert公式: Diffuse = Ambient + Kd * LightColor * max(0,dot(N,L))
                fixed4 Ambient = unity_AmbientSky;
                half Kd = _DiffuseIntensity;
                fixed4 LightColor = _LightColor0;
                fixed3 N = normalize(i.worldNormal);
                fixed3 L = _WorldSpaceLightPos0;
                fixed MdotL = dot(N, L);
                fixed4 Diffuse = Ambient + Kd * LightColor * MdotL;

                fixed3 V = normalize(_WorldSpaceCameraPos - i.worldPos);
                // fixed3 R = 2 * MdotL * N - L;
                fixed3 R = reflect(-L, N); // reflect(I, N) 根据入射光方向向量I和顶点法向量N，计算反射光方向向量
                
                // Phong公式: Sepcular = SepcularColor * Ks * pow(max(0, dot(R, V)), Shininess)
                // fixed4 Specular = _SpecularColor * _SpecularIntensity * pow(max(0, dot(R,V)), _Shininess);
                // return Diffuse + Specular;

                // Blinn-Phong公式: Sepcular = SepcularColor * Ks * pow(max(0, dot(N, H)), Shininess)
                fixed3 H = normalize(L + V);
                fixed4 BlinnSpecular = _SpecularColor * _SpecularIntensity * pow(max(0, dot(N,H)), _Shininess);
                return Diffuse + BlinnSpecular;
            }
            ENDCG
        }

    }
}
