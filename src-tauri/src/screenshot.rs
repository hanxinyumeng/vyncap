use screenshots::Screen;
use base64::{Engine as _, engine::general_purpose};

pub fn capture_screen() -> Result<String, String> {
    let screens = Screen::all().map_err(|e| e.to_string())?;
    
    if screens.is_empty() {
        return Err("No screens found".to_string());
    }
    
    let screen = &screens[0];
    let image = screen.capture().map_err(|e| e.to_string())?;
    
    let buffer = image.to_png().map_err(|e| e.to_string())?;
    let base64 = general_purpose::STANDARD.encode(&buffer);
    
    Ok(base64)
}
