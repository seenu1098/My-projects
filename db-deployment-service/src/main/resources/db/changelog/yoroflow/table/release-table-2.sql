-- liquibase formatted sql

-- changeset india:08102021-1002

DROP TABLE IF EXISTS  payment_subscription_details CASCADE ;

CREATE TABLE payment_subscription_details (
	id uuid NOT NULL,
	plan_name varchar(100) NOT NULL,
	monthly_price float4 NULL,
	yearly_price float4 NULL,
	created_by varchar(100) not NULL,
	created_date timestamp not NULL,
	tenant_id varchar(60) NOT NULL,
	active_flag varchar(1) NOT NULL,
	CONSTRAINT payment_subscription_details_pk PRIMARY KEY (id)
);

CREATE TABLE organization_discount (
	id uuid NOT NULL,
	plan_id uuid NOT NULL,
	monthly_discount_amount float4 NULL,
	yearly_discount_amount float4 NULL,
	summary varchar(200) NULL,
	customer_id uuid NOT NULL,
	active_flag varchar(1) NOT NULL,
	created_by varchar(100) NOT NULL,
	created_on timestamp NOT NULL,
	modified_by varchar(100) NOT NULL,
	modified_on timestamp NOT NULL,
	tenant_id varchar(60) NOT NULL,
	CONSTRAINT organization_discount_pkey PRIMARY KEY (id),
	CONSTRAINT customers_fkey FOREIGN KEY (customer_id) REFERENCES customers(id),
	CONSTRAINT payment_subscription_detailsk_key FOREIGN KEY (plan_id) REFERENCES payment_subscription_details(id)
);

ALTER table if exists payment_subscription ALTER COLUMN plan_type TYPE uuid USING plan_type::uuid;

alter table if exists payment_subscription add	CONSTRAINT payment_subscription_detailsk_key FOREIGN KEY (plan_type) REFERENCES payment_subscription_details(id);
