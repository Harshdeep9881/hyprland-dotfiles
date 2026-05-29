import React, { useEffect, useState } from 'react';
import { Sliders, Maximize2, Sparkles, MousePointer, Save } from 'lucide-react';

export default function Settings({ triggerToast }) {
  const [settings, setSettings] = useState({
    gaps_in: 5,
    gaps_out: 10,
    border_size: 2,
    rounding: 12,
    active_opacity: 1.0,
    inactive_opacity: 0.92,
    sensitivity: 0.0,
    natural_scroll: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/compositor-settings');
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error('Error fetching compositor settings:', err);
        triggerToast('Could not fetch real-time settings from server. Using local defaults.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (key, val) => {
    setSettings(prev => ({
      ...prev,
      [key]: val
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('http://localhost:5000/api/compositor-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      triggerToast('Settings applied! Compositor reloaded.', 'success');
    } catch (err) {
      triggerToast(`Failed to save settings: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--subtext0)' }}>
        Retrieving active compositor properties...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top Banner */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Sliders size={32} style={{ color: 'var(--lavender)' }} />
          <div>
            <h3 style={{ fontWeight: '800', fontSize: '1.2rem' }}>Interactive Compositor Settings</h3>
            <p style={{ color: 'var(--subtext0)', fontSize: '0.85rem' }}>Adjust layout, decorations, and input options with direct hot-reloading.</p>
          </div>
        </div>
        <button 
          className="save-btn" 
          onClick={handleSave} 
          disabled={saving}
          style={{ margin: 0 }}
        >
          <Save size={18} />
          {saving ? 'Applying...' : 'Apply Settings'}
        </button>
      </div>

      <div className="settings-list">
        
        {/* Layout & Borders Group */}
        <div className="settings-group">
          <div className="settings-group-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Maximize2 size={16} style={{ color: 'var(--blue)' }} /> Layout & Gaps
          </div>
          
          {/* Gaps In */}
          <div className="settings-row">
            <div className="setting-label">
              <span className="setting-name">Inner Gaps</span>
              <span className="setting-desc">Gaps between tiled windows (pixels)</span>
            </div>
            <div className="slider-container">
              <input 
                type="range" 
                className="setting-slider" 
                min="0" 
                max="30" 
                value={settings.gaps_in} 
                onChange={(e) => handleChange('gaps_in', parseInt(e.target.value, 10))}
              />
              <span className="slider-val">{settings.gaps_in}px</span>
            </div>
          </div>

          {/* Gaps Out */}
          <div className="settings-row">
            <div className="setting-label">
              <span className="setting-name">Outer Gaps</span>
              <span className="setting-desc">Gaps between window edges and screen borders</span>
            </div>
            <div className="slider-container">
              <input 
                type="range" 
                className="setting-slider" 
                min="0" 
                max="40" 
                value={settings.gaps_out} 
                onChange={(e) => handleChange('gaps_out', parseInt(e.target.value, 10))}
              />
              <span className="slider-val">{settings.gaps_out}px</span>
            </div>
          </div>

          {/* Border Size */}
          <div className="settings-row">
            <div className="setting-label">
              <span className="setting-name">Border Thickness</span>
              <span className="setting-desc">Active outline border size around windows</span>
            </div>
            <div className="slider-container">
              <input 
                type="range" 
                className="setting-slider" 
                min="0" 
                max="10" 
                value={settings.border_size} 
                onChange={(e) => handleChange('border_size', parseInt(e.target.value, 10))}
              />
              <span className="slider-val">{settings.border_size}px</span>
            </div>
          </div>
        </div>

        {/* Window Decorations Group */}
        <div className="settings-group">
          <div className="settings-group-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={16} style={{ color: 'var(--mauve)' }} /> Window Aesthetics
          </div>

          {/* Corner Rounding */}
          <div className="settings-row">
            <div className="setting-label">
              <span className="setting-name">Corner Rounding</span>
              <span className="setting-desc">Radius thickness for rounded window corners</span>
            </div>
            <div className="slider-container">
              <input 
                type="range" 
                className="setting-slider" 
                min="0" 
                max="30" 
                value={settings.rounding} 
                onChange={(e) => handleChange('rounding', parseInt(e.target.value, 10))}
              />
              <span className="slider-val">{settings.rounding}px</span>
            </div>
          </div>

          {/* Active Opacity */}
          <div className="settings-row">
            <div className="setting-label">
              <span className="setting-name">Active Opacity</span>
              <span className="setting-desc">Transparency of the currently focused window</span>
            </div>
            <div className="slider-container">
              <input 
                type="range" 
                className="setting-slider" 
                min="0.5" 
                max="1.0" 
                step="0.01"
                value={settings.active_opacity} 
                onChange={(e) => handleChange('active_opacity', parseFloat(e.target.value))}
              />
              <span className="slider-val">{Math.round(settings.active_opacity * 100)}%</span>
            </div>
          </div>

          {/* Inactive Opacity */}
          <div className="settings-row">
            <div className="setting-label">
              <span className="setting-name">Inactive Opacity</span>
              <span className="setting-desc">Transparency of unfocused background windows</span>
            </div>
            <div className="slider-container">
              <input 
                type="range" 
                className="setting-slider" 
                min="0.5" 
                max="1.0" 
                step="0.01"
                value={settings.inactive_opacity} 
                onChange={(e) => handleChange('inactive_opacity', parseFloat(e.target.value))}
              />
              <span className="slider-val">{Math.round(settings.inactive_opacity * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Input & Devices Group */}
        <div className="settings-group">
          <div className="settings-group-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MousePointer size={16} style={{ color: 'var(--peach)' }} /> Input & Touchpad
          </div>

          {/* Mouse Sensitivity */}
          <div className="settings-row">
            <div className="setting-label">
              <span className="setting-name">Mouse Sensitivity</span>
              <span className="setting-desc">Cursor speed multiplier (-1.0 to 1.0)</span>
            </div>
            <div className="slider-container">
              <input 
                type="range" 
                className="setting-slider" 
                min="-1.0" 
                max="1.0" 
                step="0.05"
                value={settings.sensitivity} 
                onChange={(e) => handleChange('sensitivity', parseFloat(e.target.value))}
              />
              <span className="slider-val">{settings.sensitivity > 0 ? `+${settings.sensitivity}` : settings.sensitivity}</span>
            </div>
          </div>

          {/* Natural Scrolling */}
          <div className="settings-row">
            <div className="setting-label">
              <span className="setting-name">Natural Touchpad Scrolling</span>
              <span className="setting-desc">Scroll direction matches finger drag (Natural scroll)</span>
            </div>
            <div className="switch-container">
              <label className="switch-container">
                <input 
                  type="checkbox" 
                  checked={settings.natural_scroll} 
                  onChange={(e) => handleChange('natural_scroll', e.target.checked)}
                />
                <span className="switch-slider"></span>
              </label>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
