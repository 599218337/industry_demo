uniform sampler2D colorTexture;

uniform vec3 marsColor;
uniform float marsOpacity;

uniform float smoothWidth;
uniform float threshold;

in vec2 v_textureCoordinates;

void main() {
  vec4 marstexel = texture(colorTexture, v_textureCoordinates);

    #ifdef CZM_SELECTED_FEATURE
  if(!czm_selected()) {
    marstexel = vec4(0.);
  }
    #endif

  vec3 luma = vec3(0.299, 0.587, 0.114);
  float marsv = dot(marstexel.xyz, luma);

  vec4 outputColor = vec4(marsColor.rgb, marsOpacity);

  float alpha = smoothstep(threshold, threshold + smoothWidth, marsv);

  out_FragColor = mix(outputColor, marstexel, alpha);
}