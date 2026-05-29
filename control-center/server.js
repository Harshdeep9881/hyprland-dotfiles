import express from 'express';
import cors from 'cors';
import { execSync, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 50000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DOTFILES   = '/home/harsh/hyprland-dotfiles';
const HYPR_CONF  = `${DOTFILES}/hypr/hyprland.conf`;
const IDLE_CONF  = `${DOTFILES}/hypr/hypridle.conf`;

// ── Safe shell helpers ────────────────────────────────────────────────────────
function sh(cmd, fallback = '') {
  try {
    return execSync(cmd, { encoding: 'utf8', shell: '/bin/bash', timeout: 5000 }).trim();
  } catch { return fallback; }
}

function shAsync(cmd, res, successMsg = 'Done') {
  exec(cmd, { shell: '/bin/bash', timeout: 10000 }, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: stderr || err.message });
    res.json({ success: true, message: successMsg, output: stdout.trim() });
  });
}

function sysfs(p, fallback = '') {
  try { return fs.readFileSync(p, 'utf8').trim(); } catch { return fallback; }
}

function parseConf(key, fallback = '', file = HYPR_CONF) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const m = content.match(new RegExp(`^\\s*${key}\\s*=\\s*(.+)$`, 'm'));
    return m ? m[1].trim() : fallback;
  } catch { return fallback; }
}

// ════════════════════════════════════════════════════════════════════════════
// SYSTEM OVERVIEW
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/system', (req, res) => {
  const cpuModel   = sh("grep 'model name' /proc/cpuinfo | head -1 | cut -d: -f2", 'AMD Ryzen 7 7840HS').trim();
  const cpuCores   = sh("nproc", '16');
  const kernel     = sh("uname -r", '');
  const arch       = sh("uname -m", 'x86_64');
  const hostname   = sysfs('/proc/sys/kernel/hostname', 'arch-pc');
  const os         = sh("grep PRETTY_NAME /etc/os-release | cut -d= -f2 | tr -d '\"'", 'Arch Linux');
  const uptime     = sh("uptime -p", 'up some time');
  const memlines   = sh("cat /proc/meminfo", '').split('\n');
  const totalKb    = parseInt((memlines.find(l => l.startsWith('MemTotal'))    || '').replace(/\D/g, '') || '0', 10);
  const availKb    = parseInt((memlines.find(l => l.startsWith('MemAvailable'))|| '').replace(/\D/g, '') || '0', 10);
  const usedKb     = totalKb - availKb;
  const cpuUsage   = parseFloat(sh("top -bn1 | grep 'Cpu(s)' | awk '{print $2}'", '0')) || 0;
  const biosVendor = sysfs('/sys/class/dmi/id/bios_vendor', 'Unknown');
  const biosVer    = sysfs('/sys/class/dmi/id/bios_version', 'Unknown');
  const boardName  = sysfs('/sys/class/dmi/id/product_name', 'Unknown');
  const boardVendor= sysfs('/sys/class/dmi/id/sys_vendor', 'Unknown');
  res.json({ hostname, os, kernel, arch, uptime,
    cpu: { model: cpuModel, cores: parseInt(cpuCores, 10), usage: cpuUsage },
    ram: { total: totalKb, used: usedKb, available: availKb },
    firmware: { biosVendor, biosVersion: biosVer, boardName, boardVendor } });
});

// ════════════════════════════════════════════════════════════════════════════
// NETWORK — INFO + CONTROL
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/network', (req, res) => {
  const raw = sh("ip -o addr show", '');
  const ifaces = {};
  raw.split('\n').filter(Boolean).forEach(line => {
    const m = line.match(/^\d+:\s+(\S+)\s+(inet6?)\s+(\S+)/);
    if (!m) return;
    const [,iface,type,addr] = m;
    if (!ifaces[iface]) ifaces[iface] = { name: iface, addresses: [] };
    ifaces[iface].addresses.push({ type, addr });
  });
  const linkRaw = sh("ip -o link show", '');
  linkRaw.split('\n').filter(Boolean).forEach(line => {
    const m = line.match(/^\d+:\s+(\S+):.*link\/\S+\s+([0-9a-f:]{17})/i);
    if (!m) return;
    const [,iface,mac] = m;
    if (!ifaces[iface]) ifaces[iface] = { name: iface, addresses: [] };
    ifaces[iface].mac = mac;
    const st = line.match(/state\s+(\S+)/);
    if (st) ifaces[iface].state = st[1];
  });
  const ssid = sh("nmcli -t -f active,ssid dev wifi 2>/dev/null | grep '^yes' | cut -d: -f2", '');
  const signal = sh("nmcli -t -f active,signal dev wifi 2>/dev/null | grep '^yes' | cut -d: -f2", '');
  if (ssid && ifaces.wlo1) { ifaces.wlo1.ssid = ssid; ifaces.wlo1.signal = signal; }
  const wifiEnabled = sh("nmcli radio wifi", 'enabled').trim() === 'enabled';
  const dns = sh("grep nameserver /etc/resolv.conf | awk '{print $2}'", '').split('\n').filter(Boolean);
  const gateway = sh("ip route | grep default | awk '{print $3}' | head -1", '');
  res.json({ interfaces: Object.values(ifaces), dns, gateway, wifiEnabled });
});

