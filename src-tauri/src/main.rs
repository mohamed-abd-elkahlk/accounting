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
