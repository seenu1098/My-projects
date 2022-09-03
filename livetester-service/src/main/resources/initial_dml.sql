INSERT INTO roles (role_id, role_name, role_desc, created_by, created_date, updated_by, updated_date) 
VALUES(1, 'admin', 'admininstrator', 'system', current_timestamp, 'system', current_timestamp);

INSERT INTO roles (role_id, role_name, role_desc, created_by, created_date, updated_by, updated_date) 
VALUES(2, 'user', 'user', 'system', current_timestamp, 'system', current_timestamp);


-- Password test123
INSERT INTO users (user_id, first_name, last_name, user_name, user_password, email_id, created_by, created_date, updated_by, updated_date, last_login, global_specification) 
VALUES(1, 'Admin', 'User', 'admin@yorosis.com', '$2a$10$PfofDHL2V/kA1HOSZpt83OqT6rKZxlLzTUSCVrxr0ZUfPwltvZFHu', 'admin@yorosis.com', 'admin', current_timestamp, 'admin@yorosis.com', current_timestamp, null, 'Y');


INSERT INTO user_role (user_role_id, user_id, role_id, created_by, created_date, updated_by, updated_date) 
VALUES(1, 1, 1, 'system', current_timestamp, 'system', current_timestamp);


INSERT INTO lookup_data (id, code, created_by, created_date, lookup_desc, lookup_type, updated_by, updated_date) VALUES(1, '1', 'admin@yorosis.com', current_timestamp, 'Fresh Claim', 'Frequency', 'admin@yorosis.com', current_timestamp);
INSERT INTO lookup_data (id, code, created_by, created_date, lookup_desc, lookup_type, updated_by, updated_date) VALUES(2, '7', 'admin@yorosis.com', current_timestamp, 'Adjustment / Resurrection', 'Frequency', 'admin@yorosis.com', current_timestamp);
INSERT INTO lookup_data (id, code, created_by, created_date, lookup_desc, lookup_type, updated_by, updated_date) VALUES(3, '8', 'admin@yorosis.com', current_timestamp, 'Void', 'Frequency', 'admin@yorosis.com', current_timestamp);
INSERT INTO lookup_data (id, code, created_by, created_date, lookup_desc, lookup_type, updated_by, updated_date) VALUES(4, 'EDI', 'admin@yorosis.com', current_timestamp, 'EDI', 'Source', 'admin@yorosis.com', current_timestamp);
INSERT INTO lookup_data (id, code, created_by, created_date, lookup_desc, lookup_type, updated_by, updated_date) VALUES(5, 'Paper', 'admin@yorosis.com', current_timestamp, 'Paper', 'Source', 'admin@yorosis.com', current_timestamp);
INSERT INTO lookup_data (id, code, created_by, created_date, lookup_desc, lookup_type, updated_by, updated_date) VALUES(6, 'Web', 'admin@yorosis.com', current_timestamp, 'Web', 'Source', 'admin@yorosis.com', current_timestamp);
INSERT INTO lookup_data (id, code, created_by, created_date, lookup_desc, lookup_type, updated_by, updated_date) VALUES(7, 'P', 'admin@yorosis.com', current_timestamp, 'Professional', 'form_type', 'admin@yorosis.com', current_timestamp);
INSERT INTO lookup_data (id, code, created_by, created_date, lookup_desc, lookup_type, updated_by, updated_date) VALUES(8, 'I', 'admin@yorosis.com', current_timestamp, 'Institutional', 'form_type', 'admin@yorosis.com', current_timestamp);
INSERT INTO lookup_data (id, code, created_by, created_date, lookup_desc, lookup_type, updated_by, updated_date) VALUES(9, 'D', 'admin@yorosis.com', current_timestamp, 'Dental', 'form_type', 'admin@yorosis.com', current_timestamp);
