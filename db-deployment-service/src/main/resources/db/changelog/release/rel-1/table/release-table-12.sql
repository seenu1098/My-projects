-- liquibase formatted sql

-- changeset india:10252021-00001

ALTER TABLE notifications ADD active_flag varchar NULL;

ALTER TABLE users ADD additional_settings jsonb NULL;
ALTER TABLE users ADD default_language varchar NULL;
ALTER TABLE users ADD color varchar NULL;

ALTER TABLE yoro_groups ADD color varchar NULL;

ALTER TABLE yoro_workspace ADD workspace_unique_key varchar NULL;

CREATE TABLE dashboard (
	id uuid NOT NULL,
	dashboard_name varchar(100) NOT NULL,
	owner_user_id UUID not null,
	tenant_id varchar(60) NOT NULL,
	created_by varchar(100) NOT NULL,
	created_on timestamp NOT NULL,
	modified_by varchar(100) not NULL,
	modified_on timestamp NOT NULL,
	active_flag varchar(1) NOT null,
	dashboard_id varchar(100) NOT NULL,
	CONSTRAINT dashboard_pkey PRIMARY KEY (id)
);

CREATE TABLE dashboard_widget (
	id uuid NOT NULL,
	widget_name varchar(100) NOT NULL,
	row_num int8 not null,
	column_num int8 not null,
	dashboard_id UUID not null,
	tenant_id varchar(60) NOT NULL,
	created_by varchar(100) NOT NULL,
	created_on timestamp NOT NULL,
	modified_by varchar(100) not NULL,
	modified_on timestamp NOT NULL,
	active_flag varchar(1) NOT null,
	CONSTRAINT dashboard_widget_fkey FOREIGN KEY (dashboard_id) REFERENCES dashboard(id),
	CONSTRAINT dashboard_widget_pkey PRIMARY KEY (id)
);

CREATE TABLE yoro_documents_comments (
	comment_id uuid NOT NULL,
	active_flag varchar(1) NOT NULL,
	doc_commented_section varchar(10000) NOT NULL,
	doc_comment varchar(1000000) NOT NULL,
	created_by varchar(100) NOT NULL,
	created_on timestamp NOT NULL,
	modified_by varchar(100) NULL,
	modified_on timestamp NULL,
	reply_to_comment_id uuid NULL,
	tenant_id varchar(60) NOT NULL,
	document_id uuid NOT NULL,
	comment_length int8 NULL,
	comment_index int8 NULL,
	CONSTRAINT yoro_documents_comments_pkey PRIMARY KEY (comment_id),
	CONSTRAINT yoro_documents_fkey FOREIGN KEY (document_id) REFERENCES yoro_documents(document_id)
);


