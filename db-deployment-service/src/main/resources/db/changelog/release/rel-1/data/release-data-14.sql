-- liquibase formatted sql

-- changeset onsite:19112021-00002

update org_integrated_apps set scopes_csv = 'Mail.Send,offline_access' where  app_name = 'Outlook';
