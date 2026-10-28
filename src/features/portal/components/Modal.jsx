import { useState } from 'react';

export default function Modal({ isOpen, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('');
  const [reportedParty, setReportedParty] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ title, category, severity, reportedParty, description });
    }
    onClose();
  };

  return (
    <div className="md on">
      <div className="mc">
        <div className="mh">
          <div>
            <h3 style={{ fontSize: '20px' }}>Make Complaint</h3>
            <p>File a new incident report for review.</p>
          </div>
          <span
            id="mx"
            onClick={onClose}
            style={{ cursor: 'pointer', fontSize: '22px', lineHeight: 1 }}
          >
            ×
          </span>
        </div>
        <form className="mb" onSubmit={handleSubmit}>
          <div>
            <label>TITLE</label>
            <input
              placeholder="Brief summary of the incident"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="row">
            <div style={{ flex: 1 }}>
              <label>CATEGORY</label>
              <input
                placeholder="Select category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>SEVERITY</label>
              <input
                placeholder="Select severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label>REPORTED PARTY</label>
            <input
              placeholder="Who was involved"
              value={reportedParty}
              onChange={(e) => setReportedParty(e.target.value)}
            />
          </div>
          <div>
            <label>DESCRIPTION</label>
            <textarea
              rows="3"
              placeholder="Describe what happened..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <div className="row">
            <button
              type="button"
              className="ghost"
              id="mc2"
              onClick={onClose}
              style={{ margin: 0 }}
            >
              Cancel
            </button>
            <button type="submit" className="pb">
              Submit complaint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
