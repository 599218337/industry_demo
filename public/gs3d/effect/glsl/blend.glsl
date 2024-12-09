// 混合
uniform sampler2D colorTexture;

uniform sampler2D bloomTexture;
uniform float ratio;
uniform vec4 color;

in vec2 v_textureCoordinates;

void main(void) {
    vec4 color1 = texture(colorTexture, v_textureCoordinates);

    vec4 bloom = texture(bloomTexture, v_textureCoordinates);
    bloom *= color; 

    #ifdef CZM_SELECTED_FEATURE
    if(czm_selected()) {
        bloom *= ratio;
    }
    #endif

    out_FragColor = bloom + color1;
}