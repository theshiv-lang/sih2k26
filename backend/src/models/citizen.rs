use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct CitizenProfile {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub gender: String,           // "Male", "Female", "Other"
    #[serde(default)]
    pub age: u32,
    #[serde(default)]
    pub state: String,            // e.g. "Uttar Pradesh", "Maharashtra", "All India"
    #[serde(default)]
    pub category: String,         // "General", "OBC", "SC", "ST", "EWS"
    #[serde(default)]
    pub annual_income: u64,       // in INR
    #[serde(default)]
    pub occupation: String,       // "Farmer", "Student", "Unemployed", "Self-Employed", "Daily Wage Worker", etc.
    
    #[serde(default)]
    pub father_name: Option<String>,

    #[serde(default)]
    pub contact_number: Option<String>,

    #[serde(default)]
    pub landholding_acres: Option<f64>, // For agriculture schemes like PM-Kisan
    
    #[serde(default)]
    pub is_student: bool,
    
    #[serde(default)]
    pub education_level: Option<String>, // "10th", "12th", "Undergraduate", "Postgraduate"
    
    #[serde(default)]
    pub is_differently_abled: bool,
    
    #[serde(default)]
    pub mobile: Option<String>,
    
    #[serde(default)]
    pub email: Option<String>,
    
    #[serde(default)]
    pub aadhaar_number: Option<String>,

    // Dynamic attributes for custom persona builder
    #[serde(default)]
    pub marital_status: Option<String>, // "Single", "Married", "Widow", "Divorced"

    #[serde(default)]
    pub has_girl_child: Option<bool>,

    #[serde(default)]
    pub girl_child_age: Option<u32>,

    #[serde(default)]
    pub bpl_card_holder: Option<bool>,

    #[serde(default)]
    pub is_pregnant_or_lactating: Option<bool>,

    #[serde(default)]
    pub crop_insured: Option<bool>,

    #[serde(default)]
    pub persona_type: Option<String>, // "Farmer", "Student", "Girl Child", "Widow", "Custom"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MatchRequest {
    pub citizen: CitizenProfile,
    pub scheme_category: Option<String>, // Optional filter (e.g. "Agriculture", "Education", "Healthcare")
    pub max_results: Option<usize>,
    pub language_code: Option<String>,   // e.g. "hi", "en", "ta", "te", "bn", "mr"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatRequest {
    pub message: String,
    #[serde(default)]
    pub language_code: Option<String>,   // e.g. "hi", "en", "ta", "te", "bn", "mr"
    #[serde(default, alias = "targetLanguage")]
    pub target_language: Option<String>,
    #[serde(default, alias = "sourceLanguage")]
    pub source_language: Option<String>,
    pub citizen: Option<CitizenProfile>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatResponse {
    pub response: String,
    pub language_code: String,
    pub suggestions: Vec<String>,
}
