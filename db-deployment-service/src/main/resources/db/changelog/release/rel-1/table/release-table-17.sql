-- liquibase formatted sql

-- changeset india:07122021-00001

ALTER TABLE dashboard_widget ADD widget_type varchar(20) NULL;


ALTER TABLE taskboard ADD launch_button_name varchar(100) NULL;
