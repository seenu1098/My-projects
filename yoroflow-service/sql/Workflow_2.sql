CREATE TABLE process_instance_task_file (
	task_file_att_id uuid NOT NULL,
	process_instance_task_id uuid NOT NULL,
	file_name varchar(20) NULL,
	added_by varchar NOT NULL,
	created_date timestamp NOT NULL,
	updated_date timestamp NOT NULL,
	files bytea NULL,
	CONSTRAINT task_file_att_pk PRIMARY KEY (task_file_att_id)
);