// WiFi Scan (returns cached results quickly, triggers background rescan)
app.get('/api/wifi/scan', (req, res) => {
  try {
    // Use cached results for fast response. Background rescan happens via /api/wifi/rescan
    const raw = sh("nmcli --escape no -t -f IN-USE,SSID,SIGNAL,SECURITY,CHAN device wifi list --rescan no 2>/dev/null", '');
    const saved = sh("nmcli --escape no -t -f NAME,TYPE connection show 2>/dev/null | grep ':wifi$' | sed 's/:wifi$//'", '').split('\n').filter(Boolean);
    const networks = raw.split('\n').filter(Boolean).map(line => {
      // Format: ' :SSID:SIGNAL:SECURITY:CHAN' or '*:SSID:SIGNAL:SECURITY:CHAN'
      const inUse = line.startsWith('*');
      const rest  = line.substring(2); // skip "* " or "  "
      const parts = rest.split(':');
      const chan     = parts[parts.length - 1] || '';
      const security = parts[parts.length - 2] || 'Open';
      const signal   = parseInt(parts[parts.length - 3], 10) || 0;
      const ssid     = parts.slice(0, parts.length - 3).join(':').trim();
      const bars     = signal >= 75 ? '▂▄▆█' : signal >= 50 ? '▂▄▆_' : signal >= 25 ? '▂▄__' : '▂___';
      const isSaved  = saved.some(s => s.trim() === ssid);
      return { ssid, signal, security, active: inUse, chan, bars, saved: isSaved };
    }).filter(n => n.ssid && n.ssid !== '--').sort((a, b) => b.signal - a.signal);
    res.json(networks);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Trigger async WiFi rescan (client calls this then re-fetches /api/wifi/scan after ~5s)
app.post('/api/wifi/rescan', (req, res) => {
  exec('nmcli device wifi list --rescan yes 2>/dev/null', { shell: '/bin/bash', timeout: 10000 }, () => {});
  res.json({ success: true, message: 'Rescan triggered, fetch /api/wifi/scan in ~5 seconds' });
});

// WiFi Connect
app.post('/api/wifi/connect', (req, res) => {
  const { ssid, password } = req.body;
  if (!ssid) return res.status(400).json({ error: 'SSID required' });
  const savedConnections = sh("nmcli -t -f NAME connection show 2>/dev/null", '').split('\n');
  if (savedConnections.includes(ssid)) {
    shAsync(`nmcli connection up "${ssid}" 2>&1`, res, `Connected to ${ssid}`);
  } else if (password) {
    shAsync(`nmcli device wifi connect "${ssid}" password "${password}" 2>&1`, res, `Connected to ${ssid}`);
  } else {
    shAsync(`nmcli device wifi connect "${ssid}" 2>&1`, res, `Connected to ${ssid}`);
  }
});

// WiFi Disconnect
app.post('/api/wifi/disconnect', (req, res) => {
  shAsync('nmcli device disconnect wlo1 2>&1', res, 'Disconnected from WiFi');
});

// WiFi Forget
app.post('/api/wifi/forget', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Connection name required' });
  shAsync(`nmcli connection delete "${name}" 2>&1`, res, `Removed connection: ${name}`);
});

// WiFi Toggle
app.post('/api/wifi/toggle', (req, res) => {
  const { enable } = req.body;
  const cmd = enable ? 'nmcli radio wifi on' : 'nmcli radio wifi off';
  shAsync(cmd, res, enable ? 'WiFi enabled' : 'WiFi disabled');
});

// ════════════════════════════════════════════════════════════════════════════
// AUDIO — INFO + FULL CONTROL
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/audio', (req, res) => {
  const volOut    = parseInt(sh("pamixer --get-volume 2>/dev/null", '50'), 10) || 50;
  const muteOut   = sh("pamixer --get-mute 2>/dev/null", 'false') === 'true';
  const micVol    = parseInt(sh("pamixer --default-source --get-volume 2>/dev/null", '100'), 10) || 100;
  const micMute   = sh("pamixer --default-source --get-mute 2>/dev/null", 'false') === 'true';
  const pipewire  = sh("pipewire --version 2>/dev/null | head -1", '');
  const defaultSink = sh("pactl get-default-sink 2>/dev/null", '');
  const defaultSource = sh("pactl get-default-source 2>/dev/null", '');

  const sinksRaw = sh("pactl list sinks 2>/dev/null", '');
  const sinks = [];
  sinksRaw.split('\n\n').filter(b => b.includes('Name:')).forEach(block => {
    const name = (block.match(/Name:\s+(.+)/) || [])[1]?.trim() || '';
    const desc = (block.match(/Description:\s+(.+)/) || [])[1]?.trim() || name;
    const state= (block.match(/State:\s+(.+)/) || [])[1]?.trim() || '';
    if (name) sinks.push({ name, desc, state, isDefault: name === defaultSink });
  });

  const sourcesRaw = sh("pactl list sources 2>/dev/null", '');
  const sources = [];
  sourcesRaw.split('\n\n').filter(b => b.includes('Name:') && !b.includes('.monitor')).forEach(block => {
    const name = (block.match(/Name:\s+(.+)/) || [])[1]?.trim() || '';
    const desc = (block.match(/Description:\s+(.+)/) || [])[1]?.trim() || name;
    const state= (block.match(/State:\s+(.+)/) || [])[1]?.trim() || '';
    if (name && !name.includes('.monitor')) sources.push({ name, desc, state, isDefault: name === defaultSource });
  });

  res.json({ volume: volOut, muted: muteOut, micVolume: micVol, micMuted: micMute,
    server: pipewire || 'PipeWire/PulseAudio', sinks, sources, defaultSink, defaultSource });
});

