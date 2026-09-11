use std::sync::{Arc, OnceLock, RwLock};
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use tracing::{error, info};
use uuid::Uuid;

use crate::db::AppState;
use crate::models::{
    ApplyRequest, ApplyResponse, ChatRequest, MatchRequest, Scheme,
};
use crate::services::{
    get_master_schemes, match_citizen_schemes,
};

static MEMORY_APPLICATIONS: OnceLock<Arc<RwLock<Vec<serde_json::Value>>>> = OnceLock::new();

pub fn get_memory_applications() -> &'static Arc<RwLock<Vec<serde_json::Value>>> {
    MEMORY_APPLICATIONS.get_or_init(|| Arc::new(RwLock::new(Vec::new())))
}

pub async fn list_all_schemes() -> impl IntoResponse {
    let schemes: Vec<Scheme> = get_master_schemes();
    (StatusCode::OK, Json(schemes))
}

pub async fn match_schemes(Json(req): Json<MatchRequest>) -> impl IntoResponse {
    let response = match_citizen_schemes(&req);
    (StatusCode::OK, Json(response))
}

pub async fn handle_chat(Json(req): Json<ChatRequest>) -> impl IntoResponse {
    let target_lang = req.target_language.as_deref()
        .or(req.language_code.as_deref())
        .unwrap_or("en");

    // 1. Detect source language
    let is_non_english = req.message.chars().any(|c| {
        ('\u{0900}'..='\u{097F}').contains(&c) // Devanagari (Hindi, Marathi)
            || ('\u{0B80}'..='\u{0BFF}').contains(&c) // Tamil
            || ('\u{0C00}'..='\u{0C7F}').contains(&c) // Telugu
            || ('\u{0980}'..='\u{09FF}').contains(&c) // Bengali
    });

    let source_lang = req.source_language.as_deref().unwrap_or(if is_non_english {
        if req.message.chars().any(|c| ('\u{0B80}'..='\u{0BFF}').contains(&c)) {
            "ta"
        } else if req.message.chars().any(|c| ('\u{0C00}'..='\u{0C7F}').contains(&c)) {
            "te"
        } else if req.message.chars().any(|c| ('\u{0980}'..='\u{09FF}').contains(&c)) {
            "bn"
        } else {
            "hi"
        }
    } else {
        "en"
    });

    // 2. Translate/normalize message to English for IntentParser (via live Bhashini or Mock Bhashini)
    let english_query = if let Some(translated_en) = crate::services::translate_text(&req.message, source_lang, "en").await {
        translated_en
    } else {
        req.message.clone()
    };

    println!("╔══════════════════════════════════════════════════════════╗");
    println!("║       🤖 SAHAYAK AI CHAT (INTENT & SCHEME MATCHER)      ║");
    println!("╠══════════════════════════════════════════════════════════╣");
    println!("║  User Query:        {:<37} ║", req.message);
    println!("║  Source Lang:       {:<37} ║", source_lang);
    println!("║  Target Lang:       {:<37} ║", target_lang);
    println!("║  Inference Query:   {:<37} ║", english_query);
    println!("╚══════════════════════════════════════════════════════════╝");

    // 3. Connect AI to SchemeMatcher using IntentParser
    let chat_response = crate::services::match_schemes_from_query(
        &english_query,
        req.citizen.as_ref(),
        target_lang
    );

    (StatusCode::OK, Json(chat_response))
}

