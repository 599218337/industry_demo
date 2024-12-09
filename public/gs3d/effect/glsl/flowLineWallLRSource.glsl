czm_material czm_getMaterial(czm_materialInput materialInput) {
  czm_material material = czm_getDefaultMaterial(materialInput);
  vec2 st = materialInput.st;
  vec4 colorImage = texture(image, vec2(fract((st.s - speed * czm_frameNumber * 0.005)), st.t));
  vec4 fragColor;
  fragColor.rgb = color.rgb / 1.0;
  fragColor = czm_gammaCorrect(fragColor);
  material.alpha = colorImage.a * color.a;
  material.diffuse = (colorImage.rgb + color.rgb) / 2.0;
  material.emission = fragColor.rgb;
  return material;
}