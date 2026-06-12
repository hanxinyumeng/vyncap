mod screenshot;
mod clipboard;

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
        .invoke_handler(tauri::generate_handler![capture_screen, copy_to_clipboard])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
