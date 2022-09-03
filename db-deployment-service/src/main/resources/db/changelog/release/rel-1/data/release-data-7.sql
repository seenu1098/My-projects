-- liquibase formatted sql

-- changeset india:09172021-00001

INSERT into email_template
(id, template_name, template_id, template_data, created_by, created_on, modified_by, modified_on, active_flag, tenant_id, managed_flag, template_subject)
VALUES('50e99b33-04e6-4dc9-ad4a-7139e84fc8b2', 'Workflow Send Back', 'workflowSendBack', '<p>Hello,</p><p>Change has been requested for <strong>{{taskname}}</strong> on the workflow <strong>{{workflow}}</strong> with comment <strong>{{comment}}</strong>.  You can view the task at <a href="https://%7B%7Bsubdomain%7D%7D/mytask/my-pending-task/%7B%7BtaskId%7D%7D" rel="noopener noreferrer" target="_blank">{{taskname}}</a>.</p><p><br></p><p>Thanks,</p><p>Yoroflow</p>', '${customerUserId}', '2021-09-14 07:21:44.962', '${customerUserId}', '2021-09-17 12:15:29.772', 'Y', '${tenantId}', 'N', '[MODIFY REQUEST] For {{taskname}} ');

UPDATE menu_details
SET menu_name='Associate Users To Teams'
WHERE id='d4755ca7-9f88-43a3-8491-5e6971e87569';
UPDATE menu_details
SET menu_name='Teams'
WHERE id='c0b883d4-25f4-494c-b990-3cd24ec2d27c';

UPDATE grid_columns
SET display_name='Team Name'
WHERE id='9e5f9c3e-5b9e-45db-9d76-34b5b92742c5';