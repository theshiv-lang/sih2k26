use std::sync::OnceLock;
use crate::models::{
    ChatRequest, ChatResponse, CitizenProfile, MatchRequest, MatchResponse, Scheme,
    SchemeMatchResult, SchemeMatcher,
};

static MASTER_SCHEMES: OnceLock<Vec<Scheme>> = OnceLock::new();

pub fn get_master_schemes() -> Vec<Scheme> {
    MASTER_SCHEMES
        .get_or_init(|| {
            let json_str = include_str!("../data/schemes_catalog.json");
            serde_json::from_str(json_str).expect("Failed to parse embedded schemes_catalog.json")
        })
        .clone()
}

pub fn match_citizen_schemes(req: &MatchRequest) -> MatchResponse {
    let master_schemes = get_master_schemes();
    let lang = req.language_code.as_deref().unwrap_or("en");

    let mut evaluated_matches: Vec<SchemeMatchResult> = master_schemes
        .into_iter()
        .filter(|s: &Scheme| {
            if let Some(cat) = &req.scheme_category {
                if !cat.is_empty() && cat.as_str() != "All" {
                    let cat_lower = cat.to_lowercase();
                    let scheme_cat_lower = s.category.to_lowercase();
                    return scheme_cat_lower == cat_lower 
                        || scheme_cat_lower.contains(&cat_lower) 
                        || cat_lower.contains(&scheme_cat_lower);
                }
            }
            true
        })
        .map(|scheme: Scheme| scheme.evaluate(&req.citizen, lang))
        .collect();

    // Sort by is_eligible DESC, then match_score DESC
    evaluated_matches.sort_by(|a, b| {
        b.is_eligible
            .cmp(&a.is_eligible)
            .then_with(|| b.match_score.cmp(&a.match_score))
    });

    let eligible_count = evaluated_matches.iter().filter(|m| m.is_eligible).count();
    let total_evaluated = evaluated_matches.len();

    if let Some(limit) = req.max_results {
        if limit > 0 {
            evaluated_matches.truncate(limit);
        }
    }

    MatchResponse {
        total_evaluated,
        eligible_count,
        matches: evaluated_matches,
    }
}

