-- liquibase formatted sql

-- changeset india:08202021-00001

INSERT INTO event_automation_config
(id, automation, automation_type, parent_automation_id, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, category, automation_subtype, app_name)
VALUES('39bce332-c0b7-4969-acab-adfa6522e616', 'create a new post ( enter ) in linkedin and share it', 'app_notification', '975fdcad-5359-4764-a4a4-f3005ec991e1', '${tenantId}', '${customerUserId}', '2021-05-06 16:12:01.000', '${customerUserId}', '2021-05-06 16:12:01.000', 'Y', NULL, NULL, 'LinkedIn');

INSERT INTO event_automation_config
(id, automation, automation_type, parent_automation_id, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, category, automation_subtype, app_name)
VALUES('9c7f248f-e12c-440c-8ada-77827f119abc', 'create a new post ( enter ) in twitter and share it', 'app_notification', '975fdcad-5359-4764-a4a4-f3005ec991e1', '${tenantId}', '${customerUserId}', '2021-05-06 16:12:01.000', '${customerUserId}', '2021-05-06 16:12:01.000', 'Y', NULL, NULL, 'Twitter');

INSERT INTO event_automation_config
(id, automation, automation_type, parent_automation_id, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, category, automation_subtype, app_name)
VALUES('f8de14a3-d804-4af5-aa04-f796b0a86624', 'notify someone in microsoft outlook with the message of something', 'app_notification', '975fdcad-5359-4764-a4a4-f3005ec991e1', '${tenantId}', '${customerUserId}', '2021-05-06 16:12:01.000', '${customerUserId}', '2021-05-06 16:12:01.000', 'Y', NULL, NULL, 'Outlook');

INSERT INTO event_automation_config
(id, automation, automation_type, parent_automation_id, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, category, automation_subtype, app_name)
VALUES('bcb1757a-6efa-4156-b973-b4538f093342', 'notify in microsoft teams with this channel choose with the message of something', 'app_notification', '975fdcad-5359-4764-a4a4-f3005ec991e1', '${tenantId}', '${customerUserId}', '2021-05-06 16:12:01.000', '${customerUserId}', '2021-05-06 16:12:01.000', 'Y', NULL, NULL, 'Microsoft Teams');

INSERT INTO event_automation_config
(id, automation, automation_type, parent_automation_id, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, category, automation_subtype, app_name)
VALUES('daaf31eb-2c59-4b4c-b880-3bfa4c9f03ee', 'notify in slack with this channel choose with the message of something', 'app_notification', '975fdcad-5359-4764-a4a4-f3005ec991e1', '${tenantId}', '${customerUserId}', '2021-05-06 16:12:01.000', '${customerUserId}', '2021-05-06 16:12:01.000', 'Y', NULL, NULL, 'Slack');


INSERT INTO event_automation_config
(id, automation, automation_type, parent_automation_id, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, category, automation_subtype, app_name)
VALUES('34e8f199-8f0f-472b-b202-258481d0661e', 'create a new post ( enter ) in linkedin and share it', 'app_notification', '3347be5b-58a4-4f4a-8c62-7a2eae788aa2', '${tenantId}', '${customerUserId}', '2021-05-06 16:12:01.000', '${customerUserId}', '2021-05-06 16:12:01.000', 'Y', NULL, NULL, 'LinkedIn');

INSERT INTO event_automation_config
(id, automation, automation_type, parent_automation_id, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, category, automation_subtype, app_name)
VALUES('30812db8-afea-4da0-bb38-96f1b1266e03', 'create a new post ( enter ) in twitter and share it', 'app_notification', '3347be5b-58a4-4f4a-8c62-7a2eae788aa2', '${tenantId}', '${customerUserId}', '2021-05-06 16:12:01.000', '${customerUserId}', '2021-05-06 16:12:01.000', 'Y', NULL, NULL, 'Twitter');

