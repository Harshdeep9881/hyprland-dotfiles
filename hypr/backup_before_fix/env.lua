-- =============================================================================
-- env.lua — Environment Variables
-- Must be sourced FIRST so toolkit env vars propagate to all child processes.
-- =============================================================================

-- ── Cursor ───────────────────────────────────────────────────────────────────
hl.env("XCURSOR_THEME",  "Breeze_Snow")   -- GTK/X11 cursor theme
hl.env("XCURSOR_SIZE",   "24")
hl.env("HYPRCURSOR_THEME", "Breeze_Snow") -- Hyprland native cursor theme
hl.env("HYPRCURSOR_SIZE",  "24")

-- ── Session Identity ─────────────────────────────────────────────────────────
hl.env("XDG_SESSION_TYPE",    "wayland")
hl.env("XDG_SESSION_DESKTOP", "hyprland")
hl.env("XDG_CURRENT_DESKTOP", "Hyprland")

-- ── GPU / DRM ─────────────────────────────────────────────────────────────────
-- AMD iGPU (780M) is the active renderer (confirmed by glxinfo).
-- Explicitly point DRM to the AMD card to avoid any NVIDIA confusion.
hl.env("WLR_DRM_DEVICES", "/dev/dri/card1:/dev/dri/card0")

-- ── Qt Wayland ───────────────────────────────────────────────────────────────
hl.env("QT_QPA_PLATFORM",                   "wayland;xcb")
hl.env("QT_WAYLAND_DISABLE_WINDOWDECORATION", "1")
hl.env("QT_AUTO_SCREEN_SCALE_FACTOR",       "1")

-- ── GTK Wayland ──────────────────────────────────────────────────────────────
hl.env("GDK_BACKEND", "wayland,x11,*")

-- ── Mozilla (Firefox) ────────────────────────────────────────────────────────
hl.env("MOZ_ENABLE_WAYLAND", "1")

-- ── Electron (VS Code, Obsidian, etc.) ───────────────────────────────────────
hl.env("ELECTRON_OZONE_PLATFORM_HINT", "auto")

-- ── SDL / libsdl2 ────────────────────────────────────────────────────────────
hl.env("SDL_VIDEODRIVER", "wayland")

-- ── CLUTTER ──────────────────────────────────────────────────────────────────
hl.env("CLUTTER_BACKEND", "wayland")

-- ── ozone-platform hint (Chromium-based apps) ────────────────────────────────
hl.env("NIXOS_OZONE_WL", "1")  -- harmless on Arch, helps some Electron apps