// Set output volume
app.post('/api/audio/volume', (req, res) => {
  const { level } = req.body;
  const vol = Math.max(0, Math.min(150, parseInt(level, 10)));
  shAsync(`pamixer --set-volume ${vol} 2>&1`, res, `Volume set to ${vol}%`);
});

// Set mic volume
app.post('/api/audio/mic-volume', (req, res) => {
  const { level } = req.body;
  const vol = Math.max(0, Math.min(100, parseInt(level, 10)));
  shAsync(`pamixer --default-source --set-volume ${vol} 2>&1`, res, `Mic volume set to ${vol}%`);
});

// Toggle output mute
app.post('/api/audio/mute', (req, res) => {
  shAsync('pamixer --toggle-mute 2>&1', res, 'Output mute toggled');
});

// Toggle mic mute
app.post('/api/audio/mic-mute', (req, res) => {
  shAsync('pamixer --default-source --toggle-mute 2>&1', res, 'Mic mute toggled');
});

// Set default sink
app.post('/api/audio/default-sink', (req, res) => {
  const { sink } = req.body;
  if (!sink) return res.status(400).json({ error: 'Sink name required' });
  shAsync(`pactl set-default-sink "${sink}" 2>&1`, res, `Default output set to ${sink}`);
});

// Set default source
app.post('/api/audio/default-source', (req, res) => {
  const { source } = req.body;
  if (!source) return res.status(400).json({ error: 'Source name required' });
  shAsync(`pactl set-default-source "${source}" 2>&1`, res, `Default input set to ${source}`);
});

// ════════════════════════════════════════════════════════════════════════════
// DISPLAY — INFO + BRIGHTNESS CONTROL
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/display', (req, res) => {
  let monitors = [];
  try {
    const raw = sh("hyprctl monitors -j 2>/dev/null", '[]');
    monitors = JSON.parse(raw || '[]');
  } catch { monitors = []; }

  const gpus = [];
  sh("lspci | grep -iE 'vga|3d|display'", '').split('\n').filter(Boolean)
    .forEach(l => gpus.push(l.split(': ').slice(1).join(': ')));

  const nvidiaSmi = sh("nvidia-smi --query-gpu=name,temperature.gpu,utilization.gpu,memory.used,memory.total --format=csv,noheader,nounits 2>/dev/null", '');
  const brightnessNow = parseInt(sh("brightnessctl get 2>/dev/null", '5'), 10);
  const brightnessMax = parseInt(sh("brightnessctl max 2>/dev/null", '100'), 10);
  const brightnessPct = Math.round((brightnessNow / brightnessMax) * 100);

  res.json({ monitors, gpus, nvidiaSmi, brightness: { current: brightnessNow, max: brightnessMax, percent: brightnessPct } });
});

