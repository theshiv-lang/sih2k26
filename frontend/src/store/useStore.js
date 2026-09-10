import { create } from 'zustand';
import { matchCitizenSchemes } from '../services/api';
import { sendAutoFillPayload } from '../utils/extensionBridge';

// Strictly sanitized mock personas with ZERO realistic digits in identifiers
export const PREBUILT_PERSONAS = {
  Farmer: {
    key: "Farmer",
    label: "🌾 Small Farmer (Rameshwar Sharma)",
    tag: "Agriculture, Rural & Environment (PM-KISAN / PMFBY)",
    profile: {
      name: "Rameshwar Kumar Sharma",
      father_name: "Ramswaroop Sharma",
      contact_number: "+91 98765 43210",
      gender: "Male",
      age: 38,
      state: "Uttar Pradesh",
      category: "OBC",
      annual_income: 160000,
      occupation: "Farmer",
      landholding_acres: 2.5,
      is_student: false,
      education_level: "12th",
      is_differently_abled: false,
      mobile: "[Phone Redacted]",
      email: "citizen.placeholder@example.gov.in",
      aadhaar_number: "XXXX-XXXX-XXXX", // Strict placeholder restraint
      marital_status: "Married",
      has_girl_child: false,
      girl_child_age: 0,
      bpl_card_holder: false,
      is_pregnant_or_lactating: false,
      crop_insured: true,
      persona_type: "Farmer",
    },
    documents: [
      {
        id: "doc-aadhaar-farmer",
        type: "Aadhaar e-KYC Card",
        authority: "Unique Identification Authority of India (UIDAI)",
        identifier: "XXXX-XXXX-XXXX",
        issueDate: "Verified • UIDAI Digital e-Sign",
        validity: "Permanent Sovereign Identity",
        category: "Identity Proof",
        fields: {
          "Full Name": "Rameshwar Kumar Sharma",
          "Date of Birth": "1988-XX-XX",
          "Gender": "Male",
          "Address": "Village Rampur, Bilaspur, Varanasi, Uttar Pradesh",
        }
      },
      {
        id: "doc-income-farmer",
        type: "Tehsildar Revenue Income Certificate",
        authority: "Department of Revenue, Govt. of Uttar Pradesh",
        identifier: "UP/REV/INC/XXXX/XXXXXX",
        issueDate: "10-May-2024",
        validity: "Valid for 3 Years (2024-2027)",
        category: "Income Verification",
        fields: {
          "Certified Income": "₹1,60,000 / Year",
          "Issuing Officer": "Tehsildar Sadar, Varanasi",
          "Purpose": "Govt Welfare & Subsidy Benefit",
        }
      },
      {
        id: "doc-land-farmer",
        type: "Agricultural Land Record (RoR / Khasra-Khatauni)",
        authority: "Revenue Board & Land Records Authority",
        identifier: "UP/LAND/ROR/XXXX/XXXXXX",
        issueDate: "15-Jan-2024",
        validity: "Active Agricultural Parcel",
        category: "Landholding Proof",
        fields: {
          "Area": "2.5 Acres (Agricultural)",
          "Ownership": "Direct Single Titleholder",
          "Survey No": "Khasra No. [Redacted-Parcel]",
        }
      },
      {
        id: "doc-caste-farmer",
        type: "OBC Category Certificate",
        authority: "Sub-Divisional Magistrate, Varanasi",
        identifier: "UP/REV/CST/XXXX/XXXXXX",
        issueDate: "12-Apr-2023",
        validity: "Valid (Non-Creamy Layer)",
        category: "Social Category",
        fields: {
          "Category": "OBC (Other Backward Class)",
          "Sub-Caste": "Kushwaha / Maurya",
          "Verification": "Barcoded Digital Authenticity",
        }
      }
    ]
  },

  Student: {
    key: "Student",
    label: "🎓 College Student (Anjali Gupta)",
    tag: "Education & Learning (National Scholarship Portal)",
    profile: {
      name: "Anjali Gupta",
      father_name: "Rajesh Gupta",
      contact_number: "+91 98123 45678",
      gender: "Female",
      age: 19,
      state: "Bihar",
      category: "OBC",
      annual_income: 120000,
      occupation: "Student",
      landholding_acres: 0.0,
      is_student: true,
      education_level: "Undergraduate",
      is_differently_abled: false,
      mobile: "[Phone Redacted]",
      email: "student.anjali@example.gov.in",
      aadhaar_number: "XXXX-XXXX-XXXX",
      marital_status: "Single",
      has_girl_child: false,
      girl_child_age: 0,
      bpl_card_holder: false,
      is_pregnant_or_lactating: false,
      crop_insured: false,
      persona_type: "Student",
    },
    documents: [
      {
        id: "doc-aadhaar-student",
        type: "Aadhaar e-KYC Card",
        authority: "UIDAI, Government of India",
        identifier: "XXXX-XXXX-XXXX",
        issueDate: "Verified • UIDAI e-KYC",
        validity: "Permanent Identity",
        category: "Identity Proof",
        fields: {
          "Full Name": "Anjali Gupta",
          "Date of Birth": "2005-XX-XX",
          "Gender": "Female",
          "State": "Bihar",
        }
      },
      {
        id: "doc-income-student",
        type: "Annual Family Income Certificate",
        authority: "Circle Officer, Revenue Dept, Bihar",
        identifier: "BR/REV/INC/XXXX/XXXXXX",
        issueDate: "04-July-2024",
        validity: "Valid for Academic Year 2024-25",
        category: "Income Verification",
        fields: {
          "Annual Family Income": "₹1,20,000 / Year (Eligible < ₹2.5 Lakhs)",
          "Verification": "Official Circle Officer Seal",
        }
      },
      {
        id: "doc-bonafide-student",
        type: "Institution Bonafide & Enrollment Certificate",
        authority: "University Affiliated Degree College, Patna",
        identifier: "COLLEGE/BONAFIDE/XXXX/XXXXXX",
        issueDate: "10-Aug-2024",
        validity: "Current Academic Session",
        category: "Education Proof",
        fields: {
          "Course": "B.Sc (Computer Science) - 2nd Year",
          "Enrollment Status": "Full-Time Active Student",
        }
      },
      {
        id: "doc-caste-student",
        type: "OBC Non-Creamy Layer Certificate",
        authority: "Sub-Divisional Officer, Govt. of Bihar",
        identifier: "BR/REV/CST/XXXX/XXXXXX",
        issueDate: "20-Mar-2024",
        validity: "Valid for Central Scholarships",
        category: "Social Category",
        fields: {
          "Category": "OBC (Non-Creamy Layer)",
          "Eligibility": "Central NSP Post-Matric Valid",
        }
      }
    ]
  },

  GirlChild: {
    key: "GirlChild",
    label: "👧 Girl Child / Guardian (Sunita & Priya)",
    tag: "Women and Child (Sukanya Samriddhi Yojana)",
    profile: {
      name: "Sunita Devi (Mother) & Priya Sharma (Child)",
      father_name: "Vikram Sharma",
      contact_number: "+91 97654 32109",
      gender: "Female",
      age: 34,
      state: "Rajasthan",
      category: "General",
      annual_income: 140000,
      occupation: "Housewife",
      landholding_acres: 0.0,
      is_student: false,
      education_level: "Graduate",
      is_differently_abled: false,
      mobile: "[Phone Redacted]",
      email: "guardian.sunita@example.gov.in",
      aadhaar_number: "XXXX-XXXX-XXXX",
      marital_status: "Married",
      has_girl_child: true,
      girl_child_age: 8,
      bpl_card_holder: false,
      is_pregnant_or_lactating: false,
      crop_insured: false,
      persona_type: "Girl Child",
    },
    documents: [
      {
        id: "doc-birth-girl",
        type: "Official Birth Certificate (Girl Child)",
        authority: "Municipal Corporation / Registrar of Births & Deaths",
        identifier: "MCD/BIRTH/XXXX/XXXXXX",
        issueDate: "Verified • Civil Registration",
        validity: "Permanent Sovereign Record",
        category: "Age & Relationship Proof",
        fields: {
          "Child Name": "Priya Sharma",
          "Age": "8 Years (Eligible ≤ 10 Years)",
          "Mother Name": "Sunita Devi",
        }
      },
      {
        id: "doc-aadhaar-guardian",
        type: "Guardian Aadhaar e-KYC",
        authority: "UIDAI, Government of India",
        identifier: "XXXX-XXXX-XXXX",
        issueDate: "Verified • UIDAI",
        validity: "Permanent Identity",
        category: "Identity Proof",
        fields: {
          "Guardian Name": "Sunita Devi",
          "Relationship": "Mother / Natural Guardian",
          "State": "Rajasthan",
        }
      },
      {
        id: "doc-postoffice-girl",
        type: "India Post Small Savings Account Authorization",
        authority: "Department of Posts, Ministry of Communications",
        identifier: "POST/SSY/AUTH/XXXX/XXXXXX",
        issueDate: "05-Jan-2024",
        validity: "Eligible for 8.2% Sovereign Account",
        category: "Savings Account",
        fields: {
          "Target Scheme": "Sukanya Samriddhi Yojana",
          "Interest Rate": "8.2% Tax-Free Sovereign Return",
        }
      }
    ]
  },

  Widow: {
    key: "Widow",
    label: "🧕 Widow Destitute (Kamla Devi)",
    tag: "Social Welfare & Empowerment (NSAP IGNWPS)",
    profile: {
      name: "Kamla Devi",
      father_name: "Late Harishankar",
      contact_number: "+91 96543 21098",
      gender: "Female",
      age: 52,
      state: "Madhya Pradesh",
      category: "SC",
      annual_income: 72000,
      occupation: "Unemployed",
      landholding_acres: 0.0,
      is_student: false,
      education_level: "Primary",
      is_differently_abled: false,
      mobile: "[Phone Redacted]",
      email: "kamla.devi@example.gov.in",
      aadhaar_number: "XXXX-XXXX-XXXX",
      marital_status: "Widow",
      has_girl_child: false,
      girl_child_age: 0,
      bpl_card_holder: true,
      is_pregnant_or_lactating: false,
      crop_insured: false,
      persona_type: "Widow",
    },
    documents: [
      {
        id: "doc-aadhaar-widow",
        type: "Aadhaar e-KYC Card",
        authority: "UIDAI, Government of India",
        identifier: "XXXX-XXXX-XXXX",
        issueDate: "Verified • UIDAI e-KYC",
        validity: "Permanent Identity",
        category: "Identity Proof",
        fields: {
          "Full Name": "Kamla Devi",
          "Age": "52 Years (Eligible ≥ 40 Years)",
          "Gender": "Female",
          "Marital Status": "Widow",
        }
      },
      {
        id: "doc-death-widow",
        type: "Spouse Death Certificate",
        authority: "Registrar of Births & Deaths, Govt. of Madhya Pradesh",
        identifier: "MP/HEALTH/DTH/XXXX/XXXXXX",
        issueDate: "Verified • Vital Statistics",
        validity: "Permanent Civil Record",
        category: "Marital Verification",
        fields: {
          "Spouse Name": "Late Ramcharan",
          "Civil Status": "Widow Documented",
        }
      },
      {
        id: "doc-bpl-widow",
        type: "Antyodaya Anna Yojana (AAY) BPL Card",
        authority: "Directorate of Food & Civil Supplies",
        identifier: "NFSA/AAY/BPL/XXXX/XXXXXX",
        issueDate: "15-Feb-2023",
        validity: "Below Poverty Line Verified",
        category: "Socioeconomic Proof",
        fields: {
          "Income Category": "Below Poverty Line (BPL)",
          "Annual Income": "₹72,000 / Year",
          "NSAP Pension Status": "Eligible for IGNWPS Direct DBT",
        }
      }
    ]
  },

  SeniorCitizen: {
    key: "SeniorCitizen",
    label: "👴 Senior Citizen (Ramprasad Verma)",
    tag: "Social Welfare & Empowerment (IGNOAPS Old Age Pension)",
    profile: {
      name: "Ramprasad Verma",
      father_name: "Late Bhagwandas Verma",
      contact_number: "+91 95432 10987",
      gender: "Male",
      age: 67,
      state: "Uttar Pradesh",
      category: "OBC",
      annual_income: 84000,
      occupation: "Unemployed",
      landholding_acres: 0.0,
      is_student: false,
      education_level: "10th",
      is_differently_abled: false,
      mobile: "[Phone Redacted]",
      email: "ramprasad.v@example.gov.in",
      aadhaar_number: "XXXX-XXXX-XXXX",
      marital_status: "Married",
      has_girl_child: false,
      girl_child_age: 0,
      bpl_card_holder: true,
      is_pregnant_or_lactating: false,
      crop_insured: false,
      persona_type: "Senior Citizen",
    },
    documents: [
      {
        id: "doc-aadhaar-senior",
        type: "Aadhaar e-KYC (Senior Citizen)",
        authority: "UIDAI, Government of India",
        identifier: "XXXX-XXXX-XXXX",
        issueDate: "Verified • UIDAI",
        validity: "Permanent Identity",
        category: "Age Proof",
        fields: {
          "Full Name": "Ramprasad Verma",
          "Age": "67 Years (Eligible ≥ 60 Years)",
          "Status": "Senior Citizen Verified",
        }
      },
      {
        id: "doc-bpl-senior",
        type: "BPL Ration Card & Living Certificate",
        authority: "Department of Food & Social Welfare, UP",
        identifier: "UP/BPL/SENIOR/XXXX/XXXXXX",
        issueDate: "12-Nov-2023",
        validity: "BPL Verified",
        category: "Socioeconomic Proof",
        fields: {
          "Annual Income": "₹84,000 / Year",
          "NSAP Benefit": "Eligible for IGNOAPS Monthly Pension",
        }
      }
    ]
  },

  Entrepreneur: {
    key: "Entrepreneur",
    label: "💼 Woman Entrepreneur (Pooja Meena)",
    tag: "Business & Entrepreneurship (Stand-Up India)",
    profile: {
      name: "Pooja Meena",
      father_name: "Kailash Meena",
      contact_number: "+91 94321 09876",
      gender: "Female",
      age: 29,
      state: "Rajasthan",
      category: "ST",
      annual_income: 210000,
      occupation: "Entrepreneur",
      landholding_acres: 0.0,
      is_student: false,
      education_level: "Graduate",
      is_differently_abled: false,
      mobile: "[Phone Redacted]",
      email: "pooja.meena@enterprise.gov.in",
      aadhaar_number: "XXXX-XXXX-XXXX",
      marital_status: "Single",
      has_girl_child: false,
      girl_child_age: 0,
      bpl_card_holder: false,
      is_pregnant_or_lactating: false,
      crop_insured: false,
      persona_type: "Entrepreneur",
    },
    documents: [
      {
        id: "doc-aadhaar-entrepreneur",
        type: "Aadhaar & PAN Identity Document",
        authority: "UIDAI & Income Tax Department",
        identifier: "XXXX-XXXX-XXXX",
        issueDate: "Verified • Digital India",
        validity: "Permanent Identity",
        category: "Identity Proof",
        fields: {
          "Name": "Pooja Meena",
          "Category": "ST (Scheduled Tribe)",
          "Gender": "Female Entrepreneur",
        }
      },
      {
        id: "doc-caste-entrepreneur",
        type: "ST Category Certificate",
        authority: "Tehsildar / District Magistrate, Rajasthan",
        identifier: "RJ/REV/ST/XXXX/XXXXXX",
        issueDate: "18-Oct-2022",
        validity: "Permanent Sovereign Caste Record",
        category: "Social Category",
        fields: {
          "Category": "ST (Scheduled Tribe)",
          "Eligibility": "Stand-Up India Priority Category",
        }
      },
      {
        id: "doc-msme-entrepreneur",
        type: "Udyam MSME Registration Certificate",
        authority: "Ministry of Micro, Small and Medium Enterprises",
        identifier: "UDYAM-RJ-XX-XXXXXXX",
        issueDate: "05-Apr-2024",
        validity: "Active Enterprise",
        category: "Business Registration",
        fields: {
          "Enterprise Type": "Micro Manufacturing Greenfield",
          "Credit Scheme": "Eligible for Stand-Up India Bank Loan",
        }
      }
    ]
  }
};

