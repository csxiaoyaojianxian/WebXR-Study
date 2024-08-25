// [属性面板]
// properties 用于暴露一些参数
// 语法: [Attribute]_Name("Display Name",Type) = Default Value
//    _Name: 变量名
//    "Display Name": 暴露名
//    Type: 值类型
//    Default Value: 默认值
//    [Attribute]: [可选]特征

// 常用Type: color / int / float / Vector / 2D
// 常用通用特征: HideInInspector(参数面板隐藏) / Header(粗体标题(不能为中文)) / Space(空行)

// 纹理采样
// 1. 属性定义 `_Name("Display Name", 2D)=""{}`
// 2. CG中声明，如 `sampler2D _Name;`
// 3. 着色器中采样 `tex2D(_Name,uv);

Shader "Unlit/Properties"
{
    Properties
    {
        [Header(Base)] // 标题头(不能用中文)
        [Space(20)] // 空行

        // 属性定义
        _Color1("颜色", color) = (1,1,1,1)
        [HDR]_Color2("颜色", color) = (1,1,0,1)
        _Int1("整数", int) = 0.5 // 虽然可以输入小数，实际值取决于下方使用的数据类型
        [Toggle]_Int2("01开关", int) = 0
        _Float1("浮点数", float) = 0.5
        _Float2("浮点数带滑轨", range(0,10)) = 0.5
        [PowerSlider(3)]_Float3("浮点数带滑轨且修改滑轨数值比例", range(0,10)) = 0.5
        [PowerSlider(3)][IntRange]_Float4("浮点数带滑轨且PowerSlider失效", range(0,10)) = 0.5
        [IntRange]_Float5("浮点数带滑轨且滑轨值为整数", range(0,10)) = 0.5

        _Vector1("四维向量", vector) = (0.5, 0.5, 0.5, 1)
        _2DTex1("2D纹理", 2D) = "black"{}
        [NoScaleOffset][HideInInspector]_2DTex2("2D纹理", 2D) = "black"{} // 隐藏缩放参数、参数面板隐藏
    }
    SubShader
    {
        Tags { "RenderType"="Opaque" }
        LOD 100

        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"

            struct appdata
            {
                float4 vertex : POSITION;
            };

            struct v2f
            {
                float4 vertex : SV_POSITION;
            };

            // properties声明
            fixed4 _Color1;
            int _Int1;
            float _Float5;
            float4 _Vector1;

            v2f vert (appdata v)
            {
                v2f o;
                o.vertex = UnityObjectToClipPos(v.vertex);
                return o;
            }

            fixed4 frag (v2f i) : SV_Target
            {

                // 着色器中采样


                
                // return _Color1;
                return _Vector1;
            }
            ENDCG
        }
    }
}
