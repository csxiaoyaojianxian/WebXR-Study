precision lowp float;
varying vec2 vUv;
void main(){
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vUv = uv;
    gl_Position = projectionMatrix * viewMatrix * modelPosition;
}