INSERT INTO event_automation_config
(id, automation, automation_type, parent_automation_id, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, category, automation_subtype, app_name)
VALUES('29a2c9a0-9a3c-4bd1-b688-6515e0bf3024', 'notify someone in microsoft outlook with the message of something', 'app_notification', '3347be5b-58a4-4f4a-8c62-7a2eae788aa2', '${tenantId}', '${customerUserId}', '2021-05-06 16:12:01.000', '${customerUserId}', '2021-05-06 16:12:01.000', 'Y', NULL, NULL, 'Outlook');

INSERT INTO event_automation_config
(id, automation, automation_type, parent_automation_id, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, category, automation_subtype, app_name)
VALUES('572b71cb-6206-45f9-a97e-32f97f8c711c', 'notify in microsoft teams with this channel choose with the message of something', 'app_notification', '3347be5b-58a4-4f4a-8c62-7a2eae788aa2', '${tenantId}', '${customerUserId}', '2021-05-06 16:12:01.000', '${customerUserId}', '2021-05-06 16:12:01.000', 'Y', NULL, NULL, 'Microsoft Teams');

INSERT INTO event_automation_config
(id, automation, automation_type, parent_automation_id, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, category, automation_subtype, app_name)
VALUES('8abb75d5-abda-46e3-bb0e-e77fec2280bb', 'notify in slack with this channel choose with the message of something', 'app_notification', '3347be5b-58a4-4f4a-8c62-7a2eae788aa2', '${tenantId}', '${customerUserId}', '2021-05-06 16:12:01.000', '${customerUserId}', '2021-05-06 16:12:01.000', 'Y', NULL, NULL, 'Slack');


INSERT INTO event_automation_config
(id, automation, automation_type, parent_automation_id, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, category, automation_subtype, app_name)
VALUES('ce165906-ce54-4a5c-adb5-8c761bb1aa24', 'create a new post ( enter ) in linkedin and share it', 'app_notification', 'e244533b-b281-498b-8ba4-cfda8e0bb404', '${tenantId}', '${customerUserId}', '2021-05-06 16:12:01.000', '${customerUserId}', '2021-05-06 16:12:01.000', 'Y', NULL, NULL, 'LinkedIn');

INSERT INTO event_automation_config
(id, automation, automation_type, parent_automation_id, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, category, automation_subtype, app_name)
VALUES('5b4695ce-273f-4ffd-bb02-7bff6b355c8c', 'create a new post ( enter ) in twitter and share it', 'app_notification', 'e244533b-b281-498b-8ba4-cfda8e0bb404', '${tenantId}', '${customerUserId}', '2021-05-06 16:12:01.000', '${customerUserId}', '2021-05-06 16:12:01.000', 'Y', NULL, NULL, 'Twitter');

INSERT INTO event_automation_config
(id, automation, automation_type, parent_automation_id, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, category, automation_subtype, app_name)
VALUES('0ac27489-92f5-4fb0-a11a-e289fa672d88', 'notify someone in microsoft outlook with the message of something', 'app_notification', 'e244533b-b281-498b-8ba4-cfda8e0bb404', '${tenantId}', '${customerUserId}', '2021-05-06 16:12:01.000', '${customerUserId}', '2021-05-06 16:12:01.000', 'Y', NULL, NULL, 'Outlook');

INSERT INTO event_automation_config
(id, automation, automation_type, parent_automation_id, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, category, automation_subtype, app_name)
VALUES('7456e53d-aa75-48a8-8962-baaa42a86820', 'notify in microsoft teams with this channel choose with the message of something', 'app_notification', 'e244533b-b281-498b-8ba4-cfda8e0bb404', '${tenantId}', '${customerUserId}', '2021-05-06 16:12:01.000', '${customerUserId}', '2021-05-06 16:12:01.000', 'Y', NULL, NULL, 'Microsoft Teams');

INSERT INTO event_automation_config
(id, automation, automation_type, parent_automation_id, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, category, automation_subtype, app_name)
VALUES('8457c005-1526-48d5-a095-8aaccfdc2265', 'notify in slack with this channel choose with the message of something', 'app_notification', 'e244533b-b281-498b-8ba4-cfda8e0bb404', '${tenantId}', '${customerUserId}', '2021-05-06 16:12:01.000', '${customerUserId}', '2021-05-06 16:12:01.000', 'Y', NULL, NULL, 'Slack');


