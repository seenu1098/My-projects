CREATE TABLE template (
	id bigserial primary key,
	template_name varchar(500) unique,
	json_data varchar NOT NULL,
	created_by varchar(100),
	created_date timestamp,
	updated_by varchar(100),
	updated_date timestamp
);


CREATE TABLE testcase_groups (
	id bigserial primary key,
	testcase_group_name varchar(200) unique,
	description varchar(300) NOT NULL,
	created_by varchar(100),
	created_date timestamp,
	updated_by varchar(100),
	updated_date timestamp
);


CREATE TABLE claims (
	id bigserial primary key,
	template_id bigserial references template(id),
	testcase_name varchar(500) unique,
	json_data varchar(4000) NOT NULL,
	created_by varchar(100),
	created_date timestamp,
	updated_by varchar(100),
	updated_date timestamp
);

CREATE TABLE claims_testcase_groups (
	id bigserial primary key,
	claims_id bigserial references claims(id),
	testcase_groups_id bigserial references testcase_groups(id),
	created_by varchar(100),
	created_date timestamp,
	updated_by varchar(100),
	updated_date timestamp
);

CREATE TABLE environment (
	id bigserial NOT NULL,
	environment_name varchar(100) NULL,
	target_folder varchar(300) NULL,
	protocol varchar(30) NULL,
	host varchar(200) NULL,
	port varchar(10) NULL,
	username varchar(100) NULL,
	password varchar(200) NULL,
	pem_text varchar(4000) NULL,
	db_type varchar(100) NULL,
	db_host varchar(100) NULL,
	db_port varchar(10) NULL,
	db_name varchar(100) NULL,
	db_username varchar(100) NULL,
	db_password varchar(200) NULL,
	scheme_name varchar(100) NULL,
	logon_type varchar(50) NULL,
	created_by varchar(100),
	created_date timestamp,
	updated_by varchar(100),
	updated_date timestamp,
	CONSTRAINT environment_environment_name_key UNIQUE (environment_name),
	CONSTRAINT environment_pkey PRIMARY KEY (id)
);


CREATE TABLE batch (
	id bigserial NOT NULL,
	batch_name varchar(100) NULL,
	environment_id bigserial NOT NULL,
	start_time timestamp NULL,
	end_time timestamp NULL,
	status varchar(100) NULL,
	total_testcases bigserial NOT NULL,
	pass_percentage bigserial NOT NULL,
	fail_percentage bigserial NOT NULL,
	created_by varchar(100) NULL,
	created_date timestamp NULL,
	updated_by varchar(100) NULL,
	updated_date timestamp NULL,
	CONSTRAINT batch_batch_name_key UNIQUE (batch_name),
	CONSTRAINT batch_pkey PRIMARY KEY (id),
	CONSTRAINT batch_environment_id_fkey FOREIGN KEY (environment_id) REFERENCES environment(id)
);


CREATE TABLE batch_testcases (
	id bigserial NOT NULL,
	batch_id bigserial NOT NULL,
	test_id bigserial NOT NULL,
	generated_edi varchar(4000) NULL,
	status varchar(100) NULL,
	created_by varchar(100) NULL,
	created_date timestamp NULL,
	updated_by varchar(100) NULL,
	updated_date timestamp NULL,
	CONSTRAINT batch_testcases_pkey PRIMARY KEY (id),
	CONSTRAINT batch_testcases_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES batch(id),
	CONSTRAINT batch_testcases_test_id_fkey FOREIGN KEY (test_id) REFERENCES claims(id)
);


CREATE TABLE elements_configuration (
	id bigserial NOT NULL,
	element_label varchar(100) NULL,
	field_name varchar(200) NULL,
	field_type varchar(100) NULL,
	is_mandatory varchar(10) NULL,
	applicable_at varchar(10) NULL,
	match_query varchar(3000) NULL,
	created_by varchar(100),
	created_date timestamp,
	updated_by varchar(100),
	updated_date timestamp,
	CONSTRAINT elements_configuration_label_key UNIQUE (element_label),
	CONSTRAINT elements_configuration_pkey PRIMARY KEY (id)
);


