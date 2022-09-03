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
public class TimeZoneVo {
	private String timeZoneCode;
	private String timeZoneLabel;
	private String defaultTimeZone;
	private UUID id;
}
