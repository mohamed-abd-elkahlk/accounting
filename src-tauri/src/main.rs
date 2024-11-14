// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

mod db;
use db::init_db;
use dotenvy::dotenv;
use std::sync::Arc;
use tokio::sync::Mutex;

#[tokio::main]
#[cfg_attr(mobile, tauri::mobile_entry_point)]
async fn main() {
    dotenv().ok();
    let database = init_db().await;
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(Arc::new(Mutex::new(database))) // Store MongoDB state in Tauri
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
