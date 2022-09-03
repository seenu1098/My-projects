-- liquibase formatted sql

-- changeset india:09262021-00001

INSERT INTO yoro_workspace
(workspace_id, workspace_name, workspace_key, secured_workspace_flag, active_flag, created_by, created_on, modified_by, modified_on, tenant_id, workspace_avatar, default_workspace, archive_workspace, managed_workspace)
VALUES('6a6ad5ca-5a59-4165-84fc-675c5c503fdf', 'Default Workspace', 'defaultWorkspace', 'N', 'Y', '${customerUserId}', '2021-09-17 12:23:39.000', '${customerUserId}', '2021-09-17 12:23:39.000', '${tenantId}', '#5445FF', 'Y', 'N', 'Y');


update process_definitions set workspace_id = '6a6ad5ca-5a59-4165-84fc-675c5c503fdf'
 where workspace_id is null;
update taskboard set workspace_id = '6a6ad5ca-5a59-4165-84fc-675c5c503fdf'
 where workspace_id is null;
update page set workspace_id = '6a6ad5ca-5a59-4165-84fc-675c5c503fdf'
 where workspace_id is null;
update application set workspace_id = '6a6ad5ca-5a59-4165-84fc-675c5c503fdf'
 where workspace_id is null;
update users set default_workspace = '6a6ad5ca-5a59-4165-84fc-675c5c503fdf'
 where default_workspace is null;
							
INSERT INTO custom_pages
(id, page_id, "json", application_id, tenant_id, page_name, menu_path, active_flag, page_version, managed_flag)
VALUES('6cea88e6-38df-4caf-afa0-caa60809fcf9', 'app-yoroflow-documents', NULL, NULL, '${tenantId}', 'Documents', 'yorodocs/documents', 'Y', 1, 'N');

INSERT INTO menu_details
(id, active_flag, created_by, created_on, menu_name, menu_path, modified_by, modified_on, page_id, tenant_id, menu_id, parent_menu_id, display_order, custom_page_id, icon, report_id)
VALUES('d5cd49b0-b052-4b1f-8e71-15e4b785ea3d', 'Y', '${customerUserId}', '2021-04-26 19:40:08.000', 'Documents', 'yorodocs/documents', '${customerUserId}', '2021-07-16 17:38:43.258', NULL, '${tenantId}', '4c98b424-ff35-4c27-894d-9fc6d9d49cc4', NULL, 13, '6cea88e6-38df-4caf-afa0-caa60809fcf9', 'note_alt', NULL);


INSERT INTO menu_details_associate_roles
(menu_details_associate_role_id, menu_details_id, role_id, active_flag, created_by, created_on, modified_by, modified_on, tenant_id, menu_id)
VALUES('38ca80f8-61e2-4809-b37c-b1e1963fddcf', 'd5cd49b0-b052-4b1f-8e71-15e4b785ea3d', 'e9b0ca86-4335-413a-9330-6e319af63e66', 'Y', '${customerUserId}', '2020-04-20 20:56:33.000', '${customerUserId}', '2020-04-20 20:56:33.000', '${tenantId}', '4c98b424-ff35-4c27-894d-9fc6d9d49cc4');
INSERT INTO menu_details_associate_roles
(menu_details_associate_role_id, menu_details_id, role_id, active_flag, created_by, created_on, modified_by, modified_on, tenant_id, menu_id)
VALUES('4cf9b9e5-9395-41c3-aed1-9ab0e013612c', 'd5cd49b0-b052-4b1f-8e71-15e4b785ea3d', 'b8640dca-4b51-4951-be35-8072f3f7037e', 'Y', '${customerUserId}', '2020-04-20 20:56:33.000', '${customerUserId}', '2020-04-20 20:56:33.000', '${tenantId}', '4c98b424-ff35-4c27-894d-9fc6d9d49cc4');
INSERT INTO menu_details_associate_roles
(menu_details_associate_role_id, menu_details_id, role_id, active_flag, created_by, created_on, modified_by, modified_on, tenant_id, menu_id)
VALUES('96bc2988-c916-4fe2-9271-4c74a1f85cb9', 'd5cd49b0-b052-4b1f-8e71-15e4b785ea3d', '0af6950d-f073-4553-a557-4a1e59a20f2f', 'Y', '${customerUserId}', '2020-04-20 20:56:33.000', '${customerUserId}', '2020-04-20 20:56:33.000', '${tenantId}', '4c98b424-ff35-4c27-894d-9fc6d9d49cc4');
INSERT INTO menu_details_associate_roles
(menu_details_associate_role_id, menu_details_id, role_id, active_flag, created_by, created_on, modified_by, modified_on, tenant_id, menu_id)
VALUES('11cf557c-f8b7-427e-93b7-ca5efbdbc74b', 'd5cd49b0-b052-4b1f-8e71-15e4b785ea3d', 'aef72506-8ccc-49cc-bdd9-8b62e4fbd4b7', 'Y', '${customerUserId}', '2020-04-20 20:56:33.000', '${customerUserId}', '2020-04-20 20:56:33.000', '${tenantId}', '4c98b424-ff35-4c27-894d-9fc6d9d49cc4');
INSERT INTO menu_details_associate_roles
(menu_details_associate_role_id, menu_details_id, role_id, active_flag, created_by, created_on, modified_by, modified_on, tenant_id, menu_id)
VALUES('8a707008-7e6b-4b1e-9acc-0fa18edf79f1', 'd5cd49b0-b052-4b1f-8e71-15e4b785ea3d', '42d69c59-6da6-415c-9ccc-5213474c1bc6', 'Y', '${customerUserId}', '2020-04-20 20:56:33.000', '${customerUserId}', '2020-04-20 20:56:33.000', '${tenantId}', '4c98b424-ff35-4c27-894d-9fc6d9d49cc4');

