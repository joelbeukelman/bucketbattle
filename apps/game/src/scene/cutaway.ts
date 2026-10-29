import * as THREE from 'three';

/**
 * Shared uniforms for the "cutaway" effect (W11): fragments of anything standing between
 * the camera and the player are dithered away so the player is never hidden. Works with
 * InstancedMesh because it runs in the shader, not per object. Shadows are unaffected.
 */
export const cutawayUniforms = {
  uBBPlayer: { value: new THREE.Vector3() },
  uBBCamera: { value: new THREE.Vector3() },
  uBBRadius: { value: 4 },
};

export function applyCutaway<T extends THREE.Material>(material: T): T {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, cutawayUniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vBBWorld;')
      .replace(
        '#include <project_vertex>',
        `#include <project_vertex>
        vec4 bbWorld = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          bbWorld = instanceMatrix * bbWorld;
        #endif
        vBBWorld = (modelMatrix * bbWorld).xyz;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vBBWorld;\nuniform vec3 uBBPlayer;\nuniform vec3 uBBCamera;\nuniform float uBBRadius;',
      )
      .replace(
        'void main() {',
        `void main() {
        {
          vec3 seg = uBBPlayer - uBBCamera;
          float len = length(seg);
          vec3 dir = seg / len;
          float t = dot(vBBWorld - uBBCamera, dir);
          // Only cut what is clearly in front of the player (t < len - radius), so walls
          // just behind or beside the player stay solid.
          if (t > 0.0 && t < len - uBBRadius) {
            float dist = length(vBBWorld - (uBBCamera + dir * t));
            float checker = mod(floor(gl_FragCoord.x) + floor(gl_FragCoord.y), 2.0);
            if (dist < uBBRadius * 0.65 || (dist < uBBRadius && checker < 1.0)) discard;
          }
        }`,
      );
  };
  material.customProgramCacheKey = () => 'bb-cutaway';
  return material;
}
