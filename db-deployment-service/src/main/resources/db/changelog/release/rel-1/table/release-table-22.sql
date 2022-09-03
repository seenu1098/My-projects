-- liquibase formatted sql

-- changeset india:28012022-00001

CREATE TABLE org_azure_config (
	azure_config_id uuid NOT NULL,
	azure_client_id varchar(100) NOT NULL,
	azure_secret_id varchar(100) NOT NULL,
	azure_tenant_id varchar(100) NULL,
	azure_allowed_group varchar(300) NULL,
	auth_method_id uuid NOT NULL,
	tenant_id varchar(60) NOT NULL,
	created_by varchar(100) NOT NULL,
	created_on timestamp NOT NULL,
	modified_by varchar(100) NULL,
	modified_on timestamp NULL,
	active_flag varchar(1) NOT NULL,
	CONSTRAINT org_azure_config_pkey PRIMARY KEY (azure_config_id),
	CONSTRAINT auth_method_fkey FOREIGN KEY (auth_method_id) REFERENCES org_auth_methods(id)
);