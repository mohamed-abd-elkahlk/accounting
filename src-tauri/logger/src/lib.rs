use std::sync::OnceLock;
use tracing::{error, info, warn};
use tracing_appender::rolling;
use tracing_subscriber::{fmt, layer::SubscriberExt, Registry};

/// Static guard to ensure the logger's lifecycle is maintained
static LOGGER_GUARD: OnceLock<tracing_appender::non_blocking::WorkerGuard> = OnceLock::new();

/// Setup the logger to write logs to a rolling file.
pub fn setup_logger() {
    // Configure rolling log file: logs are written to "logs/app.log"
    let file_appender = rolling::never("logs", "app.log");
    let (non_blocking, guard) = tracing_appender::non_blocking(file_appender);

    // Save the guard to ensure it is not dropped prematurely
    LOGGER_GUARD.set(guard).unwrap_or_else(|_| {
        panic!("Logger guard could not be set. Make sure it's initialized only once.");
    });

    // Setup the subscriber with a custom formatter and set log level
    let subscriber =
        Registry::default().with(fmt::layer().with_target(true).with_writer(non_blocking));

    // Set the global subscriber for logging
    tracing::subscriber::set_global_default(subscriber).expect("Setting default subscriber failed");
}

/// Log an informational message.
pub fn log_info(message: &str, code: u16, details: Option<&str>) {
    match details {
        Some(details) => info!(message = message, code = code, details = details),
        None => info!(message = message, code = code, details = "None"),
    }
}

/// Log a warning message.
pub fn log_warn(message: &str, code: u16, details: Option<&str>) {
    match details {
        Some(details) => warn!(message = message, code = code, details = details),
        None => warn!(message = message, code = code, details = "None"),
    }
}

/// Log an error message.
pub fn log_error(message: &str, code: u16, details: Option<&str>) {
    match details {
        Some(details) => error!(message = message, code = code, details = details),
        None => error!(message = message, code = code, details = "None"),
    }
}
