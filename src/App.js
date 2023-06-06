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
      var camera = new BABYLON.ArcRotateCamera("camera1", Math.PI / 2, Math.PI / 4, 3, new BABYLON.Vector3(0, 1, 0), scene);
      camera.attachControl(canvas, true);

      camera.lowerRadiusLimit = 2;
      camera.upperRadiusLimit = 10;
      camera.wheelDeltaPercentage = 0.01;

      var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
      light.intensity = 0.6;
      light.specular = BABYLON.Color3.Black();

      var light2 = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(0, -0.5, -1.0), scene);
      light2.position = new BABYLON.Vector3(0, 5, 5);

      // Shadows
      var shadowGenerator = new BABYLON.ShadowGenerator(1024, light2);
      shadowGenerator.useBlurExponentialShadowMap = true;
      shadowGenerator.blurKernel = 32;

      const ground = new BABYLON.MeshBuilder.CreateGround('ground', { width: 50, height: 50 }, scene);
      ground.checkCollisions = true;

      loadAvatar();

      function loadAvatar() {
        BABYLON.SceneLoader.ImportMesh("", "assets/", "dummy3.babylon", scene, function (newMeshes, particleSystems, skeletons, animationGroups) {
          var skeleton = skeletons[0];

          shadowGenerator.addShadowCaster(scene.meshes[0], true);
          for (var index = 0; index < newMeshes.length; index++) {
            newMeshes[index].receiveShadows = false;;
          }

          var avatar = newMeshes[0];
          avatar.position = new BABYLON.Vector3(0, 0, 0);
          avatar.rotation = new BABYLON.Vector3(0, Math.PI, 0);
          skeleton.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
          skeleton.animationPropertiesOverride.enableBlending = true;
          skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
          skeleton.animationPropertiesOverride.loopMode = 1;

          var idleRange = skeleton.getAnimationRange("YBot_Idle");
          var walkRange = skeleton.getAnimationRange("YBot_Walk");
          var runRange = skeleton.getAnimationRange("YBot_Run");
          var leftRange = skeleton.getAnimationRange("YBot_LeftStrafeWalk");
          var rightRange = skeleton.getAnimationRange("YBot_RightStrafeWalk");

          // IDLE
          if (idleRange) scene.beginAnimation(skeleton, idleRange.from, idleRange.to, true);
        });
      }

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
