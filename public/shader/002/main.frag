precision mediump float;

uniform sampler2D textureUnit0;
uniform sampler2D textureUnit1;
uniform sampler2D textureUnit2;
uniform sampler2D textureUnit3;
uniform sampler2D textureUnit4;
uniform sampler2D textureUnit5;
uniform sampler2D textureUnit6;
uniform sampler2D textureUnit7;
uniform float ratio;
uniform float type;
uniform float isBlend1;
uniform float isBlend2;
uniform float isBlend3;
uniform float isBlend4;
uniform float isBlend5;
uniform float isBlend6;

varying vec2 vTexCoord;

float quadraticInOut(float t) {
  float p = 2.0 * t * t;
  return t < 0.5 ? p : -p + (4.0 * t) - 1.0;
}

void main() {
  vec4 samplerColor0 = texture2D(textureUnit0, vTexCoord);
  vec4 samplerColor1 = texture2D(textureUnit1, vTexCoord);

  float offset = quadraticInOut(ratio) * .1 + .9;
  vec2 offsetTexCoord = vec2(vTexCoord.x * offset, vTexCoord.y);

  vec4 noiseColor1 = texture2D(textureUnit2, offsetTexCoord);
  vec4 noiseColor2 = texture2D(textureUnit3, offsetTexCoord);
  vec4 noiseColor3 = texture2D(textureUnit4, offsetTexCoord);
  vec4 noiseColor4 = texture2D(textureUnit5, offsetTexCoord);
  vec4 noiseColor5 = texture2D(textureUnit6, offsetTexCoord);
  vec4 noiseColor6 = texture2D(textureUnit7, offsetTexCoord);

  vec4 outColor = vec4(0.0);

  if( type == 0.0 ) {

    float r = clamp(ratio,0.0, 1.0);
    float counter = 1.0;

    if( isBlend1 == 1.0 ) {
      r += clamp(noiseColor1.r + ratio * 2.0 - 1.0,0.0, 1.0);
      counter += 1.0;
    }
    if( isBlend2 == 1.0 ) {
      r += clamp(noiseColor2.r + ratio * 2.0 - 1.0,0.0, 1.0);
      counter += 1.0;
    }
    if( isBlend3 == 1.0 ) {
      r += clamp(noiseColor3.r + ratio * 2.0 - 1.0,0.0, 1.0);
      counter += 1.0;
    }
    if( isBlend4 == 1.0 ) {
      r += clamp(noiseColor4.r + ratio * 2.0 - 1.0,0.0, 1.0);
      counter += 1.0;
    }
    if( isBlend5 == 1.0 ) {
      r += clamp(noiseColor5.r + ratio * 2.0 - 1.0,0.0, 1.0);
      counter += 1.0;
    }
    if( isBlend6 == 1.0 ) {
      r += clamp(noiseColor6.r + ratio * 2.0 - 1.0,0.0, 1.0);
      counter += 1.0;
    }

    outColor = mix(samplerColor0, samplerColor1, r / counter);

  } else if( type == 1.0 ) {
    outColor = noiseColor1;
  } else if( type == 2.0 ) {
    outColor = noiseColor2;
  } else if( type == 3.0 ) {
    outColor = noiseColor3;
  } else if( type == 4.0 ) {
    outColor = noiseColor4;
  } else if( type == 5.0 ) {
    outColor = noiseColor5;
  } else if( type == 6.0 ) {
    outColor = noiseColor6;
  }

  // vec4 outColor = mix(samplerColor0, samplerColor1, r);
  gl_FragColor = outColor;
}

