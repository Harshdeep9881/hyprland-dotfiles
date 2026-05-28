#!/usr/bin/env bash
# =============================================================================
# volume.sh — Volume control with pamixer + dunst OSD notification
# Usage: volume.sh [up|down|mute]
#
# Shows a progress-bar notification that stacks/replaces previous one.
# Uses dunstify with a fixed --replace-id so notifications stack cleanly.
# =============================================================================

set -euo pipefail

STEP=5            # Percent to change per keypress
MAX_VOL=150       # Allow up to 150% for boost (pamixer supports it)
NOTIFY_ID=9991    # Fixed ID so volume notifications replace each other

get_volume() {
    pamixer --get-volume 2>/dev/null || echo "0"
}

get_muted() {
    pamixer --get-mute 2>/dev/null && echo "true" || echo "false"
}

show_notification() {
    local volume="$1"
    local muted="$2"
    local icon

    if [[ "$muted" == "true" ]]; then
        icon="audio-volume-muted"
        label="Muted"
    elif (( volume == 0 )); then
        icon="audio-volume-off"
        label="0%"
    elif (( volume < 34 )); then
        icon="audio-volume-low"
        label="${volume}%"
    elif (( volume < 67 )); then
        icon="audio-volume-medium"
        label="${volume}%"
    else
        icon="audio-volume-high"
        label="${volume}%"
    fi

    dunstify \
        --appname="Volume" \
        --replace="$NOTIFY_ID" \
        --icon="$icon" \
        --urgency=low \
        --timeout=1500 \
        --hints="int:value:${volume}" \
        "Volume" "$label"
}

case "${1:-}" in
    up)
        pamixer --increase "$STEP" --allow-boost --set-limit "$MAX_VOL"
        ;;
    down)
        pamixer --decrease "$STEP"
        ;;
    mute)
        pamixer --toggle-mute
        ;;
    *)
        echo "Usage: $0 [up|down|mute]" >&2
        exit 1
        ;;
esac

VOL=$(get_volume)
MUTED=$(get_muted)
show_notification "$VOL" "$MUTED"
