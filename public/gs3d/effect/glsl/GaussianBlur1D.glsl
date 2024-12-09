// 高斯模糊，摘改自源码着色器 GaussianBlur1D.glsl
#define SAMPLES 32

uniform sampler2D colorTexture;

uniform float delta;
uniform float sigma;
uniform float stepSize;
uniform float direction;

in vec2 v_textureCoordinates;

// Incremental Computation of the Gaussian:
// https://developer.nvidia.com/gpugems/GPUGems3/gpugems3_ch40.html

void main() {
    vec2 st = v_textureCoordinates;
    vec2 dir = vec2(1.0 - direction, direction);
    vec2 step = vec2(stepSize * (czm_pixelRatio / czm_viewport.zw));
    vec3 g;

    g.x = 1.0 / (sqrt(czm_twoPi) * sigma);
    g.y = exp((-0.5 * delta * delta) / (sigma * sigma));
    g.z = g.y * g.y;
    vec4 result = texture(colorTexture, st) * g.x;

    for(int i = 1; i < SAMPLES; ++i) {

        g.xy *= g.yz;
        vec2 offset = float(i) * dir * step;
        result += texture(colorTexture, st - offset) * g.x;
        result += texture(colorTexture, st + offset) * g.x;
    }
    out_FragColor = result;

    // if(czm_selected()){
    //   out_FragColor = result;
    // }else{
    //   out_FragColor=texture(colorTexture, st);
    //   // out_FragColor=vec4(1.0,1.0,1.0,1.0);
    // };
}