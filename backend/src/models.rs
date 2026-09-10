#[path = "models/application.rs"]
pub mod application;
#[path = "models/citizen.rs"]
pub mod citizen;
#[path = "models/digilocker.rs"]
pub mod digilocker;
#[path = "models/scheme.rs"]
pub mod scheme;

#[allow(unused_imports)]
pub use application::{ApplyRequest, ApplyResponse};
#[allow(unused_imports)]
pub use citizen::{ChatRequest, ChatResponse, CitizenProfile, MatchRequest};
#[allow(unused_imports)]
pub use digilocker::{
    AadhaarDocument, Address, CasteCertificateDocument, DigiLockerDocumentsResponse,
    IncomeCertificateDocument,
};
#[allow(unused_imports)]
pub use scheme::{MatchResponse, Scheme, SchemeCriteria, SchemeMatchResult, SchemeMatcher};