INSERT INTO event_automation_config
(id, automation, automation_type, parent_automation_id, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, category, automation_subtype, app_name)
VALUES('a8bad693-b78e-4e0d-9e8d-9e9706b42124', 'create a new post ( enter ) in linkedin and share it', 'app_notification', 'a3d97844-6cf2-41d2-a199-580fca690265', '${tenantId}', '${customerUserId}', '2021-05-06 16:12:01.000', '${customerUserId}', '2021-05-06 16:12:01.000', 'Y', NULL, NULL, 'LinkedIn');

INSERT INTO event_automation_config
(id, automation, automation_type, parent_automation_id, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, category, automation_subtype, app_name)
VALUES('3e1652c7-08ae-4fc5-be86-2faee7a58fea', 'create a new post ( enter ) in twitter and share it', 'app_notification', 'a3d97844-6cf2-41d2-a199-580fca690265', '${tenantId}', '${customerUserId}', '2021-05-06 16:12:01.000', '${customerUserId}', '2021-05-06 16:12:01.000', 'Y', NULL, NULL, 'Twitter');

INSERT INTO event_automation_config
(id, automation, automation_type, parent_automation_id, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, category, automation_subtype, app_name)
VALUES('1daf787b-21e5-4e4d-97bd-33331d67fcd4', 'notify someone in microsoft outlook with the message of something', 'app_notification', 'a3d97844-6cf2-41d2-a199-580fca690265', '${tenantId}', '${customerUserId}', '2021-05-06 16:12:01.000', '${customerUserId}', '2021-05-06 16:12:01.000', 'Y', NULL, NULL, 'Outlook');

INSERT INTO event_automation_config
(id, automation, automation_type, parent_automation_id, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, category, automation_subtype, app_name)
VALUES('b8b31149-72d0-4dd8-85b4-54998a213e70', 'notify in microsoft teams with this channel choose with the message of something', 'app_notification', 'a3d97844-6cf2-41d2-a199-580fca690265', '${tenantId}', '${customerUserId}', '2021-05-06 16:12:01.000', '${customerUserId}', '2021-05-06 16:12:01.000', 'Y', NULL, NULL, 'Microsoft Teams');

INSERT INTO event_automation_config
(id, automation, automation_type, parent_automation_id, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, category, automation_subtype, app_name)
VALUES('fa3f1f08-488f-4cf4-81de-cc019580e72e', 'notify in slack with this channel choose with the message of something', 'app_notification', 'a3d97844-6cf2-41d2-a199-580fca690265', '${tenantId}', '${customerUserId}', '2021-05-06 16:12:01.000', '${customerUserId}', '2021-05-06 16:12:01.000', 'Y', NULL, NULL, 'Slack');


DELETE FROM event_automation_categories
WHERE id='3aa0aa2d-2531-4793-86bf-200e77815802';

INSERT INTO event_automation_categories
(id, category_name, is_featured_category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, automation, app_name)
VALUES('2b3fd025-0efb-4f70-b95e-6975a824a240', 'Status Change', 'N', '${tenantId}', '${customerUserId}', '2021-05-21 14:42:01.000', '${customerUserId}', '2021-05-21 14:42:01.000', 'Y', 'Whenever a status changes to choose status create a new post ( enter ) in linkedin and share it', 'LinkedIn');

INSERT INTO event_automation_categories
(id, category_name, is_featured_category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, automation, app_name)
VALUES('f50be71d-4d2f-4dba-b1e2-a8be921c3450', 'Status Change', 'N', '${tenantId}', '${customerUserId}', '2021-05-21 14:42:01.000', '${customerUserId}', '2021-05-21 14:42:01.000', 'Y', 'Whenever a status changes to choose status create a new post ( enter ) in twitter and share it', 'Twitter');

INSERT INTO event_automation_categories
(id, category_name, is_featured_category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, automation, app_name)
VALUES('ded6d579-9c60-4f51-81a3-56edbe5d060a', 'Status Change', 'N', '${tenantId}', '${customerUserId}', '2021-05-21 14:42:01.000', '${customerUserId}', '2021-05-21 14:42:01.000', 'Y', 'Whenever a status changes to choose status notify someone in microsoft outlook with the message of something', 'Outlook');

