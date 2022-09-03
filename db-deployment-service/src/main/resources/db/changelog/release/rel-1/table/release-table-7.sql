-- liquibase formatted sql

-- changeset india:09142021-00001

CREATE TABLE taskboard_task_dependencies (
	id uuid NOT NULL,
	active_flag varchar(255) NOT NULL,
	blocking uuid NULL,
	created_by varchar(255) NOT NULL,
	created_on timestamp NOT NULL,
	modified_by varchar(255) NULL,
	modified_on timestamp NOT NULL,
	related_tasks uuid NULL,
	tenant_id varchar(255) NOT NULL,
	waiting_on uuid NULL,
	taskboard_task_id uuid NOT NULL,
	CONSTRAINT taskboard_task_dependencies_pkey PRIMARY KEY (id),
	CONSTRAINT fkhs3baa4j20kdtx0edxbllreac FOREIGN KEY (blocking) REFERENCES taskboard_task(id),
	CONSTRAINT fknto2a8qkvjjh8pb8r83c5v063 FOREIGN KEY (taskboard_task_id) REFERENCES taskboard_task(id),
	CONSTRAINT fko9gsq5ss9alhatp3npyx8fwu FOREIGN KEY (waiting_on) REFERENCES taskboard_task(id),
	CONSTRAINT fkofr964wyb6o5887rcyk3p3r6l FOREIGN KEY (related_tasks) REFERENCES taskboard_task(id)
);