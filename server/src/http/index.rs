use axum::Json;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Response {
    pub online: bool,
}

pub async fn index_handler() -> Json<Response> {

    return Json(Response {
        online: true,
    });

}