// Set brightness
app.post('/api/display/brightness', (req, res) => {
  const { level } = req.body;
  const pct = Math.max(5, Math.min(100, parseInt(level, 10)));
  shAsync(`brightnessctl set ${pct}% 2>&1`, res, `Brightness set to ${pct}%`);
});

// ════════════════════════════════════════════════════════════════════════════
// POWER — BATTERY + CPU GOVERNOR + IDLE TIMEOUTS
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/power', (req, res) => {
  const batPath = '/sys/class/power_supply/BAT1';
  const acPath  = '/sys/class/power_supply/ACAD';
  const batExist = fs.existsSync(batPath);
  const battery = batExist ? {
    capacity:     parseInt(sysfs(`${batPath}/capacity`, '0'), 10),
    status:       sysfs(`${batPath}/status`, 'Unknown'),
    technology:   sysfs(`${batPath}/technology`, 'Unknown'),
    cycleCount:   parseInt(sysfs(`${batPath}/cycle_count`, '0'), 10),
    energyNow:    parseInt(sysfs(`${batPath}/energy_now`, '0'), 10),
    energyFull:   parseInt(sysfs(`${batPath}/energy_full`, '0'), 10),
    energyDesign: parseInt(sysfs(`${batPath}/energy_full_design`, '0'), 10),
    manufacturer: sysfs(`${batPath}/manufacturer`, 'Unknown'),
    modelName:    sysfs(`${batPath}/model_name`, 'Unknown'),
  } : null;

  const acOnline = parseInt(sysfs(`${acPath}/online`, '1'), 10);
  const governor = sysfs('/sys/devices/system/cpu/cpu0/cpufreq/scaling_governor', 'powersave');
  const availGovs = sysfs('/sys/devices/system/cpu/cpu0/cpufreq/scaling_available_governors', 'performance powersave').split(' ');
  const curFreqKhz = parseInt(sysfs('/sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq', '0'), 10);
  const maxFreqKhz = parseInt(sysfs('/sys/devices/system/cpu/cpu0/cpufreq/cpuinfo_max_freq', '0'), 10);
  const minFreqKhz = parseInt(sysfs('/sys/devices/system/cpu/cpu0/cpufreq/cpuinfo_min_freq', '0'), 10);

  // Parse hypridle.conf for timeouts
  let idleConf = '';
  try { idleConf = fs.readFileSync(IDLE_CONF, 'utf8'); } catch {}
  const timeouts = [...idleConf.matchAll(/timeout\s*=\s*(\d+)/g)].map(m => parseInt(m[1], 10));

  res.json({
    battery, acAdapter: { online: acOnline === 1 },
    cpu: { governor, availableGovernors: availGovs, curFreqMhz: Math.round(curFreqKhz/1000), maxFreqMhz: Math.round(maxFreqKhz/1000), minFreqMhz: Math.round(minFreqKhz/1000) },
    idleTimeouts: {
      dim:     timeouts[0] ?? 240,
      lock:    timeouts[1] ?? 480,
      dpms:    timeouts[2] ?? 720,
      suspend: timeouts[3] ?? 1800,
    }
  });
});

// Switch CPU governor
app.post('/api/power/governor', (req, res) => {
  const { mode } = req.body;
  const allowed = ['performance', 'powersave'];
  if (!allowed.includes(mode)) return res.status(400).json({ error: 'Invalid governor mode' });
  const cores = parseInt(sh("nproc", '16'), 10);
  const cmds = Array.from({ length: cores }, (_, i) =>
    `echo ${mode} | tee /sys/devices/system/cpu/cpu${i}/cpufreq/scaling_governor`
  ).join(' && ');
  shAsync(`bash -c "${cmds}" 2>&1`, res, `CPU governor set to ${mode}`);
});

