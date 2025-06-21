#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D tex0;
uniform vec2 resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  vec4 texColor = texture2D(tex0, uv);

  // 이걸로 확인: 이미지가 정말 붙는지
  gl_FragColor = texColor;
}