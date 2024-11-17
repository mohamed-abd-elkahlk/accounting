pub enum Collection {
    Client,
    Product,
}

impl Collection {
    /// Returns the name of the collection as a `&str`
    pub fn as_str(&self) -> &str {
        match self {
            Collection::Client => "clients",
            Collection::Product => "products",
        }
    }
}