INSERT INTO event_automation_categories
(id, category_name, is_featured_category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, automation, app_name)
VALUES('10f2ea62-6e8b-4e95-a596-988f3f5d5eac', 'Status Change', 'N', '${tenantId}', '${customerUserId}', '2021-05-21 14:42:01.000', '${customerUserId}', '2021-05-21 14:42:01.000', 'Y', 'Whenever a status changes to choose status notify in microsoft teams with this channel choose with the message of something', 'Microsoft Teams');

INSERT INTO event_automation_categories
(id, category_name, is_featured_category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, automation, app_name)
VALUES('016c44aa-68bd-4903-9db4-abf1cb86b054', 'Status Change', 'N', '${tenantId}', '${customerUserId}', '2021-05-21 14:42:01.000', '${customerUserId}', '2021-05-21 14:42:01.000', 'Y', 'Whenever a status changes to choose status notify in slack with this channel choose with the message of something', 'Slack');


INSERT INTO event_automation_categories
(id, category_name, is_featured_category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, automation, app_name)
VALUES('a63e4fdb-521f-43ca-81a2-af261c79fe0e', 'Recurring', 'N', '${tenantId}', '${customerUserId}', '2021-05-21 14:42:01.000', '${customerUserId}', '2021-05-21 14:42:01.000', 'Y', 'Starting from date every time period, create a new post ( enter ) in linkedin and share it', 'LinkedIn');

INSERT INTO event_automation_categories
(id, category_name, is_featured_category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, automation, app_name)
VALUES('858166b1-779d-44cb-8fed-6cdccc9a61e1', 'Recurring', 'N', '${tenantId}', '${customerUserId}', '2021-05-21 14:42:01.000', '${customerUserId}', '2021-05-21 14:42:01.000', 'Y', 'Starting from date every time period, create a new post ( enter ) in twitter and share it', 'Twitter');

INSERT INTO event_automation_categories
(id, category_name, is_featured_category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, automation, app_name)
VALUES('02c36332-7fcc-4540-bbef-f9641e7ca9b6', 'Recurring', 'N', '${tenantId}', '${customerUserId}', '2021-05-21 14:42:01.000', '${customerUserId}', '2021-05-21 14:42:01.000', 'Y', 'Starting from date every time period, notify someone in microsoft outlook with the message of something', 'Outlook');

INSERT INTO event_automation_categories
(id, category_name, is_featured_category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, automation, app_name)
VALUES('fffa6678-d569-42da-ab8e-df08dd49c68f', 'Recurring', 'N', '${tenantId}', '${customerUserId}', '2021-05-21 14:42:01.000', '${customerUserId}', '2021-05-21 14:42:01.000', 'Y', 'Starting from date every time period, notify in microsoft teams with this channel choose with the message of something', 'Microsoft Teams');

INSERT INTO event_automation_categories
(id, category_name, is_featured_category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, automation, app_name)
VALUES('10d1d3ee-744c-44c5-84ac-807726763900', 'Recurring', 'N', '${tenantId}', '${customerUserId}', '2021-05-21 14:42:01.000', '${customerUserId}', '2021-05-21 14:42:01.000', 'Y', 'Starting from date every time period, notify in slack with this channel choose with the message of something', 'Slack');


INSERT INTO event_automation_categories
(id, category_name, is_featured_category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, automation, app_name)
VALUES('a2f1fdf2-5d3e-4946-a0ff-e4bc56088d16', 'Due Date', 'N', '${tenantId}', '${customerUserId}', '2021-05-21 14:42:01.000', '${customerUserId}', '2021-05-21 14:42:01.000', 'Y', 'Whenever a due date arrives create a new post ( enter ) in linkedin and share it', 'LinkedIn');

