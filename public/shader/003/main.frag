precision mediump float;

uniform vec2 resolution;
uniform float time;
uniform vec4 param;

const float EPS = 0.0001; // イプシロン（微小な値の意）
const int ITR = 100; // イテレーション回数
const float pi = 3.1415926;
const float pi2 = pi * 2.0;

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

mat2 rot(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c,s,-s,c);
}

vec2 pmod(vec2 p, float r) {
    float a = atan(p.x, p.y) + pi/r;
    float n = pi2 / r;
    a = floor(a/n)*n;
    return p*rot(-a);
}

vec3 repetition(vec3 p, vec3 width) {
  return mod(p, width) - width * 0.5;
}

float map(vec3 p) {
  float d = 1e5;

  p.z = repetition(p, vec3(7.0)).z;

  for(int i=0; i<4; i++) {
    p.xy=pmod(p.xy,8.);
    p.y-=1.*float(i);
  }

  d = min(d, sdBox(p, vec3(2., .15, .5)));

  return d;
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
  float focus = 1.0 + param.x;
  vec3 rayDirection = normalize(vec3(p, -focus));

  vec3 origin = vec3(0.0, 0.01, 15.0 - time * 1.5);
  vec3 ray = origin;
  float dist = 0.0;

  float minDist = 1e5;

  for (int i = 0; i < ITR; ++i) {
    dist = map(ray);
    ray += rayDirection * dist;

    minDist = min(minDist, dist);

    if (dist < EPS) {
      break;
    }
  }

  vec3 destColor = vec3(0.0);
  
  vec3 eColor = hsv2rgb(vec3(time * .05, 1.0, 1.0)) * 2.;
  float em = pow(minDist + 2., -2.);
  float e = sin(time) * .1 + .8;
  destColor += em * eColor * e;

  if (dist < EPS) {
    destColor += eColor;
  }

  gl_FragColor = vec4(destColor, 1.0);
}