CREATE TABLE batch_testcases_result (
	id bigserial NOT NULL,
	batch_testcases_id bigserial NOT NULL,
	elements_configuration_id bigserial NOT NULL,
	expected_value varchar(300) NOT NULL,
	actual_value varchar(300) NOT NULL,
	status varchar(50) NULL,
	created_by varchar(100) NULL,
	created_date timestamp NULL,
	updated_by varchar(100) NULL,
	updated_date timestamp NULL,
	CONSTRAINT batch_testcases_result_pkey PRIMARY KEY (id),
	CONSTRAINT batch_testcases_result_batch_testcases_id_fkey FOREIGN KEY (batch_testcases_id) REFERENCES batch_testcases(id),
	CONSTRAINT batch_testcases_result_elements_configuration_id_fkey FOREIGN KEY (elements_configuration_id) REFERENCES elements_configuration(id)
);


CREATE TABLE claim_type (
	id serial NOT NULL,
	claim_type_code varchar(20) NOT NULL,
	claim_desc varchar(200) NOT NULL,
	form_type varchar(3) NOT NULL,
	created_by varchar(100) NULL,
	created_date timestamp NULL,
	updated_by varchar(100) NULL,
	updated_date timestamp NULL,
	CONSTRAINT claim_type_pkey PRIMARY KEY (id)
);


CREATE TABLE lookup_data (
	id serial NOT NULL,
	code varchar(50) NOT NULL,
	lookup_desc varchar(100) NOT NULL,
	lookup_type varchar(30) NOT NULL,
	created_by varchar(100) NULL,
	created_date timestamp NULL,
	updated_by varchar(100) NULL,
	updated_date timestamp NULL,
	CONSTRAINT lookup_data_pkey PRIMARY KEY (id)
);

CREATE TABLE roles (
	role_id serial NOT NULL,
	role_name varchar(50) NOT NULL,
	role_desc varchar(250) NOT NULL,
	created_by varchar(100) NULL,
	created_date timestamp NULL,
	updated_by varchar(100) NULL,
	updated_date timestamp NULL,
	CONSTRAINT roles_pkey PRIMARY KEY (role_id),
	CONSTRAINT roles_role_name_key UNIQUE (role_name)
);

CREATE TABLE users (
	user_id serial NOT NULL,
	first_name varchar(100) NULL,
	last_name varchar(100) NULL,
	user_name varchar(100) NOT NULL,
	user_password varchar(200) NOT NULL,
	email_id varchar(355) NOT NULL,
	created_by varchar(100) NULL,
	created_date timestamp NULL,
	updated_by varchar(100) NULL,
	updated_date timestamp NULL,
	last_login timestamp NULL,
	CONSTRAINT users_email_id_key UNIQUE (email_id),
	CONSTRAINT users_pkey PRIMARY KEY (user_id),
	CONSTRAINT users_user_name_key UNIQUE (user_name)
);


CREATE TABLE user_role (
	user_role_id serial NOT NULL,
	user_id int4 NOT NULL,
	role_id int4 NOT NULL,
	created_by varchar(100) NULL,
	created_date timestamp NULL,
	updated_by varchar(100) NULL,
	updated_date timestamp NULL,
	CONSTRAINT user_role_pkey PRIMARY KEY (user_role_id),
	CONSTRAINT user_role_role_id_fkey FOREIGN KEY (role_id) REFERENCES "roles"(role_id),
	CONSTRAINT user_role_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(user_id)
);


INSERT INTO roles (role_name,role_desc,created_by,created_date,updated_by,updated_date) VALUES 
('user','user','admin', current_timestamp, 'admin', current_timestamp);


-- test123 is the password
INSERT INTO users (first_name,last_name,user_name,user_password,email_id,created_by,created_date,updated_by,updated_date,last_login) VALUES 
('test','test','user@yorosis.com','$2a$10$PfofDHL2V/kA1HOSZpt83OqT6rKZxlLzTUSCVrxr0ZUfPwltvZFHu','user@yorosis.com', 'admin', current_timestamp, 'admin', current_timestamp, current_timestamp);


INSERT INTO user_role (user_id,role_id,created_by,created_date,updated_by,updated_date) VALUES 
(1,2,'admin', current_timestamp, 'admin', current_timestamp);


INSERT INTO lookup_data (code,created_by,created_date,lookup_desc,lookup_type,updated_by,updated_date) VALUES 
('P','admin@yorosis.com',current_timestamp,'Professional','form_type','admin@yorosis.com',current_timestamp)
,('I','admin@yorosis.com',current_timestamp,'Institutional','form_type','admin@yorosis.com',current_timestamp)
,('D','admin@yorosis.com',current_timestamp,'Dental','form_type','admin@yorosis.com',current_timestamp)
;