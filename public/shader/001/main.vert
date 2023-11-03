const float PI  = 3.141592653589793;
const float PI2 = PI * 2.;

attribute float index;
attribute float num;

uniform float uN;
uniform float uD;
uniform float uTime;
uniform vec2 uResolution;

varying vec4 vColor;

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  vColor = vec4(hsv2rgb(vec3(fract(uTime), 1.0, 1.0)), 1.0);

  float angle = PI2 * uD * index / num;

  float r = .75;

  float range = r * sin(angle * (uN / uD));

  float x = range * cos(angle);
  float y = range * sin(angle);

  float scaleX = min(uResolution.y / uResolution.x, 1.0);
  float scaleY = min(uResolution.x / uResolution.y, 1.0);

  gl_Position = vec4(vec3(x * scaleX, y * scaleY, 0.0), 1.0);

  gl_PointSize = 5.0;
}

