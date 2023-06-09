import React from 'react';
import './App.css';
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
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

      // Keyboard events
      var inputMap = {};
      scene.actionManager = new BABYLON.ActionManager(scene);
      scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
      }));
      scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
      }));

      loadAvatar();

      function loadAvatar() {
        BABYLON.SceneLoader.ImportMesh("", "assets/", "ybot.gltf", scene, function (newMeshes, particleSystems, skeletons, animationGroups) {

          shadowGenerator.addShadowCaster(scene.meshes[0], true);
          for (var index = 0; index < newMeshes.length; index++) {
            newMeshes[index].receiveShadows = false;;
          }

          var skeleton = skeletons[0];
          var hero = newMeshes[0];
          var animating = true;

          //Hero character variables 
          var heroSpeed = 0.03;
          var heroSpeedBackwards = 0.01;
          var heroRotationSpeed = 0.1;

          const walkAnim = scene.getAnimationGroupByName("walk");
          const walkBackAnim = scene.getAnimationGroupByName("walkBack");
          const idleAnim = scene.getAnimationGroupByName("idle");

          function followBehindMesh() {
            camera.target = new BABYLON.Vector3(hero.position.x, hero.position.y + 1.5, hero.position.z);
            camera.radius = 3;
          }
  
          scene.registerBeforeRender(followBehindMesh);
  

          scene.onBeforeRenderObservable.add(() => {
            var keydown = false;
            //Manage the movements of the character (e.g. position, direction)
            if (inputMap["w"]) {
              hero.moveWithCollisions(hero.forward.scaleInPlace(heroSpeed));
              keydown = true;
            }
            if (inputMap["s"]) {
              hero.moveWithCollisions(hero.forward.scaleInPlace(-heroSpeedBackwards));
              keydown = true;
            }
            if (inputMap["a"]) {
              hero.rotate(BABYLON.Vector3.Up(), -heroRotationSpeed);
              keydown = true;
            }
            if (inputMap["d"]) {
              hero.rotate(BABYLON.Vector3.Up(), heroRotationSpeed);
              keydown = true;
            }
            if (inputMap["b"]) {
              keydown = true;
            }

            //Manage animations to be played  
            if (keydown) {
              if (!animating) {
                animating = true;
                if (inputMap["s"]) {
                  //Walk backwards
                  walkBackAnim.start(true, 1.0, walkBackAnim.from, walkBackAnim.to, false);
                }
                else {
                  //Walk
                  walkAnim.start(true, 1.0, walkAnim.from, walkAnim.to, false);
                }
              }
            }
            else {

              if (animating) {
                //Default animation is idle when no key is down     
                idleAnim.start(true, 1.0, idleAnim.from, idleAnim.to, false);

                //Stop all animations besides Idle Anim when no key is down
                walkAnim.stop();
                walkBackAnim.stop();

                //Ensure animation are played only once per rendering loop
                animating = false;
              }
            }
          });

          /* var avatar = newMeshes[0];
          avatar.position = new BABYLON.Vector3(0, 0, 0);
          avatar.rotation = new BABYLON.Vector3(0, Math.PI, 0);
          skeleton.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
          skeleton.animationPropertiesOverride.enableBlending = true;
          skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
          skeleton.animationPropertiesOverride.loopMode = 1; */


          // IDLE
          // if (idleRange) scene.beginAnimation(skeleton, idleRange.from, idleRange.to, true);
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
