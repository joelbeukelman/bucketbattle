import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { City } from './scene/City';
import { Player } from './scene/Player';
import { Encounters } from './scene/Encounters';
import { CameraRig, CAMERA } from './scene/CameraRig';
import { Lighting } from './scene/Lighting';
import { Stats } from './scene/Stats';
import { Hud } from './hud/Hud';

export function App() {
  return (
    <>
      <Canvas
        shadows={{ type: THREE.PCFSoftShadowMap }}
        dpr={[1, 2]}
        camera={{ fov: CAMERA.fov, near: 5, far: 900 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <Lighting />
        <City />
        <Encounters />
        <Player />
        <CameraRig />
        <Stats />
      </Canvas>
      <Hud />
    </>
  );
}