UPDATE grids
SET where_clause='a.page_version = (SELECT max(p.page_version) FROM page p WHERE p.page_id = a.page_id) and cast(a.workspace_id as varchar) = ''replaceWorkspaceId'' and a.layout_type != ''applicationPageLayout'' AND cast(a.application_id as varchar) = cast(b.id as varchar) AND a.is_workflow_form = ''true'''
WHERE grid_id='2b4fe657-03f9-406a-b61f-ea010e01af21';

UPDATE grids
SET where_clause='cast(a.workspace_id as varchar) = ''replaceWorkspaceId'' and a.layout_type != ''applicationPageLayout'' AND cast(a.application_id as varchar) = cast(b.id as varchar) AND a.is_workflow_form = ''false'''
WHERE grid_id='4c6aa315-2f45-4003-a18f-f9e9efad23ee';

UPDATE grids
SET where_clause='cast(a.workspace_id as varchar) = ''replaceWorkspaceId'' and a.layout_type = ''applicationPageLayout'' AND cast(a.application_id as varchar) = cast(b.id as varchar)'
WHERE grid_id='5bc12b5a-e127-454a-9c13-bbc807894136';

UPDATE grids
SET where_clause='cast(a.workspace_id as varchar) = ''replaceWorkspaceId'' and cast(a.process_definition_id as varchar) = cast(b.process_definition_id as varchar) AND b.status = ''IN_PROCESS'''
WHERE grid_id='abc5e063-67c4-4bdf-9247-bdd4f60ed73c';

UPDATE grids
SET where_clause='cast(a.workspace_id as varchar) = ''replaceWorkspaceId'' and cast(a.process_definition_id as varchar) = cast(b.process_definition_id as varchar) AND cast(b.process_instance_id as varchar) = cast(c.process_instance_id as varchar) AND c.status = ''ERROR'' AND cast(c.task_id as varchar) = cast(d.task_id as varchar)'
WHERE grid_id='f475f797-9705-4312-a603-88b2e9017e97';


UPDATE menu_details
SET display_order=1
WHERE id='8b87672a-3726-4a72-be97-b06091091aef';
UPDATE menu_details
SET display_order=2
WHERE id='8863d442-22db-4d18-97b8-903492c078ff';
UPDATE menu_details
SET display_order=3
WHERE id='273be1f9-3441-4c87-b3e8-d8614ebb6b25';

DELETE FROM menu_details_associate_roles
WHERE menu_details_associate_role_id='93408e14-f72d-4ebe-9685-346fcdda5451';
DELETE FROM menu_details_associate_roles
WHERE menu_details_associate_role_id='1d798daa-ed33-4804-86b0-2c2799813966';
DELETE FROM menu_details_associate_roles
WHERE menu_details_associate_role_id='b69ee3c5-bdbc-4770-8796-179410048496';
DELETE FROM menu_details_associate_roles
WHERE menu_details_associate_role_id='c399ee77-01f1-4734-a508-ba8c3ef541ef';
DELETE FROM menu_details_associate_roles
WHERE menu_details_associate_role_id='6ff3ab4f-7f3e-4e07-8ff7-fc380c25df26';
DELETE FROM menu_details_associate_roles
WHERE menu_details_associate_role_id='b4138ffc-aab0-4b66-95d0-9ca57959c3eb';
DELETE FROM menu_details_associate_roles
WHERE menu_details_associate_role_id='3818d245-3120-4b68-bcff-f3b967faa4fa';
DELETE FROM menu_details_associate_roles
WHERE menu_details_associate_role_id='115c2623-1e8d-48b8-a68f-8146e6967b5f';
DELETE FROM menu_details_associate_roles
WHERE menu_details_associate_role_id='61b10bf3-698b-43dd-afec-0ef5405f74c4';
DELETE FROM menu_details_associate_roles
WHERE menu_details_associate_role_id='f831a8cd-1b14-419b-be3f-a97817421543';
DELETE FROM menu_details_associate_roles
WHERE menu_details_associate_role_id='f455debd-f731-470a-8c24-856e5feb0635';
DELETE FROM menu_details_associate_roles
WHERE menu_details_associate_role_id='36844541-d73c-462c-8281-8a96f896d04c';
DELETE FROM menu_details_associate_roles
WHERE menu_details_associate_role_id='977d79cc-64cf-49ae-83e2-f75f4f8695d8';

DELETE FROM menu_details
WHERE id='ca72a9a8-eb33-4735-b903-1d1887e5aa9f';
DELETE FROM menu_details
WHERE id='4ec68a6b-f006-4ade-93ed-31d69184648e';
DELETE FROM menu_details
WHERE id='325dfb21-4118-4296-bb65-94b74e14d6f2';
DELETE FROM menu_details
WHERE id='a620c1a4-4ccc-4156-9e40-7f86c1303300';
DELETE FROM menu_details
WHERE id='2e463d60-466a-4574-a005-996c048eb6ea';

