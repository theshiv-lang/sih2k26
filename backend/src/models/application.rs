use serde::{Deserialize, Serialize};
use crate::models::citizen::CitizenProfile;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApplyRequest {
    pub citizen: CitizenProfile,
    pub scheme_id: String,
    pub scheme_title: String,
    #[serde(default)]
    pub category: Option<String>,
    #[serde(default)]
    pub details: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApplyResponse {
    pub success: bool,
    pub application_id: String,
    pub status: String,
    pub message: String,
    pub submitted_at: String,
}
