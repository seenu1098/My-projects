-- liquibase formatted sql

-- changeset india:08022022-00001

UPDATE email_template
SET template_data='<p><span style="color: rgb(0, 0, 0);">Hello,&nbsp;</span></p><p><span style="color: rgb(0, 0, 0);">A gentle reminder to you!&nbsp;</span></p><p><span style="color: rgb(0, 0, 0);">A new task </span><strong>{{taskname}}</strong><span style="color: rgb(0, 0, 0);">&nbsp;has been assigned to you on the workflow </span><strong>{{workflow}}</strong><span style="color: rgb(0, 0, 0);">.&nbsp;&nbsp;</span></p><p><span style="color: rgb(0, 0, 0);">You can see the task in detail at </span><a href="https://{{subdomain}}/en/{{workspaceKey}}/mytask/my-pending-task/{{taskId}}" rel="noopener noreferrer" target="_blank" style="background-color: rgb(255, 255, 255);">{{taskname}}</a>.</p><p><span style="color: rgb(0, 0, 0);">Assigned At: </span><strong style="color: rgb(0, 0, 0);">{{assignedAt}}</strong></p><p><span style="color: rgb(0, 0, 0);">Assigned By: </span><strong style="color: rgb(0, 0, 0);">{{assignedBy}}&nbsp;</strong></p><p><span style="color: rgb(0, 0, 0);">Thanks,&nbsp;</span></p><p><span style="color: rgb(0, 0, 0);">Yoroflow&nbsp;</span></p>'
WHERE id='c00b09ae-493c-4980-aa3b-f1dc2fc15175';

UPDATE email_template
SET template_data='<p>Hello,</p><p>Change has been requested for <strong>{{taskname}}</strong> on the workflow <strong>{{workflow}}</strong> with comment <strong>{{comment}}</strong>. </p><p>You can see the task in detail at <a href="https://{{subdomain}}/en/{{workspaceKey}}/mytask/my-pending-task/{{taskId}}" rel="noopener noreferrer" target="_blank">{{taskname}}</a>.</p><p>Assigned At: <strong>{{assignedAt}}</strong></p><p>Assigned By: <strong>{{assignedBy}}&nbsp;</strong></p><p><br></p><p>Thanks,</p><p>Yoroflow</p>'
WHERE id='50e99b33-04e6-4dc9-ad4a-7139e84fc8b2';