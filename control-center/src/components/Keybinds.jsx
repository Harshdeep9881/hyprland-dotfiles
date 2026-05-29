import React, { useEffect, useState } from 'react';
import { Search, Keyboard, Filter, Compass } from 'lucide-react';

export default function Keybinds({ triggerToast }) {
  const [binds, setBinds] = useState([]);
  const [filteredBinds, setFilteredBinds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchBinds = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/keybinds');
        const data = await res.json();
        setBinds(data);
        setFilteredBinds(data);
      } catch (err) {
        console.error('Error fetching keybinds:', err);
        triggerToast('Could not load current system keybinds from server.', 'error');
        // Mock fallback binds
        const mockBinds = [
          { mods: '$mainMod', key: 'Return', action: 'exec', args: 'kitty', description: 'Open terminal (Kitty)' },
          { mods: '$mainMod', key: 'D', action: 'exec', args: 'rofi -show drun', description: 'App launcher (Rofi drun)' },
          { mods: '$mainMod', key: 'E', action: 'exec', args: 'thunar', description: 'Open file manager (Thunar)' },
          { mods: '$mainMod', key: 'B', action: 'exec', args: 'firefox', description: 'Open browser (Firefox)' },
          { mods: '$mainMod SHIFT', key: 'S', action: 'exec', args: 'screenshot.sh region', description: 'Take screenshot of region' },
          { mods: '$mainMod', key: 'Q', action: 'killactive', args: '', description: 'Close active window' },
          { mods: '$mainMod', key: 'T', action: 'togglefloating', args: '', description: 'Toggle active window floating' },
          { mods: '$mainMod', key: 'F', action: 'fullscreen', args: '0', description: 'Toggle full screen mode' },
          { mods: '$mainMod', key: '1', action: 'workspace', args: '1', description: 'Switch to workspace 1' }
        ];
        setBinds(mockBinds);
        setFilteredBinds(mockBinds);
      } finally {
        setLoading(false);
      }
    };
    fetchBinds();
  }, []);

  // Filter bindings when search term or category changes
  useEffect(() => {
    let result = binds;

    // Search query filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(b => 
        (b.mods || '').toLowerCase().includes(q) ||
        (b.key || '').toLowerCase().includes(q) ||
        (b.action || '').toLowerCase().includes(q) ||
        (b.args || '').toLowerCase().includes(q) ||
        (b.description || '').toLowerCase().includes(q)
      );
    }

    // Category filter
    if (activeCategory !== 'All') {
      result = result.filter(b => {
        const desc = (b.description || '').toLowerCase();
        const action = (b.action || '').toLowerCase();
        const args = (b.args || '').toLowerCase();

        switch (activeCategory) {
          case 'Apps':
            return args.includes('kitty') || args.includes('thunar') || args.includes('firefox') || args.includes('rofi') || desc.includes('browser') || desc.includes('terminal');
          case 'Windows':
            return action.includes('killactive') || action.includes('floating') || action.includes('fullscreen') || action.includes('movefocus') || action.includes('movewindow');
          case 'Workspaces':
            return action.includes('workspace') || action.includes('movetoworkspace') || desc.includes('workspace');
          case 'Screenshots':
            return args.includes('screenshot') || desc.includes('screenshot') || desc.includes('grim');
          case 'Hardware':
            return args.includes('volume') || args.includes('brightness') || args.includes('playerctl') || desc.includes('mute');
          case 'Session':
            return args.includes('hyprlock') || args.includes('power') || action.includes('exit') || desc.includes('lock') || desc.includes('reload');
          default:
            return true;
        }
      });
    }

    setFilteredBinds(result);
  }, [searchTerm, activeCategory, binds]);

  const renderModBadges = (modsStr) => {
    if (!modsStr || modsStr === 'None') return <span className="key-badge">None</span>;
    // Replace custom $mainMod string with Super
    const cleaned = modsStr.replace('$mainMod', 'SUPER');
    const items = cleaned.split(/\s+|\+/); // split by spaces or pluses
    return items.map((item, idx) => {
      const isModifier = ['SUPER', 'SHIFT', 'CTRL', 'ALT', 'CONTROL'].includes(item.toUpperCase());
      return (
        <span key={idx} className={`key-badge ${isModifier ? 'mod' : ''}`}>
          {item}
        </span>
      );
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--subtext0)' }}>
        Loading and parsing keybind directory...
      </div>
    );
  }

  const categories = ['All', 'Apps', 'Windows', 'Workspaces', 'Screenshots', 'Hardware', 'Session'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Search Header */}
      <div className="card" style={{ padding: '1.5rem 1.75rem' }}>
        <h3 className="card-title" style={{ marginBottom: '1.25rem' }}>
          <Keyboard size={18} /> Keyboard Shortcuts Directory
        </h3>
        
        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          {/* Search box */}
          <div className="search-container" style={{ margin: 0 }}>
            <Search size={18} style={{ color: 'var(--surface2)' }} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search keybinds by modifier, key, command description..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Categories select row */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
            {categories.map(cat => (
              <button
                key={cat}
                className="btn"
                onClick={() => setActiveCategory(cat)}
                style={{
                  background: activeCategory === cat ? 'rgba(180, 190, 254, 0.08)' : 'transparent',
                  borderColor: activeCategory === cat ? 'rgba(180, 190, 254, 0.25)' : 'var(--glass-border)',
                  color: activeCategory === cat ? 'var(--lavender)' : 'var(--subtext0)',
                  flexGrow: 0,
                  padding: '0.45rem 1rem',
                  borderRadius: '10px'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Shortcuts list card */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Modifiers</th>
                <th style={{ width: '10%' }}>Key</th>
                <th style={{ width: '22%' }}>Compositor Action</th>
                <th style={{ width: '26%' }}>Arguments</th>
                <th style={{ width: '20%' }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {filteredBinds.length > 0 ? (
                filteredBinds.map((bind, index) => (
                  <tr key={index}>
                    <td>{renderModBadges(bind.mods)}</td>
                    <td>
                      <span className="key-badge" style={{ background: 'var(--surface1)', color: 'var(--text)' }}>
                        {bind.key}
                      </span>
                    </td>
                    <td>
                      <span className="action-text">{bind.action}</span>
                    </td>
                    <td>
                      {bind.args ? <span className="args-text">{bind.args}</span> : <span style={{ color: 'var(--surface2)', fontStyle: 'italic' }}>None</span>}
                    </td>
                    <td style={{ color: 'var(--subtext1)', fontSize: '0.85rem', fontWeight: 500 }}>
                      {bind.description}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--surface2)' }}>
                    No bindings matched your criteria. Try another search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
