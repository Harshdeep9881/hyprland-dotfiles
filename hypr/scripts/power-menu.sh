#!/usr/bin/env bash
# =============================================================================
# power-menu.sh — Rofi power menu
# Options: Lock, Suspend, Hibernate, Reboot, Shutdown, Logout
# Confirmation is built-in for destructive actions.
# =============================================================================

set -euo pipefail

# ── Icons (Nerd Font) ─────────────────────────────────────────────────────────
LOCK="󰌾  Lock"
SUSPEND="󰤄  Suspend"
HIBERNATE="󰒲  Hibernate"
REBOOT="󰑐  Reboot"
SHUTDOWN="󰐥  Shutdown"
LOGOUT="󰍃  Logout"
CANCEL="  Cancel"

# ── Rofi prompt ───────────────────────────────────────────────────────────────
CHOICE=$(printf "%s\n%s\n%s\n%s\n%s\n%s\n%s" \
    "$LOCK" "$SUSPEND" "$HIBERNATE" "$REBOOT" "$SHUTDOWN" "$LOGOUT" "$CANCEL" | \
    rofi \
        -dmenu \
        -i \
        -p "Power" \
        -theme-str 'window {width: 22em;}' \
        -theme-str 'listview {lines: 7; scrollbar: false;}' \
        -theme-str 'entry {enabled: false;}' \
        -no-custom \
        2>/dev/null)

# ── Confirmation for destructive actions ──────────────────────────────────────
confirm() {
    local msg="$1"
    local answer
    answer=$(printf "Yes\nNo" | rofi \
        -dmenu \
        -i \
        -p "$msg" \
        -theme-str 'window {width: 16em;}' \
        -theme-str 'listview {lines: 2; scrollbar: false;}' \
        -theme-str 'entry {enabled: false;}' \
        -no-custom \
        2>/dev/null)
    [[ "$answer" == "Yes" ]]
}

case "$CHOICE" in
    "$LOCK")
        hyprlock
        ;;
    "$SUSPEND")
        hyprlock &
        sleep 0.5
        systemctl suspend
        ;;
    "$HIBERNATE")
        confirm "Hibernate?" && {
            hyprlock &
            sleep 0.5
            systemctl hibernate
        }
        ;;
    "$REBOOT")
        confirm "Reboot now?" && systemctl reboot
        ;;
    "$SHUTDOWN")
        confirm "Shut down?" && systemctl poweroff
        ;;
    "$LOGOUT")
        confirm "Log out?" && hyprctl dispatch exit
        ;;
    "$CANCEL"|"")
        exit 0
        ;;
esac
