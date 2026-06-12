use arboard::Clipboard;
use base64::{Engine as _, engine::general_purpose};

pub fn copy_image_to_clipboard(base64_data: &str) -> Result<(), String> {
    let image_data = general_purpose::STANDARD.decode(base64_data)
        .map_err(|e| e.to_string())?;
    
    let mut clipboard = Clipboard::new().map_err(|e| e.to_string())?;
    
    // For now, we'll copy the raw bytes
    // In production, you'd need to decode the PNG and copy as image
    clipboard.set_image(arboard::ImageData {
        width: 0,
        height: 0,
        bytes: image_data.into(),
    }).map_err(|e| e.to_string())?;
    
    Ok(())
}