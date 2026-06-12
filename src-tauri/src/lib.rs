mod screenshot;
mod clipboard;
mod hotkey;

#[tauri::command]
fn capture_screen() -> Result<String, String> {
    screenshot::capture_screen()
}

#[tauri::command]
fn copy_to_clipboard(base64_data: String) -> Result<(), String> {
    clipboard::copy_image_to_clipboard(&base64_data)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![capture_screen, copy_to_clipboard])
        .setup(|app| {
            hotkey::register_hotkey(&app.handle())?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
