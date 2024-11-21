// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod db;
mod schema;

use commands::{
    client_command::{
        add_new_client, delete_client, find_client_by_id, list_all_clients, update_client,
    },
    product_command::{
        create_product, delete_product, get_all_products, get_product_by_id, update_product,
    },
};

use db::init_db;
use dotenvy::dotenv;
use logger::setup_logger;
use tauri::async_runtime;
use tokio::sync::Mutex;

fn main() {
    // Load environment variables
    dotenv().ok();

    // Set up logging
    setup_logger();

    // Initialize the database and handle errors
    let database_state = async_runtime::block_on(async { init_db().await });

    match database_state {
        Ok(db_state) => {
            // Log successful database initialization
            logger::log_info("Database connected", 200, Some("Connection successful"));

            // Build and run the Tauri app
            tauri::Builder::default()
                .plugin(tauri_plugin_shell::init())
                .manage(Mutex::new(db_state)) // Pass database state to Tauri
                .invoke_handler(tauri::generate_handler![
                    add_new_client,
                    list_all_clients,
                    update_client,
                    find_client_by_id,
                    delete_client,
                    create_product,
                    delete_product,
                    get_all_products,
                    get_product_by_id,
                    update_product,
                ])
                .run(tauri::generate_context!())
                .expect("Error while running Tauri application");
        }
        Err(err) => {
            // Log the error and exit the application
            logger::log_error(&err.message, err.code, err.details.as_deref());
            std::process::exit(1);
        }
    }
}
