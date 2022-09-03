-- liquibase formatted sql

-- changeset india:08042021-00001
UPDATE grids
SET where_clause='a.page_version = (SELECT max(p.page_version) FROM page p WHERE p.page_id = a.page_id) and a.layout_type != ''applicationPageLayout'' AND cast(a.application_id as varchar) = cast(b.id as varchar) AND a.is_workflow_form = ''true'''
WHERE grid_id='2b4fe657-03f9-406a-b61f-ea010e01af21';

DELETE FROM grid_columns
WHERE grid_id='2b4fe657-03f9-406a-b61f-ea010e01af21';


INSERT INTO grid_columns
(id, active_flag, column_name, column_sequence_no, created_by, created_on, display_name, field_type, filterable, hidden_value, modified_by, modified_on, object_field_name, sortable, tenant_id, width_percentage, grid_id, date_time_format)
VALUES('7f2723a7-00f4-4bb6-86cc-7d8131ce3251', 'Y', 'a.id', 1, '${customerUserId}', '2019-12-25 15:03:00.000', 'Page #', 'uuid', 'false', 'true', '${customerUserId}', '2019-12-25 15:03:00.000', '', 'false', '${tenantId}', 10, '2b4fe657-03f9-406a-b61f-ea010e01af21', NULL);
INSERT INTO grid_columns
(id, active_flag, column_name, column_sequence_no, created_by, created_on, display_name, field_type, filterable, hidden_value, modified_by, modified_on, object_field_name, sortable, tenant_id, width_percentage, grid_id, date_time_format)
VALUES('66e71f43-bcce-4c23-9001-e7dc110a6aea', 'Y', 'a.page_version', 3, '${customerUserId}', '2020-05-25 17:30:33.972', 'Workflow Form Version', 'long', 'true', 'false', '${customerUserId}', '2020-05-25 17:30:33.972', NULL, 'true', '${tenantId}', 10, '2b4fe657-03f9-406a-b61f-ea010e01af21', NULL);
INSERT INTO grid_columns
(id, active_flag, column_name, column_sequence_no, created_by, created_on, display_name, field_type, filterable, hidden_value, modified_by, modified_on, object_field_name, sortable, tenant_id, width_percentage, grid_id, date_time_format)
VALUES('2483d4d6-94f4-4ca8-874c-d3ef58a36509', 'Y', 'b.app_name', 4, '${customerUserId}', '2020-08-25 16:26:40.759', 'Application Name', 'text', 'true', 'false', '${customerUserId}', '2020-08-25 16:26:40.759', NULL, 'true', '${tenantId}', 10, '2b4fe657-03f9-406a-b61f-ea010e01af21', NULL);
INSERT INTO grid_columns
(id, active_flag, column_name, column_sequence_no, created_by, created_on, display_name, field_type, filterable, hidden_value, modified_by, modified_on, object_field_name, sortable, tenant_id, width_percentage, grid_id, date_time_format)
VALUES('f0053cc5-580f-422d-8c24-e1da0b2cb856', 'Y', 'a.page_name', 2, '${customerUserId}', '2019-12-25 15:03:00.000', 'Workflow Form Name', 'text', 'true', 'false', '${customerUserId}', '2019-12-25 15:03:00.000', '', 'false', '${tenantId}', 10, '2b4fe657-03f9-406a-b61f-ea010e01af21', NULL);
INSERT INTO grid_columns
(id, active_flag, column_name, column_sequence_no, created_by, created_on, display_name, field_type, filterable, hidden_value, modified_by, modified_on, object_field_name, sortable, tenant_id, width_percentage, grid_id, date_time_format)
VALUES('53124d81-c9e2-431f-a98f-fcc26bb64c20', 'Y', 'a.created_by', 5, '${customerUserId}', '2021-08-04 07:46:51.340', 'Created By', 'text', 'true', 'false', '${customerUserId}', '2021-08-04 07:46:51.340', NULL, 'true', '${tenantId}', 10, '2b4fe657-03f9-406a-b61f-ea010e01af21', '');
INSERT INTO grid_columns
(id, active_flag, column_name, column_sequence_no, created_by, created_on, display_name, field_type, filterable, hidden_value, modified_by, modified_on, object_field_name, sortable, tenant_id, width_percentage, grid_id, date_time_format)
VALUES('80d6a061-276a-4f0b-afb5-bbea453dec10', 'Y', 'a.created_on', 6, '${customerUserId}', '2021-08-04 07:46:51.343', 'Created On', 'date', 'true', 'false', '${customerUserId}', '2021-08-04 07:46:51.343', NULL, 'true', '${tenantId}', 10, '2b4fe657-03f9-406a-b61f-ea010e01af21', '');
INSERT INTO grid_columns
(id, active_flag, column_name, column_sequence_no, created_by, created_on, display_name, field_type, filterable, hidden_value, modified_by, modified_on, object_field_name, sortable, tenant_id, width_percentage, grid_id, date_time_format)
VALUES('7f765d9f-6429-4185-85da-03055d097bed', 'Y', 'a.modified_by', 7, '${customerUserId}', '2021-08-04 07:46:51.343', 'Last Modified By', 'text', 'true', 'false', '${customerUserId}', '2021-08-04 07:46:51.343', NULL, 'true', '${tenantId}', 10, '2b4fe657-03f9-406a-b61f-ea010e01af21', '');
INSERT INTO grid_columns
(id, active_flag, column_name, column_sequence_no, created_by, created_on, display_name, field_type, filterable, hidden_value, modified_by, modified_on, object_field_name, sortable, tenant_id, width_percentage, grid_id, date_time_format)
VALUES('72b38e7b-4c58-49f6-b751-03baeca17c1d', 'Y', 'a.modified_on', 8, '${customerUserId}', '2020-05-25 17:39:23.429', 'Last Modified On', 'date', 'true', 'false', '${customerUserId}', '2020-05-25 17:39:23.429', NULL, 'true', '${tenantId}', 10, '2b4fe657-03f9-406a-b61f-ea010e01af21', NULL);