// Helper: Generates realistic 2D sovereign mock documents for any custom or edited citizen
export const generateDocumentsForProfile = (profile) => {
  const docs = [
    {
      id: `doc-aadhaar-${profile.id || 'citizen'}`,
      type: "Aadhaar e-KYC Card",
      authority: "Unique Identification Authority of India (UIDAI)",
      identifier: profile.aadhaar_number || "XXXX-XXXX-XXXX",
      issueDate: "Verified • UIDAI Digital e-Sign",
      validity: "Permanent Sovereign Identity",
      category: "Identity Proof",
      fields: {
        "Full Name": profile.name || "Citizen",
        "Father's Name": profile.father_name || "Parent",
        "Gender": profile.gender || "Male",
        "Age": `${profile.age || 30} Years`,
        "Address": `${profile.state || 'India'}`,
      }
    },
    {
      id: `doc-income-${profile.id || 'citizen'}`,
      type: "Tehsildar Revenue Income Certificate",
      authority: `Department of Revenue, Govt. of ${profile.state || 'India'}`,
      identifier: `${(profile.state || 'IN').substring(0, 2).toUpperCase()}/REV/INC/XXXX/XXXXXX`,
      issueDate: "Verified • E-District Portal",
      validity: "Valid for 3 Years",
      category: "Income Verification",
      fields: {
        "Certified Income": `₹${(profile.annual_income || 0).toLocaleString('en-IN')} / Year`,
        "Applicant Name": profile.name || "Citizen",
        "BPL Status": profile.bpl_card_holder ? "Yes (BPL Card Holder)" : "Non-BPL",
      }
    },
    {
      id: `doc-caste-${profile.id || 'citizen'}`,
      type: `${profile.category || 'General'} Category Certificate`,
      authority: `Sub-Divisional Magistrate, ${profile.state || 'India'}`,
      identifier: `${(profile.state || 'IN').substring(0, 2).toUpperCase()}/REV/CST/XXXX/XXXXXX`,
      issueDate: "Verified • Digital Civil Registry",
      validity: "Permanent Sovereign Record",
      category: "Social Category",
      fields: {
        "Category": profile.category || "General",
        "Candidate Name": profile.name || "Citizen",
      }
    }
  ];

  if ((profile.landholding_acres || 0) > 0) {
    docs.push({
      id: `doc-land-${profile.id || 'citizen'}`,
      type: "Agricultural Land Record (RoR / Khasra-Khatauni)",
      authority: "Revenue Board & Land Records Authority",
      identifier: `${(profile.state || 'IN').substring(0, 2).toUpperCase()}/LAND/ROR/XXXX/XXXXXX`,
      issueDate: "Verified • Digital Land Registry",
      validity: "Active Agricultural Parcel",
      category: "Landholding Proof",
      fields: {
        "Area": `${profile.landholding_acres} Acres (Agricultural)`,
        "Titleholder": profile.name || "Citizen",
        "Father's Name": profile.father_name || "Parent",
      }
    });
  }

  if (profile.bpl_card_holder) {
    docs.push({
      id: `doc-bpl-${profile.id || 'citizen'}`,
      type: "Antyodaya Anna Yojana (AAY) BPL Ration Card",
      authority: "Directorate of Food & Civil Supplies",
      identifier: `NFSA/BPL/XXXX/XXXXXX`,
      issueDate: "Active • NFSA Sovereign Record",
      validity: "Eligible for Central Welfare DBT",
      category: "Socioeconomic Proof",
      fields: {
        "Head of Family": profile.name || "Citizen",
        "Category": "Below Poverty Line (BPL)",
        "Certified Income": `₹${(profile.annual_income || 0).toLocaleString('en-IN')} / Year`,
      }
    });
  }

  return docs;
};

