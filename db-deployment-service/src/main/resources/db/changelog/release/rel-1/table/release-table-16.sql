-- liquibase formatted sql

-- changeset india:06122021-00001

CREATE TABLE taskboard_launch_permission (
	launch_permission_id uuid NOT NULL,
	taskboard_id uuid NOT NULL,
	group_id uuid NULL,
	allow_workspace varchar(1) NULL,
	allow_all varchar(1) NULL,
	allow_taskboard_user varchar(1) NULL,
	allow_taskboard_group varchar(1) NULL,
	active_flag varchar(1) NOT NULL,
	created_by varchar(100) NOT NULL,
	created_on timestamp NOT NULL,
	modified_by varchar(100) NULL,
	modified_on timestamp NULL,
	tenant_id varchar(50) NOT NULL,
	user_id uuid NULL,
	CONSTRAINT taskboard_launch_permission_pkey PRIMARY KEY (launch_permission_id),
	CONSTRAINT taskboard_foreign_key FOREIGN KEY (taskboard_id) REFERENCES taskboard(id),
	CONSTRAINT users_fk FOREIGN KEY (user_id) REFERENCES users(user_id),
	CONSTRAINT yoro_groups_foreign_key FOREIGN KEY (group_id) REFERENCES yoro_groups(id)
);

ALTER TABLE taskboard_task ADD launch_task_data jsonb NULL;