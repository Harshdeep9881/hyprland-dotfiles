-- =============================================================================
-- input.lua — Keyboard, Touchpad, Mouse, Gesture Configuration
-- Machine: Laptop (Ryzen 7 7840HS) — touchpad gestures enabled
-- =============================================================================

hl.config({
    input = {
        -- ── Keyboard ─────────────────────────────────────────────────────────
        kb_layout  = "us",
        kb_variant = "",
        kb_model   = "",
        kb_options = "caps:escape",  -- Remap Caps Lock → Escape (vim-friendly)
                                     -- Remove this line if you want normal Caps Lock
        kb_rules   = "",

        -- ── Repeat rate ──────────────────────────────────────────────────────
        -- repeat_rate  = key repeats per second when held
        -- repeat_delay = ms before key starts repeating
        repeat_rate  = 50,
        repeat_delay = 300,

        -- ── Focus follows mouse ───────────────────────────────────────────────
        -- 0 = click to focus, 1 = hover to focus, 2 = hover + instant raise
        follow_mouse = 1,

        -- ── Mouse sensitivity ─────────────────────────────────────────────────
        sensitivity  = 0,  -- -1.0 to 1.0 — 0 is no modification (raw)
        accel_profile = "flat",  -- "flat" = no acceleration curve (gaming-friendly)

        -- ── NumLock ──────────────────────────────────────────────────────────
        numlock_by_default = true,

        -- ── Touchpad ─────────────────────────────────────────────────────────
        touchpad = {
            natural_scroll       = true,   -- scroll direction matches trackpad direction
            disable_while_typing = true,   -- prevents accidental cursor jumps while typing
            tap_to_click         = true,   -- single tap = left click
            tap_button_map       = "lrm",  -- 1-finger=left, 2-finger=right, 3-finger=middle
            drag_lock            = false,  -- release finger to drop dragged item
            scroll_factor        = 1.0,    -- 1.0 = default scroll speed
            middle_button_emulation = false,
        },
    },

    -- ── Cursor ───────────────────────────────────────────────────────────────
    cursor = {
        no_hardware_cursors = false,   -- keep hardware cursor enabled (smooth)
        hide_on_key_press   = false,   -- set true if you prefer cursor to hide when typing
        inactive_timeout    = 0,       -- never auto-hide
    },
})

-- ── 3-finger workspace gestures ───────────────────────────────────────────
-- Swipe 3 fingers horizontally to switch workspaces
hl.gesture({
    fingers = 3,
    direction = "horizontal",
    action = "workspace"
})
