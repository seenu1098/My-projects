-- liquibase formatted sql

-- changeset india:08062021-00001
ALTER TABLE process_instance_task_notes ADD parent_notes_id uuid NULL;

ALTER TABLE process_instance_task_notes ALTER COLUMN notes TYPE varchar(100000) USING notes::varchar;
