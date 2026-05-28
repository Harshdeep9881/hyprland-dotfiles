#!/usr/bin/env bash
# =============================================================================
# screenshot.sh — Screenshot helper using grim + slurp
# Usage: screenshot.sh [region|full|window]
#
# Saves to ~/Pictures/Screenshots/ with timestamp filename
# Copies to clipboard simultaneously
# Shows dunst notification with thumbnail preview
# =============================================================================

set -euo pipefail

SAVE_DIR="$HOME/Pictures/Screenshots"
mkdir -p "$SAVE_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILE="$SAVE_DIR/screenshot_${TIMESTAMP}.png"
MODE="${1:-region}"

take_shot() {
    local tmpfile="$1"
    shift
    grim "$@" "$tmpfile"
}

notify_success() {
    local file="$1"
    dunstify \
        --appname="Screenshot" \
        --icon="$file" \
        --urgency=low \
        --timeout=3000 \
        "Screenshot saved" \
        "$(basename "$file")"
}

notify_fail() {
    dunstify \
        --appname="Screenshot" \
        --icon="dialog-error" \
        --urgency=normal \
        --timeout=3000 \
        "Screenshot cancelled" \
        "No region was selected"
}

case "$MODE" in
    region)
        # Interactive region selection with slurp
        # If user presses Escape, slurp exits non-zero → we catch it
        GEOM=$(slurp -d 2>/dev/null) || { notify_fail; exit 0; }
        take_shot "$FILE" -g "$GEOM"
        wl-copy < "$FILE"
        notify_success "$FILE"
        ;;

    full)
        # Full screen (all outputs composited)
        take_shot "$FILE"
        wl-copy < "$FILE"
        notify_success "$FILE"
        ;;

    window)
        # Active window only
        # Hyprctl gives us the active window geometry
        GEOM=$(hyprctl activewindow -j | \
            jq -r '"\(.at[0]),\(.at[1]) \(.size[0])x\(.size[1])"' 2>/dev/null)
        if [[ -z "$GEOM" ]]; then
            notify_fail
            exit 0
        fi
        take_shot "$FILE" -g "$GEOM"
        wl-copy < "$FILE"
        notify_success "$FILE"
        ;;

    *)
        echo "Usage: $0 [region|full|window]" >&2
        exit 1
        ;;
esac
