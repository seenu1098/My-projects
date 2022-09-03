-- liquibase formatted sql

-- changeset india:18012022-00001

CREATE TABLE activity_log (
	activity_log_id uuid NOT NULL,
	parent_id uuid NOT NULL,
	child_id uuid NULL,
	workspace_id uuid NOT NULL,
	activity_data varchar(1000) NULL,
	activity_type varchar(50) NOT NULL,
	activity_log_user_id uuid NOT NULL,
	tenant_id varchar(60) NOT NULL,
	created_by varchar(100) NOT NULL,
	created_on timestamp NOT NULL,
	active_flag varchar(1) NOT NULL,
	CONSTRAINT activity_logs_pkey PRIMARY KEY (activity_log_id)
);

ALTER TABLE taskboard_columns ADD is_done_column varchar(1) NULL;

