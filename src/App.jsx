// src/App.jsx
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import ImageUpload from './ImageUpload';

function App() {
  return (
    <div className="App">
      <h1 className="text-center mt-3">Image EXIF Metadata Viewer</h1>
      <ImageUpload />
    </div>
  );
}

export default App;