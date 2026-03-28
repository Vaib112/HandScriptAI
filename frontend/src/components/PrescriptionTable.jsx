export default function PrescriptionTable({ records, onView, onDelete }) {
  return (
    <div className="table-responsive">
      <table className="glass-table">
        <thead>
          <tr>
            <th>Patient & Diagnosis</th>
            <th>File Name</th>
            <th>Doctor</th>
            <th>Date</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td>
                <div className="td-main">{r.result?.patient?.name || "Unknown"}</div>
                <div className="td-sub">{r.result?.prescription?.diagnosis || "No diagnosis"}</div>
              </td>
              <td>
                <div className="file-badge">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <span>{r.fileName}</span>
                </div>
              </td>
              <td>{r.result?.doctor?.name || "N/A"}</td>
              <td>{new Date(r.createdAt).toLocaleDateString()}</td>
              <td>
                <div className="action-buttons">
                  <button className="icon-btn view-btn" onClick={() => onView(r)} title="View Details">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  </button>
                  <button className="icon-btn delete-btn" onClick={() => onDelete(r.id)} title="Delete">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}