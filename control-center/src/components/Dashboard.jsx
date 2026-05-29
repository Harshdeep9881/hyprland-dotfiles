import React, { useEffect, useState } from 'react';
import { Cpu, HardDrive, Shield, Activity, Power, Lock, LogOut, RotateCw, Moon, Clock, Terminal, User } from 'lucide-react';

export default function Dashboard({ triggerToast }) {
  const [sysInfo, setSysInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSysInfo = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/sysinfo');
      const data = await res.json();
      setSysInfo(data);
    } catch (err) {
      console.error('Error fetching system info:', err);
      // Fallback/Mock details if backend isn't loaded yet
      setSysInfo({
        cpu: { model: 'AMD Ryzen 7 7840HS (8C 16T)' },
        ram: { total: 15822, used: 4120, free: 11702 },
        disk: { total: 476822, used: 125432, free: 351390, percent: '26%' },
        uptime: 'up 3 hours, 45 minutes',
        user: {
          username: 'harsh',
          hostname: 'arch-pc',
          shell: '/bin/bash',
          groups: 'wheel sys rfkill storage power users',
          kernel: 'Linux 6.9.1-arch1-1',
          os: 'Arch Linux'
        },
        battery: { percent: 78, charging: false }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSysInfo();
    const interval = setInterval(fetchSysInfo, 4000); // refresh every 4s
    return () => clearInterval(interval);
  }, []);

  const triggerPowerAction = async (type) => {
    try {
      triggerToast(`Triggering session command: ${type.toUpperCase()}`, 'success');
      const res = await fetch('http://localhost:5000/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'power', type })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
    } catch (err) {
      triggerToast(`Action Failed: ${err.message}`, 'error');
    }
  };

  if (loading && !sysInfo) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--subtext0)' }}>
        <Activity className="animate-spin" style={{ marginRight: '0.5rem', animation: 'spin 1.5s linear infinite' }} />
        Retrieving system resource statistics...
      </div>
    );
  }

  // Calculate percentages
  const ramPercent = Math.round((sysInfo.ram.used / sysInfo.ram.total) * 100) || 0;
  const diskPercent = parseInt(sysInfo.disk.percent, 10) || 0;
  const batteryPercent = sysInfo.battery?.percent ?? 100;

  // Circle stroke math
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const getStrokeOffset = (percent) => circumference - (percent / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Overview stats cards */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(12, minmax(0, 1fr))' }}>
        
        {/* User Card */}
        <div className="card col-span-8">
          <div className="profile-card">
            <div className="profile-avatar">
              <span>{sysInfo.user.username[0].toUpperCase()}</span>
            </div>
            <div className="profile-info">
              <span className="profile-name">Welcome back, {sysInfo.user.username}!</span>
              <span className="profile-host">@{sysInfo.user.hostname} · {sysInfo.user.os}</span>
            </div>
          </div>

          <div className="profile-meta-grid">
            <div className="profile-meta-item">
              <div className="profile-meta-label">Kernel Version</div>
              <div className="profile-meta-value">{sysInfo.user.kernel}</div>
            </div>
            <div className="profile-meta-item">
              <div className="profile-meta-label">Active Shell</div>
              <div className="profile-meta-value">{sysInfo.user.shell}</div>
            </div>
            <div className="profile-meta-item" style={{ gridColumn: 'span 2' }}>
              <div className="profile-meta-label">User Security Groups</div>
              <div className="profile-meta-value" style={{ fontSize: '0.82rem', color: 'var(--subtext0)' }}>
                {sysInfo.user.groups}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Uptime Details */}
        <div className="card col-span-4" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>
              <Clock size={18} /> System Uptime
            </h3>
            <p style={{ fontSize: '1.25rem', fontWeight: '750', color: 'var(--blue)', fontFamily: 'JetBrains Mono, monospace' }}>
              {sysInfo.uptime.replace('up ', '')}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.50rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--glass-border)', marginTop: '1rem' }}>
            <Cpu size={16} style={{ color: 'var(--mauve)' }} />
            <div style={{ fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--subtext0)' }}>
              {sysInfo.cpu.model}
            </div>
          </div>
        </div>
      </div>

      {/* Dials for system resources */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>
          <Activity size={18} /> System Resource Status
        </h3>
        <div className="resource-grid">
          
          {/* Memory resource */}
          <div className="resource-widget">
            <div className="resource-circle">
              <svg>
                <circle className="circle-bg" cx="55" cy="55" r={radius} />
                <circle 
                  className="circle-val" 
                  cx="55" 
                  cy="55" 
                  r={radius} 
                  stroke="var(--blue)"
                  strokeDasharray={circumference}
                  strokeDashoffset={getStrokeOffset(ramPercent)}
                />
              </svg>
              <div className="resource-percent" style={{ color: 'var(--blue)' }}>{ramPercent}%</div>
            </div>
            <div className="resource-label">RAM Memory</div>
            <div className="resource-subtext">{Math.round(sysInfo.ram.used / 1024 * 10) / 10}G / {Math.round(sysInfo.ram.total / 1024 * 10) / 10}G</div>
          </div>

          {/* Disk storage resource */}
          <div className="resource-widget">
            <div className="resource-circle">
              <svg>
                <circle className="circle-bg" cx="55" cy="55" r={radius} />
                <circle 
                  className="circle-val" 
                  cx="55" 
                  cy="55" 
                  r={radius} 
                  stroke="var(--mauve)"
                  strokeDasharray={circumference}
                  strokeDashoffset={getStrokeOffset(diskPercent)}
                />
              </svg>
              <div className="resource-percent" style={{ color: 'var(--mauve)' }}>{diskPercent}%</div>
            </div>
            <div className="resource-label">Disk Storage (/)</div>
            <div className="resource-subtext">{Math.round(sysInfo.disk.used / 1024)}G / {Math.round(sysInfo.disk.total / 1024)}G</div>
          </div>

          {/* Battery Status resource */}
          <div className="resource-widget">
            <div className="resource-circle">
              <svg>
                <circle className="circle-bg" cx="55" cy="55" r={radius} />
                <circle 
                  className="circle-val" 
                  cx="55" 
                  cy="55" 
                  r={radius} 
                  stroke={sysInfo.battery?.charging ? "var(--green)" : "var(--peach)"}
                  strokeDasharray={circumference}
                  strokeDashoffset={getStrokeOffset(batteryPercent)}
                />
              </svg>
              <div className="resource-percent" style={{ color: sysInfo.battery?.charging ? "var(--green)" : "var(--peach)" }}>
                {batteryPercent}%
              </div>
            </div>
            <div className="resource-label">Battery Capacity</div>
            <div className="resource-subtext">
              {sysInfo.battery?.charging ? '⚡ Charging' : '🔋 Discharging'}
            </div>
          </div>

        </div>
      </div>

      {/* Session Actions widget */}
      <div className="card">
        <h3 className="card-title">
          <Power size={18} /> Quick Session Commands
        </h3>
        <div className="power-actions">
          <button className="power-btn lock" onClick={() => triggerPowerAction('lock')}>
            <Lock size={20} />
            <span>Lock Screen</span>
          </button>
          <button className="power-btn logout" onClick={() => triggerPowerAction('logout')}>
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
          <button className="power-btn suspend" onClick={() => triggerPowerAction('suspend')}>
            <Moon size={20} />
            <span>Suspend</span>
          </button>
          <button className="power-btn reboot" onClick={() => triggerPowerAction('reboot')}>
            <RotateCw size={20} />
            <span>Reboot</span>
          </button>
          <button className="power-btn shutdown" onClick={() => triggerPowerAction('shutdown')}>
            <Power size={20} />
            <span>Shutdown</span>
          </button>
        </div>
      </div>

    </div>
  );
}
