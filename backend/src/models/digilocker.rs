use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Address {
    pub care_of: String,
    pub house_no: String,
    pub locality: String,
    pub district: String,
    pub state: String,
    pub pincode: String,
    pub full_address: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AadhaarDocument {
    pub document_type: String,
    pub uid_masked: String,
    pub full_name: String,
    pub date_of_birth: String,
    pub gender: String,
    pub mobile_masked: String,
    pub address: Address,
    pub signature_verified: bool,
    pub issuer: String,
    pub verified_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IncomeCertificateDocument {
    pub document_type: String,
    pub certificate_number: String,
    pub applicant_name: String,
    pub father_or_husband_name: String,
    pub annual_income_inr: u64,
    pub financial_year: String,
    pub issuing_authority: String,
    pub district: String,
    pub state: String,
    pub issue_date: String,
    pub validity_period: String,
    pub is_verified: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CasteCertificateDocument {
    pub document_type: String,
    pub certificate_number: String,
    pub applicant_name: String,
    pub category: String, // "OBC", "SC", "ST", "EWS"
    pub sub_caste: String,
    pub issuing_authority: String,
    pub issue_date: String,
    pub is_verified: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DigiLockerDocumentsResponse {
    pub citizen_id: String,
    pub is_authenticated: bool,
    pub aadhaar: AadhaarDocument,
    pub income_certificate: IncomeCertificateDocument,
    pub caste_certificate: CasteCertificateDocument,
}
