-- liquibase formatted sql

-- changeset india:09162021-00001
  
    
CREATE INDEX taskboard_task_taskboard_id_idx ON taskboard_task (taskboard_id);
CREATE INDEX taskboard_columns_taskboard_id_idx ON taskboard_columns (taskboard_id);
CREATE INDEX taskboard_task_assigned_users_taskboard_task_id_idx ON taskboard_task_assigned_users (taskboard_task_id);
CREATE INDEX taskboard_task_assigned_users_group_id_idx ON taskboard_task_assigned_users (group_id);
CREATE INDEX taskboard_task_assigned_users_user_id_idx ON taskboard_task_assigned_users (user_id);
CREATE INDEX taskboard_task_labels_taskboard_task_id_idx ON taskboard_task_labels (taskboard_task_id);
CREATE INDEX taskboard_task_comments_taskboard_task_id_idx ON taskboard_task_comments (taskboard_task_id);
CREATE INDEX taskboard_task_files_taskboard_task_id_idx ON taskboard_task_files (taskboard_task_id);
CREATE INDEX taskboard_security_taskboard_id_idx ON taskboard_security (taskboard_id);
CREATE INDEX taskboard_security_user_id_idx ON taskboard_security (user_id);
CREATE INDEX taskboard_security_group_id_idx ON taskboard_security (group_id);
    
    
  
  

