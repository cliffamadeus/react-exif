import React, { useState, useRef } from 'react';
import ExifReader from 'exifreader';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ImageUpload = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [mapCenter, setMapCenter] = useState([0, 0]);
  const [hasLocation, setHasLocation] = useState(false);
  const mapRef = useRef(null);
  const [originalCenter, setOriginalCenter] = useState([0, 0]);

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
        console.log('EXIF Metadata:', tags);
        setMetadata(tags);

        // Check for GPS coordinates
        if (tags.GPSLatitude && tags.GPSLongitude) {
          const lat = parseFloat(tags.GPSLatitude.description);
          const lng = parseFloat(tags.GPSLongitude.description);
          setMapCenter([lat, lng]);
          setOriginalCenter([lat, lng]); // Store original center for reset
          setHasLocation(true);
        } else {
          setHasLocation(false);
        }
      } catch (error) {
        console.error('Error processing EXIF data:', error);
        setHasLocation(false);
      }
    }
  };

  const handleResetMap = () => {
    if (mapRef.current && originalCenter) {
      mapRef.current.flyTo(originalCenter, 15);
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

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

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
          {metadata && (
            <button className="btn btn-primary mt-3" onClick={handleOpenModal}>
              View All Metadata
            </button>
          )}
        </div>
        <div className="col-md-9">
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

          {hasLocation && (
            <div className="card mt-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">Location Map</h5>
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={handleResetMap}
                    title="Reset map to original location"
                  >
                    <i className="bi bi-arrow-counterclockwise"></i> Reset View
                  </button>
                </div>
                <div style={{ height: '400px', width: '100%' }}>
                  <MapContainer 
                    center={mapCenter} 
                    zoom={15} 
                    style={{ height: '100%', width: '100%' }}
                    whenCreated={(map) => { mapRef.current = map; }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={mapCenter}>
                      <Popup>
                        Image was taken here<br />
                        Latitude: {mapCenter[0].toFixed(6)}<br />
                        Longitude: {mapCenter[1].toFixed(6)}
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            </div>
          )}

          {showModal && metadata && (
            <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-lg modal-dialog-scrollable" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">All EXIF Metadata</h5>
                    <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                  </div>
                  <div className="modal-body">
                    <ul className="list-group list-group-flush">
                      {Object.entries(metadata).map(([key, tag]) => (
                        <li key={key} className="list-group-item">
                          <strong>{key}:</strong> {tag.description || tag.value?.toString()}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                      Close
                    </button>
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