package com.yorosis.yoroflow.models;

import java.sql.Timestamp;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MessageVO {
	private UUID id;
	private UUID fromId;
	private UUID groupId;
	private UUID toId;
	private String message;
	private Timestamp redTime;
	private Timestamp createdOn;
}
