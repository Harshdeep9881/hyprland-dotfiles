-- =============================================================================
-- general.lua — Compositor Behaviour
-- Controls: gaps, borders, layout engine, tearing, cursor behaviour
-- =============================================================================

hl.config({
    general = {
        -- ── Gaps ─────────────────────────────────────────────────────────────
        gaps_in  = 5,   -- gap between windows (inner)
        gaps_out = 10,  -- gap between windows and screen edge (outer)

        -- ── Borders ──────────────────────────────────────────────────────────
        border_size = 2,

        -- Active/inactive borders correctly structured under the col sub-table
        col = {
            active_border = {
                colors = { "rgba(89b4faee)", "rgba(cba6f7ee)" },
                angle = 45
            },
            inactive_border = "rgba(585b70aa)"
        },

        -- ── Layout engine ────────────────────────────────────────────────────
        layout = "dwindle",

        -- ── Tearing ──────────────────────────────────────────────────────────
        allow_tearing = false,
    },

    -- ── Dwindle layout options ────────────────────────────────────────────────
    dwindle = {
        preserve_split = true,  -- split direction is remembered per-node
        force_split   = 0,      -- 0 = cursor side, 1 = always right/bottom
    },

    -- ── Master layout options (active when layout = "master") ─────────────────
    master = {
        new_status    = "slave",     -- new windows go to slave area
        new_on_top    = false,
        mfact         = 0.55,        -- master area fraction of screen width
    },

    -- ── Misc compositor settings ──────────────────────────────────────────────
    misc = {
        force_default_wallpaper  = 0,     -- 0 disables the anime mascot default wallpaper
        disable_hyprland_logo    = true,  -- no logo on empty workspaces
        disable_splash_rendering = true,  -- no startup splash
        focus_on_activate        = true,  -- focus window that requests activation
    },

    -- ── Binds settings ────────────────────────────────────────────────────────
    binds = {
        allow_workspace_cycles = true,  -- SUPER+Tab wraps around workspaces
    },
})