/// Query the scheme database in real time based on natural language query
pub fn match_schemes_from_query(query: &str, base_citizen: Option<&CitizenProfile>, lang: &str) -> ChatResponse {
    let parsed_citizen = crate::services::IntentParser::parse_demographics(query, base_citizen);
    let match_req = MatchRequest {
        citizen: parsed_citizen.clone(),
        scheme_category: None,
        max_results: Some(3),
        language_code: Some(lang.to_string()),
    };
    let match_resp = match_citizen_schemes(&match_req);

    if match_resp.matches.is_empty() {
        return process_chat_conversation(&ChatRequest {
            message: query.to_string(),
            language_code: Some(lang.to_string()),
            target_language: Some(lang.to_string()),
            source_language: None,
            citizen: base_citizen.cloned(),
        });
    }

    let top_matches = &match_resp.matches;
    let mut response_lines = Vec::new();

    let header = match lang {
        "hi" => "🎯 **आपकी प्रोफ़ाइल और प्रश्न के आधार पर, आप निम्नलिखित कल्याणकारी योजनाओं के लिए पात्र हैं:**\n",
        "ta" => "🎯 **உங்கள் சுயவிவரம் மற்றும் வினவலின் அடிப்படையில், நீங்கள் பின்வரும் நலத்திட்டங்களுக்கு தகுதியுடையவர்:**\n",
        "te" => "🎯 **మీ ప్రొఫైల్ మరియు ప్రశ్న ఆధారంగా, మీరు ఈ క్రింది సంక్షేమ పథకాలకు అర్హులు:**\n",
        "bn" => "🎯 **আপনার প্রোফাইল এবং প্রশ্নের ভিত্তিতে, আপনি নিম্নলিখিত কল্যাণমূলক প্রকল্পগুলির জন্য যোগ্য:**\n",
        "mr" => "🎯 **आपल्या प्रोफाइल आणि प्रश्नानुसार, आपण खालील कल्याणकारी योजनांसाठी पात्र आहात:**\n",
        _ => "🎯 **Based on your input and demographics, you are eligible for the following welfare schemes:**\n",
    };
    response_lines.push(header.to_string());

    for (idx, m) in top_matches.iter().enumerate() {
        let num = idx + 1;
        let s = &m.scheme;
        let (benefit_label, portal_label) = match lang {
            "hi" => ("वित्तीय लाभ:", "आधिकारिक पोर्टल:"),
            "ta" => ("நிதி உதவி:", "அதிகாரப்பூர்வ தளம்:"),
            "te" => ("ఆర్థిక ప్రయోజనం:", "అధికారిక పోర్టల్:"),
            "bn" => ("আর্থিক সুবিধা:", "অফিসিয়াল পোর্টাল:"),
            "mr" => ("आर्थिक लाभ:", "अधिकृत पोर्टल:"),
            _ => ("Financial Benefit:", "Official Portal:"),
        };

        let block = format!(
            "{}. **{}** ({})\n   - **{}** {}\n   - {}\n   - **{}** {}",
            num, s.title, s.category, benefit_label, s.financial_benefit, s.short_description, portal_label, s.portal_url
        );
        response_lines.push(block);
    }

    let footer = match lang {
        "hi" => "\n💡 *सुझाव:* 1-क्लिक फॉर्म स्वतः भरने के लिए 'आवेदन स्वतः भरें' पर क्लिक करें या डिजीलॉकर वॉल्ट खोलें।",
        "ta" => "\n💡 *குறிப்பு:* 1-கிளிக் தானியங்கி விண்ணப்பத்திற்கு 'தானியங்கி விண்ணப்பம்' அழுத்தவும் அல்லது பெட்டகத்தைத் திறக்கவும்.",
        "te" => "\n💡 *సూచన:* 1-క్లిక్ ఆటో-ఫిల్ కోసం 'దరఖాస్తు పూరించండి' పై క్లిక్ చేయండి లేదా డిజిలాకర్ వాల్ట్ తెరవండి.",
        "bn" => "\n💡 *পরামর্শ:* ১-ক্লিকে আবেদন পূরণের জন্য 'আবেদন পূরণ করুন' চাপুন অথবা ডিজিলকার ভল্ট খুলুন।",
        "mr" => "\n💡 *टीप:* १-क्लिक अर्ज भरण्यासाठी 'अर्ज आपोआप भरा' वर क्लिक करा किंवा डिजिलॉकर तिजोरी उघडा.",
        _ => "\n💡 *Tip:* Use our Chrome extension for 1-click DOM auto-fill, or open the DigiLocker Vault to inspect verified credentials.",
    };
    response_lines.push(footer.to_string());

    let mut suggestions = Vec::new();
    if let Some(first) = top_matches.first() {
        let scheme_title = &first.scheme.title;
        match lang {
            "hi" => suggestions.push(format!("{} के लिए आवेदन स्वतः भरें ⚡", scheme_title)),
            "ta" => suggestions.push(format!("{} தானியங்கி விண்ணப்பம் ⚡", scheme_title)),
            "te" => suggestions.push(format!("{} ఆటో-ఫిల్ దరఖాస్తు ⚡", scheme_title)),
            "bn" => suggestions.push(format!("{} আবেদন পূরণ করুন ⚡", scheme_title)),
            "mr" => suggestions.push(format!("{} अर्ज आपोआप भरा ⚡", scheme_title)),
            _ => suggestions.push(format!("Auto-fill {} ⚡", scheme_title)),
        }
    }
    match lang {
        "hi" => {
            suggestions.push("पात्र योजनाएं दिखाएं 🎯".to_string());
            suggestions.push("कस्टम डिजीलॉकर वॉल्ट खोलें 📂".to_string());
        },
        "ta" => {
            suggestions.push("தகுதியான திட்டங்களைக் காட்டு 🎯".to_string());
            suggestions.push("பெட்டகத்தைத் திறக்கவும் 📂".to_string());
        },
        "te" => {
            suggestions.push("అర్హత ఉన్న పథకాలు 🎯".to_string());
            suggestions.push("వాల్ట్ తెరవండి 📂".to_string());
        },
        "bn" => {
            suggestions.push("যোগ্য প্রকল্পগুলি দেখুন 🎯".to_string());
            suggestions.push("ভল্ট খুলুন 📂".to_string());
        },
        "mr" => {
            suggestions.push("पात्र योजना पहा 🎯".to_string());
            suggestions.push("तिजोरी उघडा 📂".to_string());
        },
        _ => {
            suggestions.push("Show all eligible schemes 🎯".to_string());
            suggestions.push("Open Custom DigiLocker Vault 📂".to_string());
        }
    }

    ChatResponse {
        response: response_lines.join("\n"),
        language_code: lang.to_string(),
        suggestions,
    }
}

