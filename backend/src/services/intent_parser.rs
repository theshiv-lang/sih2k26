use crate::models::CitizenProfile;

pub struct IntentParser;

impl IntentParser {
    /// Parse natural language text into demographic attributes and overlay them onto a CitizenProfile
    pub fn parse_demographics(text: &str, base_profile: Option<&CitizenProfile>) -> CitizenProfile {
        let lower = text.to_lowercase();

        // 1. Keyword check flags
        let is_student_intent = lower.contains("student")
            || lower.contains("college")
            || lower.contains("school")
            || lower.contains("university")
            || lower.contains("scholarship")
            || lower.contains("study")
            || lower.contains("degree")
            || lower.contains("matric")
            || lower.contains("छात्र")
            || lower.contains("विद्यार्थी")
            || lower.contains("कॉलेज")
            || lower.contains("स्कूल")
            || lower.contains("शिक्षा")
            || lower.contains("पढ़ाई")
            || lower.contains("மாணவர்")
            || lower.contains("கல்லூரி")
            || lower.contains("பள்ளி")
            || lower.contains("கல்வி")
            || lower.contains("విద్యార్థి")
            || lower.contains("కళాశాల")
            || lower.contains("పాఠశాల")
            || lower.contains("విద్య")
            || lower.contains("ছাত্র")
            || lower.contains("কলেজ")
            || lower.contains("বিদ্যালয়")
            || lower.contains("महाविद्यालय")
            || lower.contains("शिक्षण");

        let is_widow_intent = lower.contains("widow")
            || lower.contains("husband died")
            || lower.contains("alone")
            || lower.contains("विधवा")
            || lower.contains("पति की मृत्यु")
            || lower.contains("अकेली")
            || lower.contains("விதவை")
            || lower.contains("விதவை பெண்")
            || lower.contains("వితంతువు")
            || lower.contains("వితంతు")
            || lower.contains("বিধবা")
            || lower.contains("স্বামী মারা গেছেন");

        let is_senior_intent = lower.contains("senior")
            || lower.contains("elderly")
            || lower.contains("old")
            || lower.contains("pension")
            || lower.contains("retired")
            || lower.contains("60")
            || lower.contains("65")
            || lower.contains("बुजुर्ग")
            || lower.contains("वृद्ध")
            || lower.contains("पेंशन")
            || lower.contains("सेवानिवृत्त")
            || lower.contains("முதியோர்")
            || lower.contains("ஓய்வூதியம்")
            || lower.contains("వృద్ధులు")
            || lower.contains("పెన్షన్")
            || lower.contains("বয়স্ক")
            || lower.contains("পেনশন")
            || lower.contains("म्हातारे")
            || lower.contains("ज्येष्ठ नागरिक");

        let is_girl_child_intent = lower.contains("girl child")
            || lower.contains("daughter")
            || lower.contains("sukanya")
            || lower.contains("ssy")
            || lower.contains("बेटी")
            || lower.contains("सुकन्या")
            || lower.contains("பெண் குழந்தை")
            || lower.contains("బాలిక")
            || lower.contains("কন্যা")
            || lower.contains("मुलगी");

        let is_woman_intent = is_girl_child_intent
            || lower.contains("woman")
            || lower.contains("female")
            || lower.contains("girl")
            || lower.contains("lady")
            || lower.contains("महिला")
            || lower.contains("स्त्री")
            || lower.contains("लड़की")
            || lower.contains("பெண்")
            || lower.contains("மகள்")
            || lower.contains("மகிளா")
            || lower.contains("మహిళ")
            || lower.contains("స్త్రీ")
            || lower.contains("కూతురు")
            || lower.contains("মহিলা")
            || lower.contains("মেয়ে");

        let is_farmer_intent = lower.contains("farmer")
            || lower.contains("farming")
            || lower.contains("agriculture")
            || lower.contains("kisan")
            || lower.contains("pm-kisan")
            || lower.contains("pm kisan")
            || lower.contains("crop")
            || lower.contains("cultivator")
            || lower.contains("किसान")
            || lower.contains("खेती")
            || lower.contains("विவசாயி")
            || lower.contains("రైతు")
            || lower.contains("কৃষক")
            || lower.contains("शेतकरी");

        let is_entrepreneur_intent = lower.contains("entrepreneur")
            || lower.contains("business")
            || lower.contains("startup")
            || lower.contains("mudra")
            || lower.contains("standup")
            || lower.contains("stand-up")
            || lower.contains("shop")
            || lower.contains("व्यापार")
            || lower.contains("उद्यमी")
            || lower.contains("வணிகம்")
            || lower.contains("వ్యాపారం")
            || lower.contains("ব্যবসা")
            || lower.contains("उद्योग");

        let has_any_persona_keyword = is_student_intent
            || is_widow_intent
            || is_senior_intent
            || is_woman_intent
            || is_farmer_intent
            || is_entrepreneur_intent;

        // 2. Initialize profile:
        // If NO persona keywords match, strictly default to a neutral generic citizen profile
        // (Age 30, General category, occupation "Citizen", landholding 0.0) without inheriting farmer attributes.
        let mut profile = if !has_any_persona_keyword {
            CitizenProfile {
                name: base_profile
                    .map(|p| p.name.clone())
                    .unwrap_or_else(|| "Citizen Applicant".to_string()),
                gender: "Male".to_string(),
                age: 30,
                state: base_profile
                    .map(|p| p.state.clone())
                    .unwrap_or_else(|| "All India".to_string()),
                category: "General".to_string(),
                annual_income: 250000,
                occupation: "Citizen".to_string(),
                father_name: base_profile.and_then(|p| p.father_name.clone()),
                contact_number: base_profile.and_then(|p| p.contact_number.clone()),
                landholding_acres: Some(0.0),
                is_student: false,
                education_level: Some("12th".to_string()),
                is_differently_abled: false,
                mobile: base_profile.and_then(|p| p.mobile.clone()),
                email: base_profile.and_then(|p| p.email.clone()),
                aadhaar_number: base_profile.and_then(|p| p.aadhaar_number.clone()),
                marital_status: Some("Single".to_string()),
                has_girl_child: Some(false),
                girl_child_age: Some(0),
                bpl_card_holder: Some(false),
                is_pregnant_or_lactating: Some(false),
                crop_insured: Some(false),
                persona_type: Some("Citizen".to_string()),
            }
        } else {
            // Start from neutral baseline, keeping base profile identity (name, state, contact)
            CitizenProfile {
                name: base_profile
                    .map(|p| p.name.clone())
                    .unwrap_or_else(|| "Citizen Applicant".to_string()),
                gender: "Male".to_string(),
                age: 30,
                state: base_profile
                    .map(|p| p.state.clone())
                    .unwrap_or_else(|| "All India".to_string()),
                category: "General".to_string(),
                annual_income: 150000,
                occupation: "Citizen".to_string(),
                father_name: base_profile.and_then(|p| p.father_name.clone()),
                contact_number: base_profile.and_then(|p| p.contact_number.clone()),
                landholding_acres: Some(0.0),
                is_student: false,
                education_level: Some("12th".to_string()),
                is_differently_abled: false,
                mobile: base_profile.and_then(|p| p.mobile.clone()),
                email: base_profile.and_then(|p| p.email.clone()),
                aadhaar_number: base_profile.and_then(|p| p.aadhaar_number.clone()),
                marital_status: Some("Single".to_string()),
                has_girl_child: Some(false),
                girl_child_age: Some(0),
                bpl_card_holder: Some(false),
                is_pregnant_or_lactating: Some(false),
                crop_insured: Some(false),
                persona_type: Some("Citizen".to_string()),
            }
        };

        // 3. Apply Persona-Specific Attributes with Conflicting Attribute Resets

        // STUDENT
        if is_student_intent {
            profile.is_student = true;
            profile.occupation = "Student".to_string();
            profile.education_level = Some("Undergraduate".to_string());
            profile.age = 20;
            profile.annual_income = 120000;
            profile.landholding_acres = Some(0.0);
            profile.crop_insured = Some(false);
            profile.persona_type = Some("Student".to_string());
        }

        // WIDOW
        if is_widow_intent {
            profile.marital_status = Some("Widow".to_string());
            profile.gender = "Female".to_string();
            profile.bpl_card_holder = Some(true);
            profile.occupation = "Unemployed".to_string();
            profile.landholding_acres = Some(0.0);
            profile.crop_insured = Some(false);
            profile.is_student = false;
            profile.age = 50;
            profile.annual_income = 80000;
            profile.persona_type = Some("Widow".to_string());
        }

        // SENIOR CITIZEN
        if is_senior_intent && !is_widow_intent {
            profile.age = 65;
            profile.occupation = "Retired".to_string();
            profile.landholding_acres = Some(0.0);
            profile.crop_insured = Some(false);
            profile.is_student = false;
            profile.persona_type = Some("Senior Citizen".to_string());
        }

        // WOMAN / GIRL CHILD
        if is_woman_intent && !is_widow_intent {
            profile.gender = "Female".to_string();
            if is_girl_child_intent {
                profile.has_girl_child = Some(true);
                profile.girl_child_age = Some(7);
                profile.persona_type = Some("Girl Child".to_string());
            } else if profile.persona_type.as_deref() == Some("Citizen") {
                profile.persona_type = Some("Woman".to_string());
            }
        }

        // FARMER (Only if explicitly matched and not overridden by student/widow)
        if is_farmer_intent && !is_student_intent && !is_widow_intent {
            profile.occupation = "Farmer".to_string();
            profile.is_student = false;
            if profile.landholding_acres.unwrap_or(0.0) <= 0.0 {
                profile.landholding_acres = Some(2.5);
            }
            profile.crop_insured = Some(true);
            profile.persona_type = Some("Farmer".to_string());
        }

        // ENTREPRENEUR
        if is_entrepreneur_intent && !is_farmer_intent {
            profile.occupation = "Entrepreneur".to_string();
            profile.is_student = false;
            profile.landholding_acres = Some(0.0);
            profile.crop_insured = Some(false);
            profile.persona_type = Some("Entrepreneur".to_string());
        }

        // 4. Landholding Extraction (if specified explicitly in query text)
        if lower.contains("landless") || lower.contains("no land") || lower.contains("भूमिहीन") {
            profile.landholding_acres = Some(0.0);
        } else if lower.contains("marginal") || lower.contains("small farmer") {
            profile.landholding_acres = Some(1.5);
            profile.occupation = "Farmer".to_string();
            profile.crop_insured = Some(true);
        } else {
            for word in lower.split_whitespace() {
                if let Ok(val) = word.parse::<f64>() {
                    if val > 0.0 && val <= 50.0 && (lower.contains("acre") || lower.contains("hectare") || lower.contains("एकड़")) {
                        profile.landholding_acres = Some(val);
                        profile.occupation = "Farmer".to_string();
                        profile.crop_insured = Some(true);
                        break;
                    }
                }
            }
        }

        // 5. Social Category / Caste Detection
        if lower.contains(" sc ") || lower.starts_with("sc ") || lower.ends_with(" sc") || lower.contains("scheduled caste") || lower.contains("दलित") {
            profile.category = "SC".to_string();
        } else if lower.contains(" st ") || lower.starts_with("st ") || lower.ends_with(" st") || lower.contains("scheduled tribe") || lower.contains("आदिवासी") {
            profile.category = "ST".to_string();
        } else if lower.contains("obc") || lower.contains("backward") || lower.contains("पिछड़ा") {
            profile.category = "OBC".to_string();
        } else if lower.contains("ews") || lower.contains("economically weaker") {
            profile.category = "EWS".to_string();
        }

        // 6. Income & Poverty / BPL Detection
        if lower.contains("bpl")
            || lower.contains("poor")
            || lower.contains("low income")
            || lower.contains("below poverty")
            || lower.contains("गरीब")
            || lower.contains("वंचित")
        {
            profile.bpl_card_holder = Some(true);
            if profile.annual_income > 100000 {
                profile.annual_income = 80000;
            }
        }

        // 7. Disability Detection
        if lower.contains("disabled")
            || lower.contains("disability")
            || lower.contains("handicap")
            || lower.contains("divyang")
            || lower.contains("दिव्यांग")
            || lower.contains("विकलांग")
            || lower.contains("மாற்றுத்திறனாளி")
        {
            profile.is_differently_abled = true;
        }

        // 8. Pregnancy / Maternity Detection
        if lower.contains("pregnant")
            || lower.contains("lactating")
            || lower.contains("maternity")
            || lower.contains("गर्भवती")
        {
            profile.is_pregnant_or_lactating = Some(true);
            profile.gender = "Female".to_string();
        }

        profile
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_intent_parser_student_extraction() {
        let text = "I am a college student studying for my degree in university looking for scholarship.";
        let profile = IntentParser::parse_demographics(text, None);
        assert!(profile.is_student);
        assert_eq!(profile.occupation, "Student");
        assert_eq!(profile.education_level.as_deref(), Some("Undergraduate"));
        assert_eq!(profile.landholding_acres, Some(0.0));
        assert_eq!(profile.crop_insured, Some(false));
    }

    #[test]
    fn test_intent_parser_farmer_extraction() {
        let text = "I am a farmer with 2.5 acres of land and need crop assistance.";
        let profile = IntentParser::parse_demographics(text, None);
        assert_eq!(profile.occupation, "Farmer");
        assert_eq!(profile.landholding_acres, Some(2.5));
        assert_eq!(profile.crop_insured, Some(true));
    }

    #[test]
    fn test_intent_parser_widow_extraction() {
        let text = "I am a poor widow whose husband died, living alone.";
        let profile = IntentParser::parse_demographics(text, None);
        assert_eq!(profile.marital_status.as_deref(), Some("Widow"));
        assert_eq!(profile.gender, "Female");
        assert_eq!(profile.bpl_card_holder, Some(true));
        assert_eq!(profile.landholding_acres, Some(0.0));
        assert_eq!(profile.crop_insured, Some(false));
        assert!(profile.age >= 40);
    }

    #[test]
    fn test_intent_parser_senior_citizen_extraction() {
        let text = "I am an old retired senior citizen looking for old age pension 65.";
        let profile = IntentParser::parse_demographics(text, None);
        assert_eq!(profile.age, 65);
        assert_eq!(profile.occupation, "Retired");
        assert_eq!(profile.landholding_acres, Some(0.0));
        assert_eq!(profile.crop_insured, Some(false));
        assert_eq!(profile.persona_type.as_deref(), Some("Senior Citizen"));
    }

    #[test]
    fn test_intent_parser_woman_girl_child_extraction() {
        let text = "Looking for schemes for my young daughter Sukanya savings for girl child.";
        let profile = IntentParser::parse_demographics(text, None);
        assert_eq!(profile.has_girl_child, Some(true));
        assert_eq!(profile.gender, "Female");
        assert_eq!(profile.landholding_acres, Some(0.0));
        assert_eq!(profile.crop_insured, Some(false));
    }

    #[test]
    fn test_intent_parser_generic_fallback_no_keywords() {
        // Even if a farmer base_profile is passed, if text contains NO persona keywords,
        // it must strictly default to generic citizen profile (Age 30, General, Citizen, 0.0 land)
        let farmer_base = CitizenProfile {
            name: "Rameshwar Sharma".to_string(),
            gender: "Male".to_string(),
            age: 52,
            state: "Uttar Pradesh".to_string(),
            category: "OBC".to_string(),
            annual_income: 160000,
            occupation: "Farmer".to_string(),
            landholding_acres: Some(2.5),
            crop_insured: Some(true),
            ..Default::default()
        };

        let text = "What schemes are available?";
        let profile = IntentParser::parse_demographics(text, Some(&farmer_base));
        assert_eq!(profile.age, 30);
        assert_eq!(profile.category, "General");
        assert_eq!(profile.occupation, "Citizen");
        assert_eq!(profile.landholding_acres, Some(0.0));
        assert_eq!(profile.crop_insured, Some(false));
        assert_eq!(profile.name, "Rameshwar Sharma");
    }

    #[test]
    fn test_intent_parser_multilingual_hindi_farmer() {
        let text = "मैं एक किसान हूँ और मुझे खेती के लिए सहायता चाहिए";
        let profile = IntentParser::parse_demographics(text, None);
        assert_eq!(profile.occupation, "Farmer");
        assert!(profile.landholding_acres.unwrap_or(0.0) > 0.0);
    }
}