INSERT INTO event_automation_categories
(id, category_name, is_featured_category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, automation, app_name)
VALUES('8024e5cd-e99d-49b8-8f0c-9b36e7feff42', 'Due Date', 'N', '${tenantId}', '${customerUserId}', '2021-05-21 14:42:01.000', '${customerUserId}', '2021-05-21 14:42:01.000', 'Y', 'Whenever a due date arrives create a new post ( enter ) in twitter and share it', 'Twitter');

INSERT INTO event_automation_categories
(id, category_name, is_featured_category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, automation, app_name)
VALUES('cdd34c10-b471-4944-b779-0e1305af54db', 'Due Date', 'N', '${tenantId}', '${customerUserId}', '2021-05-21 14:42:01.000', '${customerUserId}', '2021-05-21 14:42:01.000', 'Y', 'Whenever a due date arrives notify someone in microsoft outlook with the message of something', 'Outlook');

INSERT INTO event_automation_categories
(id, category_name, is_featured_category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, automation, app_name)
VALUES('53c9607a-b09e-43fc-aa70-a9d094d445ab', 'Due Date', 'N', '${tenantId}', '${customerUserId}', '2021-05-21 14:42:01.000', '${customerUserId}', '2021-05-21 14:42:01.000', 'Y', 'Whenever a due date arrives notify in microsoft teams with this channel choose with the message of something', 'Microsoft Teams');

INSERT INTO event_automation_categories
(id, category_name, is_featured_category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, automation, app_name)
VALUES('0ea41a19-8911-4d14-a5f4-d2d18430062f', 'Due Date', 'N', '${tenantId}', '${customerUserId}', '2021-05-21 14:42:01.000', '${customerUserId}', '2021-05-21 14:42:01.000', 'Y', 'Whenever a due date arrives notify in slack with this channel choose with the message of something', 'Slack');


INSERT INTO event_automation_categories
(id, category_name, is_featured_category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, automation, app_name)
VALUES('20ed661e-fe46-4cf1-ae23-56d441a92909', 'Subtask Status', 'N', '${tenantId}', '${customerUserId}', '2021-05-21 14:42:01.000', '${customerUserId}', '2021-05-21 14:42:01.000', 'Y', 'Whenever all the subtasks status of choose subtask status create a new post ( enter ) in linkedin and share it', 'LinkedIn');

INSERT INTO event_automation_categories
(id, category_name, is_featured_category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, automation, app_name)
VALUES('67497049-9043-458e-89a8-5d43d7ffba1a', 'Subtask Status', 'N', '${tenantId}', '${customerUserId}', '2021-05-21 14:42:01.000', '${customerUserId}', '2021-05-21 14:42:01.000', 'Y', 'Whenever all the subtasks status of choose subtask status create a new post ( enter ) in twitter and share it', 'Twitter');

INSERT INTO event_automation_categories
(id, category_name, is_featured_category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, automation, app_name)
VALUES('eef6e680-172e-4302-afaf-fa3fff177f76', 'Subtask Status', 'N', '${tenantId}', '${customerUserId}', '2021-05-21 14:42:01.000', '${customerUserId}', '2021-05-21 14:42:01.000', 'Y', 'Whenever all the subtasks status of choose subtask status notify someone in microsoft outlook with the message of something', 'Outlook');

INSERT INTO event_automation_categories
(id, category_name, is_featured_category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, automation, app_name)
VALUES('232c6358-d7c9-4bee-ae8e-d916f20c3545', 'Subtask Status', 'N', '${tenantId}', '${customerUserId}', '2021-05-21 14:42:01.000', '${customerUserId}', '2021-05-21 14:42:01.000', 'Y', 'Whenever all the subtasks status of choose subtask status notify in microsoft teams with this channel choose with the message of something', 'Microsoft Teams');

INSERT INTO event_automation_categories
(id, category_name, is_featured_category, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, automation, app_name)
VALUES('b15ff117-169d-4c3c-9b04-567ac69b2b94', 'Subtask Status', 'N', '${tenantId}', '${customerUserId}', '2021-05-21 14:42:01.000', '${customerUserId}', '2021-05-21 14:42:01.000', 'Y', 'Whenever all the subtasks status of choose subtask status notify in slack with this channel choose with the message of something', 'Slack');
