-- liquibase formatted sql

-- changeset india:08012021-01001

ALTER TABLE market_place RENAME TO workflow_templates;

GRANT ALL ON TABLE workflow_templates TO yoroflow_appuser;

ALTER TABLE workflow_templates DROP COLUMN developer_name;
ALTER TABLE workflow_templates DROP COLUMN start_key;
ALTER TABLE workflow_templates DROP COLUMN approve;
ALTER TABLE workflow_templates DROP COLUMN published_on;
ALTER TABLE workflow_templates DROP COLUMN no_of_uninstalled;
ALTER TABLE workflow_templates DROP COLUMN no_of_installed;

ALTER TABLE workflow_templates RENAME COLUMN export_data TO workflow_data;
alter table workflow_templates add column category varchar(100) null;


ALTER TABLE customers DROP COLUMN enable_two_factor;
