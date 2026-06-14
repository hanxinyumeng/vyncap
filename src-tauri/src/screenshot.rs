use windows::Win32::Foundation::HWND;
use windows::Win32::Graphics::Gdi::*;
use windows::Win32::UI::WindowsAndMessaging::*;
use base64::{Engine as _, engine::general_purpose};
use png::ColorType;

#[tauri::command]
pub fn capture_screen() -> Result<String, String> {
    unsafe {
        let screen_width = GetSystemMetrics(SM_CXSCREEN);
        let screen_height = GetSystemMetrics(SM_CYSCREEN);

        let hdc_screen = GetDC(Some(HWND(std::ptr::null_mut())));
        if hdc_screen.is_invalid() {
            return Err("Failed to get screen DC".to_string());
        }

        let hdc_mem = CreateCompatibleDC(Some(hdc_screen));
        if hdc_mem.is_invalid() {
            let _ = ReleaseDC(Some(HWND(std::ptr::null_mut())), hdc_screen);
            return Err("Failed to create memory DC".to_string());
        }

        let hbitmap = CreateCompatibleBitmap(hdc_screen, screen_width, screen_height);
        if hbitmap.is_invalid() {
            let _ = DeleteDC(hdc_mem);
            let _ = ReleaseDC(Some(HWND(std::ptr::null_mut())), hdc_screen);
            return Err("Failed to create bitmap".to_string());
        }

        let old_bitmap = SelectObject(hdc_mem, hbitmap.into());
        let result = BitBlt(hdc_mem, 0, 0, screen_width, screen_height, Some(hdc_screen), 0, 0, SRCCOPY);

        if result.is_err() {
            let _ = SelectObject(hdc_mem, old_bitmap);
            let _ = DeleteObject(hbitmap.into());
            let _ = DeleteDC(hdc_mem);
            let _ = ReleaseDC(Some(HWND(std::ptr::null_mut())), hdc_screen);
            return Err("Failed to copy screen".to_string());
        }

        let mut bitmap_info = BITMAPINFO {
            bmiHeader: BITMAPINFOHEADER {
                biSize: std::mem::size_of::<BITMAPINFOHEADER>() as u32,
                biWidth: screen_width,
                biHeight: -screen_height,
                biPlanes: 1,
                biBitCount: 32,
                biCompression: BI_RGB.0,
                biSizeImage: 0,
                biXPelsPerMeter: 0,
                biYPelsPerMeter: 0,
                biClrUsed: 0,
                biClrImportant: 0,
            },
            bmiColors: [RGBQUAD::default(); 1],
        };

        let buffer_size = (screen_width * screen_height * 4) as usize;
        let mut buffer = vec![0u8; buffer_size];

        let lines = GetDIBits(
            hdc_mem,
            hbitmap,
            0,
            screen_height as u32,
            Some(buffer.as_mut_ptr() as *mut _),
            &mut bitmap_info,
            DIB_RGB_COLORS,
        );

        let _ = SelectObject(hdc_mem, old_bitmap);
        let _ = DeleteObject(hbitmap.into());
        let _ = DeleteDC(hdc_mem);
        let _ = ReleaseDC(Some(HWND(std::ptr::null_mut())), hdc_screen);

        if lines == 0 {
            return Err("Failed to get bitmap bits".to_string());
        }

        for chunk in buffer.chunks_exact_mut(4) {
            chunk.swap(0, 2);
        }

        let mut png_data = Vec::new();
        {
            let mut info = png::Info::with_size(screen_width as u32, screen_height as u32);
            info.color_type = ColorType::Rgba;
            info.bit_depth = png::BitDepth::Eight;
            let encoder = png::Encoder::with_info(&mut png_data, info)
                .map_err(|e| format!("Failed to create PNG encoder: {}", e))?;
            let mut writer = encoder.write_header()
                .map_err(|e| format!("Failed to write PNG header: {}", e))?;

            writer.write_image_data(&buffer)
                .map_err(|e| format!("Failed to write PNG data: {}", e))?;
        }

        let base64 = general_purpose::STANDARD.encode(&png_data);
        Ok(base64)
    }
}
