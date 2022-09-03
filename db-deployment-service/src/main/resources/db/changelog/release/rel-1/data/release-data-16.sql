-- liquibase formatted sql

-- changeset india:30112021-00001

update taskboard
    set sprint_enabled = 'N' where sprint_enabled is null;