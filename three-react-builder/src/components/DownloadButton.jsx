import React from 'react';
import * as THREE from 'three';

export default function DownloadButton() {
  const handleDownload = () => {
    const sceneMeshes = [];
    const canvas = document.querySelector('.webgl');
    const renderer = canvas?.__renderer;
    const scene = renderer?.__scene;

    if (!scene) return;

    scene.traverse((obj) => {
      if (obj.isMesh && obj.userData.placed) {
        sceneMeshes.push({
          type: obj.geometry.type,
          position: obj.position,
          scale: obj.scale,
          rotation: obj.rotation,
          material: {
            color: obj.material.color.getHex(),
            metalness: obj.material.metalness,
            roughness: obj.material.roughness,
            opacity: obj.material.opacity,
            transparent: obj.material.transparent,
            wireframe: obj.material.wireframe,
            map: obj.material.map?.image?.src || null,
          },
        });
      }
    });

    const data = JSON.stringify(sceneMeshes, null, 2);
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>My 3D Scene</title>
  <style>
    body { margin: 0; overflow: hidden; }
    canvas { display: block; }
  </style>
</head>
<body>
  <script type="module">
    import * as THREE from 'https://cdn.skypack.dev/three@0.152.2';
    import { OrbitControls } from 'https://unpkg.com/three@0.152.2/examples/jsm/controls/OrbitControls.js?module';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(innerWidth, innerHeight);
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 10, 0);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const grid = new THREE.GridHelper(30, 30);
    scene.add(grid);

    const objects = ${data};

    const loader = new THREE.TextureLoader();

    const addObject = (obj) => {
      let geometry;
      switch (obj.type) {
        case 'BoxGeometry': geometry = new THREE.BoxGeometry(1, 1, 1); break;
        case 'SphereGeometry': geometry = new THREE.SphereGeometry(0.5, 32, 32); break;
        case 'CylinderGeometry': geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32); break;
        case 'TorusKnotGeometry': geometry = new THREE.TorusKnotGeometry(0.4, 0.15, 100, 16); break;
        default: return;
      }

      const matOptions = {
        color: obj.material.color,
        metalness: obj.material.metalness,
        roughness: obj.material.roughness,
        opacity: obj.material.opacity,
        transparent: obj.material.transparent,
        wireframe: obj.material.wireframe,
      };

      const material = new THREE.MeshStandardMaterial(matOptions);

      if (obj.material.map) {
        loader.load(obj.material.map, (texture) => {
          material.map = texture;
          material.needsUpdate = true;
        });
      }

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(obj.position);
      mesh.scale.copy(obj.scale);
      mesh.rotation.set(obj.rotation._x, obj.rotation._y, obj.rotation._z);
      scene.add(mesh);
    };

    objects.forEach(addObject);

    window.addEventListener('resize', () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    });

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    animate();
  </script>
</body>
</html>
    `.trim();

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'scene.html';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button onClick={handleDownload} style={styles.button}>
      ⬇️ Download Scene
    </button>
  );
}

const styles = {
  button: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    padding: '10px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    zIndex: 200,
  },
};
