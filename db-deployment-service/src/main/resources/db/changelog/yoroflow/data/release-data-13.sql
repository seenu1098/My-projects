-- liquibase formatted sql

-- changeset india:12032021-00001

UPDATE event_automation_config
SET automation='a status changes to choose and field value changes to something'
WHERE id='4e96fa97-b07c-4a5b-b8a8-8cb6a4c13dd8';

INSERT INTO event_automation_config
(id, automation, automation_type, parent_automation_id, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, category, automation_subtype, app_name)
VALUES('7cce5205-63b5-44a5-98ed-17cb5061d2ee', 'then change the task status to', 'status', '4e96fa97-b07c-4a5b-b8a8-8cb6a4c13dd8', '${tenantId}', '${customerUserId}', '2021-05-06 16:12:01.000', '${customerUserId}', '2021-05-06 16:12:01.000', 'Y', NULL, NULL, NULL);

INSERT INTO event_automation_config
(id, automation, automation_type, parent_automation_id, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, category, automation_subtype, app_name)
VALUES('eccd814a-5dfa-49e0-92b6-1b5ba35f1faa', 'assigned to', 'assigned', '4e96fa97-b07c-4a5b-b8a8-8cb6a4c13dd8', '${tenantId}', '${customerUserId}', '2021-05-06 16:12:01.000', '${customerUserId}', '2021-05-06 16:12:01.000', 'Y', NULL, NULL, NULL);


INSERT INTO event_automation_categories
(id, category_name, is_featured_category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, automation, app_name)
VALUES('5593615d-c152-456b-9cf6-fefeeab793b5', 'Status Change', 'N', '${tenantId}', '${customerUserId}', '2021-05-21 14:42:01.000', '${customerUserId}', '2021-05-21 14:42:01.000', 'Y', 'Whenever a status changes to choose and field value changes to something then change the task status to', NULL);

INSERT INTO event_automation_categories
(id, category_name, is_featured_category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, automation, app_name)
VALUES('4bc1cffa-e4b4-4c9b-8267-995f6103843a', 'Notification', 'N', '${tenantId}', '${customerUserId}', '2021-05-21 14:42:01.000', '${customerUserId}', '2021-05-21 14:42:01.000', 'Y', 'Whenever a status changes to choose and field value changes to something assigned to', NULL);

INSERT INTO event_automation_categories
(id, category_name, is_featured_category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, automation, app_name)
VALUES('56d534ac-57e2-41e2-907b-a99a526607b3', 'Notification', 'N', '${tenantId}', '${customerUserId}', '2021-05-21 14:42:01.000', '${customerUserId}', '2021-05-21 14:42:01.000', 'Y', 'Whenever a status changes to choose and field value changes to something notify someone with the message of something', NULL);