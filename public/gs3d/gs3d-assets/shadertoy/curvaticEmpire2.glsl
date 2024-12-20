// 于2023/12/14摘自于 https://www.shadertoy.com/view/lstSzj 的像素着色器片段

#define speed  0.1

float hash(float n) {
    return fract(sin(n) * 43.5453);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 q = fragCoord.xy / iResolution.xy;
    vec2 p = -1.0 + 2.0 * q;
    p.x *= iResolution.x / iResolution.y;

	// camera	
    vec3 ro = vec3(sin(iTime * 0.16), 0., cos(iTime * 0.1));
    vec3 ta = ro + vec3(sin(iTime * 0.15), sin(iTime * 0.18), cos(iTime * 0.24));
    float roll = 0.0;

	// camera tx
    vec3 cw = normalize(ta - ro);
    vec3 cp = vec3(sin(roll), cos(roll), 0.0);
    vec3 cu = normalize(cross(cp, cw));
    vec3 rd = normalize(p.x * cu + p.y * cp + cw * 2.0);

    //volumetric rendering
    vec3 v = vec3(0.);
    for(float s = 0.1; s <= 5.0; s += 0.1) {
        //float spread = hash(rd.x+rd.y+rd.z);
        vec3 p = ro + rd * s;

        for(float i = 0.1; i < 1.; i += 0.12) {
            p = abs(p) / dot(p + sin(iTime * 0.1) * 0.1, p) - 0.5; // the magic formula
            float a = length(p); // absolute sum of average change
            v += vec3(i, i * i, i * i * i) * a * 0.12; // coloring based on distance
        }

    }
    fragColor = vec4(v * .01, 1.);

}