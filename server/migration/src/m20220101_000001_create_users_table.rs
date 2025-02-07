use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Users::Table)
                    .if_not_exists()
                    .col(pk_auto(Users::Id))

                    .col(string(Users::Username).not_null().unique_key())
                    .col(string(Users::Email).not_null().unique_key())
                    .col(string(Users::Password).not_null())

                    .col(string(Users::SessionKey).not_null().unique_key().string_len(64))

                    .col(
                        date_time(Users::CreatedAt)
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        date_time(Users::UpdatedAt)
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Users::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Users {
    Table,
    Id,

    Username,
    Email,
    Password,

    SessionKey,

    CreatedAt,
    UpdatedAt
}
