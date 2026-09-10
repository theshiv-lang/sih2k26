use serde::{Deserialize, Serialize};
use crate::models::citizen::CitizenProfile;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SchemeCriteria {
    pub min_age: Option<u32>,
    pub max_age: Option<u32>,
    pub max_income: Option<u64>,
    pub allowed_categories: Vec<String>, // ["General", "OBC", "SC", "ST", "EWS"] or empty for all
    pub allowed_occupations: Vec<String>, // ["Farmer", "Student", etc.] or empty for all
    pub target_gender: Option<String>,   // "Female", "All", etc.
    pub applicable_states: Vec<String>, // ["All India"] or specific states
    pub requires_student: Option<bool>,
    pub requires_landholding: Option<bool>,
    pub requires_differently_abled: Option<bool>,

    // Dynamic criteria for expanded government schemes
    #[serde(default)]
    pub target_marital_status: Option<String>, // e.g. "Widow"
    #[serde(default)]
    pub requires_girl_child: Option<bool>,
    #[serde(default)]
    pub max_girl_child_age: Option<u32>,
    #[serde(default)]
    pub requires_bpl: Option<bool>,
    #[serde(default)]
    pub requires_pregnant_or_lactating: Option<bool>,
    #[serde(default)]
    pub requires_crop_insurance: Option<bool>,
    #[serde(default)]
    pub requires_sc_st_or_women: Option<bool>, // for Stand-Up India
    #[serde(default)]
    pub requires_senior_citizen: Option<bool>, // for Old Age Pension
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Scheme {
    pub id: String,
    pub title: String,
    pub short_description: String,
    pub ministry: String,
    pub category: String, // Official myScheme categories: "Agriculture, Rural & Environment", "Education & Learning", "Women and Child", "Social Welfare & Empowerment", "Health & Wellness", "Business & Entrepreneurship", "Housing & Shelter"
    pub level: String,    // "Central", "State"
    pub financial_benefit: String,
    pub benefit_amount_inr: Option<u64>,
    pub portal_url: String, // Verified official .gov.in or .nic.in URL
    pub required_documents: Vec<String>,
    pub criteria: SchemeCriteria,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SchemeMatchResult {
    pub scheme: Scheme,
    pub is_eligible: bool,
    pub match_score: u32, // 0 to 100
    pub satisfied_rules: Vec<String>,
    pub unmet_rules: Vec<String>,
    pub recommendations: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MatchResponse {
    pub total_evaluated: usize,
    pub eligible_count: usize,
    pub matches: Vec<SchemeMatchResult>,
}

/// Dynamic Scheme Matching Engine Trait
pub trait SchemeMatcher {
    fn evaluate(&self, citizen: &CitizenProfile, lang: &str) -> SchemeMatchResult;
}

impl SchemeMatcher for Scheme {
    fn evaluate(&self, citizen: &CitizenProfile, lang: &str) -> SchemeMatchResult {
        let mut satisfied_rules = Vec::new();
        let mut unmet_rules = Vec::new();
        let mut score: u32 = 100;
        let is_hindi = lang.starts_with("hi");

        let c = &self.criteria;

        // 1. Age Rule
        if let Some(min_age) = c.min_age {
            if citizen.age >= min_age {
                if is_hindi {
                    satisfied_rules.push(format!("आयु ({} वर्ष) न्यूनतम आवश्यकता ({} वर्ष) को पूरा करती है", citizen.age, min_age));
                } else {
                    satisfied_rules.push(format!("Age ({} yrs) meets minimum requirement ({} yrs)", citizen.age, min_age));
                }
            } else {
                if is_hindi {
                    unmet_rules.push(format!("आयु ({} वर्ष) न्यूनतम आवश्यक आयु ({} वर्ष) से कम है", citizen.age, min_age));
                } else {
                    unmet_rules.push(format!("Age ({} yrs) is below minimum required ({} yrs)", citizen.age, min_age));
                }
                score = score.saturating_sub(35);
            }
        }

        if let Some(max_age) = c.max_age {
            if citizen.age <= max_age {
                if is_hindi {
                    satisfied_rules.push(format!("आयु ({} वर्ष) ऊपरी सीमा ({} वर्ष) के भीतर है", citizen.age, max_age));
                } else {
                    satisfied_rules.push(format!("Age ({} yrs) is within upper ceiling ({} yrs)", citizen.age, max_age));
                }
            } else {
                if is_hindi {
                    unmet_rules.push(format!("आयु ({} वर्ष) अधिकतम पात्र आयु ({} वर्ष) से अधिक है", citizen.age, max_age));
                } else {
                    unmet_rules.push(format!("Age ({} yrs) exceeds maximum eligible age ({} yrs)", citizen.age, max_age));
                }
                score = score.saturating_sub(35);
            }
        }

        // 2. Senior Citizen Rule
        if let Some(req_senior) = c.requires_senior_citizen {
            if req_senior {
                if citizen.age >= 60 {
                    if is_hindi {
                        satisfied_rules.push(format!("वरिष्ठ नागरिक पात्रता (आयु {} वर्ष ≥ 60) सत्यापित", citizen.age));
                    } else {
                        satisfied_rules.push(format!("Senior citizen criteria verified (Age {} yrs >= 60)", citizen.age));
                    }
                } else {
                    if is_hindi {
                        unmet_rules.push("वृद्धावस्था पेंशन हेतु न्यूनतम 60 वर्ष की आयु आवश्यक है".to_string());
                    } else {
                        unmet_rules.push("Requires minimum 60 years of age for Senior Citizen benefit".to_string());
                    }
                    score = score.saturating_sub(50);
                }
            }
        }

        // 3. Gender Rule
        if let Some(target_gender) = &c.target_gender {
            if target_gender != "All" && !target_gender.eq_ignore_ascii_case(&citizen.gender) {
                if is_hindi {
                    unmet_rules.push(format!("यह योजना केवल {} लाभार्थियों के लिए है", target_gender));
                } else {
                    unmet_rules.push(format!("Scheme is exclusively targeted for {} citizens", target_gender));
                }
                score = score.saturating_sub(50);
            } else {
                if is_hindi {
                    satisfied_rules.push(format!("लिंग पात्रता ({}) मान्य है", citizen.gender));
                } else {
                    satisfied_rules.push(format!("Gender eligibility ({}) verified", citizen.gender));
                }
            }
        }

        // 4. Marital Status Rule (e.g. Widow Pension)
        if let Some(target_status) = &c.target_marital_status {
            let matches_status = citizen.marital_status.as_deref().unwrap_or("Single").eq_ignore_ascii_case(target_status);
            if matches_status {
                if is_hindi {
                    satisfied_rules.push(format!("वैवाहिक स्थिति ({}) योजना मानदंड से मेल खाती है", target_status));
                } else {
                    satisfied_rules.push(format!("Marital status ({}) matches scheme criteria", target_status));
                }
            } else {
                if is_hindi {
                    unmet_rules.push(format!("यह योजना विशेष रूप से {} नागरिकों के लिए है", target_status));
                } else {
                    unmet_rules.push(format!("Scheme requires marital status: {}", target_status));
                }
                score = score.saturating_sub(60);
            }
        }

        // 5. Stand-Up India Rule (SC/ST or Women Entrepreneurs)
        if let Some(req_sc_st_women) = c.requires_sc_st_or_women {
            if req_sc_st_women {
                let is_sc_st = citizen.category.eq_ignore_ascii_case("SC") || citizen.category.eq_ignore_ascii_case("ST");
                let is_woman = citizen.gender.eq_ignore_ascii_case("Female");
                if is_sc_st || is_woman {
                    if is_hindi {
                        satisfied_rules.push("स्टैंड-अप इंडिया पात्रता (अनुसूचित जाति / जनजाति अथवा महिला उद्यमी) सत्यापित".to_string());
                    } else {
                        satisfied_rules.push("Stand-Up India beneficiary criteria (SC, ST, or Woman Entrepreneur) verified".to_string());
                    }
                } else {
                    if is_hindi {
                        unmet_rules.push("स्टैंड-अप इंडिया योजना अनुसूचित जाति, जनजाति अथवा महिला उद्यमियों के लिए है".to_string());
                    } else {
                        unmet_rules.push("Stand-Up India requires applicant to be SC, ST, or Woman Entrepreneur".to_string());
                    }
                    score = score.saturating_sub(60);
                }
            }
        }

        // 6. Girl Child Rule (e.g. Sukanya Samriddhi Yojana)
        if let Some(req_girl) = c.requires_girl_child {
            if req_girl {
                let is_girl_child_citizen = citizen.gender.eq_ignore_ascii_case("Female") && citizen.age <= c.max_girl_child_age.unwrap_or(10);
                let guardian_has_girl = citizen.has_girl_child.unwrap_or(false) && citizen.girl_child_age.unwrap_or(0) <= c.max_girl_child_age.unwrap_or(10);

                if is_girl_child_citizen || guardian_has_girl {
                    if is_hindi {
                        satisfied_rules.push("सुकन्या समृद्धि हेतु बालिका पात्रता (आयु ≤ 10 वर्ष) सत्यापित".to_string());
                    } else {
                        satisfied_rules.push("Girl child beneficiary / guardian criteria (Age <= 10 yrs) verified".to_string());
                    }
                } else {
                    if is_hindi {
                        unmet_rules.push("सुकन्या समृद्धि योजना हेतु 10 वर्ष या उससे कम आयु की बालिका आवश्यक है".to_string());
                    } else {
                        unmet_rules.push("Requires girl child under 10 years of age".to_string());
                    }
                    score = score.saturating_sub(60);
                }
            }
        }

        // 7. Maternal Health / Pregnancy Rule (e.g. PMMVY)
        if let Some(req_preg) = c.requires_pregnant_or_lactating {
            if req_preg {
                if citizen.is_pregnant_or_lactating.unwrap_or(false) {
                    if is_hindi {
                        satisfied_rules.push("गर्भवती अथवा धात्री माता श्रेणी सत्यापित".to_string());
                    } else {
                        satisfied_rules.push("Pregnant or lactating mother category verified".to_string());
                    }
                } else {
                    if is_hindi {
                        unmet_rules.push("मातृत्व वंदना योजना हेतु गर्भवती अथवा स्तनपान कराने वाली माता होना आवश्यक है".to_string());
                    } else {
                        unmet_rules.push("Requires pregnant woman or lactating mother status".to_string());
                    }
                    score = score.saturating_sub(50);
                }
            }
        }

        // 8. BPL Rule
        if let Some(req_bpl) = c.requires_bpl {
            if req_bpl {
                let is_bpl = citizen.bpl_card_holder.unwrap_or(false) || citizen.annual_income <= 100000;
                if is_bpl {
                    if is_hindi {
                        satisfied_rules.push("गरीबी रेखा से नीचे (BPL/अंत्योदय) स्थिति सत्यापित".to_string());
                    } else {
                        satisfied_rules.push("Below Poverty Line (BPL) / low-income threshold verified".to_string());
                    }
                } else {
                    if is_hindi {
                        unmet_rules.push("वैध बीपीएल अथवा अंत्योदय राशन कार्ड आवश्यक है".to_string());
                    } else {
                        unmet_rules.push("Requires Below Poverty Line (BPL) ration card status".to_string());
                    }
                    score = score.saturating_sub(45);
                }
            }
        }

        // 9. Income Rule
        if let Some(max_inc) = c.max_income {
            if citizen.annual_income <= max_inc {
                if is_hindi {
                    satisfied_rules.push(format!("वार्षिक आय (₹{}) सीमा (₹{}) के भीतर है", citizen.annual_income, max_inc));
                } else {
                    satisfied_rules.push(format!("Annual income (₹{}) is within ceiling (₹{})", citizen.annual_income, max_inc));
                }
            } else {
                if is_hindi {
                    unmet_rules.push(format!("वार्षिक आय (₹{}) योजना की सीमा (₹{}) से अधिक है", citizen.annual_income, max_inc));
                } else {
                    unmet_rules.push(format!("Annual income (₹{}) exceeds scheme limit (₹{})", citizen.annual_income, max_inc));
                }
                score = score.saturating_sub(40);
            }
        }

        // 10. Category/Caste Rule
        if !c.allowed_categories.is_empty() {
            if c.allowed_categories.iter().any(|cat| cat.eq_ignore_ascii_case(&citizen.category)) {
                if is_hindi {
                    satisfied_rules.push(format!("सामाजिक श्रेणी ({}) पात्र है", citizen.category));
                } else {
                    satisfied_rules.push(format!("Social Category ({}) is eligible", citizen.category));
                }
            } else {
                if is_hindi {
                    unmet_rules.push(format!("श्रेणी ({}) पात्र श्रेणियों ({:?}) में नहीं है", citizen.category, c.allowed_categories));
                } else {
                    unmet_rules.push(format!("Category ({}) is not among eligible categories ({:?})", citizen.category, c.allowed_categories));
                }
                score = score.saturating_sub(40);
            }
        } else {
            if is_hindi {
                satisfied_rules.push("सभी सामाजिक श्रेणियों के लिए खुला है".to_string());
            } else {
                satisfied_rules.push("Open to all social categories".to_string());
            }
        }

        // 11. Occupation Rule
        if !c.allowed_occupations.is_empty() {
            let occ_match = c.allowed_occupations.iter().any(|occ| {
                occ.eq_ignore_ascii_case(&citizen.occupation) || 
                (occ == "Farmer" && citizen.occupation.to_lowercase().contains("farm")) ||
                (occ == "Entrepreneur" && (citizen.occupation.to_lowercase().contains("employ") || citizen.occupation.to_lowercase().contains("business")))
            });
            if occ_match {
                if is_hindi {
                    satisfied_rules.push(format!("व्यवसाय ({}) लक्षित लाभार्थी मानदंड से मेल खाता है", citizen.occupation));
                } else {
                    satisfied_rules.push(format!("Occupation ({}) matches target beneficiary criteria", citizen.occupation));
                }
            } else {
                if is_hindi {
                    unmet_rules.push(format!("योजना {:?} के लिए लक्षित है, वर्तमान व्यवसाय: {}", c.allowed_occupations, citizen.occupation));
                } else {
                    unmet_rules.push(format!("Targeted for {:?}, current occupation: {}", c.allowed_occupations, citizen.occupation));
                }
                score = score.saturating_sub(30);
            }
        }

        // 12. Landholding requirement
        if let Some(req_land) = c.requires_landholding {
            if req_land {
                let has_land = citizen.landholding_acres.unwrap_or(0.0) > 0.0;
                if has_land {
                    if is_hindi {
                        satisfied_rules.push(format!("कृषि भूमि स्वामित्व सत्यापित ({} एकड़)", citizen.landholding_acres.unwrap_or(0.0)));
                    } else {
                        satisfied_rules.push(format!("Agricultural land ownership verified ({} acres)", citizen.landholding_acres.unwrap_or(0.0)));
                    }
                } else {
                    if is_hindi {
                        unmet_rules.push("आवेदक के नाम पर कृषि भूमि स्वामित्व रिकॉर्ड आवश्यक है".to_string());
                    } else {
                        unmet_rules.push("Requires agricultural landholding record in applicant's name".to_string());
                    }
                    score = score.saturating_sub(35);
                }
            }
        }

        // 13. Student status requirement
        if let Some(req_student) = c.requires_student {
            if req_student {
                if citizen.is_student || citizen.occupation.eq_ignore_ascii_case("Student") {
                    if is_hindi {
                        satisfied_rules.push("मान्यता प्राप्त संस्थान में सक्रिय छात्र के रूप में नामांकित".to_string());
                    } else {
                        satisfied_rules.push("Enrolled as active student in recognized institution".to_string());
                    }
                } else {
                    if is_hindi {
                        unmet_rules.push("सक्रिय छात्र नामांकन स्थिति आवश्यक है".to_string());
                    } else {
                        unmet_rules.push("Requires active student enrollment status".to_string());
                    }
                    score = score.saturating_sub(45);
                }
            }
        }

        // 14. Disability requirement
        if let Some(req_pwd) = c.requires_differently_abled {
            if req_pwd {
                if citizen.is_differently_abled {
                    if is_hindi {
                        satisfied_rules.push("दिव्यांगता प्रमाणपत्र सत्यापित".to_string());
                    } else {
                        satisfied_rules.push("Disability criteria verified".to_string());
                    }
                } else {
                    if is_hindi {
                        unmet_rules.push("वैध दिव्यांग / UDID प्रमाणपत्र आवश्यक है".to_string());
                    } else {
                        unmet_rules.push("Requires valid PwD / UDID disability certificate".to_string());
                    }
                    score = score.saturating_sub(50);
                }
            }
        }

        let is_eligible = unmet_rules.is_empty();
        let recommendations = if is_eligible {
            if is_hindi {
                Some(format!("आप पूरी तरह से पात्र हैं! आधिकारिक पोर्टल पर 1-क्लिक ऑटो-फिल हेतु तैयार रखें: {}", self.required_documents.join(", ")))
            } else {
                Some(format!("You are fully eligible! Prepare for 1-click auto-fill: {}", self.required_documents.join(", ")))
            }
        } else {
            if is_hindi {
                Some(format!("वर्तमान में अपात्र हैं क्योंकि: {}", unmet_rules.join("; ")))
            } else {
                Some(format!("Currently not eligible due to: {}", unmet_rules.join("; ")))
            }
        };

        SchemeMatchResult {
            scheme: self.clone(),
            is_eligible,
            match_score: score,
            satisfied_rules,
            unmet_rules,
            recommendations,
        }
    }
}
