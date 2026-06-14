use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AiRequest {
    pub url: String,
    pub method: String,
    pub headers: std::collections::HashMap<String, String>,
    pub body: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AiResponse {
    pub status: u16,
    pub body: String,
}

#[tauri::command]
pub async fn fetch_ai(req: AiRequest) -> Result<AiResponse, String> {
    let client = reqwest::Client::builder()
        .danger_accept_invalid_certs(false)
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let mut request = match req.method.to_uppercase().as_str() {
        "GET" => client.get(&req.url),
        "POST" => client.post(&req.url).body(req.body),
        "PUT" => client.put(&req.url).body(req.body),
        "DELETE" => client.delete(&req.url),
        _ => return Err(format!("Unsupported method: {}", req.method)),
    };

    for (key, value) in &req.headers {
        request = request.header(key.as_str(), value.as_str());
    }

    let response = request
        .send()
        .await
        .map_err(|e| format!("HTTP request failed: {} (url: {})", e, req.url))?;

    let status = response.status().as_u16();
    let body = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response body: {}", e))?;

    Ok(AiResponse { status, body })
}
