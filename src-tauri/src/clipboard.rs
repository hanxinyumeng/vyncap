use arboard::Clipboard;
use base64::{Engine as _, engine::general_purpose};

fn parse_png_dimensions(data: &[u8]) -> Result<(u32, u32), String> {
    if data.len() < 24 {
        return Err("PNG data too short".to_string());
    }

    if &data[0..8] != b"\x89PNG\r\n\x1a\n" {
        return Err("Invalid PNG signature".to_string());
    }

    let width = u32::from_be_bytes(data[16..20].try_into().map_err(|_| "Invalid width bytes")?);
    let height = u32::from_be_bytes(data[20..24].try_into().map_err(|_| "Invalid height bytes")?);

    Ok((width, height))
}

pub fn copy_image_to_clipboard(base64_data: &str) -> Result<(), String> {
    let image_data = general_purpose::STANDARD.decode(base64_data)
        .map_err(|e| e.to_string())?;

    let (width, height) = parse_png_dimensions(&image_data)?;

    let mut clipboard = Clipboard::new().map_err(|e| e.to_string())?;

    clipboard.set_image(arboard::ImageData {
        width: width as usize,
        height: height as usize,
        bytes: image_data.into(),
    }).map_err(|e| e.to_string())?;

    Ok(())
}