-- liquibase formatted sql

-- changeset india:12162021-00001

UPDATE email_template
SET managed_flag='Y'
WHERE id='fe73b4d7-41a8-4ef8-922a-4c6c40b91683';
UPDATE email_template
SET managed_flag='Y'
WHERE id='cdb4dabf-d859-4488-88df-67233fd83a2d';
UPDATE email_template
SET managed_flag='Y'
WHERE id='50e99b33-04e6-4dc9-ad4a-7139e84fc8b2';