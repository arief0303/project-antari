import React from 'react';
import './App.css';
import * as BABYLON from 'babylonjs';
import Stats from 'stats-js';

var statsFPS = new Stats();
statsFPS.domElement.style.cssText = "position:absolute;top:3px;left:3px;";
statsFPS.showPanel(0); // 0: fps,

var statsMemory = new Stats();
statsMemory.showPanel(2); //2: mb, 1: ms, 3+: custom
statsMemory.domElement.style.cssText = "position:absolute;top:3px;left:84px;";

//add stats for FPS and Memory usage
document.body.appendChild(statsFPS.dom);
document.body.appendChild(statsMemory.dom);

function App() {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const engine = new BABYLON.Engine(canvas, true);

    const createScene = () => {
      const scene = new BABYLON.Scene(engine);
      const camera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0, 5, -10), scene);
      camera.setTarget(BABYLON.Vector3.Zero());
      camera.attachControl(canvas, true);

      new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);

      BABYLON.MeshBuilder.CreateSphere('sphere', { diameter: 2 }, scene);

      return scene;
    };

    const scene = createScene();

    engine.runRenderLoop(() => {
      scene.render();
      statsFPS.update();
      statsMemory.update();
    });

    const resize = () => {
      engine.resize();
    };

    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      scene.dispose();
      engine.dispose();
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh' }} />
  );
}

export default App;
