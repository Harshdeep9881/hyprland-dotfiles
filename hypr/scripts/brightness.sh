#!/usr/bin/env bash
# =============================================================================
# brightness.sh — Brightness control with brightnessctl + dunst OSD
# Usage: brightness.sh [up|down]
#
# Uses a fixed dunstify replace-ID so notifications stack cleanly.
# =============================================================================

set -euo pipefail

STEP="5%+"        # Step for increase (brightnessctl syntax)
STEP_DOWN="5%-"   # Step for decrease
NOTIFY_ID=9992    # Fixed ID — brightness notifications replace each other

get_brightness_percent() {
    # Returns 0–100 integer
    local max current
    max=$(brightnessctl max 2>/dev/null)
    current=$(brightnessctl get 2>/dev/null)
    if [[ -z "$max" || "$max" -eq 0 ]]; then
        echo "50"
        return
    fi
    echo $(( current * 100 / max ))
}

show_notification() {
    local pct="$1"
    local icon

    if (( pct < 34 )); then
        icon="brightness-low"
    elif (( pct < 67 )); then
        icon="brightness-medium"
    else
        icon="brightness-high"
    fi

    dunstify \
        --appname="Brightness" \
        --replace="$NOTIFY_ID" \
        --icon="$icon" \
        --urgency=low \
        --timeout=1500 \
        --hints="int:value:${pct}" \
        "Brightness" "${pct}%"
}

case "${1:-}" in
    up)
        brightnessctl set "$STEP" --quiet
        ;;
    down)
        # Don't go below 5% (screen becomes unusable at 0%)
        CURRENT=$(get_brightness_percent)
        if (( CURRENT <= 5 )); then
            brightnessctl set "5%" --quiet
        else
            brightnessctl set "$STEP_DOWN" --quiet
        fi
        ;;
    *)
        echo "Usage: $0 [up|down]" >&2
        exit 1
        ;;
esac

PCT=$(get_brightness_percent)
show_notification "$PCT"