pub async fn apply_scheme(
    State(state): State<AppState>,
    Json(req): Json<ApplyRequest>,
) -> impl IntoResponse {
    let c = &req.citizen;
    let submitted_at = Utc::now().to_rfc3339();

    println!(
        "[apply_scheme] Incoming application for scheme '{}' ({}) from citizen '{}'",
        req.scheme_title, req.scheme_id, c.name
    );
    info!(
        "[apply_scheme] Incoming application for scheme '{}' ({}) from citizen '{}'",
        req.scheme_title, req.scheme_id, c.name
    );

    let app_category = req.category.as_deref().unwrap_or("General Welfare");
    let masked_aadhaar = c.aadhaar_number.as_deref().unwrap_or("XXXX-XXXX-XXXX");

    // Prepare details JSONB snapshot upfront so both PostgreSQL and in-memory queue share full demographics
    let details_json = match &req.details {
        Some(d) => {
            let mut obj = d.clone();
            if let serde_json::Value::Object(ref mut map) = obj {
                if !map.contains_key("father_name") {
                    map.insert("father_name".to_string(), serde_json::json!(c.father_name.as_deref().unwrap_or("Not Specified")));
                }
                if !map.contains_key("contact_number") {
                    map.insert("contact_number".to_string(), serde_json::json!(c.contact_number.as_deref().or(c.mobile.as_deref()).unwrap_or("[Phone Redacted]")));
                }
                if !map.contains_key("aadhaar_masked") {
                    map.insert("aadhaar_masked".to_string(), serde_json::json!(masked_aadhaar));
                }
                if !map.contains_key("state") {
                    map.insert("state".to_string(), serde_json::json!(c.state));
                }
                if !map.contains_key("category") {
                    map.insert("category".to_string(), serde_json::json!(c.category));
                }
                if !map.contains_key("annual_income") {
                    map.insert("annual_income".to_string(), serde_json::json!(c.annual_income));
                }
                if !map.contains_key("occupation") {
                    map.insert("occupation".to_string(), serde_json::json!(c.occupation));
                }
                if !map.contains_key("age") {
                    map.insert("age".to_string(), serde_json::json!(c.age));
                }
            }
            obj
        },
        None => serde_json::json!({
            "category": c.category,
            "annual_income": c.annual_income,
            "landholding_acres": c.landholding_acres.unwrap_or(0.0),
            "state": c.state,
            "aadhaar_masked": masked_aadhaar,
            "occupation": c.occupation,
            "age": c.age,
            "father_name": c.father_name.as_deref().unwrap_or("Not Specified"),
            "contact_number": c.contact_number.as_deref().or(c.mobile.as_deref()).unwrap_or("[Phone Redacted]")
        }),
    };

    if let Some(pool) = &state.pool {
        // 1. Check if citizen already exists (matching name & state, or unmasked Aadhaar)
        let existing_citizen_query = sqlx::query_scalar::<_, Uuid>(
            r#"
            SELECT id FROM public.citizens
            WHERE (name = $1 AND state = $2)
               OR (aadhaar_masked != 'XXXX-XXXX-XXXX' AND aadhaar_masked = $3)
            ORDER BY updated_at DESC LIMIT 1
            "#
        )
        .bind(&c.name)
        .bind(&c.state)
        .bind(masked_aadhaar)
        .fetch_optional(pool)
        .await;

        let citizen_id: Option<Uuid> = match existing_citizen_query {
            Ok(Some(existing_id)) => {
                // Update existing citizen record with incoming custom profile fields
                let update_res = sqlx::query_scalar::<_, Uuid>(
                    r#"
                    UPDATE public.citizens SET
                        gender = $1,
                        age = $2,
                        state = $3,
                        category = $4,
                        annual_income = $5,
                        occupation = $6,
                        landholding_acres = $7,
                        is_student = $8,
                        education_level = $9,
                        is_differently_abled = $10,
                        mobile = $11,
                        email = $12,
                        aadhaar_masked = $13,
                        marital_status = $14,
                        has_girl_child = $15,
                        girl_child_age = $16,
                        bpl_card_holder = $17,
                        is_pregnant_or_lactating = $18,
                        crop_insured = $19,
                        persona_type = $20,
                        father_name = $21,
                        contact_number = $22,
                        updated_at = NOW()
                    WHERE id = $23
                    RETURNING id
                    "#
                )
                .bind(&c.gender)
                .bind(c.age as i32)
                .bind(&c.state)
                .bind(&c.category)
                .bind(c.annual_income as i64)
                .bind(&c.occupation)
                .bind(c.landholding_acres.unwrap_or(0.0))
                .bind(c.is_student)
                .bind(c.education_level.as_deref().unwrap_or("12th"))
                .bind(c.is_differently_abled)
                .bind(c.mobile.as_deref().unwrap_or("[Phone Redacted]"))
                .bind(c.email.as_deref().unwrap_or("citizen@placeholder.gov.in"))
                .bind(masked_aadhaar)
                .bind(c.marital_status.as_deref().unwrap_or("Single"))
                .bind(c.has_girl_child.unwrap_or(false))
                .bind(c.girl_child_age.unwrap_or(0) as i32)
                .bind(c.bpl_card_holder.unwrap_or(false))
                .bind(c.is_pregnant_or_lactating.unwrap_or(false))
                .bind(c.crop_insured.unwrap_or(false))
                .bind(c.persona_type.as_deref().unwrap_or("Citizen"))
                .bind(c.father_name.as_deref().unwrap_or("Not Specified"))
                .bind(c.contact_number.as_deref().or(c.mobile.as_deref()).unwrap_or("[Phone Redacted]"))
                .bind(existing_id)
                .fetch_one(pool)
                .await;

                match update_res {
                    Ok(id) => {
                        info!("[Database] Existing citizen record updated: {} ({})", id, c.name);
                        Some(id)
                    }
                    Err(e) => {
                        error!("[Database] CRITICAL: Failed to update citizen {}: {}", existing_id, e);
                        Some(existing_id)
                    }
                }
            }
            Ok(None) => {
                // Insert new citizen record
                let insert_res = sqlx::query_scalar::<_, Uuid>(
                    r#"
                    INSERT INTO public.citizens (
                        name, gender, age, state, category, annual_income, occupation,
                        landholding_acres, is_student, education_level, is_differently_abled,
                        mobile, email, aadhaar_masked, marital_status, has_girl_child,
                        girl_child_age, bpl_card_holder, is_pregnant_or_lactating, crop_insured, persona_type,
                        father_name, contact_number
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
                    ) RETURNING id
                    "#
                )
                .bind(&c.name)
                .bind(&c.gender)
                .bind(c.age as i32)
                .bind(&c.state)
                .bind(&c.category)
                .bind(c.annual_income as i64)
                .bind(&c.occupation)
                .bind(c.landholding_acres.unwrap_or(0.0))
                .bind(c.is_student)
                .bind(c.education_level.as_deref().unwrap_or("12th"))
                .bind(c.is_differently_abled)
                .bind(c.mobile.as_deref().unwrap_or("[Phone Redacted]"))
                .bind(c.email.as_deref().unwrap_or("citizen@placeholder.gov.in"))
                .bind(masked_aadhaar)
                .bind(c.marital_status.as_deref().unwrap_or("Single"))
                .bind(c.has_girl_child.unwrap_or(false))
                .bind(c.girl_child_age.unwrap_or(0) as i32)
                .bind(c.bpl_card_holder.unwrap_or(false))
                .bind(c.is_pregnant_or_lactating.unwrap_or(false))
                .bind(c.crop_insured.unwrap_or(false))
                .bind(c.persona_type.as_deref().unwrap_or("Citizen"))
                .bind(c.father_name.as_deref().unwrap_or("Not Specified"))
                .bind(c.contact_number.as_deref().or(c.mobile.as_deref()).unwrap_or("[Phone Redacted]"))
                .fetch_one(pool)
                .await;

                match insert_res {
                    Ok(id) => {
                        info!("[Database] Citizen record created with id: {}", id);
                        Some(id)
                    }
                    Err(e) => {
                        error!("[Database] CRITICAL: Failed to insert citizen {}: {}", c.name, e);
                        None
                    }
                }
            }
            Err(e) => {
                error!("[Database] CRITICAL: Failed to query existing citizen {}: {}", c.name, e);
                None
            }
        };

        // 2. Insert into scheme_applications with guaranteed foreign key linkage
        let app_insert = sqlx::query_scalar::<_, Uuid>(
            r#"
            INSERT INTO public.scheme_applications (
                citizen_id, citizen_name, scheme_id, scheme_title, category, status, details, submitted_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, 'Pending', $6, NOW(), NOW()
            ) RETURNING id
            "#
        )
        .bind(citizen_id)
        .bind(&c.name)
        .bind(&req.scheme_id)
        .bind(&req.scheme_title)
        .bind(app_category)
        .bind(&details_json)
        .fetch_one(pool)
        .await;

        match app_insert {
            Ok(app_id) => {
                info!(
                    "[Database] Application securely recorded in PostgreSQL: {} for scheme: {} (citizen_id: {:?})",
                    app_id, req.scheme_title, citizen_id
                );
                return (
                    StatusCode::CREATED,
                    Json(ApplyResponse {
                        success: true,
                        application_id: app_id.to_string(),
                        status: "Pending".to_string(),
                        message: format!(
                            "Application for {} has been submitted successfully and routed to the Officer Verification Queue.",
                            req.scheme_title
                        ),
                        submitted_at,
                    }),
                );
            }
            Err(e) => {
                error!("[Database] CRITICAL: Failed to insert into scheme_applications: {}", e);
            }
        }
    }

    // Fallback mode for local demo without database connection
    let mock_id = Uuid::new_v4().to_string();
    info!(
        "[Standalone Mode] Application recorded (ID: {}): {} for {}",
        mock_id, req.scheme_title, c.name
    );

    let memory_record = serde_json::json!({
        "id": mock_id,
        "citizen_id": None::<String>,
        "citizen_name": c.name.clone(),
        "scheme_id": req.scheme_id.clone(),
        "scheme_title": req.scheme_title.clone(),
        "category": app_category.to_string(),
        "status": "Pending",
        "details": details_json,
        "submitted_at": submitted_at.clone(),
        "created_at": submitted_at.clone(),
        "updated_at": submitted_at.clone()
    });

    if let Ok(mut queue) = get_memory_applications().write() {
        queue.insert(0, memory_record);
    }

    (
        StatusCode::CREATED,
        Json(ApplyResponse {
            success: true,
            application_id: mock_id,
            status: "Pending".to_string(),
            message: format!(
                "Application for {} recorded successfully in verification queue.",
                req.scheme_title
            ),
            submitted_at,
        }),
    )
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct ApplicationRow {
    pub id: Uuid,
    pub citizen_id: Option<Uuid>,
    pub citizen_name: String,
    pub scheme_id: String,
    pub scheme_title: String,
    pub category: String,
    pub status: String,
    pub details: Option<serde_json::Value>,
    pub submitted_at: chrono::DateTime<Utc>,
    pub updated_at: chrono::DateTime<Utc>,
    pub citizen_full_name: Option<String>,
    pub citizen_father_name: Option<String>,
    pub citizen_contact_number: Option<String>,
    pub citizen_aadhaar_masked: Option<String>,
    pub citizen_state: Option<String>,
    pub citizen_category: Option<String>,
    pub citizen_annual_income: Option<i64>,
    pub citizen_occupation: Option<String>,
    pub citizen_age: Option<i32>,
}

impl ApplicationRow {
    pub fn to_json(&self) -> serde_json::Value {
        let mut details = self.details.clone().unwrap_or_else(|| serde_json::json!({}));
        if let serde_json::Value::Object(ref mut map) = details {
            if let Some(val) = &self.citizen_father_name {
                if !map.contains_key("father_name") {
                    map.insert("father_name".to_string(), serde_json::json!(val));
                }
            }
            if let Some(val) = &self.citizen_contact_number {
                if !map.contains_key("contact_number") {
                    map.insert("contact_number".to_string(), serde_json::json!(val));
                }
            }
            if let Some(val) = &self.citizen_aadhaar_masked {
                if !map.contains_key("aadhaar_masked") {
                    map.insert("aadhaar_masked".to_string(), serde_json::json!(val));
                }
            }
            if let Some(val) = &self.citizen_state {
                if !map.contains_key("state") {
                    map.insert("state".to_string(), serde_json::json!(val));
                }
            }
            if let Some(val) = &self.citizen_category {
                if !map.contains_key("category") {
                    map.insert("category".to_string(), serde_json::json!(val));
                }
            }
            if let Some(val) = self.citizen_annual_income {
                if !map.contains_key("annual_income") {
                    map.insert("annual_income".to_string(), serde_json::json!(val));
                }
            }
            if let Some(val) = &self.citizen_occupation {
                if !map.contains_key("occupation") {
                    map.insert("occupation".to_string(), serde_json::json!(val));
                }
            }
            if let Some(val) = self.citizen_age {
                if !map.contains_key("age") {
                    map.insert("age".to_string(), serde_json::json!(val));
                }
            }
        }

        serde_json::json!({
            "id": self.id.to_string(),
            "citizen_id": self.citizen_id.map(|u| u.to_string()),
            "citizen_name": self.citizen_name,
            "scheme_id": self.scheme_id,
            "scheme_title": self.scheme_title,
            "category": self.category,
            "status": self.status,
            "details": details,
            "submitted_at": self.submitted_at.to_rfc3339(),
            "created_at": self.submitted_at.to_rfc3339(),
            "updated_at": self.updated_at.to_rfc3339()
        })
    }
}

pub async fn list_applications(
    State(state): State<AppState>,
) -> impl IntoResponse {
    if let Some(pool) = &state.pool {
        let result = sqlx::query_as::<_, ApplicationRow>(
            r#"
            SELECT 
                sa.id,
                sa.citizen_id,
                sa.citizen_name,
                sa.scheme_id,
                sa.scheme_title,
                sa.category,
                sa.status,
                sa.details,
                sa.submitted_at,
                sa.updated_at,
                c.name as citizen_full_name,
                c.father_name as citizen_father_name,
                c.contact_number as citizen_contact_number,
                c.aadhaar_masked as citizen_aadhaar_masked,
                c.state as citizen_state,
                c.category as citizen_category,
                c.annual_income as citizen_annual_income,
                c.occupation as citizen_occupation,
                c.age as citizen_age
            FROM public.scheme_applications sa
            LEFT JOIN public.citizens c ON sa.citizen_id = c.id
            ORDER BY sa.submitted_at DESC
            "#
        )
        .fetch_all(pool)
        .await;

        match result {
            Ok(records) => {
                let apps: Vec<serde_json::Value> = records.into_iter().map(|r| r.to_json()).collect();
                return (StatusCode::OK, Json(apps)).into_response();
            }
            Err(e) => {
                println!("[Database] Join query on citizens failed: {}. Attempting direct query on scheme_applications.", e);
                error!("[Database] Query failed on Render PostgreSQL: {}. Trying direct query on scheme_applications.", e);
                
                let direct_result = sqlx::query(
                    r#"
                    SELECT id, citizen_id, citizen_name, scheme_id, scheme_title, category, status, details, submitted_at, updated_at
                    FROM public.scheme_applications
                    ORDER BY submitted_at DESC
                    "#
                )
                .fetch_all(pool)
                .await;

                if let Ok(rows) = direct_result {
                    use sqlx::Row;
                    let apps: Vec<serde_json::Value> = rows.into_iter().map(|r| {
                        let id: Uuid = r.get("id");
                        let citizen_id: Option<Uuid> = r.get("citizen_id");
                        let citizen_name: String = r.get("citizen_name");
                        let scheme_id: String = r.get("scheme_id");
                        let scheme_title: String = r.get("scheme_title");
                        let category: String = r.get("category");
                        let status: String = r.get("status");
                        let details: Option<serde_json::Value> = r.get("details");
                        let submitted_at: chrono::DateTime<Utc> = r.get("submitted_at");
                        let updated_at: chrono::DateTime<Utc> = r.get("updated_at");

                        serde_json::json!({
                            "id": id.to_string(),
                            "citizen_id": citizen_id.map(|u| u.to_string()),
                            "citizen_name": citizen_name,
                            "scheme_id": scheme_id,
                            "scheme_title": scheme_title,
                            "category": category,
                            "status": status,
                            "details": details.unwrap_or_else(|| serde_json::json!({})),
                            "submitted_at": submitted_at.to_rfc3339(),
                            "created_at": submitted_at.to_rfc3339(),
                            "updated_at": updated_at.to_rfc3339()
                        })
                    }).collect();
                    println!("[Database] Direct query retrieved {} applications from Render PostgreSQL.", apps.len());
                    return (StatusCode::OK, Json(apps)).into_response();
                }
            }
        }
    }

    // In standalone mode or when DB is unreachable, return live memory applications submitted by users
    let mem_apps = get_memory_applications().read().map(|q| q.clone()).unwrap_or_default();
    (StatusCode::OK, Json(mem_apps)).into_response()
}

#[derive(Debug, Deserialize)]
pub struct UpdateStatusRequest {
    pub status: String,
}

pub async fn update_application_status(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(req): Json<UpdateStatusRequest>,
) -> impl IntoResponse {
    let app_uuid = Uuid::parse_str(&id).ok();

    // Sync in-memory queue
    if let Ok(mut queue) = get_memory_applications().write() {
        for app in queue.iter_mut() {
            if app.get("id").and_then(|v| v.as_str()) == Some(&id) {
                if let serde_json::Value::Object(ref mut map) = app {
                    map.insert("status".to_string(), serde_json::json!(req.status));
                    map.insert("updated_at".to_string(), serde_json::json!(Utc::now().to_rfc3339()));
                }
            }
        }
    }

    if let Some(pool) = &state.pool {
        if let Some(uuid) = app_uuid {
            let update_res = sqlx::query(
                r#"
                UPDATE public.scheme_applications
                SET status = $1, updated_at = NOW()
                WHERE id = $2
                "#
            )
            .bind(&req.status)
            .bind(uuid)
            .execute(pool)
            .await;

            match update_res {
                Ok(r) => {
                    info!("[Database] Updated application {} to {} (rows: {})", id, req.status, r.rows_affected());
                    return (StatusCode::OK, Json(serde_json::json!({
                        "success": true,
                        "id": id,
                        "status": req.status
                    }))).into_response();
                }
                Err(e) => {
                    error!("[Database] Failed to update application {}: {}", id, e);
                }
            }
        }
    }

    (StatusCode::OK, Json(serde_json::json!({
        "success": true,
        "id": id,
        "status": req.status,
        "mode": "standalone_sync"
    }))).into_response()
}

pub async fn clear_applications(
    State(state): State<AppState>,
) -> impl IntoResponse {
    if let Ok(mut queue) = get_memory_applications().write() {
        queue.clear();
    }

    if let Some(pool) = &state.pool {
        let _ = sqlx::query("DELETE FROM public.scheme_applications").execute(pool).await;
        info!("[Database] Verification queue cleared.");
    }
    (StatusCode::OK, Json(serde_json::json!({ "success": true, "message": "Queue cleared" }))).into_response()
}
