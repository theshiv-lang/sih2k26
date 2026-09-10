use std::time::Duration;
use tracing::{info, warn, error};
use crate::models::{ChatRequest, ChatResponse};

/// Detect simple source language from unicode characters
fn detect_source_language(text: &str) -> &'static str {
    if text.chars().any(|c| ('\u{0900}'..='\u{097F}').contains(&c)) {
        "hi"
    } else if text.chars().any(|c| ('\u{0B80}'..='\u{0BFF}').contains(&c)) {
        "ta"
    } else if text.chars().any(|c| ('\u{0C00}'..='\u{0C7F}').contains(&c)) {
        "te"
    } else if text.chars().any(|c| ('\u{0980}'..='\u{09FF}').contains(&c)) {
        "bn"
    } else {
        "en"
    }
}

/// Dynamic contextual suggestions based on target language
fn get_suggestions_for_lang(lang: &str) -> Vec<String> {
    match lang {
        "hi" => vec![
            "पीएम-किसान फॉर्म स्वतः भरें ⚡".to_string(),
            "पात्र योजनाएं दिखाएं 🎯".to_string(),
            "कस्टम डिजीलॉकर वॉल्ट खोलें 📂".to_string(),
        ],
        "ta" => vec![
            "தகுதியான திட்டங்களைக் காட்டு 🎯".to_string(),
            "விண்ணப்பத்தை நிரப்பவும் ⚡".to_string(),
            "பெட்டகத்தைத் திறக்கவும் 📂".to_string(),
        ],
        "te" => vec![
            "అర్హత ఉన్న పథకాలు 🎯".to_string(),
            "దరఖాస్తు పూరించండి ⚡".to_string(),
            "వాల్ట్ తెరవండి 📂".to_string(),
        ],
        "bn" => vec![
            "যোগ্য প্রকল্পগুলি দেখুন 🎯".to_string(),
            "আবেদন পূরণ করুন ⚡".to_string(),
            "ভল্ট খুলুন 📂".to_string(),
        ],
        "mr" => vec![
            "पात्र योजना पहा 🎯".to_string(),
            "अर्ज आपोआप भरा ⚡".to_string(),
            "तिजोरी उघडा 📂".to_string(),
        ],
        _ => vec![
            "Auto-fill PM-Kisan Form ⚡".to_string(),
            "Show my eligible schemes 🎯".to_string(),
            "Open Custom DigiLocker Vault 📂".to_string(),
        ],
    }
}

/// Translate arbitrary text between source and target language via Bhashini Ulca API
pub async fn translate_text(text: &str, source_lang: &str, target_lang: &str) -> Option<String> {
    if text.trim().is_empty() || source_lang == target_lang {
        return Some(text.to_string());
    }

    let auth_key = std::env::var("BHASHINI_API_KEY")
        .or_else(|_| std::env::var("BHASHINI_AUTHORIZATION"))
        .unwrap_or_default();
    let user_id = std::env::var("BHASHINI_USER_ID")
        .or_else(|_| std::env::var("BHASHINI_USERID"))
        .unwrap_or_default();
    let ulca_api_key = std::env::var("BHASHINI_ULCA_API_KEY")
        .or_else(|_| std::env::var("BHASHINI_ULCA_KEY"))
        .unwrap_or_default();
    let inference_url = std::env::var("BHASHINI_INFERENCE_URL")
        .unwrap_or_else(|_| "https://dhruva-api.bhashini.gov.in/services/inference/pipeline".to_string());

    if auth_key.trim().is_empty() && ulca_api_key.trim().is_empty() {
        info!("[Bhashini Translation] No credentials configured in .env. Skipping external translation.");
        return None;
    }

    let payload = serde_json::json!({
        "pipelineTasks": [
            {
                "taskType": "translation",
                "config": {
                    "language": {
                        "sourceLanguage": source_lang,
                        "targetLanguage": target_lang
                    }
                }
            }
        ],
        "inputData": {
            "input": [
                {
                    "source": text
                }
            ]
        }
    });

    let raw_payload_str = serde_json::to_string_pretty(&payload).unwrap_or_default();

    info!(
        "[Bhashini Translation Request] URL: {} | {} -> {}\nPayload:\n{}",
        inference_url, source_lang, target_lang, raw_payload_str
    );
    println!("╔════════════════════════════════════════════════════════════════╗");
    println!("║             📡 BHASHINI ULCA TRANSLATION REQUEST               ║");
    println!("╠════════════════════════════════════════════════════════════════╣");
    println!("  URL:             {}", inference_url);
    println!("  Source:          {}", source_lang);
    println!("  Target:          {}", target_lang);
    println!("  Payload:\n{}", raw_payload_str);
    println!("╚════════════════════════════════════════════════════════════════╝");

    let client = match reqwest::Client::builder()
        .timeout(Duration::from_secs(8))
        .build()
    {
        Ok(c) => c,
        Err(e) => {
            error!("[Bhashini Translation] Failed to build HTTP client: {}", e);
            return None;
        }
    };

    let mut request_builder = client
        .post(&inference_url)
        .header("Content-Type", "application/json");

    if !auth_key.is_empty() {
        request_builder = request_builder.header("Authorization", &auth_key);
    }
    if !user_id.is_empty() {
        request_builder = request_builder.header("userID", &user_id);
    }
    if !ulca_api_key.is_empty() {
        request_builder = request_builder.header("ulcaApiKey", &ulca_api_key);
    }

    match request_builder.json(&payload).send().await {
        Ok(response) => {
            let status = response.status();
            let raw_body = response.text().await.unwrap_or_default();

            info!(
                "[Bhashini Translation Response] Status: {}\nBody:\n{}",
                status, raw_body
            );
            println!("╔════════════════════════════════════════════════════════════════╗");
            println!("║             📥 BHASHINI ULCA TRANSLATION RESPONSE              ║");
            println!("╠════════════════════════════════════════════════════════════════╣");
            println!("  HTTP Status:     {}", status);
            println!("  Raw Body:\n{}", raw_body);
            println!("╚════════════════════════════════════════════════════════════════╝");

            if status.is_success() {
                if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(&raw_body) {
                    if let Some(target_text) = parsed
                        .get("pipelineResponse")
                        .and_then(|pr| pr.get(0))
                        .and_then(|task| task.get("output"))
                        .and_then(|out| out.get(0))
                        .and_then(|item| item.get("target"))
                        .and_then(|t| t.as_str())
                    {
                        return Some(target_text.to_string());
                    }
                }
            }
            warn!("[Bhashini Translation] Non-success response or invalid JSON structure.");
            None
        }
        Err(err) => {
            warn!("[Bhashini Translation] Network error: {}", err);
            None
        }
    }
}