DELETE FROM grid_columns
WHERE grid_id='4c6aa315-2f45-4003-a18f-f9e9efad23ee';

INSERT INTO grid_columns
(id, active_flag, column_name, column_sequence_no, created_by, created_on, display_name, field_type, filterable, hidden_value, modified_by, modified_on, object_field_name, sortable, tenant_id, width_percentage, grid_id, date_time_format)
VALUES('840594d4-31d2-4dbe-9605-b95ef3fe4fc9', 'Y', 'a.id', 1, '${customerUserId}', '2019-12-25 15:03:00.000', 'Page #', 'uuid', 'false', 'true', '${customerUserId}', '2019-12-25 15:03:00.000', '', 'false', '${tenantId}', 10, '4c6aa315-2f45-4003-a18f-f9e9efad23ee', NULL);
INSERT INTO grid_columns
(id, active_flag, column_name, column_sequence_no, created_by, created_on, display_name, field_type, filterable, hidden_value, modified_by, modified_on, object_field_name, sortable, tenant_id, width_percentage, grid_id, date_time_format)
VALUES('6c570ecf-4f84-4802-ae7a-2a1b85dd8993', 'Y', 'b.app_name', 4, '${customerUserId}', '2020-08-25 16:20:53.056', 'Application Name', 'text', 'true', 'false', '${customerUserId}', '2020-08-25 16:20:53.056', NULL, 'true', '${tenantId}', 10, '4c6aa315-2f45-4003-a18f-f9e9efad23ee', NULL);
INSERT INTO grid_columns
(id, active_flag, column_name, column_sequence_no, created_by, created_on, display_name, field_type, filterable, hidden_value, modified_by, modified_on, object_field_name, sortable, tenant_id, width_percentage, grid_id, date_time_format)
VALUES('311e1afe-e422-414b-98cd-c922021395a8', 'Y', 'a.page_name', 2, '${customerUserId}', '2019-12-25 15:03:00.000', 'Page Name', 'text', 'true', 'false', '${customerUserId}', '2019-12-25 15:03:00.000', '', 'false', '${tenantId}', 10, '4c6aa315-2f45-4003-a18f-f9e9efad23ee', NULL);
INSERT INTO grid_columns
(id, active_flag, column_name, column_sequence_no, created_by, created_on, display_name, field_type, filterable, hidden_value, modified_by, modified_on, object_field_name, sortable, tenant_id, width_percentage, grid_id, date_time_format)
VALUES('1a71728d-ca02-4a47-a701-d1a01b91655c', 'Y', 'a.modified_on', 8, '${customerUserId}', '2020-05-29 14:38:11.003', 'Last Modified On', 'date', 'true', 'false', '${customerUserId}', '2020-05-29 14:38:11.003', NULL, 'true', '${tenantId}', 10, '4c6aa315-2f45-4003-a18f-f9e9efad23ee', NULL);
INSERT INTO grid_columns
(id, active_flag, column_name, column_sequence_no, created_by, created_on, display_name, field_type, filterable, hidden_value, modified_by, modified_on, object_field_name, sortable, tenant_id, width_percentage, grid_id, date_time_format)
VALUES('4683d464-f4fc-11eb-9a03-0242ac130003', 'Y', 'a.created_by', 5, '${customerUserId}', '2021-08-04 07:46:51.340', 'Created By', 'text', 'true', 'false', '${customerUserId}', '2021-08-04 07:46:51.340', NULL, 'true', '${tenantId}', 10, '4c6aa315-2f45-4003-a18f-f9e9efad23ee', '');
INSERT INTO grid_columns
(id, active_flag, column_name, column_sequence_no, created_by, created_on, display_name, field_type, filterable, hidden_value, modified_by, modified_on, object_field_name, sortable, tenant_id, width_percentage, grid_id, date_time_format)
VALUES('4683d6bc-f4fc-11eb-9a03-0242ac130003', 'Y', 'a.created_on', 6, '${customerUserId}', '2021-08-04 07:46:51.343', 'Created On', 'date', 'true', 'false', '${customerUserId}', '2021-08-04 07:46:51.343', NULL, 'true', '${tenantId}', 10, '4c6aa315-2f45-4003-a18f-f9e9efad23ee', '');
INSERT INTO grid_columns
(id, active_flag, column_name, column_sequence_no, created_by, created_on, display_name, field_type, filterable, hidden_value, modified_by, modified_on, object_field_name, sortable, tenant_id, width_percentage, grid_id, date_time_format)
VALUES('4683d7b6-f4fc-11eb-9a03-0242ac130003', 'Y', 'a.modified_by', 7, '${customerUserId}', '2021-08-04 07:46:51.343', 'Last Modified By', 'text', 'true', 'false', '${customerUserId}', '2021-08-04 07:46:51.343', NULL, 'true', '${tenantId}', 10, '4c6aa315-2f45-4003-a18f-f9e9efad23ee', '');

