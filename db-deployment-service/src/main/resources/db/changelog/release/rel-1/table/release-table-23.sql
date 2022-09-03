-- liquibase formatted sql

-- changeset india:04022022-00001

CREATE TABLE table_objects_security (
	security_id uuid NOT NULL,
	table_objects_id uuid NOT NULL,
	group_id uuid NULL,
	table_owner varchar(1) NOT NULL,
	read_allowed varchar(1) NOT NULL,
	edit_allowed varchar(1) NOT NULL,
        delete_allowed varchar(1) NULL,
	active_flag varchar(1) NOT NULL,
	created_by varchar(100) NOT NULL,
	created_on timestamp NOT NULL,
	modified_by varchar(100) NULL,
	modified_on timestamp NULL,
	tenant_id varchar(50) NOT NULL,
	user_id uuid NULL,
	CONSTRAINT table_objects_security_pkey PRIMARY KEY (security_id),
	CONSTRAINT table_objects_foreign_key FOREIGN KEY (table_objects_id) REFERENCES table_objects(table_objects_id),
	CONSTRAINT table_objects_users_fk FOREIGN KEY (user_id) REFERENCES users(user_id),
	CONSTRAINT table_objects_yoro_groups_foreign_key FOREIGN KEY (group_id) REFERENCES yoro_groups(id)
);