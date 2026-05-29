# HyprControl System Settings

A full-featured system settings panel for Hyprland on Arch Linux.  
Accessible at: **http://localhost:50000**

## Starting the Server

```bash
cd ~/hyprland-dotfiles/control-center
node server.js
```

## Auto-start with Hyprland

Add to your `hyprland.conf`:

```ini
exec-once = bash -c 'cd ~/hyprland-dotfiles/control-center && node server.js &'
```

## Panels

| Panel | Controls |
|---|---|
| System Overview | Live RAM, CPU, hostname, firmware |
| Network & WiFi | Scan, connect, disconnect, forget networks |
| Bluetooth | Pair, connect, scan, remove devices |
| Sound | Volume slider, mic slider, mute, device selector |
| Display & Brightness | Real brightness slider, monitor info, GPU stats |
| Power & Battery | CPU governor, battery health, idle timeouts editor |
| Storage | Disk usage bars, open in Thunar |
| Users & Accounts | Profile, groups, login history |
| Date, Time & Region | Timezone selector, NTP toggle |
| Compositor | Gaps, rounding, blur, shadow, opacity sliders |
| Startup Apps | View exec-once entries |
| Keybindings | Searchable + filterable shortcut table |
| Processes | Kill processes, search, sort by CPU/RAM |
| About | Full system spec sheet |

## Port

**Always port 50000** — never changes.
