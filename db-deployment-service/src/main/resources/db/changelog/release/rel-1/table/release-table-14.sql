-- liquibase formatted sql

-- changeset onsite:16112021-00001

ALTER TABLE org_integrated_apps_config ALTER COLUMN access_token TYPE varchar(5000) ;

ALTER TABLE users ADD timezone varchar(100) NULL;

ALTER TABLE taskboard_apps_config ALTER COLUMN access_token TYPE varchar(5000) USING access_token::varchar;
ALTER TABLE taskboard_apps_config ALTER COLUMN refresh_token TYPE varchar(5000) USING refresh_token::varchar;

alter table taskboard_apps_config add column org_integrated_apps_id UUID null;

ALTER TABLE taskboard_apps_config add CONSTRAINT org_integrated_apps_pkey FOREIGN KEY (org_integrated_apps_id) REFERENCES org_integrated_apps(id);
