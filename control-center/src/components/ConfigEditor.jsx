import React, { useEffect, useState } from 'react';
import { Save, Code, FileText, CheckCircle, HelpCircle } from 'lucide-react';

export default function ConfigEditor({ triggerToast }) {
  const [configList, setConfigList] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch available configs
  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/configs');
        const data = await res.json();
        setConfigList(data);
        if (data.length > 0) {
          setSelectedFile(data[0]);
        }
      } catch (err) {
        console.error('Error fetching config files list:', err);
        triggerToast('Could not load editable configuration files directory.', 'error');
      }
    };
    fetchConfigs();
  }, []);

  // Fetch content when selected file changes
  useEffect(() => {
    if (!selectedFile) return;

    const fetchContent = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/config/${encodeURIComponent(selectedFile)}`);
        const data = await res.json();
        if (res.ok) {
          setContent(data.content);
        } else {
          throw new Error(data.error);
        }
      } catch (err) {
        console.error('Error loading config content:', err);
        triggerToast(`Error reading config file: ${err.message}`, 'error');
        setContent(`# Could not read file ${selectedFile}\n\n# Dynamic fallback loaded\n\n`);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [selectedFile]);

  const handleSave = async () => {
    if (!selectedFile) return;
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/api/config/${encodeURIComponent(selectedFile)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      triggerToast(`Saved ${selectedFile} successfully! Service reloaded automatically.`, 'success');
    } catch (err) {
      triggerToast(`Failed to save config: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Editor Description */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Code size={24} style={{ color: 'var(--blue)' }} />
          <div>
            <h3 style={{ fontWeight: '800', fontSize: '1.1rem' }}>Advanced Dotfiles Configuration Editor</h3>
            <p style={{ color: 'var(--subtext0)', fontSize: '0.8rem' }}>Modify configurations inline with dynamic reloading triggers for affected processes.</p>
          </div>
        </div>
        <button
          className="save-btn"
          onClick={handleSave}
          disabled={saving || loading || !selectedFile}
          style={{ margin: 0 }}
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save File'}
        </button>
      </div>

      {/* Editor Workspace */}
      <div className="editor-layout">
        
        {/* Left selector */}
        <div className="config-list">
          <div style={{ padding: '0.25rem 0.5rem 0.5rem 0.5rem', fontSize: '0.78rem', color: 'var(--surface2)', fontWeight: '800', textTransform: 'uppercase' }}>
            Editable Configuration Files
          </div>
          {configList.map((file) => (
            <div
              key={file}
              className={`config-tab ${selectedFile === file ? 'active' : ''}`}
              onClick={() => setSelectedFile(file)}
            >
              <FileText size={13} style={{ marginRight: '0.35rem', verticalAlign: 'middle', display: 'inline' }} />
              {file}
            </div>
          ))}
        </div>

        {/* Right textarea container */}
        <div className="editor-container">
          <div className="editor-header">
            <span className="editor-filename">
              ~/.config/{selectedFile}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--surface2)' }}>
              <HelpCircle size={12} />
              Ctrl+S applies edits directly
            </div>
          </div>
          
          {loading ? (
            <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--subtext0)' }}>
              Reading file contents...
            </div>
          ) : (
            <textarea
              className="editor-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                // Support quick keyboard save via Ctrl+S
                if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleSave();
                }
              }}
              placeholder="# Modify configurations here..."
              spellCheck="false"
            />
          )}
        </div>

      </div>

    </div>
  );
}
