vec3 RipplePing(in vec2 uv, in vec2 center, in float innerTail, in float frontierBorder, in float timeResetSeconds, in float RipplePingSpeed, in float fadeDistance, float t) {
  vec2 diff = center - uv;
  float r = length(diff);
  float time = mod(t, timeResetSeconds) * RipplePingSpeed;
  float circle;
  circle += smoothstep(time - innerTail, time, r) * smoothstep(time + frontierBorder, time, r);
  circle *= smoothstep(fadeDistance, 0.0, r);
  return vec3(circle);
}

czm_material czm_getMaterial(czm_materialInput materialInput) {
  czm_material m = czm_getDefaultMaterial(materialInput);
  vec2 uv = materialInput.st;
  uv = uv.xy * 2.;
  uv += vec2(-1.0, -1.0);
  float fadeDistance = 1.8;
  float resetTimeSec = 5.;
  float RipplePingSpeed = 0.2;

  vec2 greenPing = vec2(0.0, 0.0);
  vec3 outColor;
  float iTime = czm_frameNumber * 0.01;

  outColor += RipplePing(uv, greenPing, 0.08, 0.00025, resetTimeSec, RipplePingSpeed, fadeDistance, iTime);
  outColor += RipplePing(uv, greenPing, 0.08, 0.00025, resetTimeSec, RipplePingSpeed, fadeDistance, iTime + 1.5);
  outColor += RipplePing(uv, greenPing, 0.08, 0.00025, resetTimeSec, RipplePingSpeed, fadeDistance, iTime + 3.0);

  m.diffuse = outColor * color.xyz;
  m.alpha = outColor.r;
  return m;
}