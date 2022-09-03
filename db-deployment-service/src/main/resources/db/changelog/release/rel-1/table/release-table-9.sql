create
	table
		yoro_workspace ( workspace_id uuid not null,
		workspace_name varchar(100) not null,
		workspace_key varchar(100) not null,
		secured_workspace_flag varchar(1) not null,
		workspace_avatar varchar(100) null,
		default_workspace varchar(1) not null,
		archive_workspace varchar(1) not null,
		managed_workspace varchar(1) not null,
		active_flag varchar(1) not null,
		created_by varchar(100) not null,
		created_on timestamp not null,
		modified_by varchar(100) null,
		modified_on timestamp null,
		tenant_id varchar(50) not null,
		constraint yoro_workspace_pkey primary key (workspace_id) );
	create
		table
			yoro_workspace_security ( workspace_security_id uuid not null,
			workspace_id uuid not null,
			group_id uuid null,
			owner_id uuid NULL,
			active_flag varchar(1) not null,
			created_by varchar(100) not null,
			created_on timestamp not null,
			modified_by varchar(100) null,
			modified_on timestamp null,
			tenant_id varchar(50) not null,
			constraint yoro_workspace_security_pkey primary key (workspace_security_id),
			constraint yoro_workspace_foreign_key foreign key (workspace_id) references yoro_workspace(workspace_id),
			CONSTRAINT yoro_workspace_security_users_fk FOREIGN KEY (owner_id) REFERENCES users(user_id),
			constraint yoro_groups_foreign_key foreign key (group_id) references yoro_groups(id));

alter table process_definitions add workspace_id uuid null;
alter table taskboard add workspace_id uuid null;
alter table page add workspace_id uuid null;
alter table application add workspace_id uuid null;
alter table users add default_workspace uuid NULL;

create table
yoro_documents ( document_id uuid not null,
document_name varchar(100) not null,
document_key varchar(100) not null,
document_data varchar(100) not null,
parent_document_id uuid null,
active_flag varchar(1) not null,
created_by varchar(100) not null,
created_on timestamp not null,
modified_by varchar(100) null,
modified_on timestamp null,
tenant_id varchar(50) not null,
workspace_id uuid NULL,
constraint yoro_documents_pkey primary key (document_id) );

create table
yoro_documents_security ( id uuid not null,
document_id uuid not null,
group_id uuid null,
user_id uuid null,
read_allowed varchar(1) not null,
edit_allowed varchar(1) not null,
active_flag varchar(1) not null,
created_by varchar(100) not null,
created_on timestamp not null,
modified_by varchar(100) null,
modified_on timestamp null,
tenant_id varchar(50) not null,
constraint yoro_documents_security_pkey primary key (id),
constraint yoro_documents_foreign_key foreign key (document_id) references yoro_documents(document_id),
CONSTRAINT yoro_documents_security_users_fk FOREIGN KEY (user_id) REFERENCES users(user_id),
constraint yoro_groups_foreign_key foreign key (group_id) references yoro_groups(id));
