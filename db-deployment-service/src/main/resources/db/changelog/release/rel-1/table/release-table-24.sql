-- liquibase formatted sql

-- changeset usa:02072022-00001

CREATE TABLE metrics (
	metrics_id uuid NOT NULL,
	processed_count int4 NOT NULL,
	period_in_yearmonth varchar(10) NOT NULL,
	tenant_id varchar(60) NOT NULL,
	created_by varchar(100) NOT NULL,
	created_on timestamp NOT NULL,
	modified_by varchar(100) NULL,
	modified_on timestamp NOT NULL,
	active_flag varchar(1) NOT NULL,
	CONSTRAINT metrics_pk PRIMARY KEY (metrics_id)
);
CREATE INDEX metrics_period_in_yearmonth_idx ON metrics USING btree (period_in_yearmonth);


CREATE TABLE metrics_details (
	metrics_details_id uuid NOT NULL,
	period_in_yearmonth varchar(10) NOT NULL,
	tenant_id varchar(60) NOT NULL,
	event_type varchar(100) NOT NULL,
	category_name varchar(100) NULL,
	event_automation_id uuid NOT NULL,
	action_type varchar(30) NOT NULL,
	action_subtype varchar(30) NOT NULL,
	created_by varchar(100) NOT NULL,
	created_on timestamp NOT NULL,
	modified_by varchar(100) NULL,
	modified_on timestamp NOT NULL,
	active_flag varchar(1) NOT NULL,
	CONSTRAINT metrics_details_pk PRIMARY KEY (metrics_details_id)
);
CREATE INDEX metrics_details_period_in_yearmonth_idx ON metrics_details USING btree (period_in_yearmonth);

