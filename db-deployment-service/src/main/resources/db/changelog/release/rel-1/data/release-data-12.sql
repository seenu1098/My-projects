-- liquibase formatted sql

-- changeset india:10252021-00001

update notifications set active_flag='Y' where active_flag is null;

update users set default_language='en' where default_language is null;
update users set additional_settings='{"fontSize":"12"}' where additional_settings is null;
update users set color='#1b5e20' where color is null;

update yoro_groups set color='#40bc86' where color is null;

UPDATE yoro_workspace SET workspace_unique_key = concat(SUBSTRING(workspace_key, 1, 2), 
SUBSTRING(workspace_key, length(workspace_key) - 2, length(workspace_key)))
where workspace_unique_key is null;

UPDATE menu_details
SET active_flag='N'
WHERE id='6d6899cb-de37-4840-85d7-696791d342a5';

UPDATE email_template
SET template_data='<p>Hello, </p><p>There is a new task <strong>{{taskname}}</strong> assigned to you on the workflow <strong>{{workflow}}</strong>.You can view the task at <a href="https://{{subdomain}}/en/{{workspaceKey}}/mytask/my-pending-task/{{taskId}}">{{taskname}}</a>.</p><p><br></p><p>Thanks,</p><p>Yoroflow</p>'
WHERE id='c00b09ae-493c-4980-aa3b-f1dc2fc15175';

UPDATE email_template
SET template_data='<p>Hello,</p><p>Change has been requested for <strong>{{taskname}}</strong> on the workflow <strong>{{workflow}}</strong> with comment <strong>{{comment}}</strong>.  You can view the task at <a href="https://{{subdomain}}/en/{{workspaceKey}}/mytask/my-pending-task/{{taskId}}">{{taskname}}</a>.</p><p><br></p><p>Thanks,</p><p>Yoroflow</p>'
WHERE id='50e99b33-04e6-4dc9-ad4a-7139e84fc8b2';

UPDATE email_template
set template_id='task_comment_mention', template_data='<p>Hello, &lt;br /&gt;You are mentioned task comments in &lt;b&gt;{{taskname}}&lt;/b&gt; on the taskboard &lt;b&gt;{{taskboardname}}&lt;/b&gt;. Your can view the task at &lt;a href="https://{{subdomain}}/en/{{workspaceKey}}/taskboard/{{taskboardkey}}/{{taskkey}}"&gt;{{taskkey}}&lt;/a&gt;. &lt;br /&gt;&lt;br /&gt;Thanks,&lt;br/&gt;Yoroflow</p>'
WHERE id='0ca90c2b-b6ba-4484-a431-f398829bfee8';

UPDATE email_template
SET template_data='<p>Hello, </p><p>There is a new task {{taskname}} assigned to you on the taskboard {{taskboardname}}. You can view the task at <a href="https://{{subdomain}}/en/{{workspaceKey}}/taskboard/{{taskboardkey}}/{{taskkey}}" rel="noopener noreferrer" target="_blank">{{taskkey}}</a>. </p><p><br></p><p>Thanks,</p><p>Yoroflow</p>'
WHERE id='ab98c1a0-953b-4e06-a1c9-8bd5d3d5442d';


INSERT INTO custom_pages
(id, page_id, "json", application_id, tenant_id, page_name, menu_path, active_flag, page_version, managed_flag)
VALUES('4b387848-33af-4a16-bda5-ec1a60596fab', 'app-workspace-dashboard', NULL, NULL, '${tenantId}', 'Workspace Dashboard', 'workspace-dashboard', 'Y', 1, 'N');


INSERT INTO custom_page_permissions
(id, active_flag, create_allowed, created_by, created_on, delete_allowed, modified_by, modified_on, read_allowed, tenant_id, update_allowed, custom_page_id, group_id)
VALUES('c4394ad1-3bff-4b33-8427-328ca79b8acb', 'Y', 'Y', '${customerUserId}', '2021-10-30 15:24:58.968', 'Y', '${customerUserId}', '2021-10-30 15:24:58.968', 'Y', '${tenantId}', 'Y', '4b387848-33af-4a16-bda5-ec1a60596fab', '040e0ad6-e4c2-475f-a8d2-9e4c2505ae5b');


