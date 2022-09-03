package com.yorosis.yoroflow.models;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RessignResponseTaskVO {
	private boolean reassigned;
	private UUID reassignedInstanceTaskId;
	private String response;

}
