import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function CanvasScene({ onSelectMesh }) {
  const canvasRef = useRef();
  const placing = useRef(false);
  const preview = useRef(null);
  const selectedShape = useRef('box');
  const dragging = useRef(false);
  const selectedMesh = useRef(null);
  const clickedMesh = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 5);

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 10, 0);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const grid = new THREE.GridHelper(30, 30);
    scene.add(grid);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide })
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const shapes = {
      box: new THREE.BoxGeometry(1, 1, 1),
      sphere: new THREE.SphereGeometry(0.5, 32, 32),
      cylinder: new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
      torusknot: new THREE.TorusKnotGeometry(0.4, 0.15, 100, 16),
    };

    const previewMat = new THREE.MeshStandardMaterial({
      color: 0x8888ff,
      transparent: true,
      opacity: 0.5,
    });

    const onMouseMove = (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const hit = raycaster.intersectObject(ground)[0];
      if (!hit) return;

      const x = Math.round(hit.point.x);
      const z = Math.round(hit.point.z);
      const y = selectedShape.current === 'torusknot' ? 1 : 0.5;

      if (dragging.current && selectedMesh.current) {
        selectedMesh.current.position.set(x, y, z);
        return;
      }

      if (placing.current) {
        if (preview.current) {
          scene.remove(preview.current);
          preview.current.geometry.dispose();
        }
        const geom = shapes[selectedShape.current].clone();
        preview.current = new THREE.Mesh(geom, previewMat);
        preview.current.position.set(x, y, z);
        scene.add(preview.current);
      }
    };

    const onClick = (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const hit = raycaster.intersectObject(ground)[0];
      if (!hit) return;

      if (placing.current && preview.current) {
        const mesh = new THREE.Mesh(
          preview.current.geometry.clone(),
          new THREE.MeshStandardMaterial({ color: 0xff88aa })
        );
        mesh.position.copy(preview.current.position);
        mesh.userData.placed = true;
        scene.add(mesh);

        placing.current = false;
        document.body.style.cursor = 'default';
        scene.remove(preview.current);
        preview.current.geometry.dispose();
        preview.current = null;
        return;
      }

      const intersects = raycaster.intersectObjects(scene.children, true);
      for (const hit of intersects) {
        const obj = hit.object;
        if (obj.userData.placed && obj.geometry) {
          if (onSelectMesh) onSelectMesh(obj);
          break;
        }
      }
    };

    const onMouseDown = (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children);
      for (const hit of intersects) {
        if (hit.object.userData.placed && hit.object.geometry) {
          selectedMesh.current = hit.object;
          clickedMesh.current = hit.object;
          dragging.current = true;
          controls.enabled = false;
          break;
        }
      }
    };

    const onMouseUp = () => {
      dragging.current = false;
      selectedMesh.current = null;
      controls.enabled = true;
    };

    const onDoubleClick = (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children, true);
      for (const hit of intersects) {
        const obj = hit.object;
        if (obj.userData.placed && obj.geometry) {
          scene.remove(obj);
          obj.geometry.dispose();
          obj.material.dispose();
          if (onSelectMesh) onSelectMesh(null);
          break;
        }
      }
    };

    const addBtn = document.getElementById('addBoxBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        placing.current = true;
        document.body.style.cursor = 'crosshair';
      });
    }

    const selector = document.getElementById('shapeSelector');
    if (selector) {
      selector.addEventListener('change', (e) => {
        selectedShape.current = e.target.value;
      });
    }

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);
    window.addEventListener('dblclick', onDoubleClick);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });


    renderer.__scene = scene;
    canvasRef.current.__renderer = renderer;

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
      window.removeEventListener('dblclick', onDoubleClick);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onSelectMesh]);

  return <canvas className="webgl" ref={canvasRef} />;
}