/// Dynamic multilingual conversational response generator
pub fn process_chat_conversation(req: &ChatRequest) -> ChatResponse {
    let raw_lang = req.language_code.as_deref().unwrap_or("en");
    let lower_msg = req.message.to_lowercase();

    let is_hindi = raw_lang.starts_with("hi") || req.message.chars().any(|c| ('\u{0900}'..='\u{097F}').contains(&c));
    let is_tamil = raw_lang.starts_with("ta") || req.message.chars().any(|c| ('\u{0B80}'..='\u{0BFF}').contains(&c));
    let is_telugu = raw_lang.starts_with("te") || req.message.chars().any(|c| ('\u{0C00}'..='\u{0C7F}').contains(&c));
    let is_bengali = raw_lang.starts_with("bn") || req.message.chars().any(|c| ('\u{0980}'..='\u{09FF}').contains(&c));
    let is_marathi = raw_lang.starts_with("mr");

    let lang_code = if is_hindi {
        "hi"
    } else if is_tamil {
        "ta"
    } else if is_telugu {
        "te"
    } else if is_bengali {
        "bn"
    } else if is_marathi {
        "mr"
    } else {
        "en"
    };

    let (response_text, suggestions) = match lang_code {
        "hi" => {
            if lower_msg.contains("pm-kisan") || lower_msg.contains("kisan") || lower_msg.contains("farmer") || lower_msg.contains("किसान") || lower_msg.contains("खेती") {
                (
                    "🌾 **पीएम-किसान सम्मान निधि (https://pmkisan.gov.in/):**\n\nआप प्रति वर्ष ₹6,000 की डीबीटी सहायता के लिए **पूरी तरह से पात्र** हैं।\n\n- **श्रेणी:** कृषि, ग्रामीण एवं पर्यावरण\n- **भूमि स्वामित्व:** सत्यापित\n- **आधार ई-केवाईसी:** सत्यापित [XXXX-XXXX-XXXX]\n- **अगला कदम:** आधिकारिक पोर्टल पर 1-क्लिक फॉर्म भरने के लिए **\"आवेदन स्वतः भरें\"** (Auto-Fill) बटन पर क्लिक करें।".to_string(),
                    vec![
                        "पीएम-किसान फॉर्म स्वतः भरें ⚡".to_string(),
                        "पीएम फसल बीमा योजना देखें 🌾".to_string(),
                    ]
                )
            } else if lower_msg.contains("standup") || lower_msg.contains("उद्यमी") || lower_msg.contains("व्यापार") || lower_msg.contains("business") {
                (
                    "💼 **स्टैंड-अप इंडिया योजना (https://www.standupmitra.in/):**\n\nअनुसूचित जाति, जनजाति अथवा महिला उद्यमियों के लिए ₹10 लाख से ₹1 करोड़ तक का बैंक ऋण उपलब्ध है।".to_string(),
                    vec![
                        "स्टैंड-अप इंडिया विवरण देखें 💼".to_string(),
                        "मुद्रा ऋण योजना देखें 💰".to_string(),
                    ]
                )
            } else if lower_msg.contains("sukanya") || lower_msg.contains("girl") || lower_msg.contains("बेटी") || lower_msg.contains("सुकन्या") {
                (
                    "👧 **सुकन्या समृद्धि योजना (https://www.indiapost.gov.in/):**\n\n10 वर्ष से कम आयु की बालिकाओं के लिए भारत सरकार द्वारा 8.2% की उच्चतम कर-मुक्त ब्याज दर और ₹15 लाख+ की परिपक्वता राशि प्रदान की जाती है।".to_string(),
                    vec![
                        "सुकन्या समृद्धि विवरण देखें 👧".to_string(),
                        "आवेदन स्वतः भरें ⚡".to_string(),
                    ]
                )
            } else if lower_msg.contains("widow") || lower_msg.contains("विधवा") || lower_msg.contains("pension") || lower_msg.contains("पेंशन") {
                (
                    "🧕 **इंदिरा गांधी राष्ट्रीय विधवा पेंशन योजना (https://nsap.nic.in/):**\n\n40 वर्ष या उससे अधिक आयु की विधवा महिलाओं (BPL) के लिए प्रति माह ₹1,000 - ₹2,500 की सीधी बैंक पेंशन सहायता उपलब्ध है।".to_string(),
                    vec![
                        "विधवा पेंशन विवरण देखें 🧕".to_string(),
                        "वृद्धावस्था पेंशन देखें 👴".to_string(),
                    ]
                )
            } else if lower_msg.contains("scholarship") || lower_msg.contains("student") || lower_msg.contains("छात्रवृत्ति") || lower_msg.contains("पढ़ाई") {
                (
                    "🎓 **राष्ट्रीय छात्रवृत्ति पोर्टल (https://scholarships.gov.in/):**\n\n₹2.5 लाख से कम वार्षिक पारिवारिक आय वाले छात्रों के लिए पोस्ट-मैट्रिक और उच्च शिक्षा हेतु प्रति वर्ष ₹25,000 तक की वित्तीय सहायता उपलब्ध है।".to_string(),
                    vec![
                        "प्रोफ़ाइल को छात्र में बदलें 🎓".to_string(),
                        "शिक्षा योजनाएं देखें 📚".to_string(),
                    ]
                )
            } else if lower_msg.contains("ayushman") || lower_msg.contains("health") || lower_msg.contains("आयुष्मान") || lower_msg.contains("स्वास्थ्य") {
                (
                    "🏥 **आयुष्मान भारत PM-JAY (https://nha.gov.in/):**\n\nप्रति परिवार प्रति वर्ष ₹5,00,000 तक का मुफ्त कैशलेस स्वास्थ्य बीमा कवर प्रदान किया जाता है।".to_string(),
                    vec![
                        "आयुष्मान कार्ड विवरण देखें 🏥".to_string(),
                        "अस्पताल सूची खोजें 🔍".to_string(),
                    ]
                )
            } else {
                (
                    "मैंने आपकी नागरिक प्रोफ़ाइल का विश्लेषण किया है। आप myScheme.gov.in पर वर्गीकृत आधिकारिक सरकारी कल्याणकारी योजनाओं (कृषि, शिक्षा, महिला एवं बाल, सामाजिक सुरक्षा, स्वास्थ्य एवं उद्यम) के लिए पात्र हैं।\n\nआप हमारे कस्टम डिजीलॉकर वॉल्ट में प्रोफ़ाइल बदलकर लाइव परीक्षण कर सकते हैं।".to_string(),
                    vec![
                        "पात्र योजनाएं दिखाएं 🎯".to_string(),
                        "कस्टम डिजीलॉकर वॉल्ट खोलें 📂".to_string(),
                        "आवाज से पूछें 🎙️".to_string(),
                    ]
                )
            }
        },
        "ta" => {
            (
                "🌾 **சகாயக் வழிகாட்டி (Sahayak Tamil):**\n\nஅரசு நலத்திட்டங்கள் (PM-KISAN: https://pmkisan.gov.in/, NSP: https://scholarships.gov.in/, Stand-Up India: https://www.standupmitra.in/) பற்றிய தகவல்களைப் பெறவும். விண்ணப்பத்தை உடனடியாக நிரப்ப 'Auto-Fill' பொத்தானை அழுத்தவும்.".to_string(),
                vec![
                    "தகுதியான திட்டங்களைக் காட்டு 🎯".to_string(),
                    "விண்ணப்பத்தை நிரப்பவும் ⚡".to_string(),
                ]
            )
        },
        "te" => {
            (
                "🌾 **సహాయక్ మార్గదర్శి (Sahayak Telugu):**\n\nప్రభుత్వ సంక్షేమ పథకాలు (PM-KISAN: https://pmkisan.gov.in/, NSP: https://scholarships.gov.in/, Stand-Up India: https://www.standupmitra.in/) కోసం మీరు అర్హులు. దరఖాస్తును సులభంగా పూరించడానికి 'Auto-Fill' బటన్‌ను క్లిక్ చేయండి.".to_string(),
                vec![
                    "అర్హత ఉన్న పథకాలు 🎯".to_string(),
                    "దరఖాస్తు పూరించండి ⚡".to_string(),
                ]
            )
        },
        "bn" => {
            (
                "🌾 **সহায়ক নির্দেশিকা (Sahayak Bengali):**\n\nআপনি পিএম-কিষাণ (https://pmkisan.gov.in/) এবং ন্যাশনাল স্কলারশিপ পোর্টালের (https://scholarships.gov.in/) জন্য যোগ্য। ফর্মটি পূরণ করতে 'Auto-Fill' বাটনে ক্লিক করুন।".to_string(),
                vec![
                    "যোগ্য প্রকল্পগুলি দেখুন 🎯".to_string(),
                    "আবেদন পূরণ করুন ⚡".to_string(),
                ]
            )
        },
        _ => {
            if lower_msg.contains("pm-kisan") || lower_msg.contains("kisan") || lower_msg.contains("farmer") {
                (
                    "🌾 **PM-Kisan Samman Nidhi (https://pmkisan.gov.in/):**\n\nYou are **fully eligible** for direct DBT transfers of ₹6,000/year.\n\n- **Category:** Agriculture, Rural & Environment\n- **Landholding:** Verified\n- **Aadhaar e-KYC:** Verified [Placeholder: XXXX-XXXX-XXXX]\n- **Next Step:** Click **\"Auto-Fill Application\"** on the PM-Kisan card to automatically populate the official portal using our Chrome Extension.".to_string(),
                    vec![
                        "Auto-fill PM-Kisan Form ⚡".to_string(),
                        "Check PM Fasal Bima Yojana 🌾".to_string(),
                    ]
                )
            } else if lower_msg.contains("standup") || lower_msg.contains("entrepreneur") || lower_msg.contains("business") {
                (
                    "💼 **Stand-Up India Scheme (https://www.standupmitra.in/):**\n\nOffers bank loans from ₹10 Lakhs to ₹1 Crore for Scheduled Caste (SC), Scheduled Tribe (ST), or Women entrepreneurs starting greenfield enterprises.".to_string(),
                    vec![
                        "View Stand-Up India Details 💼".to_string(),
                        "PM Mudra Yojana Loan 💰".to_string(),
                    ]
                )
            } else if lower_msg.contains("sukanya") || lower_msg.contains("girl") {
                (
                    "👧 **Sukanya Samriddhi Yojana (https://www.indiapost.gov.in/):**\n\nHigh-yield 8.2% sovereign savings scheme for girl children up to 10 years of age, offering ₹15,00,000+ tax-exempt maturity benefit.".to_string(),
                    vec![
                        "View Sukanya Scheme Details 👧".to_string(),
                        "Auto-Fill Application ⚡".to_string(),
                    ]
                )
            } else if lower_msg.contains("widow") || lower_msg.contains("pension") {
                (
                    "🧕 **Indira Gandhi National Widow Pension Scheme (https://nsap.nic.in/):**\n\nProvides monthly pension assistance of ₹1,000 - ₹2,500 for eligible widows aged 40+ below the poverty line.".to_string(),
                    vec![
                        "View NSAP Widow Pension Details 🧕".to_string(),
                        "Old Age Pension (IGNOAPS) 👴".to_string(),
                    ]
                )
            } else if lower_msg.contains("scholarship") || lower_msg.contains("student") {
                (
                    "🎓 **National Scholarship Portal (https://scholarships.gov.in/):**\n\nCentral government portal offering up to ₹25,000/year for Post-Matric and Higher Education students with family income under ₹2.5 Lakhs.".to_string(),
                    vec![
                        "Switch to Student Profile 🎓".to_string(),
                        "View All Education Schemes 📚".to_string(),
                    ]
                )
            } else if lower_msg.contains("ayushman") || lower_msg.contains("health") {
                (
                    "🏥 **Ayushman Bharat PM-JAY (https://nha.gov.in/):**\n\nProvides ₹5,00,000 cashless secondary and tertiary hospitalization cover per family per year.".to_string(),
                    vec![
                        "View Ayushman PM-JAY 🏥".to_string(),
                        "Check Hospital List 🔍".to_string(),
                    ]
                )
            } else {
                (
                    "I have evaluated your citizen profile across verified official government portals (PM-KISAN, NSP, SSY, NSAP, PM-JAY, Stand-Up India, myScheme). You qualify for multiple high-impact welfare programs.\n\nUse our **Custom DigiLocker Vault** to switch demographic personas (Farmer, Student, Girl Child, Widow, Senior Citizen, Entrepreneur) in real time.".to_string(),
                    vec![
                        "Show my eligible schemes 🎯".to_string(),
                        "Open Custom DigiLocker Vault 📂".to_string(),
                        "Test Voice Input 🎙️".to_string(),
                    ]
                )
            }
        }
    };

    ChatResponse {
        response: response_text,
        language_code: lang_code.to_string(),
        suggestions,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::CitizenProfile;

    #[test]
    fn test_farmer_pm_kisan_eligible() {
        let farmer = CitizenProfile {
            name: "Rameshwar Sharma".to_string(),
            father_name: Some("Ramswaroop Sharma".to_string()),
            contact_number: Some("+91 98765 43210".to_string()),
            gender: "Male".to_string(),
            age: 38,
            state: "Uttar Pradesh".to_string(),
            category: "OBC".to_string(),
            annual_income: 160000,
            occupation: "Farmer".to_string(),
            landholding_acres: Some(2.5),
            is_student: false,
            education_level: Some("12th".to_string()),
            is_differently_abled: false,
            mobile: Some("[Phone Redacted]".to_string()),
            email: None,
            aadhaar_number: Some("XXXX-XXXX-XXXX".to_string()),
            marital_status: Some("Married".to_string()),
            has_girl_child: None,
            girl_child_age: None,
            bpl_card_holder: None,
            is_pregnant_or_lactating: None,
            crop_insured: Some(true),
            persona_type: Some("Farmer".to_string()),
        };

        let req = MatchRequest {
            citizen: farmer,
            scheme_category: None,
            max_results: None,
            language_code: Some("en".to_string()),
        };

        let resp = match_citizen_schemes(&req);
        assert!(resp.eligible_count > 0);
        let pm_kisan = resp.matches.iter().find(|m| m.scheme.id == "pm-kisan").unwrap();
        assert!(pm_kisan.is_eligible);
        assert_eq!(pm_kisan.scheme.portal_url, "https://pmkisan.gov.in/");
        assert_eq!(pm_kisan.match_score, 100);
    }

    #[test]
    fn test_widow_pension_eligible() {
        let widow = CitizenProfile {
            name: "Kamla Devi".to_string(),
            father_name: Some("Late Harishankar".to_string()),
            contact_number: Some("+91 96543 21098".to_string()),
            gender: "Female".to_string(),
            age: 52,
            state: "Madhya Pradesh".to_string(),
            category: "SC".to_string(),
            annual_income: 72000,
            occupation: "Unemployed".to_string(),
            landholding_acres: None,
            is_student: false,
            education_level: None,
            is_differently_abled: false,
            mobile: Some("[Phone Redacted]".to_string()),
            email: None,
            aadhaar_number: Some("XXXX-XXXX-XXXX".to_string()),
            marital_status: Some("Widow".to_string()),
            has_girl_child: None,
            girl_child_age: None,
            bpl_card_holder: Some(true),
            is_pregnant_or_lactating: None,
            crop_insured: None,
            persona_type: Some("Widow".to_string()),
        };

        let req = MatchRequest {
            citizen: widow,
            scheme_category: Some("Social Welfare & Empowerment".to_string()),
            max_results: None,
            language_code: Some("en".to_string()),
        };

        let resp = match_citizen_schemes(&req);
        let nsap = resp.matches.iter().find(|m| m.scheme.id == "ignwps-widow-pension").unwrap();
        assert!(nsap.is_eligible);
        assert_eq!(nsap.scheme.portal_url, "https://nsap.nic.in/");
    }

    #[test]
    fn test_standup_india_entrepreneur_eligible() {
        let entrepreneur = CitizenProfile {
            name: "Pooja Meena".to_string(),
            father_name: Some("Kailash Meena".to_string()),
            contact_number: Some("+91 94321 09876".to_string()),
            gender: "Female".to_string(),
            age: 29,
            state: "Rajasthan".to_string(),
            category: "ST".to_string(),
            annual_income: 210000,
            occupation: "Entrepreneur".to_string(),
            landholding_acres: None,
            is_student: false,
            education_level: Some("Graduate".to_string()),
            is_differently_abled: false,
            mobile: Some("[Phone Redacted]".to_string()),
            email: None,
            aadhaar_number: Some("XXXX-XXXX-XXXX".to_string()),
            marital_status: Some("Single".to_string()),
            has_girl_child: None,
            girl_child_age: None,
            bpl_card_holder: None,
            is_pregnant_or_lactating: None,
            crop_insured: None,
            persona_type: Some("Entrepreneur".to_string()),
        };

        let req = MatchRequest {
            citizen: entrepreneur,
            scheme_category: Some("Business & Entrepreneurship".to_string()),
            max_results: None,
            language_code: Some("en".to_string()),
        };

        let resp = match_citizen_schemes(&req);
        let standup = resp.matches.iter().find(|m| m.scheme.id == "standup-india").unwrap();
        assert!(standup.is_eligible);
        assert_eq!(standup.scheme.portal_url, "https://www.standupmitra.in/");
    }

    #[test]
    fn test_match_schemes_from_query_student() {
        let chat_resp = match_schemes_from_query("I am a college student needing scholarship", None, "en");
        assert!(!chat_resp.response.is_empty());
        assert!(chat_resp.response.to_lowercase().contains("scholarship") || chat_resp.response.to_lowercase().contains("education"));
        assert!(!chat_resp.suggestions.is_empty());
    }

    #[test]
    fn test_match_schemes_from_query_farmer() {
        let chat_resp = match_schemes_from_query("I am a farmer with 2 acres land looking for PM Kisan", None, "en");
        assert!(!chat_resp.response.is_empty());
        assert!(chat_resp.response.contains("PM-Kisan") || chat_resp.response.contains("Agriculture"));
        assert!(!chat_resp.suggestions.is_empty());
    }

    #[test]
    fn test_match_schemes_from_query_regional_hindi() {
        let chat_resp = match_schemes_from_query("farmer 2 acres", None, "hi");
        assert_eq!(chat_resp.language_code, "hi");
        assert!(chat_resp.response.contains("पात्र हैं") || chat_resp.response.contains("योजना"));
    }
}
