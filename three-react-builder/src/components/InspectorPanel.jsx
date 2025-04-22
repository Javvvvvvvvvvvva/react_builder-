import React, { useState, useEffect } from 'react';
import * as THREE from 'three';

export default function InspectorPanel({ selectedMesh }) {
  const [color, setColor] = useState('#ff88aa');
  const [scale, setScale] = useState({ x: 1, y: 1, z: 1 });
  const [rotationY, setRotationY] = useState(0);
  const [metalness, setMetalness] = useState(0.5);
  const [roughness, setRoughness] = useState(0.5);
  const [opacity, setOpacity] = useState(1);
  const [transparent, setTransparent] = useState(false);
  const [material, setMaterial] = useState(null);

  useEffect(() => {
    if (selectedMesh) {
      const mesh = selectedMesh?.isGroup ? selectedMesh.children[0] : selectedMesh;
      const mat = mesh?.material;
      setMaterial(mat);

      const hexColor = mat?.color?.getHexString?.() || 'ffffff';

      setColor('#' + hexColor);
      setScale({
        x: mesh.scale?.x || 1,
        y: mesh.scale?.y || 1,
        z: mesh.scale?.z || 1,
      });
      setRotationY(THREE.MathUtils.radToDeg(mesh.rotation?.y || 0));
      setMetalness(mat?.metalness ?? 0.5);
      setRoughness(mat?.roughness ?? 0.5);
      setOpacity(mat?.opacity ?? 1);
      setTransparent(mat?.transparent ?? false);
    }
  }, [selectedMesh]);

  const applyChanges = () => {
    if (!selectedMesh || !material) return;
    const mesh = selectedMesh?.isGroup ? selectedMesh.children[0] : selectedMesh;

    material.color?.set?.(color);
    material.metalness = metalness;
    material.roughness = roughness;
    material.transparent = transparent || opacity < 1;
    material.opacity = opacity;
    material.wireframe = transparent;
    material.depthWrite = !material.transparent;
    material.needsUpdate = true;

    mesh.scale.set(scale.x, scale.y, scale.z);
    mesh.rotation.y = THREE.MathUtils.degToRad(rotationY);
  };

  const handleDelete = () => {
    if (!selectedMesh) return;
    const parent = selectedMesh.parent;
    selectedMesh.traverse((child) => {
      if (child.isMesh) {
        child.geometry?.dispose?.();
        child.material?.dispose?.();
      }
    });
    parent?.remove(selectedMesh);
  };

  const handleTextureUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !material) return;

    const loader = new THREE.TextureLoader();
    const url = URL.createObjectURL(file);

    loader.load(url, (texture) => {
      material.map = texture;
      material.needsUpdate = true;
    });
  };

  if (!selectedMesh) return null;

  return (
    <div style={styles.panel}>
      <h3>Inspector</h3>

      <div style={styles.row}>
        <label style={{ flex: '0 0 50px' }}>Color:</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          style={{ width: '100%', height: '30px', border: 'none', background: 'none', cursor: 'pointer' }}
        />
      </div>

      <label>Upload Texture:</label>
      <input type="file" accept="image/*" onChange={handleTextureUpload} style={styles.input} />

      <label>Scale:</label>
      <div style={styles.column}>
        <input type="number" step="0.1" value={scale.x} onChange={e => setScale({ ...scale, x: parseFloat(e.target.value) })} style={styles.input} placeholder="X" />
        <input type="number" step="0.1" value={scale.y} onChange={e => setScale({ ...scale, y: parseFloat(e.target.value) })} style={styles.input} placeholder="Y" />
        <input type="number" step="0.1" value={scale.z} onChange={e => setScale({ ...scale, z: parseFloat(e.target.value) })} style={styles.input} placeholder="Z" />
      </div>

      <label>Rotate Y (deg):</label>
      <input type="number" value={rotationY} onChange={e => setRotationY(parseFloat(e.target.value))} style={styles.input} />

      <br></br><label>Metalness:</label>
      <input type="range" min="0" max="1" step="0.01" value={metalness} onChange={e => setMetalness(parseFloat(e.target.value))} style={styles.slider} />

      <label>Roughness:</label>
      <input type="range" min="0" max="1" step="0.01" value={roughness} onChange={e => setRoughness(parseFloat(e.target.value))} style={styles.slider} />

      <label>Opacity:</label>
      <input type="range" min="0" max="1" step="0.01" value={opacity} onChange={e => setOpacity(parseFloat(e.target.value))} style={styles.slider} />

      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <input type="checkbox" checked={transparent} onChange={(e) => setTransparent(e.target.checked)} />
        Transparent (wireframe)
      </label>

      <div style={styles.row}>
        <button onClick={applyChanges} style={styles.button}>Apply</button>
        <button onClick={handleDelete} style={styles.deleteButton}>Delete</button>
      </div>
    </div>
  );
}

const styles = {
  panel: {
    position: 'absolute',
    top: '100px',
    right: '20px',
    backgroundColor: '#1e1e1e',
    color: 'white',
    padding: '20px',
    borderRadius: '10px',
    zIndex: 100,
    width: '260px',
    fontFamily: 'sans-serif',
  },
  row: {
    display: 'flex',
    gap: '6px',
    marginBottom: '10px',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '10px',
  },
  input: {
    flex: 1,
    padding: '6px',
    backgroundColor: '#333',
    border: '1px solid #444',
    color: '#eee',
    borderRadius: '4px',
    marginBottom: '10px',
  },
  slider: {
    width: '100%',
    marginBottom: '10px',
  },
  button: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#00cc88',
    border: 'none',
    borderRadius: '5px',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  deleteButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#cc0044',
    border: 'none',
    borderRadius: '5px',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
  }
};
