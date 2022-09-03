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
public class ReportsDashboardVO {
	private LocalDateTime startDate;
	private LocalDateTime endDate;
	private String optionType;
	private UUID userId;
	private UUID taskId;
}
