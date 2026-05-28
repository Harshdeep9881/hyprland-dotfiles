-- =============================================================================
-- rules.lua — Window Rules (Hyprland 0.55+ Lua syntax)
--
-- Format: hl.window_rule({ match = { class = "pattern", title = "pattern" }, effect = value, ... })
--
-- match:class   = window class (use `hyprctl clients` to find values)
-- match:title   = window title
-- match:xwayland = true/false
-- =============================================================================

-- ── Floating windows ─────────────────────────────────────────────────────────
-- These apps should always float, centered on screen.
hl.window_rule({ match = { class = "pavucontrol" }, float = true, center = true, size = {800, 600} })
hl.window_rule({ match = { class = "blueman-manager" }, float = true, center = true, size = {700, 500} })
hl.window_rule({ match = { class = "nm-connection-editor" }, float = true, center = true })
hl.window_rule({ match = { class = "polkit-gnome-authentication-agent-1" }, float = true, center = true })
hl.window_rule({ match = { class = "xdg-desktop-portal-gtk" }, float = true })

-- Picture-in-Picture always floats and stays on top
hl.window_rule({ match = { title = "Picture.in.Picture" }, float = true, pin = true })
hl.window_rule({ match = { title = "Picture-in-Picture" }, float = true, pin = true })

-- Floating alacritty/kitty used as quick terminals (class "floating")
hl.window_rule({ match = { class = "floating" }, float = true, center = true })

-- ── Opacity rules ────────────────────────────────────────────────────────────
-- kitty: slightly transparent when inactive (blur effect visible)
hl.window_rule({ match = { class = "kitty" }, opacity = "1.0 0.88" })
hl.window_rule({ match = { class = "Alacritty" }, opacity = "1.0 0.90" })

-- Code editors: always fully opaque (text legibility)
hl.window_rule({ match = { class = "code-url-handler" }, opacity = "1.0 1.0" })
hl.window_rule({ match = { class = "Code" }, opacity = "1.0 1.0" })
hl.window_rule({ match = { class = "nvim" }, opacity = "1.0 1.0" })

-- Browser: fully opaque
hl.window_rule({ match = { class = "firefox" }, opacity = "1.0 1.0" })
hl.window_rule({ match = { class = "brave-browser" }, opacity = "1.0 1.0" })
hl.window_rule({ match = { class = "google-chrome" }, opacity = "1.0 1.0" })

-- ── Animation overrides ───────────────────────────────────────────────────────
-- Rofi launcher: fade in instead of slide (cleaner for a popup)
hl.window_rule({ match = { class = "rofi" }, animation = "fade" })

-- ── XWayland scaling fix ──────────────────────────────────────────────────────
hl.window_rule({ match = { xwayland = true }, xray = false })
