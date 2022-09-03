package com.yorosis.yoroflow.models;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificationsVO {
	private UUID id;
	private UUID fromId;
	private UUID groupId;
	private UUID toId;
	private String message;
	private String fromUserName;
	private UUID taskId;
	private String type;
	private UUID taskboardId;
	private UUID taskboardTaskId;
}
