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

-- ── GPU / DRM ────────────────────────────────────────────────────────────────
-- The built-in display panel eDP-2 is physically connected to the NVIDIA dGPU (card2).
-- Rendering on the AMD iGPU requires reverse PRIME copy which fails (black screen).
-- We force the primary renderer to run natively on the NVIDIA dGPU directly, with AMD as fallback.
-- Modern Hyprland (v0.55+ / Aquamarine) uses AQ_DRM_DEVICES. We use stable,
-- colon-free udev symlinks to prevent Aquamarine from splitting on PCI address colons.
hl.env("AQ_DRM_DEVICES", "/dev/dri/by-name/dgpu:/dev/dri/by-name/igpu")
hl.env("WLR_DRM_DEVICES", "/dev/dri/card2:/dev/dri/card1")

-- NVIDIA Driver Specific Environment Variables
hl.env("LIBVA_DRIVER_NAME",         "nvidia")
hl.env("GBM_BACKEND",               "nvidia-drm")
hl.env("__GLX_VENDOR_LIBRARY_NAME", "nvidia")
hl.env("NVD_BACKEND",               "direct")

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
