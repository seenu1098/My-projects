-- liquibase formatted sql

-- changeset india:15112021-00001

ALTER TABLE login_history ADD logout_time timestamp NULL;
ALTER TABLE login_history RENAME COLUMN craeted_date TO created_date;