// Update idle timeouts (rewrite hypridle.conf)
app.post('/api/power/timeouts', (req, res) => {
  const { dim, lock, dpms, suspend } = req.body;
  try {
    let content = fs.readFileSync(IDLE_CONF, 'utf8');
    const timeoutsArr = [dim, lock, dpms, suspend].map(Number);
    let idx = 0;
    content = content.replace(/^(\s*timeout\s*=\s*)\d+/gm, (match, prefix) => {
      if (idx < timeoutsArr.length && !isNaN(timeoutsArr[idx])) {
        return `${prefix}${timeoutsArr[idx++]}`;
      }
      idx++;
      return match;
    });
    fs.writeFileSync(IDLE_CONF, content, 'utf8');
    sh('killall hypridle 2>/dev/null; hypridle &');
    res.json({ success: true, message: 'Idle timeouts updated and hypridle restarted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// BLUETOOTH — FULL CONTROL
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/bluetooth', (req, res) => {
  const rawShow = sh("bluetoothctl show 2>/dev/null", '');
  const powered = /Powered:\s+yes/i.test(rawShow);
  const discovering = /Discovering:\s+yes/i.test(rawShow);
  const controllerMac = (rawShow.match(/Controller\s+([0-9A-F:]+)/i) || [])[1] || '';
  const controllerName = (rawShow.match(/Name:\s+(.+)/) || [])[1]?.trim() || 'Unknown';

  const rawDevices = sh("bluetoothctl devices 2>/dev/null", '');
  const devices = rawDevices.split('\n').filter(Boolean).map(line => {
    const m = line.match(/Device\s+([0-9A-F:]+)\s+(.+)/i);
    if (!m) return null;
    const mac = m[1], name = m[2];
    const info = sh(`bluetoothctl info ${mac} 2>/dev/null`, '');
    const connected = /Connected:\s+yes/i.test(info);
    const paired    = /Paired:\s+yes/i.test(info);
    const trusted   = /Trusted:\s+yes/i.test(info);
    const icon      = (info.match(/Icon:\s+(.+)/) || [])[1]?.trim() || 'device';
    return { mac, name, connected, paired, trusted, icon };
  }).filter(Boolean);

  res.json({ powered, discovering, controller: { mac: controllerMac, name: controllerName }, devices });
});

// Toggle Bluetooth power
app.post('/api/bluetooth/toggle', (req, res) => {
  const { enable } = req.body;
  shAsync(`bluetoothctl power ${enable ? 'on' : 'off'} 2>&1`, res, enable ? 'Bluetooth enabled' : 'Bluetooth disabled');
});

// Scan for devices (10 second scan)
app.post('/api/bluetooth/scan', (req, res) => {
  exec("bluetoothctl --timeout 10 scan on 2>&1", { shell: '/bin/bash', timeout: 15000 }, () => {
    const rawDevices = sh("bluetoothctl devices 2>/dev/null", '');
    const devices = rawDevices.split('\n').filter(Boolean).map(line => {
      const m = line.match(/Device\s+([0-9A-F:]+)\s+(.+)/i);
      if (!m) return null;
      const mac = m[1], name = m[2];
      const info = sh(`bluetoothctl info ${mac} 2>/dev/null`, '');
      const connected = /Connected:\s+yes/i.test(info);
      const paired    = /Paired:\s+yes/i.test(info);
      return { mac, name, connected, paired };
    }).filter(Boolean);
    res.json({ success: true, devices });
  });
});

// Connect to device
app.post('/api/bluetooth/connect', (req, res) => {
  const { mac } = req.body;
  if (!mac) return res.status(400).json({ error: 'MAC address required' });
  shAsync(`bluetoothctl connect ${mac} 2>&1`, res, `Connecting to ${mac}`);
});

// Disconnect device
app.post('/api/bluetooth/disconnect', (req, res) => {
  const { mac } = req.body;
  if (!mac) return res.status(400).json({ error: 'MAC address required' });
  shAsync(`bluetoothctl disconnect ${mac} 2>&1`, res, `Disconnected ${mac}`);
});

// Remove/forget device
app.post('/api/bluetooth/remove', (req, res) => {
  const { mac } = req.body;
  if (!mac) return res.status(400).json({ error: 'MAC address required' });
  shAsync(`bluetoothctl remove ${mac} 2>&1`, res, `Removed device ${mac}`);
});

// Pair a device
app.post('/api/bluetooth/pair', (req, res) => {
  const { mac } = req.body;
  if (!mac) return res.status(400).json({ error: 'MAC address required' });
  exec(`bluetoothctl pair ${mac} 2>&1`, { shell: '/bin/bash', timeout: 30000 }, (err, stdout) => {
    res.json({ success: !err, output: stdout.trim() });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// DATE, TIME & REGION
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/datetime', (req, res) => {
  const rawTimectl = sh("timedatectl status 2>/dev/null", '');
  const localTime  = (rawTimectl.match(/Local time:\s+(.+)/) || [])[1]?.trim() || '';
  const timezone   = (rawTimectl.match(/Time zone:\s+(\S+)/) || [])[1]?.trim() || 'UTC';
  const ntpActive  = /NTP service:\s+active/i.test(rawTimectl);
  const synced     = /System clock synchronized:\s+yes/i.test(rawTimectl);
  const locale     = sh("localectl status | grep 'System Locale' | cut -d= -f2", 'en_US.UTF-8');
  const x11Layout  = sh("localectl status | grep 'X11 Layout' | cut -d: -f2", '').trim() || 'us';
  res.json({ localTime, timezone, ntpActive, synced, locale, x11Layout });
});

// Get all timezones
app.get('/api/datetime/timezones', (req, res) => {
  const tzs = sh("timedatectl list-timezones 2>/dev/null", '').split('\n').filter(Boolean);
  res.json(tzs);
});

// Set timezone
app.post('/api/datetime/timezone', (req, res) => {
  const { tz } = req.body;
  if (!tz) return res.status(400).json({ error: 'Timezone required' });
  shAsync(`timedatectl set-timezone "${tz}" 2>&1`, res, `Timezone set to ${tz}`);
});

// Toggle NTP
app.post('/api/datetime/ntp', (req, res) => {
  const { enable } = req.body;
  shAsync(`timedatectl set-ntp ${enable ? 'true' : 'false'} 2>&1`, res, enable ? 'NTP enabled' : 'NTP disabled');
});

// ════════════════════════════════════════════════════════════════════════════
// COMPOSITOR — READ + FULL CONTROL
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/compositor', (req, res) => {
  if (!fs.existsSync(HYPR_CONF)) return res.status(404).json({ error: 'hyprland.conf not found' });
  const content = fs.readFileSync(HYPR_CONF, 'utf8');

  const get = (key, fallback) => {
    const m = content.match(new RegExp(`^\\s*${key}\\s*=\\s*(.+)$`, 'm'));
    return m ? m[1].trim() : fallback;
  };
  const getInSection = (section, key, fallback) => {
    const secRe = new RegExp(`${section}\\s*\\{([^}]*)\\}`, 's');
    const secM = content.match(secRe);
    if (!secM) return fallback;
    const m = secM[1].match(new RegExp(`^\\s*${key}\\s*=\\s*(.+)$`, 'm'));
    return m ? m[1].trim() : fallback;
  };

  res.json({
    gaps_in:            parseInt(get('gaps_in', '5'), 10),
    gaps_out:           parseInt(get('gaps_out', '10'), 10),
    border_size:        parseInt(get('border_size', '2'), 10),
    rounding:           parseInt(get('rounding', '12'), 10),
    active_opacity:     parseFloat(get('active_opacity', '1.0')),
    inactive_opacity:   parseFloat(get('inactive_opacity', '0.92')),
    sensitivity:        parseFloat(get('sensitivity', '0')),
    natural_scroll:     get('natural_scroll', 'true') === 'true',
    kb_layout:          get('kb_layout', 'us'),
    active_border:      get('col.active_border', 'rgba(89b4faee) rgba(cba6f7ee) 45deg'),
    inactive_border:    get('col.inactive_border', 'rgba(585b70aa)'),
    blur_enabled:       getInSection('blur', 'enabled', 'true') === 'true',
    blur_size:          parseInt(getInSection('blur', 'size', '6'), 10),
    blur_passes:        parseInt(getInSection('blur', 'passes', '2'), 10),
    shadow_enabled:     getInSection('shadow', 'enabled', 'true') === 'true',
    shadow_range:       parseInt(getInSection('shadow', 'range', '15'), 10),
    dim_inactive:       get('dim_inactive', 'true') === 'true',
    dim_strength:       parseFloat(get('dim_strength', '0.15')),
    animations_enabled: get('enabled', 'true') === 'true',
  });
});

app.post('/api/compositor', (req, res) => {
  if (!fs.existsSync(HYPR_CONF)) return res.status(404).json({ error: 'hyprland.conf not found' });
  let content = fs.readFileSync(HYPR_CONF, 'utf8');

  const replace = (pattern, value) => {
    const re = new RegExp(`(^\\s*${pattern}\\s*=\\s*).*`, 'm');
    if (re.test(content)) content = content.replace(re, `$1${value}`);
  };

  const s = req.body;
  if (s.gaps_in           !== undefined) replace('gaps_in',             s.gaps_in);
  if (s.gaps_out          !== undefined) replace('gaps_out',            s.gaps_out);
  if (s.border_size       !== undefined) replace('border_size',         s.border_size);
  if (s.rounding          !== undefined) replace('rounding',            s.rounding);
  if (s.active_opacity    !== undefined) replace('active_opacity',      s.active_opacity);
  if (s.inactive_opacity  !== undefined) replace('inactive_opacity',    s.inactive_opacity);
  if (s.sensitivity       !== undefined) replace('sensitivity',         s.sensitivity);
  if (s.natural_scroll    !== undefined) replace('natural_scroll',      s.natural_scroll);
  if (s.kb_layout         !== undefined) replace('kb_layout',           s.kb_layout);
  if (s.dim_inactive      !== undefined) replace('dim_inactive',        s.dim_inactive);
  if (s.dim_strength      !== undefined) replace('dim_strength',        s.dim_strength);
  if (s.blur_enabled      !== undefined) {
    // replace within blur block
    const blurRe = /(blur\s*\{[^}]*enabled\s*=\s*)(true|false)/s;
    content = content.replace(blurRe, `$1${s.blur_enabled}`);
  }
  if (s.blur_size         !== undefined) {
    const re = /(blur\s*\{[^}]*\n\s*size\s*=\s*)\d+/s;
    content = content.replace(re, `$1${s.blur_size}`);
  }
  if (s.blur_passes       !== undefined) {
    const re = /(blur\s*\{[^}]*\n[\s\S]*?passes\s*=\s*)\d+/s;
    content = content.replace(re, `$1${s.blur_passes}`);
  }
  if (s.shadow_enabled    !== undefined) {
    const re = /(shadow\s*\{[^}]*enabled\s*=\s*)(true|false)/s;
    content = content.replace(re, `$1${s.shadow_enabled}`);
  }
  if (s.shadow_range      !== undefined) {
    const re = /(shadow\s*\{[^}]*\n\s*range\s*=\s*)\d+/s;
    content = content.replace(re, `$1${s.shadow_range}`);
  }

  fs.writeFileSync(HYPR_CONF, content, 'utf8');
  sh('hyprctl reload 2>/dev/null');
  res.json({ success: true, message: 'Compositor config saved and reloaded' });
});

// ════════════════════════════════════════════════════════════════════════════
// STORAGE
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/storage', (req, res) => {
  const dfOut = sh("df -BM --output=source,fstype,size,used,avail,pcent,target 2>/dev/null | tail -n +2", '');
  const partitions = dfOut.split('\n').filter(Boolean).map(line => {
    const [source, fstype, size, used, avail, pcent, target] = line.trim().replace(/M/g, '').split(/\s+/);
    return { source, fstype, size: +size||0, used: +used||0, avail: +avail||0,
      percent: parseInt((pcent||'0').replace('%',''),10), mountpoint: target };
  }).filter(p => p.mountpoint && p.size > 50 && !p.source.includes('tmpfs') && p.source !== 'none');

  const lsblk = sh("lsblk -J -o NAME,SIZE,TYPE,MODEL,ROTA,MOUNTPOINTS 2>/dev/null", '{}');
  let blockDevices = [];
  try { blockDevices = (JSON.parse(lsblk).blockdevices||[]).filter(d=>d.type==='disk'); } catch {}

  res.json({ partitions, blockDevices });
});

// Open path in Thunar
app.post('/api/storage/open', (req, res) => {
  const { path: mnt } = req.body;
  if (!mnt) return res.status(400).json({ error: 'Path required' });
  exec(`DISPLAY=:0 thunar "${mnt}" &`, { shell: '/bin/bash' });
  res.json({ success: true, message: `Opening ${mnt} in Thunar` });
});

// ════════════════════════════════════════════════════════════════════════════
// USERS
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/users', (req, res) => {
  const username  = sh("id -un", 'harsh');
  const uid       = sh("id -u", '1000');
  const gid       = sh("id -g", '1000');
  const groups    = sh("id -Gn", '').split(' ').filter(Boolean);
  const shell     = sh(`getent passwd ${username} | cut -d: -f7`, '/bin/bash');
  const home      = sh(`getent passwd ${username} | cut -d: -f6`, '/home/harsh');
  const hostname  = sysfs('/proc/sys/kernel/hostname', 'arch-pc');
  const loginHistory = sh("last -n 8 --time-format iso 2>/dev/null", '').split('\n').filter(l=>l&&!l.startsWith('wtmp'));
  const systemUsers  = sh("getent passwd | awk -F: '$3 >= 1000 && $3 < 65534 {print $0}'", '')
    .split('\n').filter(Boolean).map(line => {
      const [uname,,uidv,gidv,,comment,sh2] = line.split(':');
      return { username: uname, uid: uidv, gid: gidv, comment, shell: sh2 };
    });
  res.json({ current: { username, uid, gid, groups, shell, home, hostname }, loginHistory, systemUsers });
});

