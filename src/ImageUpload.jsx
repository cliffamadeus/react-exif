import React, { useState } from 'react';
import ExifReader from 'exifreader';

const ImageUpload = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [metadata, setMetadata] = useState(null);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Process EXIF metadata
      try {
        const tags = await ExifReader.load(file);
        console.log('EXIF Metadata:', tags); // Log metadata for debugging
        setMetadata(tags);
      } catch (error) {
        console.error('Error processing EXIF data:', error);
      }
    }
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-6">
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {imagePreview && (
            <div className="mt-3">
              <img src={imagePreview} alt="Preview" className="img-fluid" />
            </div>
          )}
        </div>
        <div className="col-md-6">
          {metadata && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Image Metadata</h5>
                <p className="card-text">
                  <strong>Latitude:</strong> {metadata.GPSLatitude?.description}<br />
                  <strong>Longitude:</strong> {metadata.GPSLongitude?.description}<br />
                  <strong>Date:</strong> {metadata.DateTime?.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;