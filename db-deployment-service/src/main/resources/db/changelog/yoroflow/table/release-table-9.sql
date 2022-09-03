-- liquibase formatted sql

-- changeset india:14122021-00101

ALTER TABLE customers ALTER COLUMN actual_domain_name DROP NOT NULL;