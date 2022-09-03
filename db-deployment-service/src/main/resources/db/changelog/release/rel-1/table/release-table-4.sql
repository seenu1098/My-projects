-- liquibase formatted sql

-- changeset india:08242021-00001

ALTER TABLE users ADD terms_accepted varchar(1) NULL;

CREATE TABLE org_terms_accepted (
    id uuid NOT NULL,
    terms_accepted_date timestamp NOT NULL,
    terms_accepted_ip_from varchar(200) NULL,
    user_id uuid NOT NULL,
    created_by varchar(100) not NULL,
    craeted_date timestamp NOT NULL,
    tenant_id varchar(60) NOT NULL,
    active_flag varchar(1) NOT NULL,
    CONSTRAINT org_terms_accepted_pk PRIMARY KEY (id),
    CONSTRAINT fk_org_terms_accepted FOREIGN KEY(user_id) REFERENCES users(user_id));

    --GRANT ALL ON TABLE org_terms_accepted TO yoroflow_appuser;
 
CREATE TABLE login_history (
    id uuid NOT NULL,
    login_ip_from varchar(200) NULL,
    user_id uuid NOT NULL,
    craeted_date timestamp NOT NULL,
    created_by varchar(100) not NULL,
    tenant_id varchar(60) NOT NULL,
    active_flag varchar(1) NOT NULL,
    CONSTRAINT login_history_pk PRIMARY KEY (id),
    CONSTRAINT fk_login_history FOREIGN KEY(user_id) REFERENCES users(user_id));
    
    --GRANT ALL ON TABLE login_history TO yoroflow_appuser;

ALTER TABLE org_integrated_apps DROP COLUMN auth_token;

ALTER TABLE org_integrated_apps_config DROP COLUMN auth_type;
ALTER TABLE org_integrated_apps_config DROP COLUMN auth_token;
ALTER TABLE org_integrated_apps_config DROP COLUMN api_key;
ALTER TABLE org_integrated_apps_config DROP COLUMN api_secret;
ALTER TABLE org_integrated_apps_config DROP COLUMN client_id;
ALTER TABLE org_integrated_apps_config DROP COLUMN client_secret;
ALTER TABLE org_integrated_apps_config DROP COLUMN expire_at;

ALTER TABLE process_instance_task_notes ALTER COLUMN notes TYPE varchar(1000000) USING notes::varchar;

ALTER TABLE taskboard_task_comments ALTER COLUMN "comment" TYPE varchar(1000000) USING "comment"::varchar;
