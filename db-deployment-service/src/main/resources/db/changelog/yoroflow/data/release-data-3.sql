-- liquibase formatted sql

-- changeset india:08102021-1001

INSERT INTO payment_subscription_details
(id, plan_name, monthly_price, yearly_price, created_by, created_date, tenant_id, active_flag)
VALUES('fd29950c-f9a0-11eb-9a03-0242ac130003', 'STARTER', 0, 0, '${customerUserId}', '2020-12-30 16:50:39.000', '${tenantId}', 'Y');

INSERT INTO payment_subscription_details
(id, plan_name, monthly_price, yearly_price, created_by, created_date, tenant_id, active_flag)
VALUES('fd2997aa-f9a0-11eb-9a03-0242ac130003', 'BUSINESS PACK', 180, 150, '${customerUserId}', '2020-12-30 16:50:39.000', '${tenantId}', 'Y');

INSERT INTO payment_subscription_details
(id, plan_name, monthly_price, yearly_price, created_by, created_date, tenant_id, active_flag)
VALUES('fd299a98-f9a0-11eb-9a03-0242ac130003', 'STANDARD', 440, 360, '${customerUserId}', '2020-12-30 16:50:39.000', '${tenantId}', 'Y');

INSERT INTO payment_subscription_details
(id, plan_name, monthly_price, yearly_price, created_by, created_date, tenant_id, active_flag)
VALUES('fd299b6a-f9a0-11eb-9a03-0242ac130003', 'PRO', 1400, 1150, '${customerUserId}', '2020-12-30 16:50:39.000', '${tenantId}', 'Y');
