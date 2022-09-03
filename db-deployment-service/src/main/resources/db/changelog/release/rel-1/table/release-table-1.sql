-- liquibase formatted sql

-- changeset india:08012021-00011

CREATE TABLE if not exists user_signatures (
	id uuid NOT NULL,
	active_flag varchar(1) NOT NULL,
	created_by varchar(100) NOT NULL,
	created_on timestamp NOT NULL,
	modified_by varchar(100) NOT NULL,
	modified_on timestamp NOT NULL,
	tenant_id varchar(50) NOT NULL,
	signature_key varchar(150) NOT NULL,
	user_id uuid NOT NULL,
	signature_name varchar(100) NOT NULL,
	default_signature varchar(1) NULL,
	default_column varchar(255) NULL,
	CONSTRAINT user_signatures_pkey PRIMARY KEY (id),
	CONSTRAINT fk3surba8quvjke9g1uc727nlqp FOREIGN KEY (user_id) REFERENCES users(user_id)
);

--GRANT ALL ON TABLE user_signatures TO yoroflow_appuser;

CREATE INDEX indx_proc_def_task_perm_1
ON process_def_task_permission(task_id,user_id);


CREATE INDEX indx_proc_ins_tasks_1
ON process_instance_tasks(status);
