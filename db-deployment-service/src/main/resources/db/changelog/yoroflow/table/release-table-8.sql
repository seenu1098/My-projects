-- liquibase formatted sql

-- changeset india:12102021-01001

create table account_details(
	id uuid NOT NULL,
	created_on timestamp NOT NULL,
	modified_on timestamp NOT NULL,
	active_flag varchar(1) NOT NULL,
	first_name varchar(100) not null,
	last_name varchar(100) not null,
	email varchar(100) not null,
	phone_number varchar(100) null,
	company_name varchar(100) null,
	subdomain_name varchar(100) null,
	access_token varchar(250) null
);