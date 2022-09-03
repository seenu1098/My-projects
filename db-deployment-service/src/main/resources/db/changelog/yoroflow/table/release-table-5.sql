-- liquibase formatted sql

-- changeset india:10082021-00001

ALTER TABLE customers ADD subscription_start_date date NULL;

ALTER TABLE customers ADD subscription_end_date date NULL;

ALTER TABLE payment_customer ADD invoice_pdf varchar(500) NULL;

ALTER TABLE payment_customer ADD payment_subscription_id varchar(500) NULL;

ALTER TABLE payment_customer ADD quantity int8 NULL;

ALTER TABLE payment_customer ADD payment_price_id varchar(500) NULL;

ALTER TABLE payment_customer ADD is_payment_succeed varchar(1) NULL;

ALTER TABLE payment_customer ADD payment_method_id varchar(500) NULL;

ALTER TABLE payment_customer ADD payment_customer_id varchar(500) NULL;

ALTER TABLE payment_subscription ADD active_plan varchar(1) NULL;

CREATE TABLE installable_apps (
	id uuid NOT NULL,
	template_name varchar(100) NOT NULL,
	template_data jsonb NULL,
	description varchar(100) NULL,
	tenant_id varchar(60) NOT NULL,
	created_by varchar(100) NOT NULL,
	created_on timestamp NOT NULL,
	modified_by varchar(100) NULL,
	modified_on timestamp NULL,
	active_flag varchar(1) NOT NULL,
	category varchar(150) NULL,
	CONSTRAINT installable_apps_pkey PRIMARY KEY (id)
);