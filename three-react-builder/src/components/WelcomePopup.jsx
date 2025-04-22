import React, { useState } from 'react';

export default function WelcomePopup() {
  const [show, setShow] = useState(true); 
  const closePopup = () => setShow(false);

  if (!show) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.popup}>
        <h2>👋 Welcome to 3D Builder!</h2>
        <p>
          🧱 Use the dropdown to select a shape<br />
          ➕ Click <b>Add Shape</b> to place it on the grid<br />
          🎨 Click a shape to edit color, size, material<br />
          💾 Use the ⬇️ Download button to save your scene!
        </p>
        <button style={styles.button} onClick={closePopup}>Got It!</button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    maxWidth: '400px',
    textAlign: 'center',
    boxShadow: '0 0 20px rgba(0,0,0,0.3)',
    fontFamily: 'sans-serif',
  },
  button: {
    marginTop: '1rem',
    padding: '10px 20px',
    background: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};
