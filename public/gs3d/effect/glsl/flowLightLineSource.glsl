float SPEED_STEP = 0.01;

vec4 drawLight(float xPos, vec2 st, float headOffset, float tailOffset, float widthOffset) {

  float lineLength = smoothstep(xPos + headOffset, xPos, st.x) - smoothstep(xPos, xPos - tailOffset, st.x);
  float lineWidth = smoothstep(widthOffset, 0.5, st.y) - smoothstep(0.5, 1.0 - widthOffset, st.y);

  return vec4(lineLength * lineWidth);
}

czm_material czm_getMaterial(czm_materialInput materialInput) {
  vec4 v4_core;
  vec4 v4_color;
  float xPos = 0.0;

  czm_material m = czm_getDefaultMaterial(materialInput);
  float sinTime = sin(czm_frameNumber * SPEED_STEP * speed);
  if(sinTime < 0.0) {
    xPos = cos(czm_frameNumber * SPEED_STEP * speed) + 1.0 - tailsize;
  } else {
    xPos = -cos(czm_frameNumber * SPEED_STEP * speed) + 1.0 - tailsize;
  }

  v4_color = drawLight(xPos, materialInput.st, headsize, tailsize, widthoffset);
  v4_core = drawLight(xPos, materialInput.st, coresize, coresize * 2.0, widthoffset * 2.0);

  m.diffuse = color.xyz + v4_core.xyz * v4_core.w * 0.8;
  m.alpha = pow(v4_color.w, 3.0);
  return m;
}