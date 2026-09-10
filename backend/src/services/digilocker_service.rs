use crate::models::{
    AadhaarDocument, Address, CasteCertificateDocument, DigiLockerDocumentsResponse,
    IncomeCertificateDocument,
};

pub fn get_mock_digilocker_payload() -> DigiLockerDocumentsResponse {
    DigiLockerDocumentsResponse {
        citizen_id: "DL-IND-XXXX-XXXXXX".to_string(),
        is_authenticated: true,
        aadhaar: AadhaarDocument {
            document_type: "Aadhaar e-KYC".to_string(),
            uid_masked: "XXXX-XXXX-XXXX".to_string(), // Strict placeholder restraint
            full_name: "Rameshwar Kumar Sharma".to_string(),
            date_of_birth: "1994-08-15".to_string(),
            gender: "Male".to_string(),
            mobile_masked: "[Phone Redacted]".to_string(), // Strict placeholder restraint
            address: Address {
                care_of: "S/O Ramdas Sharma".to_string(),
                house_no: "House No. 42-B".to_string(),
                locality: "Gram Panchayat Rampur, Block Bilaspur".to_string(),
                district: "Varanasi".to_string(),
                state: "Uttar Pradesh".to_string(),
                pincode: "221001".to_string(),
                full_address: "House No. 42-B, Gram Panchayat Rampur, Bilaspur, Varanasi, Uttar Pradesh - 221001".to_string(),
            },
            signature_verified: true,
            issuer: "Unique Identification Authority of India (UIDAI)".to_string(),
            verified_at: "2026-08-22T10:30:00Z".to_string(),
        },
        income_certificate: IncomeCertificateDocument {
            document_type: "Income Certificate".to_string(),
            certificate_number: "UP/REV/INC/XXXX/XXXXXX".to_string(), // Strict placeholder restraint
            applicant_name: "Rameshwar Kumar Sharma".to_string(),
            father_or_husband_name: "Ramdas Sharma".to_string(),
            annual_income_inr: 160000,
            financial_year: "2024-2025".to_string(),
            issuing_authority: "Tehsildar Office, Sadar, Varanasi".to_string(),
            district: "Varanasi".to_string(),
            state: "Uttar Pradesh".to_string(),
            issue_date: "2024-05-10".to_string(),
            validity_period: "3 Years (Valid till 2027-05-09)".to_string(),
            is_verified: true,
        },
        caste_certificate: CasteCertificateDocument {
            document_type: "Caste Certificate".to_string(),
            certificate_number: "UP/REV/CST/XXXX/XXXXXX".to_string(), // Strict placeholder restraint
            applicant_name: "Rameshwar Kumar Sharma".to_string(),
            category: "OBC".to_string(),
            sub_caste: "Kushwaha / Maurya".to_string(),
            issuing_authority: "Sub-Divisional Magistrate, Varanasi".to_string(),
            issue_date: "2023-04-12".to_string(),
            is_verified: true,
        },
    }
}
