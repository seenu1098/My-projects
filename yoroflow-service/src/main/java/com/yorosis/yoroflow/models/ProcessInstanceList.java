package com.yorosis.yoroflow.models;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessInstanceList {
	UUID processInstanceId;
	String procesDefName;
	LocalDateTime startDate;
	LocalDateTime updatedTime;
	String status;
	Long totalTimeTaken;
}
