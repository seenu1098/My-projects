-- liquibase formatted sql

-- changeset india:08102021-0001

DELETE FROM menu_details_associate_roles
WHERE menu_details_associate_role_id='cdb17de6-ec97-4768-b840-67764710a1f8';

DELETE FROM menu_details
WHERE id='503abf99-8bf6-4029-addc-1eb7a014a48e';

INSERT INTO menu_details_associate_roles
(menu_details_associate_role_id, menu_details_id, role_id, active_flag, created_by, created_on, modified_by, modified_on, tenant_id, menu_id)
VALUES('ac27888d-c585-4a97-922f-58171b722b49', 'b307c767-5684-4056-a147-1fa847e89b07', 'e9b0ca86-4335-413a-9330-6e319af63e66', 'Y', '${customerUserId}', '2020-04-20 20:56:33.000', '${customerUserId}', '2020-04-20 20:56:33.000', '${tenantId}', '4c98b424-ff35-4c27-894d-9fc6d9d49cc4');

INSERT INTO menu_details_associate_roles
(menu_details_associate_role_id, menu_details_id, role_id, active_flag, created_by, created_on, modified_by, modified_on, tenant_id, menu_id)
VALUES('c9f79572-7096-47c9-9eeb-d78c23351619', 'b307c767-5684-4056-a147-1fa847e89b07', 'b8640dca-4b51-4951-be35-8072f3f7037e', 'Y', '${customerUserId}', '2020-04-20 20:56:33.000', '${customerUserId}', '2020-04-20 20:56:33.000', '${tenantId}', '4c98b424-ff35-4c27-894d-9fc6d9d49cc4');

INSERT into email_template
(id, template_name, template_id, template_data, created_by, created_on, modified_by, modified_on, active_flag, tenant_id, managed_flag, template_subject)
VALUES('0ca90c2b-b6ba-4484-a431-f398829bfee8', 'task_comment_mention', 'task_comment_mention', 'Hello, <br />You are mentioned in task comments of <b>{{taskname}}</b> on the taskboard <b>{{taskboardname}}</b>.  Your can view the task at <a href="https://{{subdomain}}/taskboard/{{taskboardkey}}/{{taskkey}}">{{taskkey}}</a>. <br /><br />Thanks,<br/>Yoroflow', '${customerUserId}', '2021-06-23 11:27:30.588', '${customerUserId}', '2021-06-23 11:27:30.588', 'Y', '${tenantId}', 'Y', '[MENTIONED YOU] Mention you in {{taskname}} on taskboard {{taskboardname}}');

INSERT INTO email_template
(id, template_name, template_id, template_data, created_by, created_on, modified_by, modified_on, active_flag, tenant_id, managed_flag, template_subject)
VALUES('741bd39f-3823-4223-a65b-0480782797d2', 'workflow_comment_mention', 'workflow_comment_mention', 'Hello, <br />You are mentioned in workflow comments of <b>{{taskname}}</b> on the workflow <b>{{workflow}}</b>. <br /><br />Thanks,<br/>Yoroflow', '${customerUserId}', '2021-06-23 11:27:30.588', '${customerUserId}', '2021-06-23 11:27:30.588', 'Y', '${tenantId}', 'Y', '[MENTIONED YOU] Mention you in {{taskname}} on workflow {{workflow}}');

INSERT INTO email_template
(id, template_name, template_id, template_data, created_by, created_on, modified_by, modified_on, active_flag, tenant_id, managed_flag, template_subject)
VALUES('c00b09ae-493c-4980-aa3b-f1dc2fc15175', 'Workflow Task Assign', 'workflowTaskAssign', '<p>Hello, </p><p>There is a new task <strong>{{taskname}}</strong> assigned to you on the workflow <strong>{{workflow}}</strong>.</p><p><br></p><p>Thanks,</p><p>Yoroflow</p>', '${customerUserId}', '2021-08-10 10:41:13.206', '${customerUserId}', '2021-08-10 10:55:31.946', 'Y', '${tenantId}', 'Y', '[NEW TASK ASSIGNED] New task {{taskname}} ');
