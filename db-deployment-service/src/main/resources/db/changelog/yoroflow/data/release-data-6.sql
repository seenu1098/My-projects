-- liquibase formatted sql

-- changeset india:08262021-00001

INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('9f2ec60b-2100-41cc-9573-b14ecfedecf3', 'STANDARD', 'database_connector', 'Y', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('351dda86-78aa-42a4-b7e1-7f9aff6b977d', 'STANDARD', 'public_form', 'Y', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('8d97dda5-2042-4580-9621-ce223430123f', 'STANDARD', 'signature_control', 'Y', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('29b13e91-0dbe-4772-a08b-31f33b3acb39', 'STANDARD', 'storage', 'Y', 10, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('c77e2f14-cd75-449c-a0df-5d70e55bca8f', 'STANDARD', 'single_sign_on', 'Y', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('7caa0db8-7498-4c9a-a8f6-a85a6d504733', 'STANDARD', 'two_factor_authentication', 'Y', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('4497367b-c26c-4424-b905-f9ce687cc139', 'STANDARD', 'live_chat', 'Y', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('0b740da7-2276-4666-93f7-598752bfbc85', 'STANDARD', 'application_pages', 'Y', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('7ec7a573-c541-4ba6-a693-d06ef20e3845', 'STANDARD', 'drag_drop_workflow_designer', 'Y', 0, 'workflow_and_automations', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('9e2e79ad-7cc6-4c60-96d8-a57c3b344f1f', 'STANDARD', 'scheduled_workflow', 'Y', 0, 'workflow_and_automations', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('203b1b93-ac85-4a89-9525-1f3d11a65958', 'STANDARD', 'manual_workflow', 'Y', 0, 'workflow_and_automations', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('53776f73-41c6-49c9-8700-9487be3375dd', 'STANDARD', 'web_service_workflow', 'Y', 0, 'workflow_and_automations', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('45507c26-8568-4726-99f0-2002afbf4e89', 'STANDARD', 'api_calls', 'Y', 0, 'workflow_and_automations', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('000e5c55-0690-48c6-a869-4610073d0ba1', 'STANDARD', 'automations', 'Y', 5000, 'workflow_and_automations', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('44cf5d3a-853e-4088-836a-1c4b06196a7e', 'STANDARD', 'boards', 'Y', 50, 'taskboards', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('59a48dcb-25c6-4041-8ee3-b2b3b791f02b', 'STANDARD', 'columns', 'Y', 0, 'taskboards', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('e6328ef0-9828-4592-b096-14c2966083a3', 'STANDARD', 'permission_based_access', 'Y', 0, 'security', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('10590cab-e7dd-4017-adb4-35e9e73fea67', 'STANDARD', 'encryption_in_transit', 'Y', 0, 'security', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('894a175e-c95d-4f2b-b655-21e66e5ee5d4', 'STANDARD', 'encryption_at_rest', 'Y', 0, 'security', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('7ec95793-3f94-42b8-998b-7aa0402b51c0', 'STANDARD', 'user_restriction', 'Y', 0, 'security', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('ada37590-ece6-4a99-a33e-f1b1c7f7d4e3', 'STANDARD', 'video_support', 'Y', 0, 'support', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('32a9cebd-8cd2-4e44-bdab-92b02d44cd79', 'STANDARD', 'call_support', 'Y', 0, 'support', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('8202cbc0-8f70-4975-b03b-fe5683b03546', 'STANDARD', 'chat_support', 'Y', 0, 'support', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('4b38c22d-31ca-4772-ba48-2fe2ba3d7a81', 'STANDARD', 'user_guide', 'Y', 0, 'support', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('a334a497-a99d-4bf6-978b-987a8f3176aa', 'STANDARD', 'dedicated_support', 'Y', 0, 'support', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('5dc497c9-4e62-4b99-bc9a-e675044e603b', 'STANDARD', 'custom_reports', 'Y', 0, 'reports', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('0c69f40a-3307-435f-b3ee-131132a68f0c', 'STANDARD', 'standard_reports', 'Y', 0, 'reports', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('6680b069-0939-4587-8936-37bb53259df5', 'STANDARD', 'sms', 'Y', 0, 'notifications', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('54475ea9-70ae-4910-96db-b923c01a9784', 'STANDARD', 'email', 'Y', 0, 'notifications', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('0ba42c4a-b02c-4953-837a-ba8dbc3f0ee9', 'STANDARD', 'push', 'Y', 0, 'notifications', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('8780cfdc-2872-48df-839b-0abac0e53bc9', 'STANDARD', 'custom_notification', 'Y', 0, 'notifications', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('1590c15d-198a-43b1-9eb1-28f3e37fe411', 'PRO', 'drag_drop_form_editor', 'Y', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('de501760-f043-407f-9dba-ff7bc557cfd4', 'PRO', 'data_model', 'Y', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('822f7da5-ceb0-4300-a074-751894f76d60', 'PRO', 'database_connector', 'Y', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('0339b37d-36f7-4cf9-8e02-2f7a1cc42e5f', 'PRO', 'public_form', 'Y', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('d44e0ce2-08a1-494f-8a08-8a37ca75033e', 'PRO', 'signature_control', 'Y', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('30e8674e-7f9e-459f-b740-0f94b4667167', 'PRO', 'storage', 'Y', 10000, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('da9e8747-0c10-4934-aed5-3106ee22ae07', 'PRO', 'single_sign_on', 'Y', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('9e273d98-1579-4d8d-be4b-577ebb2f7634', 'STARTER', 'two_factor_authentication', 'N', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('e691c4ce-e1da-45fc-b2b0-c459bc1e7f0e', 'STARTER', 'chat_support', 'N', 0, 'support', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('715230f3-a0b4-4d36-912b-8ade17a8c06a', 'STARTER', 'dedicated_support', 'N', 0, 'support', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('1041a817-7c3c-4d2d-9e30-8da465a331d6', 'STARTER', 'custom_reports', 'N', 0, 'reports', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('98a62d86-d199-4a7f-8cf4-4b7c6a663487', 'STARTER', 'mobile_app_menu_config', 'Y', 0, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('0b039ad9-c6cc-47fa-8982-b952de60b0b6', 'STARTER', 'users', 'Y', 3, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('11cada2a-bcd5-4a1d-92e0-9a517756730d', 'PRO', 'two_factor_authentication', 'Y', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('a6fd7210-2189-402d-8be2-1a0b265c7a76', 'PRO', 'live_chat', 'Y', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('e142e5da-3ca6-45f0-a0e2-293f6f04dace', 'PRO', 'application_pages', 'Y', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('00af8c7c-6f87-45d2-9c26-ad23772719db', 'PRO', 'drag_drop_workflow_designer', 'Y', 0, 'workflow_and_automations', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('43df4423-dd46-4415-84d6-71f170789bcd', 'PRO', 'scheduled_workflow', 'Y', 0, 'workflow_and_automations', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('ea4c6db9-cc73-4820-a67c-d5f78f905c9a', 'PRO', 'manual_workflow', 'Y', 0, 'workflow_and_automations', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('dd6a89bb-e3ba-4773-950e-5d55c402d5e9', 'BUSINESS PACK', 'mobile_app_ios_android', 'Y', 0, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('eca852d6-0522-44ed-b27d-1aae98ba9e0c', 'PRO', 'web_service_workflow', 'Y', 0, 'workflow_and_automations', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('a91c1901-f8ca-470d-a0da-4bea83c9a320', 'PRO', 'api_calls', 'Y', 0, 'workflow_and_automations', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('e6b55135-eef7-473d-8283-37c250e2cb69', 'PRO', 'automations', 'Y', 10000, 'workflow_and_automations', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('d24326c5-6ef6-4a3f-8b08-9af3c58132ae', 'PRO', 'boards', 'Y', 10000, 'taskboards', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('23519f1c-2a85-477c-b846-ae21e0a1952a', 'PRO', 'columns', 'Y', 0, 'taskboards', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('bdfebfc7-3846-4f92-a369-d98315073b7b', 'PRO', 'permission_based_access', 'Y', 0, 'security', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('043c15c0-9ce9-4b74-af8a-7f8229b01d94', 'PRO', 'encryption_in_transit', 'Y', 0, 'security', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('f569d2bf-9370-4e77-8f8b-93316f8c9186', 'PRO', 'encryption_at_rest', 'Y', 0, 'security', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('6ee9915b-eb90-46f5-b613-4a5e48f333c4', 'PRO', 'user_restriction', 'Y', 0, 'security', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('0148536f-8e8f-4989-ae96-548a2c8334d9', 'PRO', 'video_support', 'Y', 0, 'support', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('191779dc-e454-48dc-a1d1-4bd7d10f1b2a', 'PRO', 'call_support', 'Y', 0, 'support', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('636f0f4a-2435-468a-93f7-f2be402fcbb9', 'PRO', 'chat_support', 'Y', 0, 'support', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('b935b47a-4bde-4478-85bf-abb701cd2e2f', 'PRO', 'user_guide', 'Y', 0, 'support', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('980c918c-bbce-41f3-93fd-d8928e1c93a2', 'PRO', 'dedicated_support', 'Y', 0, 'support', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('2b52035e-af37-41f2-8c8c-8b92fb8c6549', 'PRO', 'custom_reports', 'Y', 0, 'reports', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('f1984c26-4f97-4198-9489-2651ec266712', 'PRO', 'standard_reports', 'Y', 0, 'reports', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('a2c19ae6-6762-46d1-90e6-6dd77fd054c2', 'PRO', 'sms', 'Y', 0, 'notifications', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('13f12ebb-07ff-459c-a2e6-d09e2a3a0e78', 'PRO', 'email', 'Y', 0, 'notifications', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('0343e2cd-7446-4c0d-8f55-a94a91abdb19', 'PRO', 'push', 'Y', 0, 'notifications', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('a90d34fc-3af4-433e-8c13-0b88cc360f54', 'PRO', 'custom_notification', 'Y', 0, 'notifications', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('6637b7de-3c1c-45ac-8ce9-df60fd1f4a65', 'PRO', 'user_restriction', 'Y', 0, 'taskboards', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('76af9d70-3d5e-4eaf-b442-31bb51cf5bcf', 'BUSINESS PACK', 'menu_configuration', 'N', 0, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('c50bdb77-6c79-4e16-abd1-5429531e06e8', 'STARTER', 'menu_configuration', 'N', 0, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('9bb78370-8af6-4ae8-8f61-73bbe797fc04', 'STARTER', 'scheduled_workflow', 'N', 0, 'workflow_and_automations', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('6a7c869a-fb6c-4d72-b453-0e33626e677a', 'STARTER', 'manual_workflow', 'Y', 0, 'workflow_and_automations', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('e82363b6-09e2-4437-a945-009fb93d119b', 'STARTER', 'boards', 'Y', 5, 'taskboards', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('4186195b-bdf1-4fbd-8135-10e5309d8cd2', 'STARTER', 'columns', 'Y', 0, 'taskboards', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('0af8fd9d-1d47-4b20-b5f0-c5ce5c5548de', 'BUSINESS PACK', 'mobile_app_menu_config', 'Y', 0, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('a728d07b-650b-4d76-82c0-dba27450a445', 'BUSINESS PACK', 'workflows', 'Y', 15, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('c44f7ccd-caee-453c-ae15-00c5b1bb927c', 'BUSINESS PACK', 'email_templates', 'Y', 0, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('b935fb84-75f0-4212-9a7a-712da7c7f0e9', 'BUSINESS PACK', 'ui_theme', 'N', 0, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('9c50be6a-a4e3-40b3-9dbb-b89a71a16891', 'BUSINESS PACK', 'ui_preferences', 'N', 0, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('9f715a6f-91ce-484b-8980-4f40b5886001', 'BUSINESS PACK', 'dashboard', 'Y', 0, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('fe6ca38f-7e05-4f72-9172-ee94108e09c0', 'STANDARD', 'mobile_app_ios_android', 'Y', 0, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('cd2e8a23-9680-4992-b13d-9487dbbc6e57', 'STANDARD', 'menu_configuration', 'Y', 0, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('bbc67c68-1d47-400f-a464-0fda7966490b', 'STANDARD', 'mobile_app_menu_config', 'Y', 0, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('74e8e6bd-67c8-46d1-8dfc-93e1f2bf0631', 'STANDARD', 'workflows', 'Y', 30, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('c33837b0-268c-4f2d-8e40-95541676a3c8', 'STANDARD', 'email_templates', 'Y', 0, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('b1502e05-c77a-4222-87f0-635ffcfd7daf', 'STANDARD', 'ui_theme', 'Y', 0, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('5c3d63b9-f87b-415a-87ee-7a7ee4a59014', 'STANDARD', 'ui_preferences', 'Y', 0, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('dec015c2-4e98-4ddc-9c2f-2c9ceedd3b5c', 'STANDARD', 'dashboard', 'Y', 0, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('061c660c-60de-4700-b5a1-dbb109ff688d', 'STANDARD', 'users', 'Y', 50, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('7b449148-458e-48cd-ae52-5ea8a8ddc937', 'STANDARD', 'teams_groups', 'Y', 10000, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('8509a8de-aaa3-432b-bf6c-14d02861a230', 'STANDARD', 'drag_drop_form_editor', 'Y', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('28e77647-f5a1-4960-9de5-cc5d4da89988', 'STANDARD', 'data_model', 'Y', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('91c162ac-d3a0-413c-8b05-60f49647b974', 'STANDARD', 'user_restriction', 'Y', 0, 'taskboards', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('716eea95-42e9-40d1-95b5-1e25a4385c33', 'PRO', 'mobile_app_ios_android', 'Y', 0, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('69d173f5-9998-4e05-ad24-9a8b0dcaa12d', 'PRO', 'menu_configuration', 'Y', 0, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('4b02de6d-522b-465a-b268-bcbbf374705b', 'PRO', 'mobile_app_menu_config', 'Y', 0, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('0816d429-ae23-4a52-ab82-805d05c1e6b7', 'PRO', 'workflows', 'Y', 10000, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('85eb483f-c603-4112-8a49-437a1a95fa76', 'PRO', 'email_templates', 'Y', 0, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('2a235b38-cfbc-44b3-b780-48b7c416e474', 'PRO', 'ui_theme', 'Y', 0, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('1ed3a624-f0c6-4259-b429-f2778a481bf6', 'PRO', 'ui_preferences', 'Y', 0, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('31c84766-29c2-4528-a647-fd820f429c10', 'PRO', 'dashboard', 'Y', 0, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('eb6af91c-3dab-482f-931f-dd4c04cae00e', 'PRO', 'users', 'Y', 10000, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('6de8f239-a42f-4c01-8889-b7b98d8b2600', 'PRO', 'teams_groups', 'Y', 10000, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('2b38cc90-aec3-4afb-93dd-cb87a64fcaf8', 'STARTER', 'workflows', 'Y', 4, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('3ec175a2-1c93-4bbe-9702-ca969a12f7cf', 'STARTER', 'ui_theme', 'N', 0, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('d0876796-ad51-4699-a363-30ff5c1bfbbc', 'STARTER', 'dashboard', 'Y', 0, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('23c6eb2e-aba3-4fa0-a1fb-d56a0640e839', 'STARTER', 'mobile_app_ios_android', 'Y', 0, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('412a3b3b-ba7e-4eaf-b816-afaa027a620d', 'STARTER', 'email_templates', 'Y', 0, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('13b3e27c-de63-409f-a5f5-925c1c578fbe', 'STARTER', 'drag_drop_form_editor', 'Y', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('853f35d0-497f-4e66-b5c9-97bff621ea10', 'STARTER', 'teams_groups', 'Y', 6, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('bcde2d34-90c4-42f3-acd3-ac70adfd8b16', 'STARTER', 'ui_preferences', 'N', 0, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('dbb2c1f5-ebbb-4e24-9a99-dc129a6b02b2', 'STARTER', 'data_model', 'Y', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('5dba49f6-b06e-4dc2-9d68-a9af6325022e', 'STARTER', 'database_connector', 'N', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('59da3d1d-c607-4882-ad8b-807535b762de', 'STARTER', 'public_form', 'N', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('a6dcf2a3-b152-45fb-a4dc-3686104687a6', 'STARTER', 'signature_control', 'N', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('70f4c5fb-3a60-4575-9e38-b51d1eb028db', 'STARTER', 'single_sign_on', 'N', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('fbe1456f-4ed4-43e1-8a9a-cf0874bbb8b5', 'STARTER', 'live_chat', 'N', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('ada1791b-32ed-443a-8791-d94b54271508', 'STARTER', 'application_pages', 'N', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('99a5db46-f5a0-4c85-879c-ccf0ab780651', 'STARTER', 'permission_based_access', 'Y', 0, 'security', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('4a5d1184-e169-4af8-b6ae-6596cc0ce244', 'STARTER', 'storage', 'Y', 500, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('8a6cf75e-e9fe-41b7-8528-f3a2d37ef84c', 'STARTER', 'encryption_in_transit', 'Y', 0, 'security', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('1ba76235-6020-414c-ab9d-a233def81aac', 'STARTER', 'encryption_at_rest', 'Y', 0, 'security', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('73485207-3db3-4933-9e94-770fbf97c2b6', 'STARTER', 'web_service_workflow', 'N', 0, 'workflow_and_automations', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('43e5d37a-634c-4c0d-9f35-1d2eb49edbc0', 'STARTER', 'api_calls', 'N', 0, 'workflow_and_automations', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('3e715c97-9280-42dd-9afc-8fac7363aa5c', 'STARTER', 'automations', 'N', 0, 'workflow_and_automations', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('6433ef29-722a-41bc-84e1-528e4e193b3e', 'STARTER', 'drag_drop_workflow_designer', 'Y', 0, 'workflow_and_automations', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('d45a1bfb-7c07-4f01-86d9-872ff42d1475', 'STARTER', 'user_restriction', 'Y', 0, 'security', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('f623b673-f6ac-4600-9cb3-2d4f6b2ae817', 'STARTER', 'video_support', 'Y', 0, 'support', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('1a5691fc-1adf-4b59-9680-d68cc460cd34', 'STARTER', 'call_support', 'N', 0, 'support', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('fc01ed3a-255d-4581-9a5b-2401eeaf332c', 'STARTER', 'user_guide', 'Y', 0, 'support', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('e3851721-5a41-43b2-b45f-5b71f7bb399b', 'STARTER', 'sms', 'N', 0, 'notifications', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('98351e08-2214-4fbf-8d37-be67fbf0d1ae', 'STARTER', 'email', 'Y', 0, 'notifications', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('30c48162-0988-4c0f-97f4-9fbda209d087', 'STARTER', 'standard_reports', 'Y', 0, 'reports', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('60111219-7ebe-44fe-85be-754cc7aa3ef5', 'STARTER', 'push', 'N', 0, 'notifications', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('a21455fd-a329-46af-896d-3bb448bd19d8', 'STARTER', 'custom_notification', 'N', 0, 'notifications', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('570e700d-2e90-4dc9-89ea-56f44330d8fd', 'STARTER', 'user_restriction', 'N', 0, 'taskboards', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('67646582-81f4-4799-ba93-a11c4280ce56', 'BUSINESS PACK', 'users', 'Y', 20, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('2a227594-9978-4135-a950-6d7286650d39', 'BUSINESS PACK', 'teams_groups', 'Y', 10000, 'general', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('6ab928a6-729b-4525-ba6c-911967b7c8a6', 'BUSINESS PACK', 'drag_drop_form_editor', 'Y', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('df5efc52-24be-4339-aec5-c98ef0f458c0', 'BUSINESS PACK', 'data_model', 'Y', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('4601c5c7-f550-47fc-85f4-e4ca302eece5', 'BUSINESS PACK', 'database_connector', 'Y', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('c7d3a8a6-282a-41d7-a77e-27960c11c9d3', 'BUSINESS PACK', 'public_form', 'Y', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('00a7e0b0-e0f7-4117-be51-5e22dccb78ee', 'BUSINESS PACK', 'signature_control', 'Y', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('6b29b66e-7fad-4c2f-b4e6-b34f295bbc04', 'BUSINESS PACK', 'single_sign_on', 'N', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('b1ebc4fa-4c11-449f-a8ed-51edb21c44fa', 'BUSINESS PACK', 'two_factor_authentication', 'N', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('c81f8a29-fe60-4a64-8468-c5f254354e94', 'BUSINESS PACK', 'live_chat', 'Y', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('45dd3a0a-ebfa-45bb-9d5c-60e311c41936', 'BUSINESS PACK', 'application_pages', 'N', 0, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('663fd6de-fe6c-4010-8d4c-82368be3a277', 'BUSINESS PACK', 'drag_drop_workflow_designer', 'Y', 0, 'workflow_and_automations', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('8696ea5a-30f8-431c-99c9-7642b361a531', 'BUSINESS PACK', 'scheduled_workflow', 'Y', 0, 'workflow_and_automations', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('2897bf02-a814-40e1-95b1-5aba639c2a0b', 'BUSINESS PACK', 'manual_workflow', 'Y', 0, 'workflow_and_automations', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('51010c90-e363-4592-8285-4c0a119b2f2a', 'BUSINESS PACK', 'web_service_workflow', 'Y', 0, 'workflow_and_automations', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('2b073640-3bd7-4a90-ba0f-557c1001d97c', 'BUSINESS PACK', 'api_calls', 'Y', 0, 'workflow_and_automations', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('b42ed76c-ff09-472d-8167-773f94b94fef', 'BUSINESS PACK', 'automations', 'Y', 1000, 'workflow_and_automations', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('aeb89190-53b6-4a71-b912-09280f0b62f8', 'BUSINESS PACK', 'boards', 'Y', 20, 'taskboards', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('318904d2-61e3-45d3-b498-19f332ca3d68', 'BUSINESS PACK', 'columns', 'Y', 0, 'taskboards', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('f551bdb0-d848-4d3d-80ea-6d13f3c50777', 'BUSINESS PACK', 'permission_based_access', 'Y', 0, 'security', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('00a36db2-fd8b-4ef0-aacf-476f9f9b472e', 'BUSINESS PACK', 'encryption_in_transit', 'Y', 0, 'security', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('f3ebebeb-299f-466b-9d80-b069357f3218', 'BUSINESS PACK', 'encryption_at_rest', 'Y', 0, 'security', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('dfec086b-9aa5-4ebd-af77-f7390a10f934', 'BUSINESS PACK', 'storage', 'Y', 10, 'form_page_builder', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('a39e1b7f-96a3-4ead-a954-fca7b5d78bee', 'BUSINESS PACK', 'user_restriction', 'Y', 0, 'security', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('3a57c409-9fa9-4a73-abe8-96ad77eede1d', 'BUSINESS PACK', 'video_support', 'Y', 0, 'support', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('d9b33606-4e7f-4999-bc50-c3c7f3244e28', 'BUSINESS PACK', 'call_support', 'Y', 0, 'support', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('1c1b3e0d-e539-4fd0-aad9-f6f61863bdda', 'BUSINESS PACK', 'chat_support', 'Y', 0, 'support', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('8d847040-3bc6-4bb0-9290-d1fccd2ea43c', 'BUSINESS PACK', 'user_guide', 'Y', 0, 'support', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('f3c1d21d-e5ae-4f4b-bb05-c93024667516', 'BUSINESS PACK', 'dedicated_support', 'N', 0, 'support', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('e6c703c0-7db6-4339-b414-a23933e6c4d6', 'BUSINESS PACK', 'custom_reports', 'Y', 0, 'reports', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('74744b27-afdf-4952-8ee4-41a747a19c6a', 'BUSINESS PACK', 'standard_reports', 'Y', 0, 'reports', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('3d36080f-1944-4170-bb48-1bb7ca6dcf09', 'BUSINESS PACK', 'sms', 'N', 0, 'notifications', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('46f8798f-6634-4151-a8f6-ff8fcfc1a57f', 'BUSINESS PACK', 'email', 'Y', 0, 'notifications', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('e7c9cc33-0c17-44cc-8543-6838b953776f', 'BUSINESS PACK', 'push', 'N', 0, 'notifications', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('6f870099-2385-4e54-b106-067c00a80817', 'BUSINESS PACK', 'custom_notification', 'N', 0, 'notifications', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
INSERT INTO license_validation
(id, plan_name, feature_name, is_allowed, allowed_limit, category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag)
VALUES('6c77eeb8-f68e-450d-8aa5-e50f9c775ccd', 'BUSINESS PACK', 'user_restriction', 'Y', 0, 'taskboards', '${tenantId}', '${customerUserId}', '2021-07-26 16:12:01.000', '${customerUserId}', '2021-07-26 16:12:01.000', 'Y');
