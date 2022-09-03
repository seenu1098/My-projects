-- liquibase formatted sql

-- changeset india:08202021-00001

ALTER TABLE payment_subscription ADD subscription_start_date timestamp NULL;
ALTER TABLE payment_subscription ADD subscription_end_date timestamp NULL;