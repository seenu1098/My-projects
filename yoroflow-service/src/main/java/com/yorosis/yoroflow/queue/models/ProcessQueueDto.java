package com.yorosis.yoroflow.queue.models;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class ProcessQueueDto {
	private UUID processQueueId;
	private String tenantId;
	private String currentUserName;
}
