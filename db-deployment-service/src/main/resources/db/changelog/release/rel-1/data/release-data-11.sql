-- liquibase formatted sql

-- changeset india:10222021-00001

INSERT INTO email_template (id, template_name, template_id, template_data, created_by, created_on, modified_by, modified_on, active_flag, tenant_id, managed_flag, template_subject) VALUES('cdb4dabf-d859-4488-88df-67233fd83a2d', 'doc_mention', 'doc_mention', '<p>Hello, You are mentioned in document <strong>{{docName}}</strong>. You can view the document at <a href="https://{{subdomain}}/en/yorodocs/documents/{{docKey}}" rel="noopener noreferrer" target="_blank">{{docName}}</a>.</p><p><br></p><p>Thanks,</p><p>Yoroflow</p>', '${customerUserId}', '2021-06-23 11:27:30.588', '${customerUserId}', '2021-10-21 08:10:32.503', 'Y', '${tenantId}', 'N', '[MENTIONED YOU] Mention you in {{docName}}');

update workflow_report set workspace_id = '6a6ad5ca-5a59-4165-84fc-675c5c503fdf'
 where workspace_id is null;