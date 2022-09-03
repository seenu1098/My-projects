-- liquibase formatted sql

-- changeset india:10222021-00001

ALTER TABLE workflow_report ADD latest_version varchar(1) NULL;
ALTER TABLE workflow_report ADD workspace_id uuid NULL;

ALTER TABLE users ADD theme varchar NULL;
ALTER TABLE users ADD layout varchar NULL;