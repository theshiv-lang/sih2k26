use axum::{response::IntoResponse, Json};
use crate::services::get_mock_digilocker_payload;

pub async fn get_digilocker_documents() -> impl IntoResponse {
    let payload = get_mock_digilocker_payload();
    Json(payload)
}
