mod db;
mod handlers;
mod models;
mod routes;
mod services;

use std::net::SocketAddr;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() {
    // Load environment variables from .env using dotenv crate
    dotenv::dotenv().ok();

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "sahayak_backend=info,tower_http=info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Initialize Database Connection Pool (PostgreSQL / Supabase)
    let pool = db::init_db_pool().await;
    let has_db = pool.is_some();
    let state = db::AppState { pool };

    let app = routes::create_router(state);

    let port: u16 = std::env::var("PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(8080);
    let addr = SocketAddr::from(([0, 0, 0, 0], port));

    println!("╔══════════════════════════════════════════════════════════╗");
    println!("║       🏛️  SAHAYAK (सहायक) BACKEND SERVICE STARTED       ║");
    println!("╠══════════════════════════════════════════════════════════╣");
    println!("║  Server listening on: 0.0.0.0:{:<26} ║", port);
    println!("║  Health Check:        /api/health                        ║");
    println!("║  DigiLocker Mock:     /api/digilocker/documents          ║");
    println!("║  Scheme Match API:    /api/match                         ║");
    println!("║  Applications Queue:  /api/applications                  ║");
    if has_db {
        println!("║  Render PostgreSQL:   ONLINE (Secure Writes Enabled)     ║");
    } else {
        println!("║  Render PostgreSQL:   OFFLINE (Resilient Standalone Mode)║");
    }
    println!("╚══════════════════════════════════════════════════════════╝");

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .unwrap_or_else(|e| panic!("Failed to bind TCP listener on 0.0.0.0:{}: {}", port, e));

    axum::serve(listener, app)
        .await
        .expect("Failed to start Axum server");
}
