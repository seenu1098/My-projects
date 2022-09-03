-- liquibase formatted sql

-- changeset india:10082021-00001

update yoro_groups_user set team_owner = 'Y' where team_owner is null;

UPDATE email_template
SET template_data='Hello, <br />{{taskkey}} - {{taskname}} on taskboard {{taskboardname}} is past due. Your can view the task at <a href="https://{{subdomain}}/en/taskboard/{{taskboardkey}}/{{taskkey}}">{{taskkey}} <br /><br />Thanks,<br/>Yoroflow'
WHERE id='1c94f559-7cc2-4ff3-92d1-0289ca524d42';

UPDATE email_template
SET template_data='Hello, <br />All Subtasks within the new task {{taskname}} assigned to you on the taskboard {{taskboardname}}. You can view the task at <a href="https://{{subdomain}}/en/taskboard/{{taskboardkey}}/{{taskkey}}">{{taskkey}} <br /><br />Thanks,<br/>Yoroflow'
WHERE id='bd98c1a0-953b-4e06-a1c9-8bd5d3d5442d';

UPDATE email_template
SET template_data='<p>Hello, </p><p>There is a new task <strong>{{taskname}}</strong> assigned to you on the workflow <strong>{{workflow}}</strong>.You can view the task at <a href="https://{{subdomain}}/en/mytask/my-pending-task/{{taskId}}">{{taskname}}'
WHERE id='c00b09ae-493c-4980-aa3b-f1dc2fc15175';

UPDATE email_template
SET template_data='<p>Hello,</p><p>Change has been requested for <strong>{{taskname}}</strong> on the workflow <strong>{{workflow}}</strong> with comment <strong>{{comment}}</strong>. You can view the task at <a href="https://%7B%7Bsubdomain%7D%7D/en/mytask/my-pending-task/%7B%7BtaskId%7D%7D" rel="noopener noreferrer" target="_blank">{{taskname}}</a>.</p><p><br></p><p>Thanks,</p><p>Yoroflow</p>'
WHERE id='50e99b33-04e6-4dc9-ad4a-7139e84fc8b2';

UPDATE menu_details
SET active_flag = 'N'
WHERE id='d4755ca7-9f88-43a3-8491-5e6971e87569';

UPDATE menu_details
SET parent_menu_id = null, icon='groups', display_order=14
WHERE id='c0b883d4-25f4-494c-b990-3cd24ec2d27c';

UPDATE menu_details
SET  menu_path='documents'
WHERE id='d5cd49b0-b052-4b1f-8e71-15e4b785ea3d';

UPDATE custom_pages
SET  menu_path='documents'
WHERE id='6cea88e6-38df-4caf-afa0-caa60809fcf9';
