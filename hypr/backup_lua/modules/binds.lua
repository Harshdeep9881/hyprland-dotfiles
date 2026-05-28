-- =============================================================================
-- binds.lua — Keybindings (Hyprland 0.55+ Lua API)
-- Main modifier: SUPER (Windows key)
-- Design: vim-friendly, one-hand-safe, laptop-optimised
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- ── APPLICATIONS ─────────────────────────────────────────────────────────────
-- ─────────────────────────────────────────────────────────────────────────────

-- Terminal
hl.bind("SUPER + Return", hl.dsp.exec_cmd("kitty"))
hl.bind("SUPER + CTRL + Return", hl.dsp.exec_cmd("kitty --class floating"))  -- floating terminal

-- File manager
hl.bind("SUPER + E", hl.dsp.exec_cmd("thunar"))

-- Browser
hl.bind("SUPER + B", hl.dsp.exec_cmd("firefox"))
hl.bind("SUPER + SHIFT + B", hl.dsp.exec_cmd("firefox --private-window"))

-- App launcher (rofi drun — desktop apps with icons)
hl.bind("SUPER + D", hl.dsp.exec_cmd("rofi -show drun -show-icons"))

-- Run launcher (rofi run — raw commands)
hl.bind("SUPER + R", hl.dsp.exec_cmd("rofi -show run"))

-- Window switcher
hl.bind("SUPER + ALT + Tab", hl.dsp.exec_cmd("rofi -show window -show-icons"))

-- Clipboard history (cliphist → rofi → wl-copy)
hl.bind("SUPER + V", hl.dsp.exec_cmd("~/.config/hypr/scripts/clip-pick.sh"))

-- Power menu
hl.bind("SUPER + SHIFT + E", hl.dsp.exec_cmd("~/.config/hypr/scripts/power-menu.sh"))

-- ── SCREENSHOTS ──────────────────────────────────────────────────────────────

-- Region screenshot → clipboard + save
hl.bind("SUPER + SHIFT + S", hl.dsp.exec_cmd("~/.config/hypr/scripts/screenshot.sh region"))

-- Full screen screenshot → clipboard + save
hl.bind("Print",  hl.dsp.exec_cmd("~/.config/hypr/scripts/screenshot.sh full"))

-- Active window screenshot → clipboard + save
hl.bind("SUPER + Print", hl.dsp.exec_cmd("~/.config/hypr/scripts/screenshot.sh window"))

-- ── WINDOW MANAGEMENT ────────────────────────────────────────────────────────

-- Close active window
hl.bind("SUPER + Q", hl.dsp.window.close())

-- Toggle floating for active window
hl.bind("SUPER + T", hl.dsp.window.float({ action = "toggle" }))

-- Toggle fullscreen
hl.bind("SUPER + F", hl.dsp.window.fullscreen({ mode = "fullscreen" }))     -- real fullscreen
hl.bind("SUPER + M", hl.dsp.window.fullscreen({ mode = "maximized" }))     -- maximise (keeps bar)

-- Toggle pseudotiling (floating-size within tiling)
hl.bind("SUPER + P", hl.dsp.window.pseudo())

-- Pin window (visible on all workspaces — PiP, notes, etc.)
hl.bind("SUPER + SHIFT + P", hl.dsp.window.pin())

-- Split direction toggle (dwindle layout)
hl.bind("SUPER + J", hl.dsp.layout("togglesplit"))

-- ── Focus movement (vim-style H/J/K/L) ───────────────────────────────────────
hl.bind("SUPER + H", hl.dsp.focus({ direction = "left" }))
hl.bind("SUPER + L", hl.dsp.focus({ direction = "right" }))
hl.bind("SUPER + K", hl.dsp.focus({ direction = "up" }))
hl.bind("SUPER + Down",  hl.dsp.focus({ direction = "down" }))
hl.bind("SUPER + Up",    hl.dsp.focus({ direction = "up" }))
hl.bind("SUPER + Left",  hl.dsp.focus({ direction = "left" }))
hl.bind("SUPER + Right", hl.dsp.focus({ direction = "right" }))

-- ── Window movement (swap with neighbour) ─────────────────────────────────────
hl.bind("SUPER + SHIFT + H",     hl.dsp.window.move({ direction = "left" }))
hl.bind("SUPER + SHIFT + L",     hl.dsp.window.move({ direction = "right" }))
hl.bind("SUPER + SHIFT + K",     hl.dsp.window.move({ direction = "up" }))
hl.bind("SUPER + SHIFT + J",     hl.dsp.window.move({ direction = "down" }))
hl.bind("SUPER + SHIFT + Left",  hl.dsp.window.move({ direction = "left" }))
hl.bind("SUPER + SHIFT + Right", hl.dsp.window.move({ direction = "right" }))
hl.bind("SUPER + SHIFT + Up",    hl.dsp.window.move({ direction = "up" }))
hl.bind("SUPER + SHIFT + Down",  hl.dsp.window.move({ direction = "down" }))

-- ── Resize mode (hold SUPER+CTRL, then arrow keys / HJKL) ────────────────────
-- Enter resize submap
hl.bind("SUPER + CTRL + R", hl.dsp.exec_cmd("hyprctl dispatch submap resize"))

