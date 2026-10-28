import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  File,
  X,
  Paperclip,
  Link as LinkIcon
} from 'lucide-react';

export default function FileUpload({
  label = 'ATTACH DOCUMENTS / MATERIALS',
  placeholder = 'Or paste external link / URL...',
  files = [],
  onChange,
  onFilesChange,
  accept = '.pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.webp',
  maxSize = 10 * 1024 * 1024,
  className = ''
}) {
  const [linkInput, setLinkInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const notifyChange = (updated) => {
    onChange?.(updated);
    onFilesChange?.(updated);
  };

  const processFileList = (selectedFiles) => {
    if (!selectedFiles || !selectedFiles.length) return;
    const newItems = Array.from(selectedFiles).map((f) => ({
      name: f.name,
      size: `${(f.size / 1024).toFixed(0)} KB`,
      type: 'file',
      file: f,
      isImage: f.type?.startsWith('image/'),
      isPdf: f.type === 'application/pdf' || f.name?.toLowerCase().endsWith('.pdf')
    }));
    notifyChange([...files, ...newItems]);
  };

  const handleFileChange = (e) => {
    processFileList(e.target.files);
    if (e.target) e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer?.files?.length) {
      processFileList(e.dataTransfer.files);
    }
  };

  const handleAddLink = () => {
    const trimmed = linkInput.trim();
    if (!trimmed) return;
    notifyChange([...files, { name: trimmed, type: 'link', url: trimmed }]);
    setLinkInput('');
  };

  const handleRemove = (index) => {
    const updated = files.filter((_, i) => i !== index);
    notifyChange(updated);
  };

  return (
    <div className={`file-upload ${className}`.trim()} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {label && (
        <label style={{ fontSize: '11px', letterSpacing: '.08em', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase' }}>
          {label}
        </label>
      )}

      {/* Compact Drag & Drop Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: isDragging ? '2px dashed var(--p1)' : '1.5px dashed var(--line)',
          background: isDragging ? 'rgba(30,111,120,.08)' : 'var(--soft)',
          borderRadius: '14px',
          padding: '14px 12px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '5px'
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: isDragging ? 'var(--p1)' : 'rgba(30,111,120,.12)',
            color: isDragging ? '#fff' : 'var(--p1)',
            display: 'grid',
            placeItems: 'center'
          }}
        >
          <UploadCloud size={18} />
        </div>

        <div>
          <span style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--ink)' }}>
            Click to browse
          </span>
          <span style={{ color: 'var(--mute)', fontSize: '12px' }}> or drag files</span>
        </div>

        <p style={{ margin: 0, fontSize: '10.5px', color: 'var(--mute)' }}>
          PDF, Images, Word, PowerPoint (up to 10MB)
        </p>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {/* Compact Link Input */}
      <div style={{ display: 'flex', gap: '6px' }}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0 10px',
            borderRadius: '10px',
            background: 'var(--soft)',
            border: '1px solid var(--line)',
            height: '34px'
          }}
        >
          <LinkIcon size={13} style={{ color: 'var(--mute)', flexShrink: 0 }} />
          <input
            type="url"
            placeholder={placeholder}
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddLink();
              }
            }}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '12px',
              color: 'var(--ink)'
            }}
          />
        </div>

        {linkInput.trim() && (
          <button
            type="button"
            onClick={handleAddLink}
            style={{
              padding: '0 12px',
              height: '34px',
              borderRadius: '10px',
              background: 'var(--p1)',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              fontSize: '11.5px',
              cursor: 'pointer'
            }}
          >
            Add
          </button>
        )}
      </div>

      {/* Attached Files List */}
      {files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase' }}>
            Attached ({files.length}):
          </span>
          <div
            className="no-scrollbar"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              maxHeight: '90px',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {files.map((item, idx) => {
              const rawName = String(item.name || '');
              const displayName = (!rawName || rawName.includes('[object'))
                ? (item.url ? item.url.split('/').pop().split('?')[0] : `Document ${idx + 1}`)
                : rawName;

              const isPdf = displayName.toLowerCase().endsWith('.pdf');
              const isImg = displayName.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif)$/);

              return (
                <div
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    background: isPdf ? 'rgba(220,38,38,.08)' : isImg ? 'rgba(30,111,120,.1)' : 'var(--soft)',
                    border: '1px solid var(--line)',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--ink)'
                  }}
                >
                  {item.type === 'link' ? (
                    <LinkIcon size={12} style={{ color: 'var(--p1)' }} />
                  ) : isPdf ? (
                    <FileText size={12} style={{ color: '#DC2626' }} />
                  ) : isImg ? (
                    <ImageIcon size={12} style={{ color: 'var(--p1)' }} />
                  ) : (
                    <Paperclip size={12} style={{ color: 'var(--mute)' }} />
                  )}

                  <span style={{ maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {displayName}
                  </span>

                  {item.size && (
                    <span style={{ fontSize: '10px', color: 'var(--mute)', fontWeight: 500 }}>
                      ({item.size})
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(idx);
                    }}
                    title="Remove file"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      color: 'var(--mute)',
                      display: 'grid',
                      placeItems: 'center',
                      marginLeft: '2px'
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
