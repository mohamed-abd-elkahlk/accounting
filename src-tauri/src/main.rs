// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

mod commands;
mod db;
mod schema;

use commands::client_command::add_new_client;
use db::init_db;
use dotenvy::dotenv;
use tauri::{async_runtime, Manager};
use tokio::sync::Mutex;

fn main() {
    dotenv().ok();

    // Initialize the database using Tauri's async runtime
    let database = async_runtime::block_on(async { init_db().await });

    // Build and run the Tauri app
    tauri::Builder::default()
        .setup(move |app| {
            // Share the database state with the app using a Mutex
            app.manage(Mutex::new(database));
            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, add_new_client])
        .run(tauri::generate_context!())
        .expect("Error while running Tauri application");
}
