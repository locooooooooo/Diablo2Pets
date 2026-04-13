use winreg::enums::*;
use winreg::RegKey;
use std::process::Command;
use std::path::PathBuf;
use sysinfo::System;
use std::thread;
use std::time::Duration;
use std::env;

mod process_killer;
mod auto_typer;

fn get_d2r_path() -> Result<String, String> {
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let key_path = r#"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\Diablo II Resurrected"#;
    
    if let Ok(key) = hklm.open_subkey(key_path) {
        if let Ok(install_location) = key.get_value::<String, _>("InstallLocation") {
            let path = PathBuf::from(&install_location).join("D2R.exe");
            if path.exists() {
                return Ok(install_location);
            }
        }
    }
    
    Err("Could not find Diablo II Resurrected installation path in registry.".into())
}

fn kill_d2r_mutex() -> Result<String, String> {
    let mut sys = System::new_all();
    sys.refresh_all();

    let mut found = false;
    let mut total_killed = 0;

    for (pid, process) in sys.processes() {
        if process.name().to_string().to_lowercase() == "d2r.exe" {
            found = true;
            println!("Found D2R process with PID: {}", pid);
            
            match process_killer::kill_d2r_mutexes_for_pid(pid.as_u32()) {
                Ok(killed) => {
                    println!("Successfully killed {} mutexes for PID {}", killed, pid);
                    total_killed += killed;
                },
                Err(e) => {
                    println!("Error killing mutexes for PID {}: {}", pid, e);
                }
            }
        }
    }
    
    if found {
        Ok(format!("Successfully processed D2R mutexes. Killed: {}", total_killed))
    } else {
        Ok("No running D2R process found, ready to launch.".into())
    }
}

fn launch_d2r(path: String, args: Vec<String>, username: Option<String>, password: Option<String>) -> Result<String, String> {
    let executable = PathBuf::from(&path).join("D2R.exe");
    
    if !executable.exists() {
        return Err(format!("D2R.exe not found in {}", path));
    }

    match Command::new(&executable)
        .current_dir(path)
        .args(args)
        .spawn() {
        Ok(child) => {
            let pid = child.id();
            
            if let (Some(u), Some(p)) = (username, password) {
                thread::spawn(move || {
                    println!("Waiting 10s for D2R to reach login screen...");
                    thread::sleep(Duration::from_secs(10));
                    
                    if let Err(e) = auto_typer::type_credentials(&u, &p) {
                        println!("Auto-type failed: {}", e);
                    } else {
                        println!("Auto-type finished for PID {}", pid);
                    }
                });
            }

            Ok(format!("Successfully launched D2R with PID: {}", pid))
        },
        Err(e) => Err(format!("Failed to launch D2R: {}", e)),
    }
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        println!("{{\"status\":\"error\", \"message\":\"No command provided\"}}");
        return;
    }

    let command = args[1].as_str();

    match command {
        "get_d2r_path" => {
            match get_d2r_path() {
                Ok(path) => println!("{{\"status\":\"success\", \"data\":\"{}\"}}", path.replace("\\", "\\\\")),
                Err(e) => println!("{{\"status\":\"error\", \"message\":\"{}\"}}", e),
            }
        },
        "kill_d2r_mutex" => {
            match kill_d2r_mutex() {
                Ok(msg) => println!("{{\"status\":\"success\", \"data\":\"{}\"}}", msg),
                Err(e) => println!("{{\"status\":\"error\", \"message\":\"{}\"}}", e),
            }
        },
        "launch_d2r" => {
            let path = args.get(2).cloned().unwrap_or_default();
            let mut launch_args = vec![];
            
            // Collect any additional args starting from index 3 until we hit username marker
            let mut i = 3;
            let mut username = None;
            let mut password = None;
            
            while i < args.len() {
                if args[i] == "--user" && i + 1 < args.len() {
                    username = Some(args[i+1].clone());
                    i += 2;
                } else if args[i] == "--pass" && i + 1 < args.len() {
                    password = Some(args[i+1].clone());
                    i += 2;
                } else {
                    launch_args.push(args[i].clone());
                    i += 1;
                }
            }

            match launch_d2r(path, launch_args, username, password) {
                Ok(msg) => println!("{{\"status\":\"success\", \"data\":\"{}\"}}", msg),
                Err(e) => println!("{{\"status\":\"error\", \"message\":\"{}\"}}", e),
            }
        },
        _ => {
            println!("{{\"status\":\"error\", \"message\":\"Unknown command\"}}");
        }
    }
}