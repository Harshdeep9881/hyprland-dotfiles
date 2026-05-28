#!/usr/bin/env python3
import os
import re
import shlex
import sys
import subprocess

def get_desktop_files():
    """Locate all desktop entries across local and system paths."""
    dirs = [
        os.path.expanduser("~/.local/share/applications"),
        "/usr/share/applications"
    ]
    files = []
    seen_basenames = set()
    for d in dirs:
        if not os.path.exists(d):
            continue
        try:
            for f in os.listdir(d):
                if f.endswith(".desktop"):
                    # Local overrides system directory if name matches
                    if f not in seen_basenames:
                        seen_basenames.add(f)
                        files.append(os.path.join(d, f))
        except Exception:
            continue
    return files

def parse_desktop_file(filepath):
    """Extract required fields from a single desktop entry."""
    app = {}
    current_group = None
    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if line.startswith("[") and line.endswith("]"):
                    current_group = line[1:-1]
                    continue
                if current_group == "Desktop Entry":
                    if "=" in line:
                        key, val = line.split("=", 1)
                        app[key.strip()] = val.strip()
    except Exception:
        return None
        
    # Validation filters
    if "Name" not in app or "Exec" not in app:
        return None
    if app.get("NoDisplay") == "true" or app.get("NoDisplay") == "1":
        return None
    if app.get("Type") and app.get("Type") != "Application":
        return None
        
    return {
        "name": app["Name"],
        "exec": app["Exec"],
        "icon": app.get("Icon", ""),
        "terminal": app.get("Terminal", "false").lower() == "true"
    }

def clean_exec(exec_str):
    """Strip standard desktop field codes from the Exec instruction."""
    # Remove quoted or raw desktop placeholders like %U, %u, %F, %f
    cleaned = re.sub(r'\s+["\']?%[fFuUiicckk]["\']?', '', exec_str)
    return cleaned.strip()

def run_rofi(prompt, options, show_icons=False):
    """Generic wrapper to invoke a rofi menu and return the selection."""
    args = ["rofi", "-dmenu", "-i", "-p", prompt]
    if show_icons:
        args.append("-show-icons")
        
    proc = subprocess.Popen(
        args,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    out, _ = proc.communicate(options)
    if proc.returncode != 0:
        return None
    return out.strip()

def main():
    # 1. Parse and build database of installed apps
    apps = {}
    for filepath in get_desktop_files():
        app_data = parse_desktop_file(filepath)
        if app_data:
            apps[app_data["name"]] = app_data
            
    if not apps:
        subprocess.run(["dunstify", "GPU Launcher Error", "No applications found!"])
        sys.exit(1)
        
    # 2. Format app options for rofi with icons
    # Format: Name\0icon\x1fIconName
    rofi_lines = []
    for name, data in sorted(apps.items(), key=lambda x: x[0].lower()):
        icon = data["icon"]
        if icon:
            rofi_lines.append(f"{name}\0icon\x1f{icon}")
        else:
            rofi_lines.append(name)
            
    rofi_input = "\n".join(rofi_lines)
    
    # 3. Prompt user for application
    selected_app_name = run_rofi("Launch App with GPU:", rofi_input, show_icons=True)
    if not selected_app_name or selected_app_name not in apps:
        sys.exit(0)
        
    app_info = apps[selected_app_name]
    
    # 4. Prompt user for GPU selection
    gpu_options = (
        "🟢 AMD Radeon 780M (Integrated iGPU)\n"
        "🚀 NVIDIA GeForce RTX 4050 (Dedicated dGPU)"
    )
    selected_gpu = run_rofi(f"Run '{selected_app_name}' on:", gpu_options, show_icons=False)
    if not selected_gpu:
        sys.exit(0)
        
    # 5. Configure environment variables for the selected GPU
    env = os.environ.copy()
    gpu_label = ""
    
    if "NVIDIA" in selected_gpu:
        env["__NV_PRIME_RENDER_OFFLOAD"] = "1"
        env["__GLX_VENDOR_LIBRARY_NAME"] = "nvidia"
        gpu_label = "NVIDIA RTX 4050"
    else:
        env["__GLX_VENDOR_LIBRARY_NAME"] = "mesa"
        env["DRI_PRIME"] = "pci-0000_05_00_0"
        gpu_label = "AMD Radeon 780M"
        
    # Clean the Exec command
    cmd_clean = clean_exec(app_info["exec"])
    cmd_args = shlex.split(cmd_clean)
    
    # Force OpenGL (disable Vulkan) for Chromium/Electron apps on AMD iGPU.
    # Vulkan ignores standard DRI_PRIME offloading variables, forcing them to NVIDIA by default.
    if "AMD" in selected_gpu:
        app_lower = selected_app_name.lower()
        exec_lower = cmd_args[0].lower() if cmd_args else ""
        chromium_names = ["chrome", "brave", "chromium", "electron", "code", "discord", "slack", "spotify", "teams", "vivaldi", "opera"]
        if any(c in app_lower or c in exec_lower for c in chromium_names):
            cmd_args.append("--disable-features=Vulkan")
    
    # 6. Check if app requires running in terminal
    if app_info["terminal"]:
        cmd_args = ["kitty", "-e"] + cmd_args
        
    # 7. Detach and execute application
    try:
        subprocess.Popen(
            cmd_args,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            close_fds=True,
            env=env,
            start_new_session=True
        )
        
        # Send a success notification with Dunst
        notification_title = "GPU Selector Launcher"
        notification_msg = f"Launching <b>{selected_app_name}</b> on <b>{gpu_label}</b>"
        subprocess.run([
            "dunstify",
            "-a", "GPU Launcher",
            notification_title,
            notification_msg,
            "-i", app_info["icon"] if app_info["icon"] else "system-run"
        ])
    except Exception as e:
        subprocess.run([
            "dunstify",
            "-a", "GPU Launcher",
            "Launch Failed",
            f"Could not launch {selected_app_name}: {str(e)}"
        ])

if __name__ == "__main__":
    main()
