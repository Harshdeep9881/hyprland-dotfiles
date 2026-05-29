import React, { useState } from 'react';
import { LayoutDashboard, Sliders, Keyboard, Terminal, Code, Info, ShieldAlert, Sparkles } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Keybinds from './components/Keybinds';
import ScriptsRunner from './components/ScriptsRunner';
import ConfigEditor from './components/ConfigEditor';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState(null);

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000); // clear after 4s
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard triggerToast={triggerToast} />;
      case 'settings':
        return <Settings triggerToast={triggerToast} />;
      case 'keybinds':
        return <Keybinds triggerToast={triggerToast} />;
      case 'scripts':
        return <ScriptsRunner triggerToast={triggerToast} />;
      case 'editor':
        return <ConfigEditor triggerToast={triggerToast} />;
      default:
        return <Dashboard triggerToast={triggerToast} />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'System Control Center';
      case 'settings': return 'Compositor Properties';
      case 'keybinds': return 'Shortcut Bindings';
      case 'scripts': return 'Utility Shell Scripts';
      case 'editor': return 'Configuration Console';
      default: return 'Hyprland Dashboard';
    }
  };

  const getPageDescription = () => {
    switch (activeTab) {
      case 'dashboard': return 'Live statistics, resource workloads, and system commands.';
      case 'settings': return 'Fine-tune gaps, active rounding, borders, and input sensitivities.';
      case 'keybinds': return 'Browse and search all key mappings parsed from hyprland.conf.';
      case 'scripts': return 'Manual triggers for volume, brightness, screenshots, and system overlays.';
      case 'editor': return 'Directly view and adjust all system dotfiles with instant live-reloading.';
      default: return 'Unified management interface';
    }
  };

  return (
    <div className="app-container">
      
      {/* Sidebar navigation panel */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">
            <Sparkles size={20} />
          </div>
          <h2>HyprControl</h2>
        </div>

        <ul className="nav-menu">
          <li 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </li>
          <li 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Sliders size={18} />
            <span>Settings</span>
          </li>
          <li 
            className={`nav-item ${activeTab === 'keybinds' ? 'active' : ''}`}
            onClick={() => setActiveTab('keybinds')}
          >
            <Keyboard size={18} />
            <span>Keybinds</span>
          </li>
          <li 
            className={`nav-item ${activeTab === 'scripts' ? 'active' : ''}`}
            onClick={() => setActiveTab('scripts')}
          >
            <Terminal size={18} />
            <span>Scripts</span>
          </li>
          <li 
            className={`nav-item ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            <Code size={18} />
            <span>Config Editor</span>
          </li>
        </ul>

        <div className="sidebar-footer">
          <div className="system-status-indicator">
            <span className="status-dot"></span>
            <span>API Server Online</span>
          </div>
        </div>
      </aside>

      {/* Main scrolling viewport */}
      <main className="main-content">
        <header className="page-header">
          <h1>{getPageTitle()}</h1>
          <p>{getPageDescription()}</p>
        </header>

        {renderActiveComponent()}
      </main>

      {/* Persistent notifications toast alerts */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? <Info size={16} /> : <ShieldAlert size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

    </div>
  );
}
