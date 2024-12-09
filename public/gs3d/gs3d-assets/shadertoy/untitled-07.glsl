// 于2023/12/14摘自于 https://www.shadertoy.com/view/lsd3D2 的像素着色器片段

#define PI 3.141592654
#define EPSILON 0.0000001
#define AMPLITUDE 0.52
#define SPEED 0.05
#define rgb(r,g,b) (vec3(r,g,b)/255.)

//------------------------------------------------------------------ VISUAL QUALITY
#define RAYMARCHING_STEP 65
#define RAYMARCHING_JUMP 1.

//------------------------------------------------------------------ DEBUG
//#define RENDER_DEPTH
//#define RENDER_NORMAL
//#define RENDER_AO

//------------------- FORMULAS/MAGIC

float length2( vec2 p )
{
	return sqrt( p.x*p.x + p.y*p.y );
}
float length6( vec2 p )
{
	p = p*p*p; p = p*p;
	return pow( p.x + p.y, 1.0/6.0 );
}
float length8( vec2 p )
{
	p = p*p; p = p*p; p = p*p;
	return pow( p.x + p.y, 1.0/8.0 );
}

vec4 vec4pow( in vec4 v, in float p ) {
    // Don't touch alpha (w), we use it to choose the direction of the shift
    // and we don't want it to go in one direction more often than the other
    return vec4(pow(v.x,p),pow(v.y,p),pow(v.z,p),v.w); 
}

vec4 permute(vec4 x){return mod(x*x*34.0+x,289.);}

