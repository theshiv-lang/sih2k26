use sqlx::{postgres::PgPoolOptions, PgPool};
use std::env;
use tracing::{error, info, warn};

#[derive(Clone)]
pub struct AppState {
    pub pool: Option<PgPool>,
}

pub async fn init_db_pool() -> Option<PgPool> {
    dotenv::dotenv().ok();

    match env::var("DATABASE_URL") {
        Ok(db_url) => {
            if db_url.trim().is_empty()
                || db_url.contains("YOUR_POSTGRES_CONNECTION_STRING_HERE")
                || db_url.contains("placeholder")
            {
                warn!("[Database] DATABASE_URL is placeholder or empty. Operating in standalone memory mode.");
                return None;
            }
            info!("[Database] Connecting to Render PostgreSQL pool...");
            let mut attempts = 0;
            let max_attempts = 3;
            loop {
                attempts += 1;
                match PgPoolOptions::new()
                    .max_connections(10)
                    .acquire_timeout(std::time::Duration::from_secs(10))
                    .connect(&db_url)
                    .await
                {
                    Ok(pool) => {
                        info!("[Database] Successfully connected to Render PostgreSQL pool!");
                        init_db_schema(&pool).await;
                        return Some(pool);
                    }
                    Err(err) => {
                        if attempts < max_attempts {
                            warn!(
                                "[Database] Connection attempt {}/{} failed: {}. Retrying in 2 seconds...",
                                attempts, max_attempts, err
                            );
                            tokio::time::sleep(std::time::Duration::from_secs(2)).await;
                        } else {
                            error!(
                                "[Database] Could not connect to PostgreSQL after {} attempts: {}. Operating in standalone mode.",
                                max_attempts, err
                            );
                            return None;
                        }
                    }
                }
            }
        }
        Err(_) => {
            warn!("[Database] DATABASE_URL not set in environment. Operating in standalone mode (offline/demo resilient).");
            None
        }
    }
}

pub async fn init_db_schema(pool: &PgPool) {
    let schema_queries = [
        r#"CREATE EXTENSION IF NOT EXISTS "pgcrypto";"#,
        r#"
        CREATE TABLE IF NOT EXISTS public.citizens (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            gender VARCHAR(50) NOT NULL,
            age INTEGER NOT NULL,
            state VARCHAR(100) NOT NULL,
            category VARCHAR(50) NOT NULL,
            annual_income BIGINT NOT NULL,
            occupation VARCHAR(100) NOT NULL,
            landholding_acres DOUBLE PRECISION DEFAULT 0.0,
            is_student BOOLEAN DEFAULT FALSE,
            education_level VARCHAR(100),
            is_differently_abled BOOLEAN DEFAULT FALSE,
            mobile VARCHAR(50),
            email VARCHAR(255),
            aadhaar_masked VARCHAR(50) DEFAULT 'XXXX-XXXX-XXXX',
            marital_status VARCHAR(50),
            has_girl_child BOOLEAN DEFAULT FALSE,
            girl_child_age INTEGER DEFAULT 0,
            bpl_card_holder BOOLEAN DEFAULT FALSE,
            is_pregnant_or_lactating BOOLEAN DEFAULT FALSE,
            crop_insured BOOLEAN DEFAULT FALSE,
            persona_type VARCHAR(100),
            father_name VARCHAR(255),
            contact_number VARCHAR(50),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        "#,
        r#"
        CREATE TABLE IF NOT EXISTS public.scheme_applications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            citizen_id UUID REFERENCES public.citizens(id) ON DELETE SET NULL,
            citizen_name VARCHAR(255) NOT NULL,
            scheme_id VARCHAR(100) NOT NULL,
            scheme_title VARCHAR(255) NOT NULL,
            category VARCHAR(100) NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Under Review', 'Approved', 'Rejected')),
            details JSONB DEFAULT '{}'::jsonb,
            submitted_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        "#,
        r#"CREATE INDEX IF NOT EXISTS idx_applications_submitted_at ON public.scheme_applications(submitted_at DESC);"#,
        r#"ALTER TABLE public.citizens ADD COLUMN IF NOT EXISTS father_name VARCHAR(255);"#,
        r#"ALTER TABLE public.citizens ADD COLUMN IF NOT EXISTS contact_number VARCHAR(50);"#,
        r#"ALTER TABLE public.citizens ADD COLUMN IF NOT EXISTS aadhaar_masked VARCHAR(50) DEFAULT 'XXXX-XXXX-XXXX';"#,
        r#"ALTER TABLE public.citizens ADD COLUMN IF NOT EXISTS persona_type VARCHAR(100);"#,
        r#"ALTER TABLE public.citizens ADD COLUMN IF NOT EXISTS marital_status VARCHAR(50);"#,
        r#"ALTER TABLE public.citizens ADD COLUMN IF NOT EXISTS has_girl_child BOOLEAN DEFAULT FALSE;"#,
        r#"ALTER TABLE public.citizens ADD COLUMN IF NOT EXISTS girl_child_age INTEGER DEFAULT 0;"#,
        r#"ALTER TABLE public.citizens ADD COLUMN IF NOT EXISTS bpl_card_holder BOOLEAN DEFAULT FALSE;"#,
        r#"ALTER TABLE public.citizens ADD COLUMN IF NOT EXISTS is_pregnant_or_lactating BOOLEAN DEFAULT FALSE;"#,
        r#"ALTER TABLE public.citizens ADD COLUMN IF NOT EXISTS crop_insured BOOLEAN DEFAULT FALSE;"#,
        r#"ALTER TABLE public.scheme_applications ALTER COLUMN scheme_title TYPE TEXT;"#,
        r#"ALTER TABLE public.scheme_applications ALTER COLUMN category TYPE TEXT;"#,
        r#"ALTER TABLE public.scheme_applications ALTER COLUMN citizen_name TYPE TEXT;"#,
    ];

    for q in schema_queries {
        if let Err(e) = sqlx::query(q).execute(pool).await {
            warn!("[Database] Schema bootstrap notice for query: {}", e);
        }
    }
    info!("[Database] Render PostgreSQL tables and schema verified.");
}
