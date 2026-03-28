export default function PrescriptionModal({ record, onClose }) {
  if (!record) return null;

  // Use optional chaining carefully to avoid crashes
  const prescription = record.result?.prescription || {};
  const medications = prescription.medications || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close-btn">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
        </button>

        <div className="modal-split">
          
          {/* LEFT SIDE: Image */}
          <div className="modal-pane modal-pane-left">
            <h3 className="pane-title">Prescription Image</h3>
            <div className="image-wrapper">
              <img src={record.image} alt="Prescription Scan" />
            </div>
          </div>

          {/* RIGHT SIDE: Extracted Details */}
          <div className="modal-pane modal-pane-right">
            <h3 className="pane-title">Extracted Details</h3>
            
            <div className="pane-scroll">
              
              <div className="detail-group">
                <div className="detail-label group-label">👨‍⚕️ Doctor / Clinic</div>
                <div className="detail-text">Name: {record.result?.doctor?.name || "N/A"}</div>
                <div className="detail-text">Clinic: {record.result?.clinic?.name || "N/A"}</div>
                {record.result?.doctor?.qualification && <div className="detail-text">Qualification: {record.result?.doctor?.qualification}</div>}
              </div>

              <div className="detail-group">
                <div className="detail-label group-label">🧑 Patient Details</div>
                <div className="detail-text">Name: {record.result?.patient?.name || "Unknown"}</div>
                <div className="detail-text">Age/Gender: {record.result?.patient?.age} {record.result?.patient?.gender}</div>
              </div>

              <div className="detail-group">
                <div className="detail-label group-label">❤️ Vital Signs</div>
                <div className="vitals-grid" style={{ marginTop: '0.8rem', gap: '0.5rem' }}>
                  <div className="vital-card">
                    <span className="vital-label">BP</span>
                    <span className="vital-value">{prescription.vitalSigns?.bloodPressure || "-"}</span>
                  </div>
                  <div className="vital-card">
                    <span className="vital-label">Temp</span>
                    <span className="vital-value">{prescription.vitalSigns?.temperature || "-"}</span>
                  </div>
                  <div className="vital-card">
                    <span className="vital-label">Pulse</span>
                    <span className="vital-value">{prescription.vitalSigns?.pulse || "-"}</span>
                  </div>
                </div>
              </div>

              {prescription.diagnosis && (
                <div className="detail-row">
                  <span className="detail-label">Diagnosis:</span>
                  <span className="detail-value">{prescription.diagnosis}</span>
                </div>
              )}

              {medications.length > 0 && (
                <div className="detail-group">
                  <div className="detail-label group-label">Medications:</div>
                  <div className="meds-list">
                    {medications.map((m, i) => (
                      <div key={i} className="meds-item">
                        <div className="meds-name">{m.name}</div>
                        {m.generic && <div className="meds-sub">Generic: {m.generic}</div>}
                        {m.dosage && <div className="meds-sub">Dosage: {m.dosage}</div>}
                        {m.frequency && <div className="meds-sub">Frequency: {m.frequency}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {prescription.notes && (
                <div className="detail-group">
                  <div className="detail-label group-label">Notes:</div>
                  <div className="detail-text">{prescription.notes}</div>
                </div>
              )}

              {prescription.followUp && (
                <div className="detail-group">
                  <div className="detail-label group-label">Follow Up:</div>
                  <div className="detail-text">{prescription.followUp}</div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}