pub mod digilocker;
pub mod match_routes;

use axum::{
    routing::{get, patch, post},
    Router,
};
use tower_http::cors::{Any, CorsLayer};
use crate::db::AppState;

pub fn create_router(state: AppState) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any)
        .expose_headers(Any);

    Router::new()
        .route("/api/health", get(health_check))
        .route("/api/schemes", get(match_routes::list_all_schemes))
        .route("/api/match", post(match_routes::match_schemes))
        .route("/api/chat", post(match_routes::handle_chat))
        .route("/api/apply", post(match_routes::apply_scheme))
        .route("/api/applications", get(match_routes::list_applications).delete(match_routes::clear_applications))
        .route("/api/applications/:id/status", patch(match_routes::update_application_status).put(match_routes::update_application_status))
        .route("/api/digilocker/documents", get(digilocker::get_digilocker_documents))
        .layer(cors)
        .with_state(state)
}

async fn health_check() -> &'static str {
    "OK: Sahayak Backend Service is running"
}
