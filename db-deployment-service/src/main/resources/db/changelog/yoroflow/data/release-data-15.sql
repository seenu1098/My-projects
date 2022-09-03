-- liquibase formatted sql

-- changeset india:12212021-00001

UPDATE license_validation
SET allowed_limit=2 
WHERE id='0b039ad9-c6cc-47fa-8982-b952de60b0b6';
UPDATE license_validation
SET allowed_limit=3 
WHERE id='853f35d0-497f-4e66-b5c9-97bff621ea10';

UPDATE license_validation
SET allowed_limit=2 
WHERE id='e82363b6-09e2-4437-a945-009fb93d119b';
UPDATE license_validation
SET allowed_limit=2 
WHERE id='2b38cc90-aec3-4afb-93dd-cb87a64fcaf8';


INSERT INTO license_validation
(id, active_flag, allowed_limit, category, created_by, created_on, feature_name, is_allowed, modified_by, modified_on, plan_name, tenant_id)
VALUES('bbcfeec5-69f4-4af6-ab72-32c90e9104db', 'Y', 5, 'general', 'admin@yoroflow.com', '2021-07-26 16:12:01.000', 'documents', 'Y', 'admin@yoroflow.com', '2021-07-26 16:12:01.000', 'STARTER', 'yoroflow');
INSERT INTO license_validation
(id, active_flag, allowed_limit, category, created_by, created_on, feature_name, is_allowed, modified_by, modified_on, plan_name, tenant_id)
VALUES('2f9e3921-a978-4c64-a900-2aa44eb833dc', 'Y', 2, 'general', 'admin@yoroflow.com', '2021-07-26 16:12:01.000', 'workspace', 'Y', 'admin@yoroflow.com', '2021-07-26 16:12:01.000', 'STARTER', 'yoroflow');
INSERT INTO license_validation
(id, active_flag, allowed_limit, category, created_by, created_on, feature_name, is_allowed, modified_by, modified_on, plan_name, tenant_id)
VALUES('561fadfa-2e2f-467f-8c9f-7dcc57864d0c', 'Y', 10000, 'general', 'admin@yoroflow.com', '2021-07-26 16:12:01.000', 'workspace', 'Y', 'admin@yoroflow.com', '2021-07-26 16:12:01.000', 'BUSINESS PACK', 'yoroflow');
INSERT INTO license_validation
(id, active_flag, allowed_limit, category, created_by, created_on, feature_name, is_allowed, modified_by, modified_on, plan_name, tenant_id)
VALUES('1fa44815-bbd5-4fdf-b7d1-b649ddb00143', 'Y', 10000, 'general', 'admin@yoroflow.com', '2021-07-26 16:12:01.000', 'documents', 'Y', 'admin@yoroflow.com', '2021-07-26 16:12:01.000', 'BUSINESS PACK', 'yoroflow');
INSERT INTO license_validation
(id, active_flag, allowed_limit, category, created_by, created_on, feature_name, is_allowed, modified_by, modified_on, plan_name, tenant_id)
VALUES('d1f81a36-6d25-47d6-82a0-34f16e6dbbd2', 'Y', 10000, 'general', 'admin@yoroflow.com', '2021-07-26 16:12:01.000', 'documents', 'Y', 'admin@yoroflow.com', '2021-07-26 16:12:01.000', 'STANDARD', 'yoroflow');
INSERT INTO license_validation
(id, active_flag, allowed_limit, category, created_by, created_on, feature_name, is_allowed, modified_by, modified_on, plan_name, tenant_id)
VALUES('954b5cad-6287-47e9-bf31-d207e72ef17d', 'Y', 10000, 'general', 'admin@yoroflow.com', '2021-07-26 16:12:01.000', 'workspace', 'Y', 'admin@yoroflow.com', '2021-07-26 16:12:01.000', 'STANDARD', 'yoroflow');
INSERT INTO license_validation
(id, active_flag, allowed_limit, category, created_by, created_on, feature_name, is_allowed, modified_by, modified_on, plan_name, tenant_id)
VALUES('7da0d548-acd0-4ccf-99da-75fa064fcf25', 'Y', 10000, 'general', 'admin@yoroflow.com', '2021-07-26 16:12:01.000', 'documents', 'Y', 'admin@yoroflow.com', '2021-07-26 16:12:01.000', 'PRO', 'yoroflow');
INSERT INTO license_validation
(id, active_flag, allowed_limit, category, created_by, created_on, feature_name, is_allowed, modified_by, modified_on, plan_name, tenant_id)
VALUES('f0cab54a-c65c-49aa-87dd-41097be97118', 'Y', 10000, 'general', 'admin@yoroflow.com', '2021-07-26 16:12:01.000', 'workspace', 'Y', 'admin@yoroflow.com', '2021-07-26 16:12:01.000', 'PRO', 'yoroflow');

