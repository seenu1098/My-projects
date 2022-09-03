-- liquibase formatted sql

-- changeset india:10222021-00001

UPDATE payment_subscription_details
SET plan_name='STARTER', monthly_price=0, yearly_price=0, created_by='${customerUserId}', created_date='2020-12-30 16:50:39.000', tenant_id='${tenantId}', active_flag='Y', base_price=0, customer_id='c52179b8-a06c-4381-8a03-9c5e7e28d6c4'
WHERE id='fd29950c-f9a0-11eb-9a03-0242ac130003';
UPDATE payment_subscription_details
SET plan_name='BUSINESS PACK', monthly_price=10, yearly_price=8, created_by='${customerUserId}', created_date='2020-12-30 16:50:39.000', tenant_id='${tenantId}', active_flag='Y', base_price=0, customer_id='c52179b8-a06c-4381-8a03-9c5e7e28d6c4'
WHERE id='fd2997aa-f9a0-11eb-9a03-0242ac130003';
UPDATE payment_subscription_details
SET plan_name='STANDARD', monthly_price=17, yearly_price=14, created_by='${customerUserId}', created_date='2020-12-30 16:50:39.000', tenant_id='${tenantId}', active_flag='Y', base_price=0, customer_id='c52179b8-a06c-4381-8a03-9c5e7e28d6c4'
WHERE id='fd299a98-f9a0-11eb-9a03-0242ac130003';
UPDATE payment_subscription_details
SET plan_name='PRO', monthly_price=27, yearly_price=22, created_by='${customerUserId}', created_date='2020-12-30 16:50:39.000', tenant_id='${tenantId}', active_flag='Y', base_price=0, customer_id='c52179b8-a06c-4381-8a03-9c5e7e28d6c4'
WHERE id='fd299b6a-f9a0-11eb-9a03-0242ac130003';