# 🖥️ Hyprland Desktop Environment — User Guide

> **Machine:** AMD Ryzen 7 7840HS · RTX 4050 Mobile · AMD 780M iGPU  
> **Display:** eDP-2 1920×1080 @ 60Hz  
> **Theme:** Catppuccin Mocha · JetBrainsMono Nerd Font  
> **Layout:** Dwindle (auto-tiling)

---

## 📋 Table of Contents

1. [Components Overview](#-components-overview)
2. [Keyboard Shortcuts](#-keyboard-shortcuts)
3. [Mouse Controls](#-mouse-controls)
4. [Touchpad Gestures](#-touchpad-gestures)
5. [Waybar Modules](#-waybar-modules)
6. [Autostart Services](#-autostart-services)
7. [Scripts](#-scripts)
8. [Config File Locations](#-config-file-locations)
9. [Customization Guide](#-customization-guide)
10. [Troubleshooting](#-troubleshooting)

---

## 🧩 Components Overview

| Component | Software | Purpose |
|---|---|---|
| Compositor | **Hyprland** v0.55+ | Window manager & compositor |
| Status Bar | **Waybar** | Top bar with system info |
| App Launcher | **Rofi** | Application launcher & menus |
| Terminal | **Kitty** | GPU-accelerated terminal |
| File Manager | **Thunar** | Graphical file manager |
| Browser | **Firefox** | Web browser |
| Notifications | **Dunst** | Notification daemon |
| Wallpaper | **Hyprpaper** | Static wallpaper |
| Lock Screen | **Hyprlock** | Screen locker |
| Idle Manager | **Hypridle** | Auto-lock & suspend |
| Clipboard | **cliphist** + wl-paste | Clipboard history |
| Screenshots | **grim** + slurp | Screen capture |
| Network | **nm-applet** | NetworkManager tray |
| Bluetooth | **blueman-applet** | Bluetooth tray |
| Audio | **WirePlumber** + pamixer | Audio control |
| Brightness | **brightnessctl** | Screen brightness |

---

## ⌨️ Keyboard Shortcuts

> **Super** = Windows/Meta key (referred to as `Super` below)

### 🚀 Application Launchers

| Shortcut | Action |
|---|---|
| `Super + Return` | Open terminal (Kitty) |
| `Super + Ctrl + Return` | Open floating terminal |
| `Super + D` | App launcher (Rofi drun) |
| `Super + Shift + D` | GPU-Selector Launcher (Run on AMD or NVIDIA) |
| `Super + R` | Run command (Rofi run) |
| `Super + Alt + Tab` | Window switcher (Rofi) |
| `Super + E` | File manager (Thunar) |
| `Super + B` | Browser (Firefox) |
| `Super + Shift + B` | Private browser window |
| `Super + V` | Clipboard history picker |
| `Super + Shift + E` | Power menu (lock/suspend/reboot/shutdown) |

### 🪟 Window Management

| Shortcut | Action |
|---|---|
| `Super + Q` | Close active window |
| `Super + T` | Toggle floating mode |
| `Super + F` | Fullscreen (true fullscreen) |
| `Super + M` | Maximize (fake fullscreen, keeps bar) |
| `Super + P` | Toggle pseudo-tiling |
| `Super + Shift + P` | Pin window (stays on all workspaces) |
| `Super + J` | Toggle split direction (dwindle) |

### 🧭 Focus Navigation

| Shortcut | Action |
|---|---|
| `Super + H` or `Super + ←` | Focus left |
| `Super + L` or `Super + →` | Focus right |
| `Super + K` or `Super + ↑` | Focus up |
| `Super + ↓` | Focus down |

### 📦 Move Windows

| Shortcut | Action |
|---|---|
| `Super + Shift + H` or `Super + Shift + ←` | Move window left |
| `Super + Shift + L` or `Super + Shift + →` | Move window right |
| `Super + Shift + K` or `Super + Shift + ↑` | Move window up |
| `Super + Shift + J` or `Super + Shift + ↓` | Move window down |

### 🔢 Workspaces

| Shortcut | Action |
|---|---|
| `Super + 1-9, 0` | Switch to workspace 1–10 |
| `Super + Shift + 1-9, 0` | Move window to workspace 1–10 |
| `Super + Tab` | Next workspace |
| `Super + Shift + Tab` | Previous workspace |
| `Super + Ctrl + →` | Move window to next workspace |
| `Super + Ctrl + ←` | Move window to previous workspace |

### 📌 Scratchpad

| Shortcut | Action |
|---|---|
| `` Super + ` `` (backtick) | Toggle scratchpad visibility |
| `` Super + Shift + ` `` | Send window to scratchpad |

### 📸 Screenshots

| Shortcut | Action |
|---|---|
| `Super + Shift + S` | Screenshot region (select area) |
| `Print Screen` | Screenshot full screen |
| `Super + Print Screen` | Screenshot active window |

> Screenshots are saved to `~/Pictures/Screenshots/` and copied to clipboard automatically.

### 🔊 Volume (Hardware Keys)

| Key | Action |
|---|---|
| `Volume Up` | Increase volume (+5%) |
| `Volume Down` | Decrease volume (-5%) |
| `Mute` | Toggle mute |
| `Mic Mute` | Toggle microphone mute |

> Volume goes up to 150% (boost mode). An OSD notification shows current level.

### 🔆 Brightness (Hardware Keys)

| Key | Action |
|---|---|
| `Brightness Up` | Increase brightness (+5%) |
| `Brightness Down` | Decrease brightness (-5%) |

> Minimum brightness is clamped at 5% to prevent black screen. OSD notification shows level.

### 🎵 Media (Hardware Keys)

| Key | Action |
|---|---|
| `Play/Pause` | Toggle play/pause |
| `Next` | Next track |
| `Previous` | Previous track |

### 🔔 Notifications

| Shortcut | Action |
|---|---|
| `Super + N` | Show last notification from history |
| `Super + Shift + N` | Close all notifications |

### 🎨 Utilities

| Shortcut | Action |
|---|---|
| `Super + Shift + C` | Color picker (copies hex to clipboard) |

### 🔐 Session

| Shortcut | Action |
|---|---|
| `Super + Ctrl + L` | Lock screen |
| `Super + Shift + R` | Reload Hyprland config |

---

## 🖱️ Mouse Controls

| Action | Behavior |
|---|---|
| `Super + Left Click Drag` | Move (drag) window |
| `Super + Right Click Drag` | Resize window |
| `Super + Scroll Up` | Next workspace |
| `Super + Scroll Down` | Previous workspace |

---

## 👆 Touchpad Gestures

| Gesture | Action |
|---|---|
| **3-finger horizontal swipe** | Switch workspace |
| **Tap-to-click** | Left click |
| **Natural scroll** | Enabled (scroll direction follows content) |

> Touchpad is disabled while typing.

---

## 📊 Waybar Modules

The top bar is organized into three sections:

```
┌──────────────────────────────────────────────────────────────────┐
│ [Logo] [Taskbar] [Workspaces]    [Clock]    [Tray] [Mem] [Net]  │
│                                              [BT] [Vol] [Bat] ⏻ │
└──────────────────────────────────────────────────────────────────┘
```

### Left Section
| Module | Description | Interaction |
|---|---|---|
| **Logo** (  ) | Arch logo | Click → Rofi launcher |
| **Taskbar** | Running app icons | Click → focus, Middle → close |
| **Workspaces** | 1–5 persistent, more on demand | Click → switch |

### Center
| Module | Description | Interaction |
|---|---|---|
| **Clock** | 12h time (e.g. 09:30 PM) | Click → toggle date display, Hover → calendar |

### Right Section
| Module | Description | Interaction |
|---|---|---|
| **Tray** | System tray icons | Standard tray behavior |
| **Memory** (󰍛) | RAM usage % | — |
| **Network** | WiFi signal strength icon | Click → WiFi menu, Right-click → alt WiFi menu |
| **Bluetooth** (󰂯) | Connection status | Click → Bluetooth device picker |
| **Volume** | Speaker icon | Click → toggle mute, Scroll → volume |
| **Battery** | Charge % + icon | Animated when charging, blinks on critical |
| **Power** (󰤆) | Shutdown button | Click → Power menu |

### Battery States
| State | Visual |
|---|---|
| Charging | Green + charging icon animation |
| Warning (< 20%) | Yellow |
| Critical (< 10%) | Red + blinking |
| Full | "Charged" text |

---

## 🔄 Autostart Services

These services start automatically when Hyprland launches:

| Service | Purpose |
|---|---|
| **D-Bus / XDG Portals** | Enables screen sharing, file dialogs, etc. |
| **Polkit Agent** | Authentication popups (e.g. sudo in GUI) |
| **Hyprpaper** | Sets wallpaper |
| **Waybar** | Status bar |
| **Dunst** | Notification daemon |
| **Hypridle** | Idle management (dim → lock → dpms → suspend) |
| **cliphist** (×2) | Clipboard history (text + images) |
| **nm-applet** | NetworkManager system tray |
| **blueman-applet** | Bluetooth system tray |

---

## 📜 Scripts

Located in `~/.config/hypr/scripts/`:

| Script | Usage | Description |
|---|---|---|
| `volume.sh` | `volume.sh [up\|down\|mute]` | Volume ±5% with dunst OSD |
| `brightness.sh` | `brightness.sh [up\|down]` | Brightness ±5% with dunst OSD |
| `screenshot.sh` | `screenshot.sh [region\|full\|window]` | Screenshot with grim+slurp, saves & copies |
| `clip-pick.sh` | `clip-pick.sh` | Rofi clipboard history picker |
| `power-menu.sh` | `power-menu.sh` | Rofi power menu with confirmation dialogs |
| `gpu-launcher.py` | `gpu-launcher.py` | Rofi-based app launcher with AMD/NVIDIA GPU selection |

---

## 📂 Config File Locations

```
~/.config/
├── hypr/
│   ├── hyprland.conf          # Main compositor config
│   ├── hyprlock.conf          # Lock screen appearance
│   ├── hypridle.conf          # Idle timeouts (dim/lock/suspend)
│   ├── hyprpaper.conf         # Wallpaper settings
│   ├── scripts/               # Helper scripts
│   │   ├── volume.sh
│   │   ├── brightness.sh
│   │   ├── screenshot.sh
│   │   ├── clip-pick.sh
│   │   ├── power-menu.sh
│   │   └── gpu-launcher.py
│   └── wallpapers/
│       └── default.png        # Current wallpaper
│
├── waybar/
│   ├── config                 # Module layout & settings (JSON)
│   └── style.css              # Appearance & colors (CSS)
│
├── rofi/
│   ├── config.rasi            # Global rofi settings
│   ├── themes/
│   │   └── catppuccin-mocha.rasi
│   ├── wifi/                  # WiFi picker scripts
│   ├── bluetooth/             # Bluetooth picker scripts
│   └── powermenu/             # Power menu theme & script
│
├── dunst/
│   └── dunstrc                # Notification appearance & rules
│
├── kitty/
│   ├── kitty.conf             # Terminal settings
│   └── catppuccin-mocha.conf  # Color scheme
│
├── gtk-3.0/settings.ini       # GTK3 theme (Adwaita-dark)
└── gtk-4.0/settings.ini       # GTK4 theme
```

---

## 🎨 Customization Guide

### Change Wallpaper
```bash
# Replace the wallpaper file
cp /path/to/your/image.png ~/.config/hypr/wallpapers/default.png

# Reload hyprpaper
killall hyprpaper && hyprpaper &
```

### Idle Timeouts

Edit `~/.config/hypr/hypridle.conf`:

| Step | Default | Action |
|---|---|---|
| 1. Dim screen | 4 minutes | Brightness → 20% |
| 2. Lock screen | 8 minutes | Hyprlock activates |
| 3. Display off | 12 minutes | DPMS off |
| 4. Suspend | 30 minutes | System suspend |

### Change Keyboard Layout

In `hyprland.conf`, under `input {}`:
```
kb_layout = us          # Change to: de, fr, es, etc.
```

### Add a New Keybind

Format: `bind = MODIFIERS, KEY, ACTION, ARGS`

Examples:
```bash
# Open Spotify with Super+F8
bind = $mainMod, F8, exec, spotify

# Toggle a specific app
bind = $mainMod, G, exec, google-chrome-stable
```

### Caps Lock Behavior

Currently: **Normal Caps Lock behavior is active** (default)

To remap Caps Lock to Escape:
```
kb_options = caps:escape
```

For dual-function (tap = Escape, hold = Caps Lock):
```
kb_options = caps:escape_shifted_capslock
```

### Window Rules

Force an app to float:
```bash
windowrulev2 = float, class:^(pavucontrol)$
windowrulev2 = size 800 600, class:^(pavucontrol)$
windowrulev2 = center, class:^(pavucontrol)$
```

Find a window's class name:
```bash
hyprctl clients -j | jq '.[].class'
```

### Add a Workspace-Specific App

Open a specific app on a workspace:
```bash
windowrulev2 = workspace 3, class:^(discord)$
```

---

## 🔧 Troubleshooting

### Screen Goes Black / No Display
```bash
# Switch to TTY
Ctrl + Alt + F2

# Restart Hyprland
Hyprland
```

### Waybar Disappeared
```bash
# Restart waybar
killall waybar; waybar &
```

### Notifications Not Showing
```bash
# Restart dunst
killall dunst; dunst &
```

### WiFi Not Connecting
```bash
# Restart NetworkManager
sudo systemctl restart NetworkManager
```

### Audio Not Working
```bash
# Check wireplumber
systemctl --user restart wireplumber

# List sinks
pamixer --list-sinks
```

### NVIDIA Issues
```bash
# Check if NVIDIA modules are loaded
lsmod | grep nvidia

# Check which GPU is in use
nvidia-smi
```

### Config Syntax Error After Editing
```bash
# Reload and check for errors
hyprctl reload

# View Hyprland logs
cat /tmp/hypr/$(ls -t /tmp/hypr/ | head -1)/hyprland.log | tail -50
```

### Find Window Class/Title
```bash
# Interactive — click on a window
hyprctl activewindow -j | jq '.class, .title'

# List all windows
hyprctl clients -j | jq '.[] | {class, title}'
```

---

## 📖 Useful Commands

```bash
# Reload Hyprland config
hyprctl reload                     # or Super+Shift+R

# List all keybinds
hyprctl binds

# Monitor info
hyprctl monitors

# Active window info
hyprctl activewindow

# Kill a window by clicking
hyprctl kill

# Hyprland version
hyprctl version
```

---

> **Config source:** `~/.config/hypr/hyprland.conf`  
> **Hyprland Wiki:** https://wiki.hyprland.org  
> **Theme:** Catppuccin Mocha — https://catppuccin.com


