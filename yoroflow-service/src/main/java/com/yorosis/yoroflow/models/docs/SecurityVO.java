package com.yorosis.yoroflow.models.docs;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecurityVO {
	private UUID groupId;
	private Boolean readAllowed;
	private Boolean updateAllowed;
}
