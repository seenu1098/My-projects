-- liquibase formatted sql

-- changeset india:28012022-00001

INSERT INTO org_auth_methods (id, auth_provider, allowed_domains, tenant_id, created_by, created_on, modified_by, modified_on, active_flag) 
VALUES('b4994848-4946-4727-ac64-c36407bff6d8', 'Sign in with Microsoft Azure', '', '${tenantId}', '${customerUserId}', '2022-01-24 18:31:45.834', '${customerUserId}', '2022-01-28 14:16:24.644', 'N');
