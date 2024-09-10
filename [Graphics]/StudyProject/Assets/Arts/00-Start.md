# Shader学习笔记

## 1. 一些名词
Unlit: 不受灯光影响的

## 2. 数据类型
`float` 32位精度，用于世界坐标、UV坐标等  
`half` 16位精度，用于本地坐标、方向向量等  
`fixed` 16位精度，-2～2，用于常规的颜色与贴图等  
`integer` 整型，用于循环与数组的索引

1. PC浮点数都要用float，移动端可选half和fixed提升性能
2. 类型+数字，如 `float2,float3,float4` 代表多个float来表示2,3,4维变量

## 3. 空间变换

投影的目的是为了从观察空间转换到齐次裁剪空间

观察空间(右手坐标系)中心点在屏幕中心

本地空间=>(模型变换)=>世界空间=>(视图变化)=>相机空间=>(投影变换)=>裁剪空间

矩阵变换运算符

```
mul(M,V);
M=矩阵
V=向量
```

## 4. 顶点着色器和片段着色器区别

1. 计算复杂度不同，因此计算尽量放到顶点着色器，如渲染一个三角形，包含3个顶点，光栅化为25个片段，那么顶点着色器计算3次，片段着色器计算25次
2. 实现功能不同：顶点着色器定义形态并准备属性数据传递给片段着色器，片段着色器输出颜色


## 5. 图形计算器

`https://www.geogebra.org/graphing`

## 6. 常用的cginc

`HLSLSupport.cginc`: 编译 CGPROGRAM 时自动包含此文件，其中声明了很多预处理器宏帮助多平台开发

`UnityShaderVariables.cginc`: 编译 CGPROGRAM 时自动包含此文件，其中声明了很多内置的全局变量

`UnityCG.cginc`: 需手动添加，声明了很多内置的帮助函数和结构

获取路径：`/Applications/Unity/Unity.app/Contents/CGIncludes/xxx.cginc`

使用方法：  
```
CGPROGRAM
#include "UnityCG.cginc"
ENDCG
```

## 7. 创建Shader仅保留必要代码

```
Shader "Unlit/MyShader"
{
    Properties
    {
        
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

            v2f vert (appdata v)
            {
                v2f o;
                o.vertex = UnityObjectToClipPos(v.vertex);
                return o;
            }

            fixed4 frag (v2f i) : SV_Target
            {
                return 1;
            }
            ENDCG
        }
    }
}
```
