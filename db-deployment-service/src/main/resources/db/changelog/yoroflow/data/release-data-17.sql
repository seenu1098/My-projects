-- liquibase formatted sql

-- changeset india:12282021-00001

INSERT INTO event_automation_config
(id, automation, automation_type, parent_automation_id, tenant_id, created_by, created_on, modified_by, modified_on, active_flag, category, automation_subtype, app_name)
VALUES('e244533b-b281-498b-8ba4-cfda8e0bb404', 'a due date arrives', 'due date', '040e0ad6-e4c2-475f-a8d2-9e4c2505ae5b', '${tenantId}', '${customerUserId}', '2021-05-06 16:12:01.000', '${customerUserId}', '2021-05-06 16:12:01.000', 'Y', NULL, NULL, NULL);
