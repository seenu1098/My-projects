-- liquibase formatted sql

-- changeset usa:01112022-00001


insert
	into
	email_template (id,
	template_name,
	template_id,
	template_data,
	created_by,
	created_on,
	modified_by,
	modified_on,
	active_flag,
	tenant_id,
	managed_flag,
	template_subject)
values
	 ('e84401e4-256d-40ce-a9aa-42e5a12ca0eb'::uuid,
'summary_email',
'summary_email',
'<p>Hi {{firstname}} {{lastname}},</p>
<p>Please find the summary of pending tasks assigned to you and have crossed the due date.</p>
#foreach
<ul>
<li><a href="https://{{subdomain}}.yoroflow.com/{{workspace}}/taskboard/task/{{taskid}}">https://{{subdomain}}.yoroflow.com/{{workspace}}/taskboard/task/{{taskid}}</a></li>
</ul>
#end
<p>Thank you</p>
<p>Yoroflow Team</p>',
'${customerUserId}',
'2022-01-11 00:47:01.199',
'${customerUserId}',
'2022-01-11 00:47:01.199',
'Y',
'${tenantId}',
null,
'Due Tasks');
