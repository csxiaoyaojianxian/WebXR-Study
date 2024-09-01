// [Unity Shader整体结构] shader路径可以自由定义
Shader "victor/FrameWork"
{
	SubShader
	{
		pass
		{
			CGPROGRAM
			#pragma vertex vert
			#pragma fragment frag
			#include "UnityCG.cginc"

			// 获取模型本身数据的结构
			struct appdata
			{
				// POSITION 表示顶点在模型空间中的位置
				float4 vertex	:POSITION;
				float4 color    :COLOR;
			};

			struct v2f
			{
				// SV_POSITION 表示顶点在屏幕空间中的位置
				float4 pos	:SV_POSITION;
			};

			/*
			float4 vert(appdata v):SV_POSITION
			{
			}
			*/
			// 简写为
			v2f vert(appdata v)
			{
				// 定义变量并初始化，否则部分gpu可能报错
				v2f o = (v2f)0;

				// 【1】
				// o.pos = v.vertex; // 传入的本地空间向量
				// o.pos = mul(unity_ObjectToWorld, v.vertex); // unity_ObjectToWorld矩阵: 传入的本地空间向量转换为世界空间向量
				// o.pos = mul(UNITY_MATRIX_VP, mul(unity_ObjectToWorld, v.vertex)); // UNITY_MATRIX_VP矩阵: 世界空间向量转换为投影空间向量

				// 【2】unity封装了 UnityObjectToClipPos: 本地空间=>齐次裁剪空间
				o.pos = UnityObjectToClipPos(v.vertex);
				
				return o;
			}

			float4 frag(v2f i):SV_TARGET
			{
				// return 1; // 相当于 return float4(1,1,1,1);
				fixed4 value = fixed4(0.5, 0.2, 2, 0.8);
				// 四维向量的分量有两种取值方式 rgba xyzw，实质没有区别，建议颜色用 rgba 更直观
				// return value.r; // 渲染为灰色，相当于 return float4(0.5,0.5,0.5,0.5);
				// return value.arbg; // 渲染为淡紫色，相当于 return float4(0.8,0.5,2,0.2);
				// return value.axbg; // [错误] !!!rgba和xyzw不可以混用!
				// return value;
				return i.pos;
			}

			ENDCG
		}
	}
}