import { useState, useRef } from "react";
const BASE_URL = import.meta.env.BASE_URL;

export default function Upload({ onUpload, token }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (f) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("prescription", file);

    try {
      // Connect specifically passing JWT Ticket in Bearer auth
      const res = await fetch(`${BASE_URL}/api/ocr`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to process image on server');
      }

      // The new DB record is directly returned by the server containing proper DB IDs
      onUpload(data.data);

      setFile(null);
      setPreview(null);
    } catch (err) {
      alert("Upload failed. Make sure the backend API is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel upload-glass glass-animation">
      {!preview ? (
        <div 
          className={`upload-zone ${isDragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current.click()}
        >
          <input 
            type="file" 
            ref={inputRef}
            className="file-input"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files[0])} 
          />
          <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <div className="upload-text">Click to upload or drag & drop</div>
          <div className="upload-subtext">Supports PNG, JPG, JPEG</div>
        </div>
      ) : (
        <div className="preview-container">
          <img src={preview} className="image-preview" alt="Preview" />
          <div className="actions">
            <button className="btn btn-secondary" onClick={() => {setFile(null); setPreview(null);}} disabled={loading}>
              Clear
            </button>
            <button className="btn" onClick={handleUpload} disabled={loading}>
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Analyzing AI Data...
                </>
              ) : (
                <>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Extract Data
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}