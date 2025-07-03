import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const ImageUpload = ({ 
  onUpload, 
  maxFiles = 1, 
  uploadType = 'recipe-image',
  existingImages = [],
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState(existingImages);
  const [error, setError] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      
      if (maxFiles === 1) {
        formData.append(uploadType === 'recipe-image' ? 'recipeImage' : 'stepImage', acceptedFiles[0]);
      } else {
        acceptedFiles.forEach(file => {
          formData.append('recipeImages', file);
        });
      }

      const endpoint = maxFiles === 1 ? uploadType : 'recipe-images';
      
      const response = await axios.post(
        `http://localhost:3001/api/v1/upload/${endpoint}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          }
        }
      );

      if (response.data) {
        const newImages = maxFiles === 1 
          ? [response.data.file] 
          : response.data.files;
        
        setUploadedImages(prev => [...prev, ...newImages]);
        
        if (onUpload) {
          onUpload(newImages);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [maxFiles, uploadType, onUpload]);

  const removeImage = async (imageIndex, filename) => {
    try {
      // Extract folder from uploadType
      const folder = uploadType.includes('step') ? 'steps' : 'recipes';
      
      await axios.delete(
        `http://localhost:3001/api/v1/upload/file/${filename}?folder=${folder}`,
        { withCredentials: true }
      );
      
      setUploadedImages(prev => prev.filter((_, index) => index !== imageIndex));
    } catch (err) {
      console.error('Error deleting image:', err);
      setError('Failed to delete image');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles,
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: uploading
  });

  return (
    <div className={`image-upload ${className}`}>
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`upload-zone ${isDragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p>Uploading... {uploadProgress}%</p>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">📷</div>
            <p>
              {isDragActive
                ? 'Drop images here...'
                : `Drag & drop ${maxFiles === 1 ? 'an image' : 'images'} here, or click to select`
              }
            </p>
            <p className="upload-info">
              Max {maxFiles} file{maxFiles > 1 ? 's' : ''} • JPG, PNG, GIF, WebP • Max 5MB each
            </p>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="upload-error">
          {error}
        </div>
      )}

      {/* Uploaded Images Gallery */}
      {uploadedImages.length > 0 && (
        <div className="uploaded-images">
          <h4>Uploaded Images</h4>
          <div className="images-grid">
            {uploadedImages.map((image, index) => (
              <div key={index} className="image-preview">
                <img 
                  src={image.url} 
                  alt={image.originalName || `Upload ${index + 1}`}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div className="image-overlay">
                  <button
                    type="button"
                    onClick={() => removeImage(index, image.filename)}
                    className="remove-image"
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
                <div className="image-info">
                  <p>{image.originalName}</p>
                  <p>{Math.round(image.size / 1024)}KB</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;