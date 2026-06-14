mod screenshot;

use tauri::Manager;
use serde_json::Value;

#[tauri::command]
fn set_fullscreen(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        window.set_fullscreen(true).map_err(|e| e.to_string())?;
        window.set_decorations(false).map_err(|e| e.to_string())?;
        window.set_always_on_top(true).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn set_windowed(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        window.set_fullscreen(false).map_err(|e| e.to_string())?;
        window.set_decorations(true).map_err(|e| e.to_string())?;
        window.set_always_on_top(false).map_err(|e| e.to_string())?;
        window.set_size(tauri::LogicalSize::new(800, 600)).map_err(|e| e.to_string())?;
        window.center().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn hide_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        window.hide().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn show_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        window.show().map_err(|e| e.to_string())?;
        window.set_focus().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn call_llm_api(api_url: String, api_key: String, body: Value) -> Result<String, String> {
    eprintln!("[AI] Calling API: {}", api_url);
    eprintln!("[AI] Request body: {}", serde_json::to_string_pretty(&body).unwrap_or_default());

    let client = reqwest::Client::new();
    let resp = client
        .post(&api_url)
        .header("Content-Type", "application/json")
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&body)
        .send()
        .await
        .map_err(|e| {
            eprintln!("[AI] Request failed: {}", e);
            format!("请求失败: {}", e)
        })?;

    let status = resp.status();
    eprintln!("[AI] Response status: {}", status);

    let text = resp.text().await.map_err(|e| {
        eprintln!("[AI] Failed to read response: {}", e);
        format!("读取响应失败: {}", e)
    })?;

    eprintln!("[AI] Response body: {}", &text[..text.len().min(500)]);

    if !status.is_success() {
        return Err(format!("API 错误 ({}): {}", status, text));
    }

    Ok(text)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            screenshot::capture_screen,
            set_fullscreen,
            set_windowed,
            hide_window,
            show_window,
            call_llm_api
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
