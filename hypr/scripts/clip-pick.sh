#!/usr/bin/env bash
# =============================================================================
# clip-pick.sh — Clipboard history picker using cliphist + rofi
# Shows stored clipboard items → select one → paste to clipboard
# =============================================================================

set -euo pipefail

cliphist list | \
    rofi \
        -dmenu \
        -p "Clipboard" \
        -display-columns 2 \
        -show-icons \
        -theme-str 'window {width: 40em;}' \
        -theme-str 'listview {lines: 12; scrollbar: true;}' \
        2>/dev/null | \
    cliphist decode | \
    wl-copy
