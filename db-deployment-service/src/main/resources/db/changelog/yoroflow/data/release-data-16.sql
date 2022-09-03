-- liquibase formatted sql

-- changeset india:12272021-00001

INSERT INTO event_automation_config
(id, automation, automation_type, parent_automation_id, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, category, automation_subtype, app_name)
VALUES('7aa98f72-6099-454e-99d1-ce7a92a7910a', 'update an entry in table of something', 'data_table', '975fdcad-5359-4764-a4a4-f3005ec991e1', '${tenantId}', '${customerUserId}', '2021-05-06 16:12:01.000', '${customerUserId}', '2021-05-06 16:12:01.000', 'Y', NULL, 'update', NULL);

INSERT INTO event_automation_config
(id, automation, automation_type, parent_automation_id, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, category, automation_subtype, app_name)
VALUES('48fc76ef-c478-45d3-b4ae-cfc6b98cb97a', 'create a new entry in table of something', 'data_table', '975fdcad-5359-4764-a4a4-f3005ec991e1', '${tenantId}', '${customerUserId}', '2021-05-06 16:12:01.000', '${customerUserId}', '2021-05-06 16:12:01.000', 'Y', NULL, 'insert', NULL);

INSERT INTO event_automation_config
(id, automation, automation_type, parent_automation_id, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, category, automation_subtype, app_name)
VALUES('c35786ca-c0c4-4b03-92ad-370a2cd75cbf', 'delete an entry in table of something', 'data_table', '975fdcad-5359-4764-a4a4-f3005ec991e1', '${tenantId}', '${customerUserId}', '2021-05-06 16:12:01.000', '${customerUserId}', '2021-05-06 16:12:01.000', 'Y', NULL, 'delete', NULL);

INSERT INTO event_automation_config
(id, automation, automation_type, parent_automation_id, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, category, automation_subtype, app_name)
VALUES('91b4d3f6-2d7b-41bb-b5e8-a27024377526', 'create a new task in', 'new task', 'f647341c-1fa2-4507-bd39-2d01ac1a3096', '${tenantId}', '${customerUserId}', '2021-05-06 16:12:01.000', '${customerUserId}', '2021-05-06 16:12:01.000', 'Y', NULL, NULL, NULL);


INSERT INTO event_automation_categories
(id, category_name, is_featured_category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, automation, app_name)
VALUES('3dbb8891-b049-447b-a379-e4cc92b20fd2', 'Label', 'N', '${tenantId}', '${customerUserId}', '2021-05-21 14:42:01.000', '${customerUserId}', '2021-05-21 14:42:01.000', 'Y', 'Whenever a label is associated to a task, create a new task in', NULL);

INSERT INTO event_automation_categories
(id, category_name, is_featured_category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, automation, app_name)
VALUES('1af43e27-f918-441b-9243-1441605b7711', 'Status Change', 'N', '${tenantId}', '${customerUserId}', '2021-05-21 14:42:01.000', '${customerUserId}', '2021-05-21 14:42:01.000', 'Y', 'Whenever a status changes to choose status create a new entry in table of something', NULL);

INSERT INTO event_automation_categories
(id, category_name, is_featured_category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, automation, app_name)
VALUES('c90770f1-249d-484f-850a-a15c4b81023b', 'Status Change', 'N', '${tenantId}', '${customerUserId}', '2021-05-21 14:42:01.000', '${customerUserId}', '2021-05-21 14:42:01.000', 'Y', 'Whenever a status changes to choose status delete an entry in table of something', NULL);

INSERT INTO event_automation_categories
(id, category_name, is_featured_category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, automation, app_name)
VALUES('8ca60122-d869-49dd-82e5-5742deef916f', 'Status Change', 'N', '${tenantId}', '${customerUserId}', '2021-05-21 14:42:01.000', '${customerUserId}', '2021-05-21 14:42:01.000', 'Y', 'Whenever a status changes to choose status update an entry in table of something', NULL);

UPDATE menu_details
	SET menu_name='Manage Organization'
	WHERE id='359d1cec-0622-470e-a24b-2af75b6f4755';
	