-- Define "resize" submap
hl.define_submap("resize", function()
    hl.bind("H",     hl.dsp.window.resize({ x = -30, y = 0, relative = true }), { repeating = true })
    hl.bind("L",     hl.dsp.window.resize({ x = 30, y = 0, relative = true }), { repeating = true })
    hl.bind("K",     hl.dsp.window.resize({ x = 0, y = -30, relative = true }), { repeating = true })
    hl.bind("J",     hl.dsp.window.resize({ x = 0, y = 30, relative = true }), { repeating = true })
    hl.bind("Left",  hl.dsp.window.resize({ x = -30, y = 0, relative = true }), { repeating = true })
    hl.bind("Right", hl.dsp.window.resize({ x = 30, y = 0, relative = true }), { repeating = true })
    hl.bind("Up",    hl.dsp.window.resize({ x = 0, y = -30, relative = true }), { repeating = true })
    hl.bind("Down",  hl.dsp.window.resize({ x = 0, y = 30, relative = true }), { repeating = true })
    -- Exit resize mode
    hl.bind("escape", hl.dsp.exec_cmd("hyprctl dispatch submap reset"))
    hl.bind("return", hl.dsp.exec_cmd("hyprctl dispatch submap reset"))
end)

-- ── Move floating windows with mouse ──────────────────────────────────────────
hl.bind("SUPER + mouse:272", hl.dsp.window.drag(), { mouse = true })   -- SUPER + Left Click = move
hl.bind("SUPER + mouse:273", hl.dsp.window.resize(), { mouse = true }) -- SUPER + Right Click = resize

-- ── WORKSPACES ───────────────────────────────────────────────────────────────

-- Switch to workspace 1–10 (SUPER+1..0)
for i = 1, 9 do
    hl.bind("SUPER + " .. i, hl.dsp.focus({ workspace = i }))
    hl.bind("SUPER + SHIFT + " .. i, hl.dsp.window.move({ workspace = i }))
end
hl.bind("SUPER + 0",  hl.dsp.focus({ workspace = 10 }))
hl.bind("SUPER + SHIFT + 0", hl.dsp.window.move({ workspace = 10 }))

-- Cycle workspaces (SUPER+Tab / SUPER+Shift+Tab)
hl.bind("SUPER + Tab",  hl.dsp.focus({ workspace = "r+1" }))
hl.bind("SUPER + SHIFT + Tab", hl.dsp.focus({ workspace = "r-1" }))

-- Scroll through workspaces
hl.bind("SUPER + mouse_down", hl.dsp.focus({ workspace = "r+1" }))
hl.bind("SUPER + mouse_up",   hl.dsp.focus({ workspace = "r-1" }))

-- ── Special workspace (scratchpad) ────────────────────────────────────────────
hl.bind("SUPER + grave", hl.dsp.workspace.toggle_special("scratchpad"))
hl.bind("SUPER + SHIFT + grave", hl.dsp.window.move({ workspace = "special:scratchpad" }))

-- ── SESSION ──────────────────────────────────────────────────────────────────

-- Lock screen
hl.bind("SUPER + L", hl.dsp.exec_cmd("hyprlock"))

-- Reload Hyprland config (without restarting the session)
hl.bind("SUPER + SHIFT + R", hl.dsp.exec_cmd("hyprctl reload"))

-- ── MEDIA & HARDWARE KEYS ────────────────────────────────────────────────────

-- Volume (pamixer + dunst OSD notification)
hl.bind("XF86AudioRaiseVolume",  hl.dsp.exec_cmd("~/.config/hypr/scripts/volume.sh up"))
hl.bind("XF86AudioLowerVolume",  hl.dsp.exec_cmd("~/.config/hypr/scripts/volume.sh down"))
hl.bind("XF86AudioMute",         hl.dsp.exec_cmd("~/.config/hypr/scripts/volume.sh mute"))
hl.bind("XF86AudioMicMute",      hl.dsp.exec_cmd("pamixer --default-source --toggle-mute"))

-- Brightness (brightnessctl + dunst OSD notification)
hl.bind("XF86MonBrightnessUp",   hl.dsp.exec_cmd("~/.config/hypr/scripts/brightness.sh up"))
hl.bind("XF86MonBrightnessDown", hl.dsp.exec_cmd("~/.config/hypr/scripts/brightness.sh down"))

-- Media playback (playerctl)
hl.bind("XF86AudioPlay",  hl.dsp.exec_cmd("playerctl play-pause"))
hl.bind("XF86AudioPause", hl.dsp.exec_cmd("playerctl pause"))
hl.bind("XF86AudioNext",  hl.dsp.exec_cmd("playerctl next"))
hl.bind("XF86AudioPrev",  hl.dsp.exec_cmd("playerctl previous"))
hl.bind("XF86AudioStop",  hl.dsp.exec_cmd("playerctl stop"))

-- ── MISC ─────────────────────────────────────────────────────────────────────

-- Colour picker (pick any colour on screen → clipboard)
hl.bind("SUPER + SHIFT + C", hl.dsp.exec_cmd("hyprpicker -a"))

-- Notification history (show last notifications in rofi)
hl.bind("SUPER + N", hl.dsp.exec_cmd("dunstctl history-pop"))

-- Dismiss all notifications
hl.bind("SUPER + SHIFT + N", hl.dsp.exec_cmd("dunstctl close-all"))