// ════════════════════════════════════════════════════════════════════════════
// PROCESSES — WITH KILL + SEARCH
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/processes', (req, res) => {
  const byCpu = sh("ps aux --sort=-%cpu | head -21 | tail -20", '');
  const byMem = sh("ps aux --sort=-%mem | head -21 | tail -20", '');
  const parse = raw => raw.split('\n').filter(Boolean).map(line => {
    const p = line.trim().split(/\s+/);
    return { user:p[0], pid:p[1], cpu:parseFloat(p[2])||0, mem:parseFloat(p[3])||0,
      rss: Math.round(parseInt(p[5]||'0')/1024) + ' MB',
      stat:p[7]||'', command:p.slice(10).join(' ').substring(0,55) };
  });
  const total = parseInt(sh("ps aux | wc -l",'0'),10)-1;
  res.json({ byCpu: parse(byCpu), byMem: parse(byMem), total });
});

// Kill a process
app.post('/api/processes/kill', (req, res) => {
  const { pid } = req.body;
  if (!pid) return res.status(400).json({ error: 'PID required' });
  shAsync(`kill -9 ${pid} 2>&1`, res, `Process ${pid} terminated`);
});

// ════════════════════════════════════════════════════════════════════════════
// KEYBINDS
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/keybinds', (req, res) => {
  if (!fs.existsSync(HYPR_CONF)) return res.status(404).json([]);
  const content = fs.readFileSync(HYPR_CONF, 'utf8');
  const binds = [];
  let lastComment = '';
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('#')) {
      const c = trimmed.replace(/^#+\s*/,'');
      if (c && !c.includes('===') && !c.includes('───')) lastComment = c;
      return;
    }
    if (!trimmed) { lastComment=''; return; }
    const m = trimmed.match(/^(bind[eml]{0,2})\s*=\s*([^,]*),\s*([^,]+),\s*([^,]+)(?:,\s*(.+))?$/);
    if (m) {
      binds.push({
        type:m[1], mods:(m[2]||'').trim().replace('$mainMod','SUPER') || 'None',
        key:m[3].trim(), action:m[4].trim(), args:(m[5]||'').trim(), category:lastComment||'Misc'
      });
    }
  });
  res.json(binds);
});

