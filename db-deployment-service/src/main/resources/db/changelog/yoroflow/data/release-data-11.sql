-- liquibase formatted sql

-- changeset india:19112021-00001

INSERT INTO grid_columns (id,active_flag,column_name,column_sequence_no,created_by,created_on,display_name,field_type,filterable,hidden_value,modified_by,modified_on,sortable,tenant_id,width_percentage,grid_id)
VALUES ('cf8373d4-24e3-4d4f-b830-9cbbf6e39c88','Y','created_on',5,'${customerUserId}','2020-11-17 08:48:52.000','Created Date','timeStamp','true','false','${customerUserId}','2020-11-17 08:48:52.000','true','${tenantId}',10,'bee2b791-a60e-472c-b17f-818d99b345cf');

UPDATE grids
SET sort_direction='desc',default_sortable_column='created_on'
WHERE grid_id='bee2b791-a60e-472c-b17f-818d99b345cf';