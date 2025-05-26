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

  const renderMetadataGroup = (title, keys) => (
    <div className="mb-3">
      <h6>{title}</h6>
      <ul className="list-group list-group-flush">
        {keys.map((key) =>
          metadata[key] ? (
            <li key={key} className="list-group-item px-0 py-1">
              <strong>{key}:</strong> {metadata[key].description || metadata[key].value?.toString()}
            </li>
          ) : null
        )}
      </ul>
    </div>
  );

  return (
    <div className="container mt-6">
      <div className="row">
        <div className="col-md-3">
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {imagePreview && (
            <div className="mt-3">
              <img style={{
                    height: "45%",
                    width: "45%"
                    }} 
                    src={imagePreview} alt="Preview" className="img-fluid" />
            </div>
          )}
        </div>
        <div className="col-md-9">
          {/* Subset Metadata
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
          */}

          {/* Full Metadata
          {metadata && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Image Metadata</h5>
                <ul className="list-group list-group-flush">
                  {Object.entries(metadata).map(([key, tag]) => (
                    <li key={key} className="list-group-item">
                      <strong>{key}:</strong> {tag.description || tag.value?.toString()}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}*/}

          {metadata && (
            <div className="card mt-4">
              <div className="card-body">
                <h5 className="card-title">Grouped Image Metadata</h5>
                <div className="row">
                  <div className="col-md-4">
                    {renderMetadataGroup("📍 Location", ["GPSLatitude", "GPSLongitude", "GPSAltitude"])}
                  </div>
                  <div className="col-md-4">
                    {renderMetadataGroup("📷 Camera Info", ["Make", "Model", "LensModel"])}
                  </div>
                  <div className="col-md-4">
                    {renderMetadataGroup("🔧 Shooting Settings", ["ExposureTime", "FNumber", "ISOSpeedRatings"])}
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-md-6">
                    {renderMetadataGroup("🗓️ Date & Time", ["DateTimeOriginal", "DateTime"])}
                  </div>
                  <div className="col-md-6">
                    {renderMetadataGroup("🖼️ Image Properties", ["Orientation", "ImageWidth", "ImageHeight"])}
                  </div>
                </div>
              </div>
            </div>
          )}


        </div>
      </div>
    </div>
  );
};

export default ImageUpload;