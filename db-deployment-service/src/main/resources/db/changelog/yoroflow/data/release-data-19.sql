-- liquibase formatted sql

-- changeset usa:02072022-00001

update email_template set template_data = '<p>Hi {{firstname}} {{lastname}},</p>
<p>Please find the summary of pending tasks assigned to you and have crossed the due date.</p>
#foreach
<ul>
<li><a href="https://{{subdomain}}/en/{{workspace}}/task/taskboard/board-view/{{taskBoard}}/{{taskid}}">{{taskBoard}} - {{taskid}}</a></li>

</ul>
#end
<p>Thank you</p>
<p>Yoroflow Team</p>' where template_name = 'summary_email';