export const useStore = create((set, get) => ({
  // Active persona key
  activePersonaKey: "Farmer",
  
  // Citizen profile synchronized with backend
  citizen: { ...PREBUILT_PERSONAS.Farmer.profile, documents: PREBUILT_PERSONAS.Farmer.documents },
  activeProfile: { ...PREBUILT_PERSONAS.Farmer.profile, documents: PREBUILT_PERSONAS.Farmer.documents },

  // Stored user-created custom profiles
  customProfiles: [],
  
  // 2D Mock Certificates
  documents: PREBUILT_PERSONAS.Farmer.documents,
  
  // Status flags
  isDigiLockerConnected: true,
  isMatchingLoading: false,
  schemes: [],
  eligibleCount: 0,
  selectedCategory: "All",
  currentLanguage: "en",
  isVaultModalOpen: false,

  // Modal controller for manual creation & editing
  isProfileModalOpen: false,
  profileModalMode: 'create', // 'create' | 'edit'
  openCreateProfileModal: () => set({ isProfileModalOpen: true, profileModalMode: 'create' }),
  openEditProfileModal: () => set({ isProfileModalOpen: true, profileModalMode: 'edit' }),
  closeProfileModal: () => set({ isProfileModalOpen: false }),

  // Open / Close 2D Vault Modal
  setIsVaultModalOpen: (open) => set({ isVaultModalOpen: open }),

  // Set Language
  setCurrentLanguage: (lang) => set({ currentLanguage: lang }),

  // Set Persona (Prebuilt or Custom)
  setPersona: async (personaKey) => {
    let profile = null;
    let documents = null;

    const prebuilt = PREBUILT_PERSONAS[personaKey];
    if (prebuilt) {
      profile = { ...prebuilt.profile };
      documents = [...prebuilt.documents];
    } else {
      const custom = get().customProfiles.find(p => p.id === personaKey);
      if (custom) {
        profile = { ...custom };
        documents = generateDocumentsForProfile(custom);
      }
    }

    if (profile) {
      const activeWithDocs = { ...profile, documents: documents || [] };
      set({
        activePersonaKey: personaKey,
        citizen: activeWithDocs,
        activeProfile: activeWithDocs,
        documents: documents || [],
        isDigiLockerConnected: true,
      });

      // Synchronize with Chrome extension & localStorage
      try {
        sendAutoFillPayload(
          { title: `${profile.name} Welfare Enrollment` },
          profile,
          { citizen_id: "DL-IND-XXXX-XXXXXX", aadhaar: { uid_masked: profile.aadhaar_number || "XXXX-XXXX-XXXX", full_name: profile.name } }
        );
      } catch (e) {
        console.warn('[Zustand Store] Auto-fill sync notice:', e);
      }

      // Automatically re-evaluate matching schemes
      await get().evaluateSchemes(activeWithDocs);
    }
  },

  // Add a brand-new custom citizen profile
  addCustomProfile: async (profileData) => {
    const profileId = profileData.id || `custom-${Date.now()}`;
    const newProfile = {
      id: profileId,
      name: profileData.name?.trim() || "Custom Citizen",
      father_name: profileData.father_name?.trim() || "Parent Name",
      contact_number: profileData.contact_number?.trim() || "+91 98765 43210",
      gender: profileData.gender || "Male",
      age: Number(profileData.age) || 30,
      state: profileData.state || "Uttar Pradesh",
      category: profileData.category || "General",
      annual_income: Number(profileData.annual_income) || 120000,
      occupation: profileData.occupation || "Self-Employed",
      landholding_acres: Number(profileData.landholding_acres) || 0.0,
      is_student: profileData.occupation === "Student" || !!profileData.is_student,
      education_level: profileData.education_level || "12th",
      is_differently_abled: !!profileData.is_differently_abled,
      mobile: "[Phone Redacted]",
      email: profileData.email || "citizen.placeholder@example.gov.in",
      aadhaar_number: "XXXX-XXXX-XXXX", // Strict zero-PII compliance
      marital_status: profileData.marital_status || "Single",
      has_girl_child: !!profileData.has_girl_child,
      girl_child_age: Number(profileData.girl_child_age) || 0,
      bpl_card_holder: !!profileData.bpl_card_holder,
      is_pregnant_or_lactating: !!profileData.is_pregnant_or_lactating,
      crop_insured: !!profileData.crop_insured,
      persona_type: "Custom",
      is_custom: true,
      documents: profileData.documents || [],
    };

    const newDocs = generateDocumentsForProfile(newProfile);
    newProfile.documents = newDocs || [];

    set((state) => ({
      customProfiles: [...state.customProfiles, newProfile],
      activePersonaKey: profileId,
      citizen: newProfile,
      activeProfile: newProfile,
      documents: newDocs || [],
      isDigiLockerConnected: true,
      isProfileModalOpen: false,
    }));

    try {
      sendAutoFillPayload(
        { title: `${newProfile.name} Custom Profile` },
        newProfile,
        { citizen_id: "DL-IND-XXXX-XXXXXX", aadhaar: { uid_masked: "XXXX-XXXX-XXXX", full_name: newProfile.name } }
      );
    } catch (e) {
      console.warn('[Zustand Store] Auto-fill sync notice:', e);
    }

    await get().evaluateSchemes(newProfile);
    return newProfile;
  },

  // Update fields on the active profile in real time
  updateActiveProfile: async (updatedFields) => {
    const currentCitizen = get().citizen || {};
    const newCitizen = {
      ...currentCitizen,
      ...updatedFields,
      age: updatedFields.age !== undefined ? Number(updatedFields.age) : currentCitizen.age,
      annual_income: updatedFields.annual_income !== undefined ? Number(updatedFields.annual_income) : currentCitizen.annual_income,
      landholding_acres: updatedFields.landholding_acres !== undefined ? Number(updatedFields.landholding_acres) : currentCitizen.landholding_acres,
      bpl_card_holder: updatedFields.bpl_card_holder !== undefined ? !!updatedFields.bpl_card_holder : currentCitizen.bpl_card_holder,
      is_student: updatedFields.occupation === "Student" || (updatedFields.is_student !== undefined ? !!updatedFields.is_student : currentCitizen.is_student),
      persona_type: currentCitizen.is_custom ? "Custom" : (currentCitizen.persona_type || "Custom"),
      documents: currentCitizen.documents || [],
    };

    const newDocs = generateDocumentsForProfile(newCitizen);
    newCitizen.documents = newDocs || [];

    const updatedCustomProfiles = get().customProfiles.map(p => 
      (p.id === newCitizen.id) ? { ...newCitizen } : p
    );

    set({
      citizen: newCitizen,
      activeProfile: newCitizen,
      documents: newDocs || [],
      customProfiles: updatedCustomProfiles,
      isProfileModalOpen: false,
    });

    try {
      sendAutoFillPayload(
        { title: `${newCitizen.name} Profile Update` },
        newCitizen,
        { citizen_id: "DL-IND-XXXX-XXXXXX", aadhaar: { uid_masked: newCitizen.aadhaar_number || "XXXX-XXXX-XXXX", full_name: newCitizen.name } }
      );
    } catch (e) {}

    await get().evaluateSchemes(newCitizen);
    return newCitizen;
  },

  // Backward-compatibility alias for AttributeEditor
  updateCitizenAttributes: async (updatedAttributes) => {
    return get().updateActiveProfile(updatedAttributes);
  },

  // Scheme Matching evaluation
  evaluateSchemes: async (profile = get().citizen, category = get().selectedCategory) => {
    set({ isMatchingLoading: true });
    try {
      const resp = await matchCitizenSchemes(
        profile,
        category === "All" ? null : category,
        get().currentLanguage
      );
      if (resp && resp.matches) {
        set({
          schemes: resp.matches,
          eligibleCount: resp.eligible_count || resp.matches.filter(m => m.is_eligible).length,
        });
      }
    } catch (err) {
      console.warn('[Zustand Store] Scheme evaluation notice:', err);
    } finally {
      set({ isMatchingLoading: false });
    }
  },
}));

if (typeof window !== 'undefined') {
  window.__SAHAYAK_STORE__ = useStore;
}

export default useStore;
