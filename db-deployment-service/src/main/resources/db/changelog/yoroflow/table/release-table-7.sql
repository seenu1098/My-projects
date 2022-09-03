-- liquibase formatted sql

-- changeset india:01122021-00001


ALTER TABLE installable_apps ALTER COLUMN description TYPE varchar(1000) USING description::varchar;

ALTER TABLE workflow_templates ALTER COLUMN description TYPE varchar(1000) USING description::varchar;

ALTER TABLE taskboard_templates ALTER COLUMN description TYPE varchar(1000) USING description::varchar;