-- =============================================================================
-- animations.lua — Motion & Transition Configuration
-- Philosophy: Fast, purposeful, never distracting.
-- All curves tuned for 60Hz (the laptop display refresh rate).
-- =============================================================================

hl.config({
    animations = {
        enabled = true,

        -- ── Bézier curves ────────────────────────────────────────────────────
        -- Define reusable easing curves. Think of these as CSS animation timing functions.
        bezier_curve = {
            -- "overshot"  — snappy with slight elastic overshoot (windows popping in)
            { name = "overshot",    points = "0.05, 0.9, 0.1, 1.05" },
            -- "smoothOut" — fast start, slow end (windows leaving)
            { name = "smoothOut",   points = "0.36, 0, 0.66, -0.56" },
            -- "smoothIn"  — slow start, fast end (general transitions)
            { name = "smoothIn",    points = "0.25, 1, 0.5, 1" },
            -- "easeInOut" — balanced, elegant (workspace slides)
            { name = "easeInOut",   points = "0.65, 0, 0.35, 1" },
            -- "linear"    — constant speed (border angle rotation)
            { name = "linear",      points = "0, 0, 1, 1" },
        },

        animation = {
            -- ── Windows opening ───────────────────────────────────────────────
            -- speed unit: 1 = 100ms; speed=5 → 500ms total animation
            { target = "windows",     enabled = true, speed = 5, curve = "overshot",  style = "slide" },
            -- ── Windows closing ───────────────────────────────────────────────
            { target = "windowsOut",  enabled = true, speed = 4, curve = "smoothOut", style = "slide" },
            -- ── Windows moving (drag, resize) ─────────────────────────────────
            { target = "windowsMove", enabled = true, speed = 4, curve = "smoothIn" },

            -- ── Borders ───────────────────────────────────────────────────────
            { target = "border",      enabled = true, speed = 5, curve = "default" },
            -- Animated gradient angle rotation on active border
            { target = "borderangle", enabled = true, speed = 8, curve = "linear",    style = "loop" },

            -- ── Fade ──────────────────────────────────────────────────────────
            -- Applies to transparency changes (inactive_opacity, window hide/show)
            { target = "fade",        enabled = true, speed = 5, curve = "smoothIn" },

            -- ── Workspace switching ───────────────────────────────────────────
            -- "slidevert" = slide up/down (matches 3-finger swipe gesture direction)
            { target = "workspaces",       enabled = true, speed = 6, curve = "easeInOut", style = "slide" },
            -- ── Special workspace (scratchpad) ────────────────────────────────
            { target = "specialWorkspace", enabled = true, speed = 6, curve = "overshot",  style = "slidefadevert" },
        },
    },
})