// ════════════════════════════════════════════════════════════════════════════
// STARTUP APPS
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/startup', (req, res) => {
  if (!fs.existsSync(HYPR_CONF)) return res.status(404).json([]);
  const content = fs.readFileSync(HYPR_CONF, 'utf8');
  const entries = [];
  content.split('\n').forEach((line, idx) => {
    const m = line.match(/^(#\s*)?(exec-once)\s*=\s*(.+)$/);
    if (m) entries.push({ line: idx, enabled: !m[1], command: m[3].trim(), raw: line });
  });
  res.json(entries);
});

// ════════════════════════════════════════════════════════════════════════════
// QUICK ACTIONS
// ════════════════════════════════════════════════════════════════════════════
app.post('/api/action', (req, res) => {
  const { type } = req.body;
  const SCRIPTS = `${DOTFILES}/hypr/scripts`;
  const cmds = {
    'lock':              'hyprlock &',
    'logout':            'hyprctl dispatch exit &',
    'reboot':            'systemctl reboot',
    'suspend':           'systemctl suspend',
    'shutdown':          'systemctl poweroff',
    'screenshot-region': `bash ${SCRIPTS}/screenshot.sh region &`,
    'screenshot-full':   `bash ${SCRIPTS}/screenshot.sh full &`,
    'reload-hyprland':   'hyprctl reload',
    'reload-waybar':     'killall waybar 2>/dev/null; waybar &',
  };
  const cmd = cmds[type];
  if (!cmd) return res.status(400).json({ error: 'Unknown action: ' + type });
  exec(cmd, { shell: '/bin/bash', timeout: 5000 }, (err, stdout, stderr) => {
    res.json({ success: true, output: stdout || stderr || '' });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// SERVE FRONTEND
// ════════════════════════════════════════════════════════════════════════════
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  ⚙️  HyprControl Settings Panel\n  →  http://localhost:${PORT}\n`);
});