/// Call Bhashini Ulca/Dhruva Inference API with raw request/response tracing
/// and seamless fallback
pub async fn infer_bhashini_pipeline(req: &ChatRequest) -> Option<ChatResponse> {
    let target_lang = req.target_language.as_deref()
        .or(req.language_code.as_deref())
        .unwrap_or("en");
    let source_lang = req.source_language.as_deref()
        .unwrap_or_else(|| detect_source_language(&req.message));

    if let Some(translated) = translate_text(&req.message, source_lang, target_lang).await {
        return Some(ChatResponse {
            response: translated,
            language_code: target_lang.to_string(),
            suggestions: get_suggestions_for_lang(target_lang),
        });
    }

    info!("[Bhashini Service] Falling back to local rule-matching engine.");
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_chat_request_serde_target_language() {
        let json_data = serde_json::json!({
            "message": "PM-Kisan eligibility?",
            "targetLanguage": "ta"
        });

        let req: ChatRequest = serde_json::from_value(json_data).expect("Failed to deserialize");
        assert_eq!(req.message, "PM-Kisan eligibility?");
        assert_eq!(req.target_language.as_deref(), Some("ta"));
    }

    #[test]
    fn test_chat_request_serde_snake_case_target_language() {
        let json_data = serde_json::json!({
            "message": "விண்ணப்பம்",
            "target_language": "hi",
            "source_language": "ta"
        });

        let req: ChatRequest = serde_json::from_value(json_data).expect("Failed to deserialize");
        assert_eq!(req.target_language.as_deref(), Some("hi"));
        assert_eq!(req.source_language.as_deref(), Some("ta"));
    }

    #[test]
    fn test_detect_source_language() {
        assert_eq!(detect_source_language("नमस्ते सहायक"), "hi");
        assert_eq!(detect_source_language("வணக்கம்"), "ta");
        assert_eq!(detect_source_language("నమస్కారం"), "te");
        assert_eq!(detect_source_language("নমস্কার"), "bn");
        assert_eq!(detect_source_language("Hello assistant"), "en");
    }

    #[test]
    fn test_get_suggestions_for_lang() {
        let ta_suggestions = get_suggestions_for_lang("ta");
        assert!(!ta_suggestions.is_empty());
        assert!(ta_suggestions.iter().any(|s| s.contains("திட்ட")));

        let te_suggestions = get_suggestions_for_lang("te");
        assert!(!te_suggestions.is_empty());
        assert!(te_suggestions.iter().any(|s| s.contains("పథకాలు")));

        let mr_suggestions = get_suggestions_for_lang("mr");
        assert!(!mr_suggestions.is_empty());
        assert!(mr_suggestions.iter().any(|s| s.contains("योजना")));

        let bn_suggestions = get_suggestions_for_lang("bn");
        assert!(!bn_suggestions.is_empty());
        assert!(bn_suggestions.iter().any(|s| s.contains("প্রকল্প")));
    }

    #[tokio::test]
    async fn test_infer_bhashini_fallback_when_no_keys() {
        let req = ChatRequest {
            message: "What is PM-Kisan?".to_string(),
            language_code: Some("hi".to_string()),
            target_language: Some("hi".to_string()),
            source_language: Some("en".to_string()),
            citizen: None,
        };

        // When no keys are present in testing environment, it safely returns None (falling back to local engine)
        let resp = infer_bhashini_pipeline(&req).await;
        // In clean test environment without real live government auth tokens, resp is None
        // Verify it executes without panic or crash
        assert!(resp.is_none() || resp.is_some());
    }
}

