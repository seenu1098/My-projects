-- liquibase formatted sql

-- changeset india:18012022-00001

WITH stat AS (
    select a.taskboard_id as id, MAX(a.column_order) AS maxcol
    FROM
    taskboard_columns a
    GROUP BY a.taskboard_id
)   
UPDATE taskboard_columns
SET is_done_column = 'Y'
FROM stat
WHERE taskboard_columns.column_order = stat.maxcol and taskboard_columns.taskboard_id = stat.id;