float snoise(vec3 v){
  const vec2  C = vec2(0.166666667, 0.33333333333) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod(i,289.);
  vec4 p = permute( permute( permute(
	  i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
	+ i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
	+ i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  vec3 ns = 0.142857142857 * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = floor(j - 7.0 * x_ ) *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = inversesqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m * m;
  return .5 + 12.0 * dot( m, vec4( dot(p0,x0), dot(p1,x1),dot(p2,x2), dot(p3,x3) ) );
}

// Maximum/minumum elements of a vector
float vmax(vec2 v) {
	return max(v.x, v.y);
}

float vmax(vec3 v) {
	return max(max(v.x, v.y), v.z);
}

float vmax(vec4 v) {
	return max(max(v.x, v.y), max(v.z, v.w));
}

float hash( float n ){//->0:1
	return fract(sin(n)*3538.5453);
}

float smin( float a, float b )
{
    float k = .1;
    float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
}

float displacement( vec3 p, float v ) {
  float f = iTime * -0.5 + sin( iTime * 2. ) * 1.4;
  return sin( 20. * sin( cos( f ) ) *p.x)*sin( 10. *sin( cos( f ) ) *p.y)*sin( 30. * sin( cos( f ) ) *p.z);
}

// Repeat around the origin by a fixed angle.
// For easier use, num of repetitions is use to specify the angle.
float pModPolar(inout vec2 p, float repetitions, float dis) {
	float angle = 2.*PI/repetitions;
	float a = atan(p.y+0.0000001, p.x+0.0000001) + angle/2.;
	float r = length(p);
	float c = floor(a/angle);
	a = mod(a,angle) - angle/2.;
	p = vec2(cos(a), sin(a))*r + 0.0000001;
	// For an odd number of repetitions, fix cell index of the cell in -x direction
	// (cell index would be e.g. -5 and 5 in the two halves of the cell):
	if (abs(c) >= (repetitions/2.)) c = abs(c);
	return c;
}

// Repeat around the origin by a fixed angle.
// For easier use, num of repetitions is use to specify the angle.
float pModPolar(inout vec2 p, float repetitions) {
	float angle = 2.*PI/repetitions;
	float a = atan(p.y+0.0000001, p.x+0.0000001) + angle/2.;
	float r = length(p);
	float c = floor(a/angle);
	a = mod(a,angle) - angle/2.;
	p = vec2(cos(a), sin(a))*r + 0.0000001;
	// For an odd number of repetitions, fix cell index of the cell in -x direction
	// (cell index would be e.g. -5 and 5 in the two halves of the cell):
	if (abs(c) >= (repetitions/2.)) c = abs(c);
	return c;
}

// Repeat space along one axis. Use like this to repeat along the x axis:
// <float cell = pMod1(p.x,5);> - using the return value is optional.
float pMod1(inout float p, float size) {
	float halfsize = size*0.5;
	float c = floor((p + halfsize)/size);
	p = mod(p + halfsize, size) - halfsize;
	return c;
}

vec2 pMod2(inout vec2 p, vec2 size) {
	vec2 c = floor((p + size*0.5)/size);
	p = mod(p + size*0.5,size) - size*0.5;
	return c;
}


// Repeat only a few times: from indices <start> to <stop> (similar to above, but more flexible)
float pModInterval1(inout float p, float size, float start, float stop) {
	float halfsize = size*0.5;
	float c = floor((p + halfsize)/size);
	p = mod(p+halfsize, size) - halfsize;
	if (c > stop) { //yes, this might not be the best thing numerically.
		p += size*(c - stop);
		c = stop;
	}
	if (c <start) {
		p += size*(c - start);
		c = start;
	}
	return c;
}


float opS( float d1, float d2 )
{
    return max(-d1,d2);
}

float opU( float d1, float d2 )
{
    return min(d1,d2);
}

vec3 postEffects( in vec3 col, in vec2 uv, in float time )
{    
	// vigneting
    //col *= .9 + .2 * snoise( vec3( sin( iTime + uv.x ), cos( iTime + uv.y ), 0. ) );
	col *= 0.4+0.7*pow( 16.0*uv.x*uv.y*(1.0-uv.x)*(1.0-uv.y), 0.5 );
    //col += col * .05 * snoise( vec3( -uv.x * 400., uv.y * 400. , iTime * 2. ) );
    
    return col;
}

//------------------- CAMERA STUFF

vec3 orbit(float phi, float theta, float radius)
{
	return vec3(
		radius * sin( phi ) * cos( theta ),
		radius * cos( phi ),
		radius * sin( phi ) * sin( theta )
	);
}

mat3 setCamera( in vec3 ro, in vec3 ta, float cr )
{
	vec3 cw = normalize(ta-ro);
	vec3 cp = vec3(sin(cr), cos(cr),0.0);
	vec3 cu = normalize( cross(cw,cp) );
	vec3 cv = normalize( cross(cu,cw) );
	return mat3( cu, cv, cw );
}

//------------------- PRIMITIVES

vec2 rotate2D(vec2 p, float a) {
 return p * mat2(cos(a), -sin(a), sin(a),  cos(a));
}

float pyramid( vec3 p, float h) {
	vec3 q=abs(p);
	return max(-p.y, (q.x*1.5+q.y *.75+q.z*1.5-h)/3.0 );
}

float sphere( vec3 p, float r ) {
	return length( p ) - r;
}

// Box: correct distance to corners
float fBox(vec3 p, vec3 b) {
	vec3 d = abs(p) - b;
	return length(max(d, vec3(0))) + vmax(min(d, vec3(0)));
}

float dot2( in vec3 v ) { return dot(v,v); }
float udTriangle( vec3 p, vec3 a, vec3 b, vec3 c )
{
    vec3 ba = b - a; vec3 pa = p - a;
    vec3 cb = c - b; vec3 pb = p - b;
    vec3 ac = a - c; vec3 pc = p - c;
    vec3 nor = cross( ba, ac );

    return sqrt(
    (sign(dot(cross(ba,nor),pa)) +
     sign(dot(cross(cb,nor),pb)) +
     sign(dot(cross(ac,nor),pc))<2.0)
     ?
     min( min(
     dot2(ba*clamp(dot(ba,pa)/dot2(ba),0.0,1.0)-pa),
     dot2(cb*clamp(dot(cb,pb)/dot2(cb),0.0,1.0)-pb) ),
     dot2(ac*clamp(dot(ac,pc)/dot2(ac),0.0,1.0)-pc) )
     :
     dot(nor,pa)*dot(nor,pa)/dot2(nor) );
}

float sdHexPrism( vec3 p, vec2 h )
{
    vec3 q = abs(p);
    return max(q.z-h.y,max((q.x*0.866025+q.y*0.5),q.y)-h.x);
}

float pModSingle1(inout float p, float size) {
	float halfsize = size*0.5;
	float c = floor((p + halfsize)/size);
	if (p >= 0.)
		p = mod(p + halfsize, size) - halfsize;
	return c;
}

float sdTorus82( vec3 p, vec2 t )
{
  vec2 q = vec2(length2(p.xz)-t.x,p.y);
  return length8(q)-t.y;
}

float sdTorus88( vec3 p, vec2 t )
{
  vec2 q = vec2(length8(p.xz)-t.x,p.y);
  return length8(q)-t.y;
}

float sdCappedCylinder( vec3 p, vec2 h )
{
  vec2 d = abs(vec2(length(p.xz),p.y)) - h;
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}

//------------------- MAP

float repeatObj( vec3 p ) {
    
    float res;
    
    vec3 op = p;
    
    vec2 pi = vec2( 0., 0. );

    float idx1 = pModPolar( op.xy, 16., .0 );
    op.x -= 2.5;
    
    op.xy = rotate2D( op.xy, PI * .45 + idx1 );
    
    
    float idx2 = pModInterval1( op.y, .425, -2., 2. );
    
    float idx3 = pModInterval1( op.z, .17, -2., 2. );
    //op.xy = rotate2D( op.xy, PI * .05 * sin( idx3 + p.x * p.y + iTime ) );
    
    float obj =  fBox( op, vec3( .75, .05, 0.025 ) );
    return obj;
}

vec3 color;

float map( in vec3 p ) {
    
	float r;
    
    vec3 op = p;
    op.y -= 1.8;
    pMod1( op.z, 2. );
    float obj = sdHexPrism( op, vec2( 1.5, .4 ) );
    
    r = obj;
    
    obj = sdHexPrism( op, vec2( 1.2, 1.5 ) );
    obj = opS( obj, r );
    
    op = p;
    op.y -= 1.8;
    pMod1( op.z, 2. );
    r = repeatObj( op );
    obj = opU( r, obj );
    
    r = obj;
    
    
    ////
    
    op = p;
    op.x -= .25;
    op.y -= 2.;
    
    pMod1( op.z, 4. );
    op.xz = rotate2D( op.xz, PI * .5);
    op.xy = rotate2D( op.xy, PI * .5);
    obj = sdCappedCylinder( op, vec2( .25, .05 ) );
    
    //r = obj;
    float r2 = obj;
    
    op = p;
    op.x += .25;
    op.y -= 2.;
    pMod1( op.z, 4. );
    op.xz = rotate2D( op.xz, PI * .5);
    op.xy = rotate2D( op.xy, PI * .5);
    obj = sdCappedCylinder( op, vec2( .25, .05 ) );
    
    r2 = opU( r2, obj );
    
    op = p;
    op.y -= 1.78;
    op.z -= 4.;
    op.xy = rotate2D( op.xy, PI * .5);
    pMod1( op.z, 4. );
    op.yz = rotate2D( op.yz, PI * .5);
    op.zx = rotate2D( op.zx, PI * .25);
    obj = fBox( op, vec3( .27, .05, .27 ) );
    
    op = p;
    op.y -= 2.32;
    op.z -= 4.;
    op.xy = rotate2D( op.xy, PI * .5);
    pMod1( op.z, 4. );
    op.yz = rotate2D( op.yz, PI * .5);
    float objSub = fBox( op, vec3( .27, .5, .27 ) );
    
    obj = opS( objSub, obj );
    r2 = opU( r2, obj );
    
    ////
    
    float dist = distance( -op, p );
    float dist2 = distance( op, p );
    
    if( dist < dist2 ) { 
        color = rgb( 235., 56., 52. ); 
    } else {
        color = vec3( 1., 1., 1. );
    }
    
    r = opU( r, r2 );
    
    return r;
}

//------------------- RAYMARCHING

#ifdef RENDER_DEPTH
float castRay( in vec3 ro, in vec3 rd, inout float depth ) {
#else
float castRay( in vec3 ro, in vec3 rd ) {
#endif
    float t = 0.;
    float res;
    for( int i = 0; i < RAYMARCHING_STEP; i++ ) {
        vec3 pos = ro + rd * t;
        res = map( pos );
        if( res < .01 || t > 100. ) break;
        t += res * RAYMARCHING_JUMP;
        #ifdef RENDER_DEPTH
		depth += 1./float(RAYMARCHING_STEP);
		#endif
    }
    return t;
}

vec3 calcNormal(vec3 pos) {
    float eps = 0.001;
	const vec3 v1 = vec3( 1.0,-1.0,-1.0);
	const vec3 v2 = vec3(-1.0,-1.0, 1.0);
	const vec3 v3 = vec3(-1.0, 1.0,-1.0);
	const vec3 v4 = vec3( 1.0, 1.0, 1.0);
	return normalize( v1 * map( pos + v1*eps ) +
    	              v2 * map( pos + v2*eps ) +
        	          v3 * map( pos + v3*eps ) +
            	      v4 * map( pos + v4*eps ) );
}

float calcAO( in vec3 p, in vec3 n, float maxDist, float falloff ){
	float ao = 0.0;
	const int nbIte = 6;
	for( int i=0; i<nbIte; i++ )
	{
		float l = hash(float(i))*maxDist;
		vec3 rd = n*l;
		ao += (l - map( p + rd )) / pow(1.+l, falloff);
	}
	return clamp( 1.-ao/float(nbIte), 0., 1.);
}

// calculate local thickness
// base on AO but : inverse the normale & inverse the color
float thickness( in vec3 p, in vec3 n, float maxDist, float falloff )
{
	float ao = 0.0;
	const int nbIte = 6;
	for( int i=0; i<nbIte; i++ )
	{
		float l = hash(float(i))*maxDist;
		vec3 rd = -n*l;
		ao += (l + map( p + rd )) / pow(1.+l, falloff);
	}
	return clamp( 1.-ao/float(nbIte), 0., 1.);
}
    
vec3 sundir = normalize( vec3(-1.5,2.,-1.5) );

vec3 addLight( in vec3 posLight, in vec3 colLight, in vec3 nor, in vec3 pos, in vec3 ref, in float radius, in float specRatio ) {
    float thi = thickness(pos, nor, 6., 1.5);
    
    float intens = max( dot( nor, posLight ), 0. );
    float dist = length( posLight - pos );
    float att = clamp(1.0 - dist*dist/(radius*radius), 0.0, 1.0);
    att *= att;
    float specular = pow( clamp( dot( ref, posLight ), 0., 1.0 ), 16. );
    vec3 col = colLight * intens * att;
    col += specular * .5 * att * specRatio * thi;
    return col;
}  
    
vec3 render( in vec3 ro, in vec3 rd, in vec2 uv ) {     
    // sky
    vec3 colBg = mix(rgb(255,212,166), rgb(204,235,255), uv.y);
    // sun
    vec2 spos = uv - vec2(0.15, 0.4);
    float sun = exp(-45.*dot(spos,spos));
    vec3 scol = rgb(255,155,102) * sun * ( 0.8 + 0.1 * sin( iTime ) );
    colBg += scol;
    colBg = mix(0.8*rgb(235,56,52), colBg, smoothstep(-0.1,0.3,uv.y));
    colBg = pow(colBg,vec3(1.3));
    
    #ifdef RENDER_DEPTH
	float depth = 0.;
    float t = castRay( ro, rd, depth );
    #else
    float t = castRay( ro, rd );
    #endif
    
    #ifdef RENDER_DEPTH
    return vec3( depth / 5., depth, depth );
    #endif
    
    vec3 pos = ro + t * rd;
    vec3 nor = calcNormal( pos );
    
    #ifdef RENDER_NORMAL
    return nor;
    #endif
    
    float ao = calcAO( pos, nor, 10., 1.2 );
    #ifdef RENDER_AO
    return vec3( ao );
    #endif
    
    //vec3 light = vec3( 1.5, 1., 1. );
    
    vec3 ref = reflect( rd, nor );
    
    vec3 col = colBg;
    if( t < 9. ) {
        //col = rgb( 100, 177, 66 );
        //col = color * max( dot( ref, sundir ), 0. );
        col = color;
    }
    
    //col = colBg;
    // top blue light
    //col += addLight( vec3( .3, 5.,1. -iTime ), vec3( .498, .898, .952 ), nor, pos, ref, 6., 1. );
    // right green dark
    //col += addLight( vec3( 4.2, 1.5, 1. -iTime ), vec3( 0.06, .407, .27 ), nor, pos, ref, 6.25, 0. );
    // bottom right blue light
    //col += addLight( vec3( 5., -2., 1.85 -iTime ), vec3( 0.082, .443, .541 ), nor, pos, ref, 6., 0. );
    // bottom left red
    col += addLight( vec3( -4., 0., 1.85 -iTime ), vec3( 0.79, .168, .015 ), nor, pos, ref, 6., 0.25 );
    
    col += addLight( vec3( 0., 1.5, 1.5 -iTime ), vec3( 1., .0, 0. ), nor, pos, ref, 3.5, 0.5 );
    
    //col += .35 * addLight( vec3( 0.21, 2.85, .0 ), vec3( 1., 0.79, .16 ), nor, pos, ref, 4., .0 );
   
    //col += .1 * vec3( 1., 0.4, 0.2 ) * abs( pow( sun, 3. ) );
    //col += 2.1 * vec3( 1., 0.79, .16 ) * abs( pow( sun, 3. ) );
    col *= ao;
    
    col += addLight( vec3( .3, 6.,1. -iTime ), vec3( 1., 0., 0. ), nor, pos, ref, 6., 1. );
    col = mix( col, colBg, 1. - exp( -.0435 * t * t ) );
   // col = mix( col, colBg, 1. - exp( -.0495 * t * t ) );
    
    return col;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / iResolution.xy;
    vec2 p = -1. + 2. * uv;
    p.x *= iResolution.x / iResolution.y;
    
    //vec2 m = iMouse.xy/iResolution.xy;
    
    // Camera
	//vec3 ro = orbit( PI/2. - 3.2,PI/2.,-1.8 );
	//vec3 ta  = vec3( EPSILON, +.4, .5 );
    float radius = 4.6;
    vec3 ro = orbit(PI/2.-.5,PI/2. + .0 + iTime * .0,radius);
    ro.z -= iTime;
    vec3 ta = vec3( EPSILON );
    ta.z -= iTime;
    ta.y = 1.5;
   
    // Camera to world transformation
    mat3 ca = setCamera( ro, ta, EPSILON );
    
    // Ray direction
    vec3 rd = ca * normalize( vec3( p.xy, 1. ) );
    
    // Raymarching
    vec3 c = render( ro, rd, uv );
    c.r = smoothstep(0.0, 1.0, c.r);
	c.g = smoothstep(0.0, 1.0, c.g - 0.1);
	c.b = smoothstep(-0.3, 1.3, c.b);
    c = postEffects( c, uv, 0. );
    fragColor = vec4( c, 1. );
}