-- liquibase formatted sql

-- changeset india:30112021-00001

ALTER TABLE taskboard ADD sprint_enabled varchar(1) NULL;

ALTER TABLE taskboard_task ADD estimate_hours float4 NULL;
ALTER TABLE taskboard_task ADD original_points int4 NULL;

CREATE TABLE taskboard_sprint_settings (
	sprint_settings_id uuid NOT NULL,
	taskboard_id uuid NOT NULL,
	sprint_duration int4 NOT NULL,
	sprint_duration_type varchar(1) NOT NULL,
	sprint_start_day varchar(20) NULL,
	sprint_estimations varchar(10) NOT NULL,
	tenant_id varchar(60) NOT NULL,
	created_by varchar(100) NOT NULL,
	created_on timestamp NOT NULL,
	modified_by varchar(100) NULL,
	modified_on timestamp NULL,
	active_flag varchar(1) NOT NULL,
	CONSTRAINT taskboard_sprint_settings_pkey PRIMARY KEY (sprint_settings_id),
	CONSTRAINT taskboard_fkey FOREIGN KEY (taskboard_id) REFERENCES taskboard(id)
);

CREATE TABLE taskboard_sprints (
	sprints_id uuid NOT NULL,
	sprint_settings_id uuid NOT NULL,
	sprint_name varchar(100) NOT NULL,
	sprint_seq_number int4 NOT NULL,
	sprint_start_date timestamp NOT NULL,
	sprint_end_date timestamp NOT NULL,
	sprint_total_original_points int4 NULL,
	sprint_total_estimated_hours float4 NULL,
	sprint_total_worked_hours float4 NULL,
	sprint_status varchar(1) NOT NULL,
	tenant_id varchar(60) NOT NULL,
	created_by varchar(100) NOT NULL,
	created_on timestamp NOT NULL,
	modified_by varchar(100) NULL,
	modified_on timestamp NULL,
	active_flag varchar(1) NOT NULL,
	CONSTRAINT taskboard_sprints_pkey PRIMARY KEY (sprints_id),
	CONSTRAINT fkicfymm048ntk0np3q81sg5pdr FOREIGN KEY (sprint_settings_id) REFERENCES taskboard_sprint_settings(sprint_settings_id)
);

CREATE TABLE taskboard_sprint_tasks (
	sprint_task_id uuid NOT NULL,
	sprints_id uuid NOT NULL,
	taskboard_task_id uuid NOT NULL,
	sprint_estimated_points int4 NULL,
	sprint_estimated_hours float4 NULL,
	sprint_total_hours_spent float4 NULL,
	tenant_id varchar(60) NOT NULL,
	created_by varchar(100) NOT NULL,
	created_on timestamp NOT NULL,
	modified_by varchar(100) NULL,
	modified_on timestamp NULL,
	active_flag varchar(1) NOT NULL,
	CONSTRAINT taskboard_sprint_tasks_pkey PRIMARY KEY (sprint_task_id),
	CONSTRAINT taskboard_sprints_fkey FOREIGN KEY (sprints_id) REFERENCES taskboard_sprints(sprints_id),
	CONSTRAINT taskboard_task_fkey FOREIGN KEY (taskboard_task_id) REFERENCES taskboard_task(id)
);

CREATE TABLE taskboard_sprint_work_log (
	work_log_id uuid NOT NULL,
	sprint_task_id uuid NOT NULL,
	user_id uuid NOT NULL,
	time_spent float4 NULL,
	work_date timestamp NOT NULL,
	work_description varchar(10000) NULL,
	tenant_id varchar(60) NOT NULL,
	created_by varchar(100) NOT NULL,
	created_on timestamp NOT NULL,
	modified_by varchar(100) NULL,
	modified_on timestamp NULL,
	active_flag varchar(1) NOT NULL,
	CONSTRAINT taskboard_sprint_work_log_pkey PRIMARY KEY (work_log_id),
	CONSTRAINT taskboard_sprint_tasks_fkey FOREIGN KEY (sprint_task_id) REFERENCES taskboard_sprint_tasks(sprint_task_id),
	CONSTRAINT users_fkey FOREIGN KEY (user_id) REFERENCES users(user_id)
);