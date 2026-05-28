-- =============================================================================
-- autostart.lua — Applications launched once at Hyprland startup
-- Order matters: portals first, then services, then UI
-- =============================================================================

hl.on("hyprland.start", function()
    -- ── 1. systemd / D-Bus environment propagation ───────────────────────────
    -- CRITICAL: Without this, systemd services don't know about WAYLAND_DISPLAY
    -- and apps launched via systemd units won't connect to the compositor.
    hl.exec_cmd("dbus-update-activation-environment --systemd WAYLAND_DISPLAY XDG_CURRENT_DESKTOP XDG_SESSION_TYPE")
    hl.exec_cmd("systemctl --user import-environment WAYLAND_DISPLAY XDG_CURRENT_DESKTOP XDG_SESSION_TYPE")

    -- ── 2. XDG Desktop Portal ────────────────────────────────────────────────
    -- Required for: screen sharing (OBS, Discord), file pickers, sandboxed apps.
    -- hyprland portal must start BEFORE the generic portal.
    hl.exec_cmd("sleep 1 && /usr/lib/xdg-desktop-portal-hyprland")
    hl.exec_cmd("sleep 2 && /usr/lib/xdg-desktop-portal --replace")

    -- ── 3. Polkit authentication agent ───────────────────────────────────────
    -- Required for privilege escalation prompts (package managers, disk mounting, etc.)
    hl.exec_cmd("/usr/lib/polkit-gnome/polkit-gnome-authentication-agent-1")

    -- ── 4. Wallpaper ─────────────────────────────────────────────────────────
    hl.exec_cmd("hyprpaper")

    -- ── 5. Status bar ────────────────────────────────────────────────────────
    hl.exec_cmd("waybar")

    -- ── 6. Notification daemon ───────────────────────────────────────────────
    hl.exec_cmd("dunst")

    -- ── 7. Idle manager (screen dim → lock → sleep) ──────────────────────────
    hl.exec_cmd("hypridle")

    -- ── 8. Clipboard history ─────────────────────────────────────────────────
    -- Watches clipboard and stores items; both text and image types
    hl.exec_cmd("wl-paste --type text --watch cliphist store")
    hl.exec_cmd("wl-paste --type image --watch cliphist store")

    -- ── 9. Network manager tray ──────────────────────────────────────────────
    hl.exec_cmd("nm-applet --indicator")

    -- ── 10. Bluetooth tray ───────────────────────────────────────────────────
    hl.exec_cmd("blueman-applet")
end)
