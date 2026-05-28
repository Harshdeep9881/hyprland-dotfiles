-- =============================================================================
-- decoration.lua — Visual Decoration
-- Controls: rounding, blur, shadows, opacity, dimming
-- Catppuccin Mocha colour palette throughout
-- =============================================================================

hl.config({
    decoration = {
        -- ── Rounded corners ──────────────────────────────────────────────────
        -- 12px rounding — noticeable but not cartoonish on a 1366x768 screen
        rounding = 12,

        -- ── Window opacity ───────────────────────────────────────────────────
        -- active_opacity   = window you're currently using
        -- inactive_opacity = background windows
        -- fullscreen windows always get 1.0 regardless
        active_opacity      = 1.0,
        inactive_opacity    = 0.92,
        fullscreen_opacity  = 1.0,

        -- ── Blur ─────────────────────────────────────────────────────────────
        -- Blurs whatever is rendered behind a transparent window.
        -- On 780M iGPU: size=6 passes=2 is a safe balance between quality and perf.
        blur = {
            enabled           = true,
            size              = 6,      -- blur kernel size (higher = more blur, heavier)
            passes            = 2,      -- blur quality passes (1–4; 3+ is GPU-heavy)
            new_optimizations = true,   -- use newer, faster blur algorithm
            xray              = false,  -- if true, ignores window opacity for blur
            noise             = 0.015,  -- subtle film grain effect (0 = off)
            contrast          = 0.9,    -- contrast of blurred area (0.8–1.2)
            brightness        = 0.8,    -- brightness of blurred area
            popups            = true,   -- blur dropdown menus and popups
            popups_ignorealpha = 0.2,   -- don't blur fully transparent popup parts
        },

        -- ── Drop shadow ──────────────────────────────────────────────────────
        shadow = {
            enabled        = true,
            range          = 15,          -- shadow spread in pixels
            render_power   = 3,           -- shadow intensity (1–4)
            color          = "rgba(1e1e2ecc)",  -- Catppuccin base with alpha
            color_inactive = "rgba(1e1e2e77)",  -- dimmer for inactive windows
        },

        -- ── Inactive window dimming ───────────────────────────────────────────
        -- dim_inactive dims unfocused windows. Combined with inactive_opacity = 0.92
        -- this gives a clear but subtle focus cue.
        dim_inactive   = true,
        dim_strength   = 0.15,  -- 0.0–1.0; 0.15 is barely noticeable but effective
        dim_special    = 0.3,   -- dim amount for the special (scratchpad) workspace
        dim_around     = 0.0,   -- darken area around a floating window (0 = disabled)

        -- ── Screenshader (optional) ───────────────────────────────────────────
        -- screen_shader = ""  -- path to a GLSL fragment shader for full-screen effect
    },
})
