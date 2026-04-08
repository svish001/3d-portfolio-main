import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import setCharacter from "./utils/character";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/LoadingProvider";
import handleResize from "./utils/resizeUtils";
import {
  handleMouseMove,
  handleTouchEnd,
  handleHeadRotation,
  handleTouchMove,
} from "./utils/mouseUtils";
import setAnimations from "./utils/animationUtils";
import { setProgress } from "../Loading";

const createGlasses = () => {
  const glasses = new THREE.Group();

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: "#111111",
    roughness: 0.35,
    metalness: 0.45,
  });

  const lensMaterial = new THREE.MeshPhysicalMaterial({
    color: "#9ed0ff",
    transparent: true,
    opacity: 0.12,
    roughness: 0.1,
    transmission: 0.85,
    thickness: 0.025,
  });

  const rimGeometry = new THREE.TorusGeometry(0.15, 0.015, 10, 32);
  const lensGeometry = new THREE.CircleGeometry(0.135, 32);
  const bridgeGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.11, 12);
  const armGeometry = new THREE.CylinderGeometry(0.009, 0.009, 0.22, 8);

  const leftRim = new THREE.Mesh(rimGeometry, frameMaterial);
  const rightRim = new THREE.Mesh(rimGeometry, frameMaterial);
  leftRim.position.set(-0.18, 0, 0);
  rightRim.position.set(0.18, 0, 0);

  const leftLens = new THREE.Mesh(lensGeometry, lensMaterial);
  const rightLens = new THREE.Mesh(lensGeometry, lensMaterial);
  leftLens.position.set(-0.18, 0, 0.012);
  rightLens.position.set(0.18, 0, 0.012);

  const bridge = new THREE.Mesh(bridgeGeometry, frameMaterial);
  bridge.rotation.z = Math.PI / 2;
  bridge.position.z = 0.002;

  const leftArm = new THREE.Mesh(armGeometry, frameMaterial);
  const rightArm = new THREE.Mesh(armGeometry, frameMaterial);
  leftArm.rotation.x = Math.PI / 2;
  rightArm.rotation.x = Math.PI / 2;
  leftArm.position.set(-0.32, -0.015, -0.09);
  rightArm.position.set(0.32, -0.015, -0.09);

  glasses.add(leftRim, rightRim, leftLens, rightLens, bridge, leftArm, rightArm);
  glasses.position.set(0, 0.19, 0.53);
  glasses.rotation.x = 0.04;
  glasses.name = "hero-glasses";

  return glasses;
};

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef(new THREE.Scene());
  const { setLoading, setIsLoading } = useLoading();

  const [character, setChar] = useState<THREE.Object3D | null>(null);
  useEffect(() => {
    if (canvasDiv.current) {
      let rect = canvasDiv.current.getBoundingClientRect();
      let container = { width: rect.width, height: rect.height };
      const aspect = container.width / container.height;
      const scene = sceneRef.current;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: "high-performance",
      });
      renderer.setSize(container.width, container.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      canvasDiv.current.appendChild(renderer.domElement);

      const camera = new THREE.PerspectiveCamera(14.5, aspect, 0.1, 1000);
      camera.position.z = 10;
      camera.position.set(0, 13.1, 24.7);
      camera.zoom = 1.1;
      camera.updateProjectionMatrix();

      let headBone: THREE.Object3D | null = null;
      let screenLight: any | null = null;
      let mixer: THREE.AnimationMixer;

      const clock = new THREE.Clock();

      const light = setLighting(scene);
      let progress = setProgress((value) => setLoading(value));
      const { loadCharacter } = setCharacter(renderer, scene, camera);

      loadCharacter().then((gltf) => {
        if (gltf) {
          const animations = setAnimations(gltf);
          hoverDivRef.current && animations.hover(gltf, hoverDivRef.current);
          mixer = animations.mixer;
          let character = gltf.scene;
          setChar(character);
          scene.add(character);
          headBone = character.getObjectByName("spine006") || null;
          if (headBone && !headBone.getObjectByName("hero-glasses")) {
            headBone.add(createGlasses());
          }
          screenLight = character.getObjectByName("screenlight") || null;
          progress.loaded().then(() => {
            setTimeout(() => {
              light.turnOnLights();
              animations.startIntro();
            }, 2500);
          });
        }
      }).catch((error) => {
        console.error("Character model failed to load", error);
        setLoading(100);
        setIsLoading(false);
      });

      const onResize = () => {
        if (!character) return;
        handleResize(renderer, camera, canvasDiv, character);
      };
      window.addEventListener("resize", onResize);

      let mouse = { x: 0, y: 0 },
        interpolation = { x: 0.1, y: 0.2 };

      const onMouseMove = (event: MouseEvent) => {
        handleMouseMove(event, (x, y) => (mouse = { x, y }));
      };
      const onTouchMove = (event: TouchEvent) => {
        handleTouchMove(event, (x, y) => (mouse = { x, y }));
      };

      const onTouchStart = (event: TouchEvent) => {
        const element = event.target as HTMLElement;
        element?.addEventListener("touchmove", onTouchMove, { passive: true });
      };

      const onTouchEnd = () => {
        handleTouchEnd((x, y, interpolationX, interpolationY) => {
          mouse = { x, y };
          interpolation = { x: interpolationX, y: interpolationY };
        });
      };

      document.addEventListener("mousemove", onMouseMove);
      const landingDiv = document.getElementById("landingDiv");
      if (landingDiv) {
        landingDiv.addEventListener("touchstart", onTouchStart, {
          passive: true,
        });
        landingDiv.addEventListener("touchend", onTouchEnd);
      }

      renderer.setAnimationLoop(() => {
        if (headBone) {
          handleHeadRotation(
            headBone,
            mouse.x,
            mouse.y,
            interpolation.x,
            interpolation.y,
            THREE.MathUtils.lerp
          );
          light.setPointLight(screenLight);
        }
        const delta = clock.getDelta();
        if (mixer) {
          mixer.update(delta);
        }
        renderer.render(scene, camera);
      });

      return () => {
        renderer.setAnimationLoop(null);
        scene.clear();
        renderer.dispose();
        window.removeEventListener("resize", onResize);
        if (canvasDiv.current) {
          canvasDiv.current.removeChild(renderer.domElement);
        }
        if (landingDiv) {
          document.removeEventListener("mousemove", onMouseMove);
          landingDiv.removeEventListener("touchstart", onTouchStart);
          landingDiv.removeEventListener("touchmove", onTouchMove);
          landingDiv.removeEventListener("touchend", onTouchEnd);
        }
      };
    }
  }, []);

  return (
    <>
      <div className="character-container">
        <div className="character-model" ref={canvasDiv}>
          <div className="character-rim"></div>
          <div className="character-hover" ref={hoverDivRef}></div>
        </div>
      </div>
    </>
  );
};

export default Scene;
