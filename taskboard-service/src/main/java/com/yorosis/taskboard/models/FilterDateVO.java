package com.yorosis.taskboard.models;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FilterDateVO {
	private LocalDateTime startDate;
	private LocalDateTime endDate;
}
