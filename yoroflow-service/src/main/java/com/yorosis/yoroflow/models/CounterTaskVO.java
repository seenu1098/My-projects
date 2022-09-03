package com.yorosis.yoroflow.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class CounterTaskVO {
	private String counterType;
	private Integer countIncreasedBy;
	private Long resetAt;
	private String counterLabel;
	private String name;
	private String timeZone;
	private Integer countStartAt;
}
