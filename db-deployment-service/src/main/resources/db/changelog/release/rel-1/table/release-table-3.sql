-- liquibase formatted sql

-- changeset india:08202021-00001

ALTER TABLE taskboard_apps_config ADD authorization_code varchar(1000) NULL;
ALTER TABLE taskboard_apps_config ADD access_token varchar(1000) NULL;
ALTER TABLE taskboard_apps_config ADD refresh_token varchar(1000) NULL;
ALTER TABLE taskboard_apps_config ADD access_token_expiry timestamp NULL;
ALTER TABLE taskboard_apps_config ADD allowed_scopes_csv varchar(255) NULL;
ALTER TABLE taskboard_apps_config ADD expire_at timestamp NULL;

ALTER TABLE org_integrated_apps ADD column authorization_endpoint varchar(500) ,ADD column client_id varchar(100) ,ADD column client_secret varchar(1000) ,ADD column scopes_csv varchar(500) ,ADD column token_endpoint varchar(500) ,ADD column userinfo_endpoint varchar(500) ,ADD column issuer varchar(100) ,ADD column redirect_url varchar(500),ADD column description varchar(500);

ALTER TABLE org_integrated_apps_config ADD column authorization_code varchar(1000) NULL, ADD column access_token varchar(1000) NULL, ADD column refresh_token varchar(1000) NULL, ADD column access_token_expiry timestamp NULL, ADD column allowed_scopes_csv varchar(255) NULL, ADD column expire_at timestamp NULL;