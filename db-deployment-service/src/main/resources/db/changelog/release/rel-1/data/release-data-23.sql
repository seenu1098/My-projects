-- liquibase formatted sql

-- changeset india:01072022-00001


INSERT INTO menu_details
(id, active_flag, created_by, created_on, menu_name, menu_path, modified_by, modified_on, page_id, tenant_id, menu_id, parent_menu_id, display_order, custom_page_id, icon, report_id)
VALUES('f0ce0d7d-3a21-45c1-80ea-4fd889c49ee7', 'Y', '${customerUserId}', '2020-08-26 11:01:10.983', 'Template Center', 'template-center', '${customerUserId}', '2021-07-16 17:38:43.258', NULL, '${tenantId}', '4c98b424-ff35-4c27-894d-9fc6d9d49cc4', NULL, 11, NULL, 'work', NULL);


INSERT INTO menu_details_associate_roles
(menu_details_associate_role_id, menu_details_id, role_id, active_flag, created_by, created_on, modified_by, modified_on, tenant_id, menu_id)
VALUES('6c9e54ec-c8dd-4060-86df-971431da3abc', 'f0ce0d7d-3a21-45c1-80ea-4fd889c49ee7', 'e9b0ca86-4335-413a-9330-6e319af63e66', 'Y', '${customerUserId}', '2020-04-20 20:56:33.000', '${customerUserId}', '2020-04-20 20:56:33.000', '${tenantId}', '4c98b424-ff35-4c27-894d-9fc6d9d49cc4');
INSERT INTO menu_details_associate_roles
(menu_details_associate_role_id, menu_details_id, role_id, active_flag, created_by, created_on, modified_by, modified_on, tenant_id, menu_id)
VALUES('87bc4189-a19d-45a5-a198-8c0a143aafb3', 'f0ce0d7d-3a21-45c1-80ea-4fd889c49ee7', 'b8640dca-4b51-4951-be35-8072f3f7037e', 'Y', '${customerUserId}', '2020-04-20 20:56:33.000', '${customerUserId}', '2020-04-20 20:56:33.000', '${tenantId}', '4c98b424-ff35-4c27-894d-9fc6d9d49cc4');
INSERT INTO menu_details_associate_roles
(menu_details_associate_role_id, menu_details_id, role_id, active_flag, created_by, created_on, modified_by, modified_on, tenant_id, menu_id)
VALUES('9207f13e-d1f8-49f6-b2da-53bf880efc9b', 'f0ce0d7d-3a21-45c1-80ea-4fd889c49ee7', '0af6950d-f073-4553-a557-4a1e59a20f2f', 'Y', '${customerUserId}', '2020-04-20 20:56:33.000', '${customerUserId}', '2020-04-20 20:56:33.000', '${tenantId}', '4c98b424-ff35-4c27-894d-9fc6d9d49cc4');
INSERT INTO menu_details_associate_roles
(menu_details_associate_role_id, menu_details_id, role_id, active_flag, created_by, created_on, modified_by, modified_on, tenant_id, menu_id)
VALUES('82c139f6-7cdc-4241-b842-cf915b972e63', 'f0ce0d7d-3a21-45c1-80ea-4fd889c49ee7', 'aef72506-8ccc-49cc-bdd9-8b62e4fbd4b7', 'Y', '${customerUserId}', '2020-04-20 20:56:33.000', '${customerUserId}', '2020-04-20 20:56:33.000', '${tenantId}', '4c98b424-ff35-4c27-894d-9fc6d9d49cc4');
INSERT INTO menu_details_associate_roles
(menu_details_associate_role_id, menu_details_id, role_id, active_flag, created_by, created_on, modified_by, modified_on, tenant_id, menu_id)
VALUES('83c54b92-908c-44c9-821a-1411b0063c03', 'f0ce0d7d-3a21-45c1-80ea-4fd889c49ee7', '42d69c59-6da6-415c-9ccc-5213474c1bc6', 'Y', '${customerUserId}', '2020-04-20 20:56:33.000', '${customerUserId}', '2020-04-20 20:56:33.000', '${tenantId}', '4c98b424-ff35-4c27-894d-9fc6d9d49cc4');