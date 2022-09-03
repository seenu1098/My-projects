-- liquibase formatted sql

-- changeset onsite:19112021-00003

update org_integrated_apps set redirect_url  = 'https://auth.yoroflow.com/en/single-signon/return' where id in ('04dcccd8-c501-449c-b393-633a63ad981e', 'c9531d0e-4df8-4535-9397-c3a62e710d4d', '15a20fb8-259a-4248-bc1b-e6cf1c2747b7');
