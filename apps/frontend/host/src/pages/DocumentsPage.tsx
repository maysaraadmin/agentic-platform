import { FC, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { API_URL, getAuthHeaders } from 'shared/auth';

interface Document {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const DocumentsPage: FC = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadContent, setUploadContent] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: documents, isLoading, refetch } = useQuery({
    queryKey: ['documents'],
    queryFn: async (): Promise<Document[]> => {
      const response = await fetch(`${API_URL}/api/v1/documents/`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return response.json();
    },
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadStatus(null);

    try {
      if (uploadFile) {
        const formData = new FormData();
        formData.append('file', uploadFile);
        const response = await fetch(`${API_URL}/api/v1/documents/upload`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: formData,
        });
        if (!response.ok) throw new Error('Upload failed');
      } else {
        const response = await fetch(`${API_URL}/api/v1/documents/`, {
          method: 'POST',
          headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: uploadTitle, content: uploadContent }),
        });
        if (!response.ok) throw new Error('Upload failed');
      }
      setUploadStatus({ type: 'success', message: 'Document uploaded successfully!' });
      setUploadTitle('');
      setUploadContent('');
      setUploadFile(null);
      setShowUpload(false);
      refetch();
    } catch {
      setUploadStatus({ type: 'error', message: 'Failed to upload document. Please try again.' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await fetch(`${API_URL}/api/v1/documents/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      refetch();
    } catch {
      alert('Failed to delete document');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            Manage your knowledge base documents
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowUpload(!showUpload)}>
          {showUpload ? 'Cancel' : '+ Add Document'}
        </button>
      </div>

      {showUpload && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-body">
            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>File Upload</label>
                <input
                  type="file"
                  accept=".txt,.md,.json,.csv"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  style={{
                    padding: '10px',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    width: '100%',
                    fontSize: '14px',
                  }}
                />
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  Supported: .txt, .md, .json, .csv (or enter content below)
                </p>
              </div>
              <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>— or —</div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Title</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Document title"
                  style={{
                    padding: '10px 14px',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    width: '100%',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Content</label>
                <textarea
                  value={uploadContent}
                  onChange={(e) => setUploadContent(e.target.value)}
                  placeholder="Enter document content..."
                  rows={5}
                  style={{
                    padding: '10px 14px',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    width: '100%',
                    fontSize: '14px',
                    resize: 'vertical',
                  }}
                />
              </div>
              {uploadStatus && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  backgroundColor: uploadStatus.type === 'success' ? '#dcfce7' : '#fee2e2',
                  color: uploadStatus.type === 'success' ? '#166534' : '#991b1b',
                }}>
                  {uploadStatus.message}
                </div>
              )}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowUpload(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Upload Document</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <span>Documents</span>
          <span className="badge badge-info">{documents?.length || 0} total</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto' }} />
              <p style={{ marginTop: '12px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>Loading documents...</p>
            </div>
          ) : documents && documents.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {documents.map((doc, idx) => (
                <div
                  key={doc.id}
                  style={{
                    padding: '16px 20px',
                    borderBottom: idx < documents.length - 1 ? '1px solid var(--color-border)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'background-color var(--transition)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '500', fontSize: '14px', marginBottom: '4px' }}>{doc.title}</div>
                    <div style={{
                      fontSize: '13px',
                      color: 'var(--color-text-secondary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '500px',
                    }}>
                      {doc.content}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                      Updated: {new Date(doc.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      backgroundColor: '#fee2e2',
                      color: '#991b1b',
                      borderRadius: 'var(--radius-sm)',
                      marginLeft: '16px',
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '60px 40px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px' }}>No documents yet</p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginTop: '4px' }}>Upload your first document to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
