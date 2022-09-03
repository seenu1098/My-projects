-- liquibase formatted sql

-- changeset india:08062021-00002

INSERT INTO event_automation_config
(id, automation, automation_type, parent_automation_id, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, category, automation_subtype, app_name)
VALUES('882ba337-8f9a-4b89-b7eb-6eb450ae0879', 'update the due date to created date plus enter days', 'due_date_count', 'c165010b-1072-4fca-bacd-76db6cd8924d', '${tenantId}', '${customerUserId}', '2021-05-06 16:12:01.000', '${customerUserId}', '2021-05-06 16:12:01.000', 'Y', NULL, NULL, NULL);

 

INSERT INTO event_automation_categories
(id, category_name, is_featured_category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, automation, app_name)
VALUES('940d6199-41c0-4673-84f6-0a891afc124d', 'Due Date', 'N', '${tenantId}', '${customerUserId}', '2021-05-21 14:42:01.000', '${customerUserId}', '2021-05-21 14:42:01.000', 'Y', 'Whenever a new task is created update the due date to created date plus enter days', NULL);

 

UPDATE event_automation_config
SET automation_type='email_campaign'
WHERE id='b359957c-1b5e-40f7-bb34-78262fce8a46';



