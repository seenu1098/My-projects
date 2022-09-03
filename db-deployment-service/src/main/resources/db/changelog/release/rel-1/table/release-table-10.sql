-- liquibase formatted sql

-- changeset india:10082021-00001

ALTER TABLE yoro_groups_user ADD team_owner varchar(1) NULL;

ALTER TABLE yoro_documents ALTER COLUMN document_data DROP NOT NULL;
