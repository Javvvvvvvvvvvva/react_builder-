import React from 'react';

export default function ShapeControls() {
  return (
    <div id="ui" style={styles.ui}>
      <div style={styles.column}>
        {/* Shape selector dropdown */}
        <select id="shapeSelector" style={styles.select}>
          <option value="box">Box</option>
          <option value="sphere">Sphere</option>
          <option value="cylinder">Cylinder</option>
          <option value="torusknot">Torus Knot</option>
        </select>

        {/* Add Shape Button */}
        <button id="addBoxBtn" style={styles.button}>+ Add Shape</button>
      </div>
    </div>
  );
}

const styles = {
  ui: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    zIndex: 10,
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  select: {
    padding: '8px',
    fontSize: '14px',
  },
  button: {
    padding: '8px 12px',
    backgroundColor: '#222',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};
