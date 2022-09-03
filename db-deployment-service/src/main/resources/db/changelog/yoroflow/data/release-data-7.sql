
INSERT INTO email_template
(id, template_name, template_id, template_data, created_by, created_on, modified_by, modified_on, active_flag, tenant_id, managed_flag, template_subject)
VALUES('1c94f559-7cc2-4ff3-92d1-0289ca524d42'::uuid, 'due_date', 'due_date', 'Hello, <br />{{taskkey}} - {{taskname}} on taskboard {{taskboardname}} is past due.  Your can view the task at <a href="https://{{subdomain}}/taskboard/{{taskboardkey}}/{{taskkey}}">{{taskkey}}</a>. <br /><br />Thanks,<br/>Yoroflow', '${customerUserId}', '2021-06-23 11:27:30.588', '${customerUserId}', '2021-06-23 11:27:30.588', 'Y', '${tenantId}', 'N', '[PAST DUE DATE]  {{taskname}} on taskboard {{taskboardname}} is past due
');
