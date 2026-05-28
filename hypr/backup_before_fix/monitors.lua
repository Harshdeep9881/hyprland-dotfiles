-- =============================================================================
-- monitors.lua — Monitor Layout Configuration
-- Machine: Laptop with eDP-1 at 1366x768
-- =============================================================================

-- Primary built-in display
-- Format: hl.monitor({ output = name, mode = resolution@rate, position = position, scale = scale })
hl.monitor({ output = "eDP-1", mode = "1366x768@60", position = "0x0", scale = 1 })

-- ── External monitor templates (uncomment and adjust when plugging in) ─────────
-- hl.monitor({ output = "HDMI-A-1", mode = "1920x1080@60", position = "1366x0", scale = 1 })
-- hl.monitor({ output = "DP-1", mode = "2560x1440@144", position = "1366x0", scale = 1 })
-- hl.monitor({ output = "HDMI-A-1", mode = "preferred", position = "auto", scale = 1 })

-- ── Catch-all: any monitor Hyprland detects that isn't named above ────────────
-- This prevents a blank/crash if you plug in an unknown monitor.
-- hl.monitor("", "preferred", "auto", 1)
