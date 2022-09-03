-- liquibase formatted sql

-- changeset india:08262021-00002

ALTER TABLE payment_subscription ALTER COLUMN subscription_start_date TYPE date USING subscription_start_date::date;
ALTER TABLE payment_subscription ALTER COLUMN subscription_end_date TYPE date USING subscription_end_date::date;

CREATE TABLE license_validation (
	id uuid NOT NULL,
	plan_name varchar(100) NOT NULL,
	feature_name varchar(100) NOT NULL,
	is_allowed varchar(1) NOT NULL,
	allowed_limit int8 NOT NULL,
	category varchar(100) NOT NULL,
	tenant_id varchar(60) NOT NULL,
	created_by varchar(100) NOT NULL,
	created_on timestamp NOT NULL,
	modified_by varchar(100) NULL,
	modified_on timestamp NOT NULL,
	active_flag varchar(1) NOT NULL,
	CONSTRAINT license_validation_pkey PRIMARY KEY (id)
);

