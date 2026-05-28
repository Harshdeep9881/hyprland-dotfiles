-- =============================================================================
-- Hyprland Desktop Environment — Main Configuration
-- Format: Lua (Hyprland 0.55+)
-- Machine: AMD Ryzen 7 7840HS / RTX 4050 Mobile / AMD 780M iGPU
-- Monitor: eDP-1 1366x768@60Hz
-- =============================================================================
-- Module load order matters:
--   1. env     — must be first so toolkit env vars are set before anything starts
--   2. monitors — output layout
--   3. general  — compositor behaviour (gaps, borders, layout engine)
--   4. input    — keyboard, touchpad, cursor
--   5. decoration — visual style (blur, shadow, rounding, opacity)
--   6. animations — motion curves and timings
--   7. rules    — per-app window rules
--   8. autostart — exec-once services
--   9. binds    — keybindings last (avoids startup race with services)

require("modules.env")
require("modules.monitors")
require("modules.general")
require("modules.input")
require("modules.decoration")
require("modules.animations")
require("modules.rules")
require("modules.autostart")
require("modules.binds")
