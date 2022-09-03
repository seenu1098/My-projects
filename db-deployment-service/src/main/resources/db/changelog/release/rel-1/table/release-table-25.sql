-- liquibase formatted sql

-- changeset usa:02092022-00001


ALTER TABLE metrics_details ALTER COLUMN action_subtype DROP NOT NULL;
