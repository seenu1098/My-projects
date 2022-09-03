-- liquibase formatted sql

-- changeset pradeep:1627330094911-1
CREATE TABLE "application" ("id" UUID NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "app_name" VARCHAR(200) NOT NULL, "app_prefix" VARCHAR(4) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "description" VARCHAR(200) NOT NULL, "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "timezone" VARCHAR(100), "default_language" VARCHAR(50) NOT NULL, "application_id" VARCHAR(200) NOT NULL, "left_menu_id" UUID, "theme_id" VARCHAR(50), "logo" VARCHAR, "right_menu_id" UUID, "top_menu_id" UUID, "bottom_menu_id" UUID, "managed_flag" VARCHAR(1), CONSTRAINT "application_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-2
CREATE TABLE  "application_permissions" ("id" UUID NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "create_allowed" VARCHAR(1) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "delete_allowed" VARCHAR(1) NOT NULL, "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "read_allowed" VARCHAR(1) NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "update_allowed" VARCHAR(1) NOT NULL, "application_id" UUID NOT NULL, "group_id" UUID NOT NULL, "launch_allowed" VARCHAR(1), "edit_allowed" VARCHAR(1), CONSTRAINT "application_permissions_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-3
CREATE TABLE  "yoro_groups" ("id" UUID NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "description" VARCHAR(255) NOT NULL, "group_name" VARCHAR(100) NOT NULL, "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "managed_flag" VARCHAR(1), CONSTRAINT "yoro_groups_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-4
CREATE TABLE  "auth_two_factor_methods" ("id" UUID NOT NULL, "method_name" VARCHAR(100) NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "updated_by" VARCHAR(100) NOT NULL, "updated_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, CONSTRAINT "auth_two_factor_methods_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-5
CREATE TABLE  "counter_values" ("counter_id" UUID NOT NULL, "process_definition_id" UUID, "process_definition_key" VARCHAR(100) NOT NULL, "counter_type" VARCHAR(10) NOT NULL, "reset_at" BIGINT, "counter_value" BIGINT, "counter_name" VARCHAR(100) NOT NULL, "count_increased_by" INTEGER NOT NULL, "counter_start_at" INTEGER NOT NULL, "time_zone" VARCHAR(60), "counter_date" date, "created_by" VARCHAR(100), "created_date" TIMESTAMP WITHOUT TIME ZONE, "updated_by" VARCHAR(100), "updated_date" TIMESTAMP WITHOUT TIME ZONE, "tenant_id" VARCHAR(60) NOT NULL, "active_flag" VARCHAR(1) NOT NULL, CONSTRAINT "counter_values_pkey" PRIMARY KEY ("counter_id"));

-- changeset pradeep:1627330094911-6
CREATE TABLE  "custom_menu_mobile" ("id" UUID NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "custom_menu_name" VARCHAR(100), "custom_page_name" VARCHAR(100), "default_menu_name" VARCHAR(100), "created_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100) NOT NULL, CONSTRAINT "custom_menu_mobile_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-7
CREATE TABLE  "custom_page_permissions" ("id" UUID NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "create_allowed" VARCHAR(1) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "delete_allowed" VARCHAR(1) NOT NULL, "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "read_allowed" VARCHAR(1) NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "update_allowed" VARCHAR(1) NOT NULL, "custom_page_id" UUID, "group_id" UUID NOT NULL, CONSTRAINT "custom_page_permissions_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-8
CREATE TABLE  "custom_pages" ("id" UUID NOT NULL, "page_id" VARCHAR NOT NULL, "json" JSON, "application_id" UUID, "tenant_id" VARCHAR, "page_name" VARCHAR, "menu_path" VARCHAR, "active_flag" VARCHAR(1), "page_version" BIGINT, "managed_flag" VARCHAR(1), CONSTRAINT "custom_pages_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-9
CREATE TABLE  "email_template" ("id" UUID NOT NULL, "template_name" VARCHAR(100) NOT NULL, "template_id" VARCHAR(100) NOT NULL, "template_data" VARCHAR(100000) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "managed_flag" VARCHAR(1), "template_subject" VARCHAR(1000), CONSTRAINT "email_template_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-10
CREATE TABLE  "environment_variable" ("id" UUID NOT NULL, "process_definition_id" UUID NOT NULL, "name" VARCHAR(250) NOT NULL, "value" VARCHAR(250000) NOT NULL, "tenant_id" VARCHAR(250) NOT NULL, "active_flag" VARCHAR(250) NOT NULL, "created_by" VARCHAR, "updated_by" VARCHAR, "created_date" TIMESTAMP WITHOUT TIME ZONE, "updated_date" TIMESTAMP WITHOUT TIME ZONE, CONSTRAINT "environment_variable_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-11
CREATE TABLE  "process_definitions" ("process_definition_id" UUID NOT NULL, "process_definition_name" VARCHAR(4000) NOT NULL, "created_by" VARCHAR(100), "created_date" TIMESTAMP WITHOUT TIME ZONE, "updated_by" VARCHAR(100), "updated_date" TIMESTAMP WITHOUT TIME ZONE, "process_definition_key" VARCHAR NOT NULL, "start_task_key" VARCHAR(50), "workflow_structure" VARCHAR(50000), "status" VARCHAR, "workflow_version" BIGINT, "tenant_id" VARCHAR(60), "user_name" VARCHAR(100), "active_flag" VARCHAR(60), "key" VARCHAR(250), "scheduler_expression" VARCHAR, "start_type" VARCHAR(100), "upload_workflow" VARCHAR(60), "approve" VARCHAR(1), "install_workflow" VARCHAR(255), CONSTRAINT "process_definitions_pkey" PRIMARY KEY ("process_definition_id"));

-- changeset pradeep:1627330094911-12
CREATE TABLE  "event_automation" ("id" UUID NOT NULL, "taskboard_id" UUID NOT NULL, "automation" JSONB, "tenant_id" VARCHAR(60) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100), "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "rule_active" VARCHAR(1) NOT NULL, "automation_type" VARCHAR(100), CONSTRAINT "event_automation_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-13
CREATE TABLE  "taskboard_task" ("id" UUID NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "due_date" TIMESTAMP WITHOUT TIME ZONE, "modified_by" VARCHAR(100), "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "parent_task_id" UUID, "start_date" TIMESTAMP WITHOUT TIME ZONE, "status" VARCHAR(100) NOT NULL, "task_name" VARCHAR(255), "task_type" VARCHAR(100) NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "taskboard_id" UUID NOT NULL, "task_data" JSONB, "description" VARCHAR(255), "task_id" VARCHAR(255), "sequence_no" BIGINT, "sub_status" VARCHAR(100), "previous_status" VARCHAR(100), CONSTRAINT "taskboard_task_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-14
CREATE TABLE  "taskboard_task_assigned_users" ("id" UUID NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "group_id" UUID, "modified_by" VARCHAR(100), "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "user_id" UUID, "taskboard_task_id" UUID NOT NULL, CONSTRAINT "taskboard_task_assigned_users_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-15
CREATE TABLE  "taskboard_task_comments" ("id" UUID NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "comment" VARCHAR(3000) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100), "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "reply_to_comment_id" UUID, "tenant_id" VARCHAR(60) NOT NULL, "taskboard_task_id" UUID NOT NULL, CONSTRAINT "taskboard_task_comments_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-16
CREATE TABLE  "process_def_task_permission" ("process_def_task_prms_id" UUID NOT NULL, "user_id" UUID, "created_by" VARCHAR(100), "created_date" TIMESTAMP WITHOUT TIME ZONE, "updated_by" VARCHAR(100), "updated_date" TIMESTAMP WITHOUT TIME ZONE, "tenant_id" VARCHAR(60), "task_id" UUID NOT NULL, "group_id" UUID, "read_allowed" VARCHAR(1), "update_allowed" VARCHAR, "execute_allowed" VARCHAR(1), CONSTRAINT "process_def_task_permission_pkey" PRIMARY KEY ("process_def_task_prms_id"));

-- changeset pradeep:1627330094911-17
CREATE TABLE  "process_definition_tasks" ("process_definition_id" UUID NOT NULL, "task_id" UUID NOT NULL, "task_name" VARCHAR, "assigned_to" VARCHAR, "assigned_to_type" VARCHAR, "status" VARCHAR, "parent_step_key" VARCHAR(100), "task_type" VARCHAR, "form_id" VARCHAR, "target_step_key" VARCHAR, "created_by" VARCHAR(100), "created_date" TIMESTAMP WITHOUT TIME ZONE, "updated_by" VARCHAR(100), "updated_date" TIMESTAMP WITHOUT TIME ZONE, "task_step_key" VARCHAR NOT NULL, "tenant_id" VARCHAR(60), "scheduler_expression" VARCHAR(300), CONSTRAINT "process_definition_tasks_pkey" PRIMARY KEY ("task_id"));

-- changeset pradeep:1627330094911-18
CREATE TABLE  "taskboard" ("id" UUID NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "description" VARCHAR(100), "modified_by" VARCHAR(100), "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "name" VARCHAR(100) NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "generated_task_id" VARCHAR(255), "task_name" VARCHAR(255), "taskboard_key" VARCHAR(255), "is_column_background" VARCHAR(100), CONSTRAINT "taskboard_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-19
CREATE TABLE  "taskboard_columns" ("id" UUID NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "column_color" VARCHAR(255) NOT NULL, "column_name" VARCHAR(100) NOT NULL, "column_order" BIGINT NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "form_id" VARCHAR(100) NOT NULL, "modified_by" VARCHAR(100), "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "version" BIGINT NOT NULL, "taskboard_id" UUID NOT NULL, "layout_type" VARCHAR(255), "is_column_background" VARCHAR(100), CONSTRAINT "taskboard_columns_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-20
CREATE TABLE  "menu_details_associate_roles" ("menu_details_associate_role_id" UUID NOT NULL, "menu_details_id" UUID NOT NULL, "role_id" UUID NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "menu_id" UUID, CONSTRAINT "menu_details_associate_roles_pkey" PRIMARY KEY ("menu_details_associate_role_id"));

-- changeset pradeep:1627330094911-21
CREATE TABLE  "user_associate_roles" ("user_associate_role_id" UUID NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "user_id" UUID NOT NULL, "role_id" UUID NOT NULL, CONSTRAINT "user_associate_roles_pkey" PRIMARY KEY ("user_associate_role_id"));

-- changeset pradeep:1627330094911-22
CREATE TABLE  "yoro_roles" ("role_id" UUID NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "role_desc" VARCHAR(250), "role_name" VARCHAR(50) NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "managed_flag" VARCHAR(1) NOT NULL, "role_color" VARCHAR(50), CONSTRAINT "roles_pkey" PRIMARY KEY ("role_id"));

-- changeset pradeep:1627330094911-23
CREATE TABLE  "yoro_groups_user" ("id" UUID NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "created_by" VARCHAR(100), "created_on" TIMESTAMP WITHOUT TIME ZONE, "modified_by" VARCHAR(100), "modified_on" TIMESTAMP WITHOUT TIME ZONE, "tenant_id" VARCHAR(60) NOT NULL, "user_id" UUID NOT NULL, "group_id" UUID NOT NULL, CONSTRAINT "yoro_groups_user_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-24
CREATE TABLE  "page" ("id" UUID NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "description" VARCHAR(255), "layout_type" VARCHAR(50), "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "page_data" JSON NOT NULL, "page_id" VARCHAR(200) NOT NULL, "page_link" VARCHAR(255), "page_name" VARCHAR(200) NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "application_id" UUID NOT NULL, "qualifier" VARCHAR(255), "status" VARCHAR(255), "page_version" BIGINT, "is_workflow_form" VARCHAR, "managed_flag" VARCHAR(1), CONSTRAINT "page_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-25
CREATE TABLE  "page_permissions" ("id" UUID NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "create_allowed" VARCHAR(1) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "delete_allowed" VARCHAR(1) NOT NULL, "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "read_allowed" VARCHAR(1) NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "update_allowed" VARCHAR(1) NOT NULL, "page_id" UUID, "group_id" UUID NOT NULL, CONSTRAINT "page_permissions_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-26
CREATE TABLE  "grid_columns" ("id" UUID NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "column_name" VARCHAR(50) NOT NULL, "column_sequence_no" INTEGER NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "display_name" VARCHAR(100) NOT NULL, "field_type" VARCHAR(25) NOT NULL, "filterable" VARCHAR(5) NOT NULL, "hidden_value" VARCHAR(5) NOT NULL, "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "object_field_name" VARCHAR(25), "sortable" VARCHAR(5) NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "width_percentage" INTEGER, "grid_id" UUID NOT NULL, "date_time_format" VARCHAR(50), CONSTRAINT "grid_columns_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-27
CREATE TABLE  "grids" ("grid_id" UUID NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "default_no_of_rows" INTEGER NOT NULL, "default_sortable_column" VARCHAR(255), "exportable" VARCHAR(5) NOT NULL, "filterable" VARCHAR(5) NOT NULL, "grid_name" VARCHAR(200), "grid_url" VARCHAR(255), "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "module_name" VARCHAR(200), "pass_params" VARCHAR(200), "show_check_box" VARCHAR(255), "tenant_id" VARCHAR(60) NOT NULL, "where_clause" VARCHAR(500), "width_percentage" INTEGER, "sort_direction" VARCHAR(50), "managed_flag" VARCHAR(1), "field_values" VARCHAR(100), "user_specific_grid_data" VARCHAR(1), "grid_column_names" VARCHAR(100), CONSTRAINT "grids_pkey" PRIMARY KEY ("grid_id"));

-- changeset pradeep:1627330094911-28
CREATE TABLE  "taskboard_columns_security" ("id" UUID NOT NULL, "taskboard_column_id" UUID NOT NULL, "group_id" UUID, "user_id" UUID, "read" VARCHAR(1) NOT NULL, "update" VARCHAR(1) NOT NULL, "delete" VARCHAR(1) NOT NULL, "launch" VARCHAR(1) NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100), "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "active_flag" VARCHAR(1) NOT NULL, CONSTRAINT "taskboard_columns_security_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-29
CREATE TABLE  "taskboard_labels" ("id" UUID NOT NULL, "taskboard_id" UUID, "label_name" VARCHAR(300), "label_color" VARCHAR(100), "tenant_id" VARCHAR(60) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100), "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "active_flag" VARCHAR(1) NOT NULL, CONSTRAINT "taskboard_labels_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-30
CREATE TABLE  "taskboard_security" ("id" UUID NOT NULL, "taskboard_id" UUID NOT NULL, "group_id" UUID, "user_id" UUID, "read" VARCHAR(1) NOT NULL, "update" VARCHAR(1) NOT NULL, "delete" VARCHAR(1) NOT NULL, "launch" VARCHAR(1) NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100), "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "active_flag" VARCHAR(1) NOT NULL, CONSTRAINT "taskboard_security_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-31
CREATE TABLE  "taskboard_task_files" ("id" UUID NOT NULL, "taskboard_task_id" UUID NOT NULL, "file_type" VARCHAR(100), "file_path" VARCHAR(100), "tenant_id" VARCHAR(60) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100), "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "file_name" VARCHAR, CONSTRAINT "taskboard_task_files_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-32
CREATE TABLE  "grid_filter" ("filter_id" UUID NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "filter_name" VARCHAR(100) NOT NULL, "filter_type" VARCHAR(100) NOT NULL, "filter_value" VARCHAR(100) NOT NULL, "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "operator" VARCHAR(50) NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "grid_id" UUID NOT NULL, CONSTRAINT "grid_filter_pkey" PRIMARY KEY ("filter_id"));

-- changeset pradeep:1627330094911-33
CREATE TABLE  "workflow_report" ("report_id" UUID NOT NULL, "report_name" VARCHAR(100) NOT NULL, "report_type" VARCHAR(100) NOT NULL, "workflow_name" VARCHAR(100) NOT NULL, "workflow_key" VARCHAR(100) NOT NULL, "workflow_version" INTEGER NOT NULL, "task_name" VARCHAR(100) NOT NULL, "report_json" JSON, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "enable_report" VARCHAR(1), "created_by" VARCHAR(255), "task_id" UUID, CONSTRAINT "workflow_report_pkey" PRIMARY KEY ("report_id"));

-- changeset pradeep:1627330094911-34
CREATE TABLE  "workflow_report_permission" ("id" UUID NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "report_id" UUID NOT NULL, "group_id" UUID NOT NULL, "created_by" VARCHAR(100) NOT NULL, CONSTRAINT "workflow_report_permission_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-35
CREATE TABLE  "users" ("user_id" UUID NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "email_id" VARCHAR(355) NOT NULL, "first_name" VARCHAR(100), "last_login" TIMESTAMP WITHOUT TIME ZONE, "last_name" VARCHAR(100), "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "user_name" VARCHAR(200), "user_password" VARCHAR(200), "user_type" VARCHAR(10), "profile_picture" VARCHAR, "contact_email_id" VARCHAR(355) NOT NULL, "contact_mobile_number" VARCHAR(50), "otp_provider" VARCHAR(20), "otp_secret" VARCHAR(200), "auth_type" VARCHAR(20), "auth_token" VARCHAR(4000), "auth_expiration_date" TIMESTAMP WITHOUT TIME ZONE, "is_two_factor" VARCHAR(1), CONSTRAINT "users_pkey" PRIMARY KEY ("user_id"));

-- changeset pradeep:1627330094911-36
CREATE TABLE  "group_message_read_times" ("id" UUID NOT NULL, "message_history_id" UUID NOT NULL, "read_time" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "user_id" UUID NOT NULL, CONSTRAINT "group_message_read_times_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-37
CREATE TABLE  "group" ("group_id" UUID NOT NULL, "group_name" VARCHAR NOT NULL, "group_desc" VARCHAR, "created_by" VARCHAR, "created_date" TIMESTAMP WITHOUT TIME ZONE, "updated_by" VARCHAR, "updated_date" TIMESTAMP WITHOUT TIME ZONE, "active_flag" VARCHAR, "tenant_id" VARCHAR, CONSTRAINT "group_pkey" PRIMARY KEY ("group_id"));

-- changeset pradeep:1627330094911-38
CREATE TABLE  "market_place_installed_apps" ("id" UUID NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "process_definition_name" VARCHAR(255), "tenant_id" VARCHAR(60) NOT NULL, "description" VARCHAR(250), "start_key" VARCHAR(255), CONSTRAINT "market_place_installed_apps_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-39
CREATE TABLE  "menu" ("menu_id" UUID NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "collapsible" VARCHAR(5) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "menu_name" VARCHAR(100) NOT NULL, "menu_orientation" VARCHAR(50) NOT NULL, "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "application_id" UUID, "managed_flag" VARCHAR(1), CONSTRAINT "menu_pkey" PRIMARY KEY ("menu_id"));

-- changeset pradeep:1627330094911-40
CREATE TABLE  "menu_details" ("id" UUID NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "menu_name" VARCHAR(100) NOT NULL, "menu_path" VARCHAR(100), "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "page_id" UUID, "tenant_id" VARCHAR(60) NOT NULL, "menu_id" UUID NOT NULL, "parent_menu_id" UUID, "display_order" BIGINT, "custom_page_id" UUID, "icon" VARCHAR(25), "report_id" UUID, CONSTRAINT "menu_details_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-41
CREATE TABLE  "message_group" ("id" UUID NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "group_name" VARCHAR, CONSTRAINT "message_group_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-42
CREATE TABLE  "message_group_users" ("id" UUID NOT NULL, "message_group_id" UUID NOT NULL, "user_id" UUID NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, CONSTRAINT "message_group_users_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-43
CREATE TABLE  "message_history" ("id" UUID NOT NULL, "from_id" UUID NOT NULL, "to_id" UUID, "message" VARCHAR NOT NULL, "read_time" TIMESTAMP WITHOUT TIME ZONE, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "group_id" UUID, CONSTRAINT "message_history_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-44
CREATE TABLE  "metrics_data" ("id" UUID NOT NULL, "metric_type" VARCHAR(10) NOT NULL, "task_id" UUID NOT NULL, "recipient_id" VARCHAR(50) NOT NULL, "created_by" VARCHAR(50) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "sent_timestamp" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "tenant_id" VARCHAR(50) NOT NULL, CONSTRAINT "metrics_data_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-45
CREATE TABLE  "notifications" ("id" UUID NOT NULL, "from_id" UUID NOT NULL, "to_id" UUID, "message" VARCHAR NOT NULL, "read_time" TIMESTAMP WITHOUT TIME ZONE, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "task_id" UUID, "group_id" UUID, "type" VARCHAR(100), "taskboard_id" UUID, "taskboard_task_id" UUID, CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-46
CREATE TABLE  "org_auth_associate_group" ("associate_id" UUID NOT NULL, "id" UUID NOT NULL, "group_id" UUID NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100), "modified_on" TIMESTAMP WITHOUT TIME ZONE, "active_flag" VARCHAR(1) NOT NULL, CONSTRAINT "org_auth_associate_group_pk" PRIMARY KEY ("associate_id"));

-- changeset pradeep:1627330094911-47
CREATE TABLE  "org_auth_methods" ("id" UUID NOT NULL, "auth_provider" VARCHAR(60) NOT NULL, "allowed_domains" VARCHAR(500) NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100), "modified_on" TIMESTAMP WITHOUT TIME ZONE, "active_flag" VARCHAR(1) NOT NULL, CONSTRAINT "org_auth_methods_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-48
CREATE TABLE  "org_auth_associate_roles" ("id" UUID NOT NULL, "org_auth_methods_id" UUID NOT NULL, "role_id" UUID NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100), "modified_on" TIMESTAMP WITHOUT TIME ZONE, "active_flag" VARCHAR(1) NOT NULL, CONSTRAINT "org_auth_associate_roles_pk" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-49
CREATE TABLE  "org_custom_attributes" ("id" UUID NOT NULL, "attribute_name" VARCHAR(400) NOT NULL, "attribute_value" VARCHAR(1000), "attribute_datatype" VARCHAR(60) NOT NULL, "attribute_type" VARCHAR(60) NOT NULL, "attribute_size" BIGINT NOT NULL, "attribute_required" VARCHAR(60), "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, CONSTRAINT "org_custom_attributes_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-50
CREATE TABLE  "org_integrated_apps_config" ("id" UUID NOT NULL, "org_integrated_apps_id" UUID, "tenant_id" VARCHAR(60) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100), "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "auth_type" VARCHAR(100), "auth_token" VARCHAR(1000), "api_key" VARCHAR(100), "api_secret" VARCHAR(1000), "client_id" VARCHAR(100), "client_secret" VARCHAR(1000), CONSTRAINT "org_integrated_apps_config_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-51
CREATE TABLE  "org_integrated_apps" ("id" UUID NOT NULL, "app_name" VARCHAR(100) NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100), "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "auth_token" VARCHAR(1000), "is_removed" VARCHAR(1), CONSTRAINT "org_integrated_apps_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-52
CREATE TABLE  "org_sms_settings" ("id" UUID NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "provider_name" VARCHAR(100), "secret_key" VARCHAR(500), "secret_token" VARCHAR(500), "created_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100) NOT NULL, "from_phone_number" VARCHAR(20), "service_name" VARCHAR(50), CONSTRAINT "org_sms_settings_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-53
CREATE TABLE  "organization" ("id" UUID NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "allowed_domain_names" VARCHAR(300), "organization_url" VARCHAR(255), "subdomain_name" VARCHAR(100) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "org_name" VARCHAR(200) NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "logo" VARCHAR, "theme_id" VARCHAR, "enable_two_factor" VARCHAR(1) NULL, "background_image" VARCHAR(255),CONSTRAINT "organization_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-54
CREATE TABLE  "organization_preferences" ("id" UUID NOT NULL, "default_page_size" INTEGER NOT NULL, "pending_task_color" VARCHAR(100) NOT NULL, "completed_task_color" VARCHAR(100) NOT NULL, "error_task_color" VARCHAR(100) NOT NULL, "draft_task_color" VARCHAR(100) NOT NULL, "approve_task_color" VARCHAR(100) NOT NULL, "reject_task_color" VARCHAR(100) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, CONSTRAINT "organization_preferences_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-55
CREATE TABLE  "payment_settings" ("uuid" UUID NOT NULL, "ya_stripe_key_name" VARCHAR(100) NOT NULL, "ya_description" VARCHAR(3000), "ya_publish_key" VARCHAR(500) NOT NULL, "ya_secret_key" VARCHAR(500) NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100), "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "active_flag" VARCHAR(1) NOT NULL, CONSTRAINT "payment_settings_pkey" PRIMARY KEY ("uuid"));

-- changeset pradeep:1627330094911-56
CREATE TABLE  "process_def_task_properties" ("task_id" UUID, "task_properties_id" UUID NOT NULL, "property_name" VARCHAR(50), "property_value" JSON, "process_definition_id" VARCHAR(100), "created_by" VARCHAR(100), "created_date" TIMESTAMP WITHOUT TIME ZONE, "updated_by" VARCHAR(100), "updated_date" TIMESTAMP WITHOUT TIME ZONE, "tenant_id" VARCHAR(60), CONSTRAINT "process_def_task_properties_pkey" PRIMARY KEY ("task_properties_id"));

-- changeset pradeep:1627330094911-57
CREATE TABLE  "process_definition_permission" ("process_def_prmsn_id" UUID NOT NULL, "process_definition_id" UUID NOT NULL, "group_id" UUID NOT NULL, "update_allowed" VARCHAR, "read_allowed" VARCHAR, "launch_allowed" VARCHAR, "publish_allowed" VARCHAR(1) NOT NULL, "created_by" VARCHAR, "created_date" TIMESTAMP WITHOUT TIME ZONE, "updated_by" VARCHAR, "updated_date" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "active_flag" VARCHAR(1), "tenant_id" VARCHAR, CONSTRAINT "process_definition_permission_pkey" PRIMARY KEY ("process_def_prmsn_id"));

-- changeset pradeep:1627330094911-58
CREATE TABLE  "process_instance_errors" ("id" UUID NOT NULL, "process_definition_id" UUID NOT NULL, "process_instance_id" UUID NOT NULL, "process_instance_task_id" UUID NOT NULL, "error_description" VARCHAR(2000) NOT NULL, "resolution_status" VARCHAR(100), "created_by" VARCHAR(50) NOT NULL, "created_date" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "updated_by" VARCHAR(100), "updated_date" TIMESTAMP WITHOUT TIME ZONE, "tenant_id" VARCHAR(50) NOT NULL, CONSTRAINT "process_instance_errors_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-59
CREATE TABLE  "process_instance" ("created_by" VARCHAR(100), "created_date" TIMESTAMP WITHOUT TIME ZONE, "updated_by" VARCHAR(100), "updated_date" TIMESTAMP WITHOUT TIME ZONE, "process_instance_id" UUID NOT NULL, "status" VARCHAR, "start_time" TIMESTAMP WITHOUT TIME ZONE, "end_time" TIMESTAMP WITHOUT TIME ZONE, "started_by" VARCHAR, "completed_by" VARCHAR, "start_task" UUID, "end_task" UUID, "process_definition_id" UUID, "tenant_id" VARCHAR(60), "initiated_by_task_id" UUID, CONSTRAINT "process_instance_pkey" PRIMARY KEY ("process_instance_id"));

-- changeset pradeep:1627330094911-60
CREATE TABLE  "process_instance_task_file" ("task_file_att_id" UUID NOT NULL, "process_instance_task_id" UUID NOT NULL, "file_name" VARCHAR(20), "added_by" UUID NOT NULL, "created_date" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "updated_date" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "files" BYTEA, "tenant_id" VARCHAR(60), "created_by" VARCHAR(100), "updated_by" VARCHAR(100), CONSTRAINT "process_instance_task_file_pkey" PRIMARY KEY ("task_file_att_id"));

-- changeset pradeep:1627330094911-61
CREATE TABLE  "process_instance_task_notes" ("task_notes_att_id" UUID NOT NULL, "process_instance_task_id" UUID NOT NULL, "notes" VARCHAR(300), "added_by" UUID NOT NULL, "created_date" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "updated_date" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "updated_by" VARCHAR NOT NULL, "tenant_id" VARCHAR(60), "created_by" VARCHAR(100), CONSTRAINT "process_instance_task_notes_pkey" PRIMARY KEY ("task_notes_att_id"));

-- changeset pradeep:1627330094911-62
CREATE TABLE  "process_instance_tasks" ("created_by" VARCHAR(100), "created_date" TIMESTAMP WITHOUT TIME ZONE, "updated_by" VARCHAR(100), "updated_date" TIMESTAMP WITHOUT TIME ZONE, "process_instance_id" UUID, "process_instance_task_id" UUID NOT NULL, "assigned_to" UUID, "start_time" TIMESTAMP WITHOUT TIME ZONE, "end_time" TIMESTAMP WITHOUT TIME ZONE, "task_id" UUID, "status" VARCHAR, "description" VARCHAR, "due_date" TIMESTAMP WITHOUT TIME ZONE, "data" JSON, "tenant_id" VARCHAR(60), "due_date_event_processed_on" TIMESTAMP WITHOUT TIME ZONE, "assigned_to_group" UUID, "referred_by" UUID, "task_completion_remainder" TIMESTAMP WITHOUT TIME ZONE, "initiated_process_instance_alias" VARCHAR, "initiated_process_instance_id" UUID, "reminder_task" JSON, "task_data" JSONB, CONSTRAINT "process_instance_tasks_pkey" PRIMARY KEY ("process_instance_task_id"));

-- changeset pradeep:1627330094911-63
CREATE TABLE  "process_queue" ("process_queue_id" UUID NOT NULL, "process_instance_id" UUID NOT NULL, "process_definition_task_id" UUID NOT NULL, "picked_up_by" VARCHAR, "picked_up_timestamp" TIMESTAMP WITHOUT TIME ZONE, "created_timestamp" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "status" VARCHAR(20) NOT NULL, "error_description" VARCHAR(10000), CONSTRAINT "process_queue_pkey" PRIMARY KEY ("process_queue_id"));

-- changeset pradeep:1627330094911-64
CREATE TABLE  "service_token" ("id" UUID NOT NULL, "api_name" VARCHAR(100) NOT NULL, "api_key" VARCHAR(100) NOT NULL, "secret_key" VARCHAR(100) NOT NULL, "expires_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "user_id" UUID NOT NULL, "internal" VARCHAR(1) NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, CONSTRAINT "service_token_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-65
CREATE TABLE  "shedlock" ("name" VARCHAR(64) NOT NULL, "lock_until" TIMESTAMP WITHOUT TIME ZONE, "locked_at" TIMESTAMP WITHOUT TIME ZONE, "locked_by" VARCHAR(255), CONSTRAINT "shedlock_pkey" PRIMARY KEY ("name"));

-- changeset pradeep:1627330094911-66
CREATE TABLE  "shopping_cart" ("id" UUID NOT NULL, "cart_name" VARCHAR(100) NOT NULL, "cart_label" VARCHAR(100) NOT NULL, "cart_data" JSON NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, CONSTRAINT "shopping_cart_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-67
CREATE TABLE  "table_objects_columns" ("id" UUID NOT NULL, "table_objects_id" UUID NOT NULL, "column_name" VARCHAR(100) NOT NULL, "data_type" VARCHAR(100) NOT NULL, "field_size" BIGINT, "is_unique" VARCHAR(100) NOT NULL, "is_required" VARCHAR(100) NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "tenant_id" VARCHAR(30) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "column_identifier" VARCHAR, CONSTRAINT "table_objects_columns_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-68
CREATE TABLE  "table_objects" ("table_objects_id" UUID NOT NULL, "table_name" VARCHAR(100) NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "tenant_id" VARCHAR(30) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "table_identifier" VARCHAR, "managed_flag" VARCHAR(10), "public_table" VARCHAR(1), CONSTRAINT "table_objects_pkey" PRIMARY KEY ("table_objects_id"));

-- changeset pradeep:1627330094911-69
CREATE TABLE  "taskboard_apps_config" ("id" UUID NOT NULL, "taskboard_id" UUID, "taskboard_apps_id" UUID, "tenant_id" VARCHAR(60) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100), "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "auth_type" VARCHAR(100), "auth_token" VARCHAR(1000), "api_key" VARCHAR(100), "api_secret" VARCHAR(1000), "client_id" VARCHAR(100), "client_secret" VARCHAR(1000), CONSTRAINT "taskboard_apps_config_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-70
CREATE TABLE  "taskboard_apps" ("id" UUID NOT NULL, "taskboard_id" UUID, "tenant_id" VARCHAR(60) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100), "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "app_name" VARCHAR(100), CONSTRAINT "taskboard_apps_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-71
CREATE TABLE  "taskboard_task_labels" ("id" UUID NOT NULL, "taskboard_task_id" UUID NOT NULL, "taskboard_labels_id" UUID NOT NULL, "label_name" VARCHAR(300), "tenant_id" VARCHAR(60) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100), "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "active_flag" VARCHAR(1) NOT NULL, CONSTRAINT "taskboard_task_labels_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-72
CREATE TABLE  "taskboard_sub_status" ("id" UUID NOT NULL, "taskboard_column_id" UUID NOT NULL, "sub_status_name" VARCHAR(100) NOT NULL, "sub_status_color" VARCHAR(100) NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100), "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "column_order" BIGINT, CONSTRAINT "taskboard_sub_status_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-73
CREATE TABLE  "user_custom_attribute" ("id" UUID NOT NULL, "attribute_name" VARCHAR(400) NOT NULL, "attribute_value" VARCHAR(1000) NOT NULL, "attribute_datatype" VARCHAR(60) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, "user_id" UUID NOT NULL, CONSTRAINT "user_custom_attribute_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-74
CREATE TABLE  "user_otp_recovery_codes" ("id" UUID NOT NULL, "user_id" UUID NOT NULL, "recovery_code" VARCHAR(60) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "created_by" VARCHAR(100) NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "tenant_id" VARCHAR(60) NOT NULL, CONSTRAINT "user_otp_recovery_codes_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-75
CREATE TABLE  "user_permission" ("id" UUID NOT NULL, "page_id" VARCHAR(200), "page_name" VARCHAR(200), "workflow_key" VARCHAR(200), "workflow_name" VARCHAR(200), "active_flag" VARCHAR(1) NOT NULL, "create_allowed" VARCHAR(1), "delete_allowed" VARCHAR(1), "read_allowed" VARCHAR(1), "update_allowed" VARCHAR(1), "launch_allowed" VARCHAR(1), "publish_allowed" VARCHAR(1), "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "version" BIGINT, "service_token_id" UUID NOT NULL, CONSTRAINT "user_permission_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-76
CREATE TABLE  "users_workflow_pins" ("id" UUID NOT NULL, "user_id" UUID NOT NULL, "process_definition_key" VARCHAR(100) NOT NULL, "tenant_id" VARCHAR NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "created_by" VARCHAR(100) NOT NULL, "updated_date" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "created_date" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "updated_by" VARCHAR(100) NOT NULL, CONSTRAINT "users_workflow_pins_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-77
CREATE TABLE  "yoro_time_zone" ("id" UUID NOT NULL, "time_zone_code" VARCHAR(100) NOT NULL, "time_zone_label" VARCHAR(100) NOT NULL, "default_time_zone" VARCHAR(1) NOT NULL, "created_by" VARCHAR(100), "created_date" TIMESTAMP WITHOUT TIME ZONE, "updated_by" VARCHAR(100), "updated_date" TIMESTAMP WITHOUT TIME ZONE, "tenant_id" VARCHAR(60) NOT NULL, "active_flag" VARCHAR(1) NOT NULL, CONSTRAINT "yoro_time_zone_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-78
CREATE TABLE  "yorosis_themes" ("id" UUID NOT NULL, "theme_name" VARCHAR, "theme_id" VARCHAR, "created_by" VARCHAR(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" VARCHAR(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "active_flag" VARCHAR(1) NOT NULL, "tenant_id" VARCHAR(60), CONSTRAINT "yorosis_themes_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-79
ALTER TABLE  "menu" ADD CONSTRAINT "menu_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES  "application" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-80
ALTER TABLE  "application_permissions" ADD CONSTRAINT "application_permissions_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES  "application" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-81
ALTER TABLE  "page_permissions" ADD CONSTRAINT "fkp6hm09wogk9r7tgamvu1cpxxq" FOREIGN KEY ("group_id") REFERENCES  "yoro_groups" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-82
ALTER TABLE  "menu_details" ADD CONSTRAINT "menu_details_custom_page_id_fkey" FOREIGN KEY ("custom_page_id") REFERENCES  "custom_pages" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-83
ALTER TABLE  "taskboard_task_assigned_users" ADD CONSTRAINT "fk1eifumi2n3fw48gdy1qsylj91" FOREIGN KEY ("taskboard_task_id") REFERENCES  "taskboard_task" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-84
ALTER TABLE  "taskboard_task_comments" ADD CONSTRAINT "fk1s1dlxi7ntimw1u52wxfnkavm" FOREIGN KEY ("taskboard_task_id") REFERENCES  "taskboard_task" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-85
ALTER TABLE  "taskboard_columns" ADD CONSTRAINT "fk3ib85k78h5k0hf7lhp7a2v36t" FOREIGN KEY ("taskboard_id") REFERENCES  "taskboard" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-86
ALTER TABLE  "taskboard_sub_status" ADD CONSTRAINT "taskboard_sub_status_fkey" FOREIGN KEY ("taskboard_column_id") REFERENCES  "taskboard_columns" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-87
ALTER TABLE  "yoro_groups_user" ADD CONSTRAINT "fkauyseg6jagxf4mus8wcq3h59y" FOREIGN KEY ("group_id") REFERENCES  "yoro_groups" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-88
ALTER TABLE  "page_permissions" ADD CONSTRAINT "fkb1aowyxbkve5xpeq806kckwmu" FOREIGN KEY ("page_id") REFERENCES  "page" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-89
ALTER TABLE  "taskboard_labels" ADD CONSTRAINT "fke1g9x7atjagstifalfjcvhltm" FOREIGN KEY ("taskboard_id") REFERENCES  "taskboard" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-90
ALTER TABLE  "grid_filter" ADD CONSTRAINT "fkinmkg3j0hk32fm8vel8402o7a" FOREIGN KEY ("grid_id") REFERENCES  "grids" ("grid_id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-91
ALTER TABLE  "workflow_report_permission" ADD CONSTRAINT "fkow4k4flgq9lumefll6244imyw" FOREIGN KEY ("report_id") REFERENCES  "workflow_report" ("report_id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-92
ALTER TABLE  "users" ADD CONSTRAINT "uk_k8d0f2n7n88w1a16yhua64onx" UNIQUE ("user_name");

-- changeset pradeep:1627330094911-93
ALTER TABLE  "users" ADD CONSTRAINT "uk_pwrpg821nujmmnavoq7s420jn" UNIQUE ("email_id");

-- changeset pradeep:1627330094911-94
ALTER TABLE  "menu_details" ADD CONSTRAINT "menu_details_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES  "menu" ("menu_id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-95
ALTER TABLE  "menu_details" ADD CONSTRAINT "menu_details_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES  "page" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-96
ALTER TABLE  "message_group_users" ADD CONSTRAINT "message_group_users_message_group_id_fkey" FOREIGN KEY ("message_group_id") REFERENCES  "message_group" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-97
ALTER TABLE  "message_group_users" ADD CONSTRAINT "message_group_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES  "users" ("user_id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-98
ALTER TABLE  "org_auth_associate_roles" ADD CONSTRAINT "org_auth_associate_roles_org_auth_methods_fk" FOREIGN KEY ("org_auth_methods_id") REFERENCES  "org_auth_methods" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-99
ALTER TABLE  "org_integrated_apps_config" ADD CONSTRAINT "org_integrated_apps_pkey" FOREIGN KEY ("org_integrated_apps_id") REFERENCES  "org_integrated_apps" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-100
ALTER TABLE  "service_token" ADD CONSTRAINT "service_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES  "users" ("user_id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-101
ALTER TABLE  "user_permission" ADD CONSTRAINT "user_permission_service_token_id_fkey" FOREIGN KEY ("service_token_id") REFERENCES  "service_token" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-102
ALTER TABLE  "taskboard_apps_config" ADD CONSTRAINT "taskboard_foreign_key" FOREIGN KEY ("taskboard_id") REFERENCES  "taskboard" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-103
ALTER TABLE  "taskboard_task_labels" ADD CONSTRAINT "taskboard_labels_fkey" FOREIGN KEY ("taskboard_labels_id") REFERENCES  "taskboard_labels" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-104
ALTER TABLE  "taskboard_task_labels" ADD CONSTRAINT "taskboard_task_fkey" FOREIGN KEY ("taskboard_task_id") REFERENCES  "taskboard_task" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-105
ALTER TABLE  "user_custom_attribute" ADD CONSTRAINT "user_custom_attribute_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES  "users" ("user_id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-106
ALTER TABLE  "application_permissions" ADD CONSTRAINT "application_permissions_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES  "yoro_groups" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-107
ALTER TABLE  "environment_variable" ADD CONSTRAINT "environment_variable_fkey" FOREIGN KEY ("process_definition_id") REFERENCES  "process_definitions" ("process_definition_id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-108
ALTER TABLE  "taskboard_task" ADD CONSTRAINT "fkftylbh0b2ej2lrjm2tr1dlupn" FOREIGN KEY ("taskboard_id") REFERENCES  "taskboard" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-109
ALTER TABLE  "process_def_task_permission" ADD CONSTRAINT "fk35qnpgo1ae274aqxpfjxt70eb" FOREIGN KEY ("task_id") REFERENCES  "process_definition_tasks" ("task_id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-110
ALTER TABLE  "user_associate_roles" ADD CONSTRAINT "fk97mxvrajhkq19dmvboprimeg1" FOREIGN KEY ("role_id") REFERENCES  "yoro_roles" ("role_id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-111
ALTER TABLE  "menu_details_associate_roles" ADD CONSTRAINT "menu_details_associate_roles_fk" FOREIGN KEY ("menu_details_id") REFERENCES  "menu_details" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-112
ALTER TABLE  "user_associate_roles" ADD CONSTRAINT "user_associate_roles_fk" FOREIGN KEY ("user_id") REFERENCES  "users" ("user_id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-113
ALTER TABLE  "yoro_groups_user" ADD CONSTRAINT "fksl2jutaberu1c3vapgsgeqi6h" FOREIGN KEY ("user_id") REFERENCES  "users" ("user_id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-114
ALTER TABLE  "org_auth_associate_group" ADD CONSTRAINT "org_auth_associate_group_org_auth_methods_fk" FOREIGN KEY ("id") REFERENCES  "org_auth_methods" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-115
ALTER TABLE  "table_objects_columns" ADD CONSTRAINT "table_objects_columns_table_objects_id" FOREIGN KEY ("table_objects_id") REFERENCES  "table_objects" ("table_objects_id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-116
ALTER TABLE  "taskboard_apps_config" ADD CONSTRAINT "taskboard_apps_key" FOREIGN KEY ("taskboard_apps_id") REFERENCES  "taskboard_apps" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-117
ALTER TABLE  "custom_page_permissions" ADD CONSTRAINT "custom_pages_fk" FOREIGN KEY ("custom_page_id") REFERENCES "custom_pages" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-118
ALTER TABLE  "custom_page_permissions" ADD CONSTRAINT "group_fk" FOREIGN KEY ("group_id") REFERENCES "yoro_groups" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-119
CREATE TABLE "org_settings" ("id" uuid NOT NULL, "active_flag" varchar(1) NOT NULL, "created_by" varchar(100) NOT NULL, "created_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "modified_by" varchar(100) NOT NULL, "modified_on" TIMESTAMP WITHOUT TIME ZONE NOT NULL, "tenant_id" varchar(50) NOT NULL, "setting_name" varchar(150) NOT NULL, "setting_type" varchar(150) NOT NULL, "setting_data" json NOT NULL, CONSTRAINT "org_settings_pkey" PRIMARY KEY ("id"));

-- changeset pradeep:1627330094911-120
alter table "grid_columns" add CONSTRAINT "grid_columns_pk" FOREIGN KEY ("grid_id") REFERENCES "grids" ("grid_id") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-121
alter table event_automation add CONSTRAINT event_automation_pk FOREIGN KEY (taskboard_id) REFERENCES taskboard(id) ON UPDATE NO ACTION ON DELETE NO ACTION;

-- changeset pradeep:1627330094911-122
ALTER TABLE  "menu_details_associate_roles" ADD CONSTRAINT "menu_details_associate_roles_fk2" FOREIGN KEY (role_id) REFERENCES yoro_roles(role_id);

-- changeset pradeep:1627330094911-123
alter table "taskboard_apps" add CONSTRAINT taskboard_foreign_key FOREIGN KEY (taskboard_id) REFERENCES taskboard(id);

-- changeset pradeep:1627330094911-124
alter table taskboard_columns_security add CONSTRAINT taskboard_columns_security_fk FOREIGN KEY (taskboard_column_id) REFERENCES taskboard_columns(id);

-- changeset pradeep:1627330094911-125
alter table taskboard_security add CONSTRAINT taskboard_security_fk FOREIGN KEY (taskboard_id) REFERENCES taskboard(id);

-- changeset pradeep:1627330094911-126
alter table taskboard_task_files add CONSTRAINT taskboard_task_files_fk FOREIGN KEY (taskboard_task_id) REFERENCES  taskboard_task(id);
