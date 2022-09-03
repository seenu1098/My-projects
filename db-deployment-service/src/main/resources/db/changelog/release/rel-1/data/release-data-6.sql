-- liquibase formatted sql

-- changeset india:08202021-00001

UPDATE org_integrated_apps
SET app_name='Slack', tenant_id='${tenantId}', created_by='${customerUserId}', created_on='2021-07-16 22:53:09.547', modified_by='${customerUserId}', modified_on='2021-08-20 02:37:24.124', active_flag='Y', auth_token=NULL, is_removed='Y', authorization_endpoint='https://slack.com/oauth/v2/authorize', client_id='2324438026579.2357236852864', client_secret='4c09a8dac60f2d9fbfc7c177dcbdc08f', scopes_csv='chat:write,channels:read,incoming-webhook, openid, profile, email', token_endpoint=NULL, userinfo_endpoint=NULL, issuer='https://slack.com', redirect_url='https://4cbd5d3d8412.ngrok.io/single-signon/return', description='Slack offers many IRC-style features, including persistent chat rooms (channels) organized by topic, private groups, and direct messaging.'
WHERE id='04dcccd8-c501-449c-b393-633a63ad981e';
UPDATE org_integrated_apps
SET app_name='Microsoft Teams', tenant_id='${tenantId}', created_by='${customerUserId}', created_on='2021-07-16 22:52:00.549', modified_by='${customerUserId}', modified_on='2021-08-08 01:13:05.109', active_flag='Y', auth_token=NULL, is_removed='Y', authorization_endpoint='https://login.microsoftonline.com/common/oauth2/v2.0/authorize', client_id='580f7a3a-ba61-4d46-b8a0-15fcb7280e47', client_secret='DM.FUg.dJVqS.E~G43hKu1fR3dsMU~HYef', scopes_csv='incoming-webhook', token_endpoint=NULL, userinfo_endpoint=NULL, issuer='https://slack.com', redirect_url='https://4cbd5d3d8412.ngrok.io/single-signon/return', description='Teams is replacing other Microsoft-operated business messaging and collaboration platforms, including Skype for Business and Microsoft Classroom.'
WHERE id='c9531d0e-4df8-4535-9397-c3a62e710d4d';
INSERT INTO org_integrated_apps
(id, app_name, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, auth_token, is_removed, authorization_endpoint, client_id, client_secret, scopes_csv, token_endpoint, userinfo_endpoint, issuer, redirect_url,description)
VALUES('da21a9df-e958-4ffc-9e2e-bee6dd051a34', 'Twitter', '${tenantId}', '${customerUserId}', '2021-07-16 22:52:00.549', '${customerUserId}', '2021-08-08 01:13:05.109', 'Y', NULL, 'Y', NULL, NULL, NULL, NULL, NULL, NULL, NULL, null,'Twitter is an American microblogging and social networking service on which users post and interact with messages known as "tweets".');
INSERT INTO org_integrated_apps
(id, app_name, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, auth_token, is_removed, authorization_endpoint, client_id, client_secret, scopes_csv, token_endpoint, userinfo_endpoint, issuer, redirect_url,description)
VALUES('bb5c6e1a-a5c9-47a1-ab59-52bd4e1500ab', 'LinkedIn', '${tenantId}', '${customerUserId}', '2021-07-16 22:52:00.549', '${customerUserId}', '2021-08-08 01:13:05.109', 'Y', NULL, 'Y', NULL, NULL, NULL, NULL, NULL, NULL, NULL, null,'LinkedIn is an American business and employment-oriented online service, the platform is mainly used for professional networking, and allows job seekers to post their CVs and employers to post jobs.');
INSERT INTO org_integrated_apps
(id, app_name, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, auth_token, is_removed, authorization_endpoint, client_id, client_secret, scopes_csv, token_endpoint, userinfo_endpoint, issuer, redirect_url,description)
VALUES('15a20fb8-259a-4248-bc1b-e6cf1c2747b7', 'Outlook', '${tenantId}', '${customerUserId}', '2021-07-16 22:52:00.549', '${customerUserId}', '2021-08-08 01:13:05.109', 'Y', NULL, 'Y', NULL, NULL, NULL, NULL, NULL, NULL, NULL, null,'Outlook.com is a personal information manager web app from Microsoft consisting of webmail, calendaring, contacts, and tasks services.');
