-- liquibase formatted sql

-- changeset india:08132021-00001

UPDATE email_template
SET template_data='<p>Hello, </p><p>There is a new task <strong>{{taskname}}</strong> assigned to you on the workflow <strong>{{workflow}}</strong>.You can view the task at <a href="https://{{subdomain}}/mytask/my-pending-task/{{taskId}}">{{taskname}}</a>.</p><p><br></p><p>Thanks,</p><p>Yoroflow</p>'
WHERE id='c00b09ae-493c-4980-aa3b-f1dc2fc15175';