-- liquibase formatted sql

-- changeset india:08172021-00002


INSERT INTO custom_pages
(id, page_id, "json", application_id, tenant_id, page_name, menu_path, active_flag, page_version, managed_flag)
VALUES('007826f0-d457-44a0-9eed-3d867b62e8a8', 'app-taskboard-documents', NULL, NULL, '${tenantId}', 'Files', 'files', 'Y', 1, 'N');


INSERT INTO menu_details
(id, active_flag, created_by, created_on, menu_name, menu_path, modified_by, modified_on, page_id, tenant_id, menu_id, parent_menu_id, display_order, custom_page_id, icon, report_id)
VALUES('ca72a9a8-eb33-4735-b903-1d1887e5aa9f', 'Y', '${customerUserId}', '2021-04-26 19:40:08.000', 'Files', 'files', '${customerUserId}', '2021-07-16 17:38:43.258', NULL, '${tenantId}', '4c98b424-ff35-4c27-894d-9fc6d9d49cc4', NULL, 12, '007826f0-d457-44a0-9eed-3d867b62e8a8', 'description', NULL);


INSERT INTO menu_details_associate_roles
(menu_details_associate_role_id, menu_details_id, role_id, active_flag, created_by, created_on, modified_by, modified_on, tenant_id, menu_id)
VALUES('61b10bf3-698b-43dd-afec-0ef5405f74c4', 'ca72a9a8-eb33-4735-b903-1d1887e5aa9f', 'e9b0ca86-4335-413a-9330-6e319af63e66', 'Y', '${customerUserId}', '2020-04-20 20:56:33.000', '${customerUserId}', '2020-04-20 20:56:33.000', '${tenantId}', '4c98b424-ff35-4c27-894d-9fc6d9d49cc4');
INSERT INTO menu_details_associate_roles
(menu_details_associate_role_id, menu_details_id, role_id, active_flag, created_by, created_on, modified_by, modified_on, tenant_id, menu_id)
VALUES('f831a8cd-1b14-419b-be3f-a97817421543', 'ca72a9a8-eb33-4735-b903-1d1887e5aa9f', 'b8640dca-4b51-4951-be35-8072f3f7037e', 'Y', '${customerUserId}', '2020-04-20 20:56:33.000', '${customerUserId}', '2020-04-20 20:56:33.000', '${tenantId}', '4c98b424-ff35-4c27-894d-9fc6d9d49cc4');
INSERT INTO menu_details_associate_roles
(menu_details_associate_role_id, menu_details_id, role_id, active_flag, created_by, created_on, modified_by, modified_on, tenant_id, menu_id)
VALUES('f455debd-f731-470a-8c24-856e5feb0635', 'ca72a9a8-eb33-4735-b903-1d1887e5aa9f', '0af6950d-f073-4553-a557-4a1e59a20f2f', 'Y', '${customerUserId}', '2020-04-20 20:56:33.000', '${customerUserId}', '2020-04-20 20:56:33.000', '${tenantId}', '4c98b424-ff35-4c27-894d-9fc6d9d49cc4');
INSERT INTO menu_details_associate_roles
(menu_details_associate_role_id, menu_details_id, role_id, active_flag, created_by, created_on, modified_by, modified_on, tenant_id, menu_id)
VALUES('36844541-d73c-462c-8281-8a96f896d04c', 'ca72a9a8-eb33-4735-b903-1d1887e5aa9f', 'aef72506-8ccc-49cc-bdd9-8b62e4fbd4b7', 'Y', '${customerUserId}', '2020-04-20 20:56:33.000', '${customerUserId}', '2020-04-20 20:56:33.000', '${tenantId}', '4c98b424-ff35-4c27-894d-9fc6d9d49cc4');
INSERT INTO menu_details_associate_roles
(menu_details_associate_role_id, menu_details_id, role_id, active_flag, created_by, created_on, modified_by, modified_on, tenant_id, menu_id)
VALUES('977d79cc-64cf-49ae-83e2-f75f4f8695d8', 'ca72a9a8-eb33-4735-b903-1d1887e5aa9f', '42d69c59-6da6-415c-9ccc-5213474c1bc6', 'Y', '${customerUserId}', '2020-04-20 20:56:33.000', '${customerUserId}', '2020-04-20 20:56:33.000', '${tenantId}', '4c98b424-ff35-4c27-894d-9fc6d9d49cc4');
