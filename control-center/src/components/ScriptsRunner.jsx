import React from 'react';
import { Camera, Volume2, Sun, Clipboard, ShieldAlert, Cpu, Terminal, Play } from 'lucide-react';

export default function ScriptsRunner({ triggerToast }) {

  const runScript = async (action, type = '') => {
    try {
      triggerToast(`Triggering script: ${action} ${type}`, 'success');
      const res = await fetch('http://localhost:5000/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, type })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
    } catch (err) {
      triggerToast(`Script Execution Failed: ${err.message}`, 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Introduction banner */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem 2rem' }}>
        <Terminal size={32} style={{ color: 'var(--blue)' }} />
        <div>
          <h3 style={{ fontWeight: '800', fontSize: '1.2rem' }}>Desktop Scripts & Utilities</h3>
          <p style={{ color: 'var(--subtext0)', fontSize: '0.85rem' }}>Interact directly with helper shell scripts in your system. Quick triggers for screenshots, system audio, brightness controls, and utility services.</p>
        </div>
      </div>

      <div className="scripts-grid">
        
        {/* Screenshot Script */}
        <div className="script-card">
          <div className="script-meta">
            <div className="script-icon" style={{ background: 'rgba(180, 190, 254, 0.1)', color: 'var(--lavender)' }}>
              <Camera size={20} />
            </div>
            <span className="script-title">Screen Capture</span>
          </div>
          <span className="script-desc">Captures screen displays and automatically saves to ~/Pictures/Screenshots/ while placing in clipboard.</span>
          <div className="script-actions">
            <button className="btn primary" onClick={() => runScript('screenshot', 'region')}>Region</button>
            <button className="btn" onClick={() => runScript('screenshot', 'full')}>Fullscreen</button>
            <button className="btn" onClick={() => runScript('screenshot', 'window')}>Active Window</button>
          </div>
        </div>

        {/* Volume Script */}
        <div className="script-card">
          <div className="script-meta">
            <div className="script-icon" style={{ background: 'rgba(137, 180, 250, 0.1)', color: 'var(--blue)' }}>
              <Volume2 size={20} />
            </div>
            <span className="script-title">System Audio Controls</span>
          </div>
          <span className="script-desc">Modifies speaker volume by 5% increments or toggles mute status with native dunst OSD overlays.</span>
          <div className="script-actions">
            <button className="btn" onClick={() => runScript('volume', 'down')}>Vol -5%</button>
            <button className="btn" onClick={() => runScript('volume', 'up')}>Vol +5%</button>
            <button className="btn primary" onClick={() => runScript('volume', 'mute')}>Toggle Mute</button>
          </div>
        </div>

        {/* Brightness Script */}
        <div className="script-card">
          <div className="script-meta">
            <div className="script-icon" style={{ background: 'rgba(250, 179, 135, 0.1)', color: 'var(--peach)' }}>
              <Sun size={20} />
            </div>
            <span className="script-title">Screen Brightness</span>
          </div>
          <span className="script-desc">Adjusts hardware panel backlight levels by 5% steps, clamped at a minimum safety threshold of 5%.</span>
          <div className="script-actions">
            <button className="btn" onClick={() => runScript('brightness', 'down')}>Dim 5%</button>
            <button className="btn primary" onClick={() => runScript('brightness', 'up')}>Brighten 5%</button>
          </div>
        </div>

        {/* Clipboard Picker Script */}
        <div className="script-card">
          <div className="script-meta">
            <div className="script-icon" style={{ background: 'rgba(166, 227, 161, 0.1)', color: 'var(--green)' }}>
              <Clipboard size={20} />
            </div>
            <span className="script-title">Clipboard Manager Picker</span>
          </div>
          <span className="script-desc">Launches the dynamic Rofi clipboard history browser using cliphist. Select items to copy back.</span>
          <div className="script-actions">
            <button className="btn primary" style={{ width: '100%' }} onClick={() => runScript('cliphist')}>
              <Play size={14} /> Open Clipboard Picker
            </button>
          </div>
        </div>

        {/* GPU Selector Launcher Script */}
        <div className="script-card">
          <div className="script-meta">
            <div className="script-icon" style={{ background: 'rgba(203, 166, 247, 0.1)', color: 'var(--mauve)' }}>
              <Cpu size={20} />
            </div>
            <span className="script-title">GPU-Selector Application Launcher</span>
          </div>
          <span className="script-desc">Launches the python3 gpu-launcher allowing applications to load with explicit AMD iGPU or NVIDIA dGPU options.</span>
          <div className="script-actions">
            <button className="btn primary" style={{ width: '100%' }} onClick={() => runScript('gpu-selector')}>
              <Play size={14} /> Run GPU Selector
            </button>
          </div>
        </div>

        {/* Session Power Overlay Script */}
        <div className="script-card">
          <div className="script-meta">
            <div className="script-icon" style={{ background: 'rgba(243, 139, 168, 0.1)', color: 'var(--red)' }}>
              <ShieldAlert size={20} />
            </div>
            <span className="script-title">Rofi Desktop Session Overlay</span>
          </div>
          <span className="script-desc">Displays the visual power actions selector overlay panel directly on the active workspace monitor.</span>
          <div className="script-actions">
            <button className="btn primary" style={{ width: '100%' }} onClick={() => runScript('power', 'menu')}>
              <Play size={14} /> Launch Power Menu
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
