-- liquibase formatted sql

-- changeset india:19112021-00001

DELETE FROM org_integrated_apps
WHERE id='bb5c6e1a-a5c9-47a1-ab59-52bd4e1500ab';
DELETE FROM org_integrated_apps
WHERE id='da21a9df-e958-4ffc-9e2e-bee6dd051a34';
DELETE FROM org_integrated_apps
WHERE id='04dcccd8-c501-449c-b393-633a63ad981e';
DELETE FROM org_integrated_apps
WHERE id='c9531d0e-4df8-4535-9397-c3a62e710d4d';
DELETE FROM org_integrated_apps
WHERE id='15a20fb8-259a-4248-bc1b-e6cf1c2747b7';

INSERT INTO org_integrated_apps
(id, app_name, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, is_removed, authorization_endpoint, client_id, client_secret, scopes_csv, token_endpoint, userinfo_endpoint, issuer, redirect_url, description)
VALUES('bb5c6e1a-a5c9-47a1-ab59-52bd4e1500ab', 'LinkedIn', '${tenantId}', '${customerUserId}', '2021-07-16 22:52:00.549', '${customerUserId}', '2021-08-08 01:13:05.109', 'Y', 'Y', 'https://www.linkedin.com/oauth/v2/authorization', '77hrnl14pydzs5', 'FQbAiO2OsKTuws6e', 'w_member_social, r_emailaddress, r_liteprofile', NULL, NULL, NULL, NULL, 'LinkedIn is an American business and employment-oriented online service, the platform is mainly used for professional networking, and allows job seekers to post their CVs and employers to post jobs.');
INSERT INTO org_integrated_apps
(id, app_name, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, is_removed, authorization_endpoint, client_id, client_secret, scopes_csv, token_endpoint, userinfo_endpoint, issuer, redirect_url, description)
VALUES('da21a9df-e958-4ffc-9e2e-bee6dd051a34', 'Twitter', '${tenantId}', '${customerUserId}', '2021-07-16 22:52:00.549', '${customerUserId}', '2021-08-08 01:13:05.109', 'Y', 'Y', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Twitter is an American microblogging and social networking service on which users post and interact with messages known as "tweets".');
INSERT INTO org_integrated_apps
(id, app_name, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, is_removed, authorization_endpoint, client_id, client_secret, scopes_csv, token_endpoint, userinfo_endpoint, issuer, redirect_url, description)
VALUES('04dcccd8-c501-449c-b393-633a63ad981e', 'Slack', '${tenantId}', '${customerUserId}', '2021-07-16 22:53:09.547', '${customerUserId}', '2021-09-17 13:17:50.033', 'Y', 'N', 'https://slack.com/oauth/v2/authorize', '517730160807.2287296410612', '357fda9c46d55b9178c6786eccf96178', 'chat:write,users:read,channels:manage,channels:read,openid,profile,email,chat:write.public
', NULL, NULL, 'https://slack.com', 'https://auth-dev.yoroflow.com/en/single-signon/return', 'Slack offers many IRC-style features, including persistent chat rooms (channels) organized by topic, private groups, and direct messaging.');
INSERT INTO org_integrated_apps
(id, app_name, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, is_removed, authorization_endpoint, client_id, client_secret, scopes_csv, token_endpoint, userinfo_endpoint, issuer, redirect_url, description)
VALUES('c9531d0e-4df8-4535-9397-c3a62e710d4d', 'Microsoft Teams', '${tenantId}', '${customerUserId}', '2021-07-16 22:52:00.549', '${customerUserId}', '2021-09-17 13:17:29.716', 'Y', 'N', 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize', '840375e4-44bc-4f12-8cf5-271495375e6f', 'qaAy~w0AS__MaiMCl.Xg-0qClzu4.i95_R', 'user.read,Team.ReadBasic.All,ChannelMessage.Send,offline_access', NULL, NULL, 'https://slack.com', 'https://auth-dev.yoroflow.com/en/single-signon/return', 'Teams is replacing other Microsoft-operated business messaging and collaboration platforms, including Skype for Business and Microsoft Classroom.');
INSERT INTO org_integrated_apps
(id, app_name, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, is_removed, authorization_endpoint, client_id, client_secret, scopes_csv, token_endpoint, userinfo_endpoint, issuer, redirect_url, description)
VALUES('15a20fb8-259a-4248-bc1b-e6cf1c2747b7', 'Outlook', '${tenantId}', '${customerUserId}', '2021-07-16 22:52:00.549', '${customerUserId}', '2021-08-08 01:13:05.109', 'Y', 'Y', 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize', '840375e4-44bc-4f12-8cf5-271495375e6f', 'qaAy~w0AS__MaiMCl.Xg-0qClzu4.i95_R', 'Mail.Send', NULL, NULL, NULL, 'https://auth-dev.yoroflow.com/en/single-signon/return', 'Outlook.com is a personal information manager web app from Microsoft consisting of webmail, calendaring, contacts, and tasks services.');

UPDATE grid_columns
SET column_sequence_no=3,display_name='Initiated By'
WHERE id='011f1eef-1e20-42f8-a5c5-7efb81804807';
UPDATE grid_columns
SET column_sequence_no=5
WHERE id='0fcec8a1-a3ad-48e5-9736-2389621c8865';
UPDATE grid_columns
SET column_sequence_no=4,display_name='Initialted Date'
WHERE id='88934503-3c09-4918-8301-3e5b713c8908';
UPDATE grid_columns
SET column_sequence_no=6
WHERE id='24091610-828f-4750-8723-0d5d2f54a81e';
UPDATE grid_columns
SET display_name='Process Name'
WHERE id='16712cea-5e27-46ca-8f22-8ee692e06604';

UPDATE menu_details
SET display_order=10
WHERE id='b445bfb1-89d6-456b-84bd-e6eb6a599365';
UPDATE menu_details
SET display_order=1
WHERE id='0085bcba-5e36-4e5b-b680-f23a5c6f2ba1';
UPDATE menu_details
SET display_order=4
WHERE id='e5be6b5d-2e2c-43da-84bd-b501a46f78b0';
UPDATE menu_details
SET display_order=8
WHERE id='dc829215-2276-488c-a9a2-4d1b67436ad3';
UPDATE menu_details
SET display_order=9
WHERE id='80c04e8a-9aa2-4220-a3e3-56683563ffad';
UPDATE menu_details
SET display_order=5
WHERE id='9a505ed9-7455-475c-adbd-5b1e64298a2a';
UPDATE menu_details
SET display_order=6
WHERE id='d5cd49b0-b052-4b1f-8e71-15e4b785ea3d';
UPDATE menu_details
SET display_order=7
WHERE id='c0b883d4-25f4-494c-b990-3cd24ec2d27c';

UPDATE menu_details
SET icon='',menu_path='',parent_menu_id='f99f201b-350b-4eff-9898-1b2b4b896360',display_order=7
WHERE id='52be1d92-34f1-4678-b4a7-f76386ab61d5';

update users
    set timezone = (select yoroflow.customers.timezone
    from yoroflow.customers
    where yoroflow.customers.tenant_id = users.tenant_id) where users.timezone is null;