INSERT INTO menu_details
(id, active_flag, created_by, created_on, menu_name, menu_path, modified_by, modified_on, page_id, tenant_id, menu_id, parent_menu_id, display_order, custom_page_id, icon, report_id)
VALUES('9a505ed9-7455-475c-adbd-5b1e64298a2a', 'Y', '${customerUserId}', '2021-07-14 16:45:00.569', 'Dashboard', 'workspace-dashboard', '${customerUserId}', '2021-07-14 16:44:52.126', NULL, '${tenantId}', '4c98b424-ff35-4c27-894d-9fc6d9d49cc4', NULL, 14, '4b387848-33af-4a16-bda5-ec1a60596fab', 'widgets', NULL);


INSERT INTO menu_details_associate_roles
(menu_details_associate_role_id, menu_details_id, role_id, active_flag, created_by, created_on, modified_by, modified_on, tenant_id, menu_id)
VALUES('8b259a8d-cc66-48ac-b978-532fe6711941', '9a505ed9-7455-475c-adbd-5b1e64298a2a', 'e9b0ca86-4335-413a-9330-6e319af63e66', 'Y', '${customerUserId}', '2020-04-20 20:56:33.000', '${customerUserId}', '2020-04-20 20:56:33.000', '${tenantId}', '4c98b424-ff35-4c27-894d-9fc6d9d49cc4');
INSERT INTO menu_details_associate_roles
(menu_details_associate_role_id, menu_details_id, role_id, active_flag, created_by, created_on, modified_by, modified_on, tenant_id, menu_id)
VALUES('8086b847-f8bc-4343-97b4-559ed292cfec', '9a505ed9-7455-475c-adbd-5b1e64298a2a', 'b8640dca-4b51-4951-be35-8072f3f7037e', 'Y', '${customerUserId}', '2020-04-20 20:56:33.000', '${customerUserId}', '2020-04-20 20:56:33.000', '${tenantId}', '4c98b424-ff35-4c27-894d-9fc6d9d49cc4');
INSERT INTO menu_details_associate_roles
(menu_details_associate_role_id, menu_details_id, role_id, active_flag, created_by, created_on, modified_by, modified_on, tenant_id, menu_id)
VALUES('7cdf1c03-26bd-4031-97bc-3b523d9e6bf3', '9a505ed9-7455-475c-adbd-5b1e64298a2a', '0af6950d-f073-4553-a557-4a1e59a20f2f', 'Y', '${customerUserId}', '2020-04-20 20:56:33.000', '${customerUserId}', '2020-04-20 20:56:33.000', '${tenantId}', '4c98b424-ff35-4c27-894d-9fc6d9d49cc4');
INSERT INTO menu_details_associate_roles
(menu_details_associate_role_id, menu_details_id, role_id, active_flag, created_by, created_on, modified_by, modified_on, tenant_id, menu_id)
VALUES('8cbc866f-09f7-4dc4-9e01-99f66e5657a4', '9a505ed9-7455-475c-adbd-5b1e64298a2a', 'aef72506-8ccc-49cc-bdd9-8b62e4fbd4b7', 'Y', '${customerUserId}', '2020-04-20 20:56:33.000', '${customerUserId}', '2020-04-20 20:56:33.000', '${tenantId}', '4c98b424-ff35-4c27-894d-9fc6d9d49cc4');
INSERT INTO menu_details_associate_roles
(menu_details_associate_role_id, menu_details_id, role_id, active_flag, created_by, created_on, modified_by, modified_on, tenant_id, menu_id)
VALUES('74aea8d6-cabb-4a0f-ba70-91fdc324e767', '9a505ed9-7455-475c-adbd-5b1e64298a2a', '42d69c59-6da6-415c-9ccc-5213474c1bc6', 'Y', '${customerUserId}', '2020-04-20 20:56:33.000', '${customerUserId}', '2020-04-20 20:56:33.000', '${tenantId}', '4c98b424-ff35-4c27-894d-9fc6d9d49cc4');

UPDATE menu_details
SET active_flag='N'
WHERE id='233a85a8-7748-4df9-a8f9-73df0b95c912';

UPDATE menu_details
SET display_order=3
WHERE id='52be1d92-34f1-4678-b4a7-f76386ab61d5';
UPDATE menu_details
SET display_order=15
WHERE id='80c04e8a-9aa2-4220-a3e3-56683563ffad';
UPDATE menu_details
SET display_order=4
WHERE id='0085bcba-5e36-4e5b-b680-f23a5c6f2ba1';