-- liquibase formatted sql

-- changeset USA:12212021-00101

ALTER TABLE taskboard_task ADD next_reminder_timestamp timestamp NULL;
