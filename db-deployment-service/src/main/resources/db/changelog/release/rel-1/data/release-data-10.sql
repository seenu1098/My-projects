-- liquibase formatted sql

-- changeset india:10162021-00001

UPDATE email_template
SET template_data='Hello, <br />You are mentioned in task comments of <b>{{taskname}}</b> on the taskboard <b>{{taskboardname}}</b>.  Your can view the task at <a href="https://{{subdomain}}/en/taskboard/{{taskboardkey}}/{{taskkey}}">{{taskkey}}</a>. <br /><br />Thanks,<br/>Yoroflow'
WHERE id='0ca90c2b-b6ba-4484-a431-f398829bfee8';

DELETE FROM auth_two_factor_methods WHERE id='90db99c1-7213-42b4-9279-fc09ba483775';

INSERT INTO auth_two_factor_methods ("id", "method_name", "active_flag", "created_by", "created_on", "updated_by", "updated_on", "tenant_id") VALUES ('90db99c1-7213-42b4-9279-fc09ba483775', 'Email Authenticator', 'Y', '${customerUserId}', '2021-07-16 15:01:38', '${customerUserId}', '2021-07-16 15:01:38', '${tenantId}');

