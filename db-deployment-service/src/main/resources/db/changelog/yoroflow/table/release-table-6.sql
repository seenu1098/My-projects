-- liquibase formatted sql

-- changeset india:10222021-00001

ALTER TABLE payment_subscription_details ADD base_price float4 NULL;
ALTER TABLE payment_subscription_details ADD customer_id uuid NULL;