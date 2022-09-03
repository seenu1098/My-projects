package com.yorosis.yoroapps.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class YoroResponse {
	public static final String SUCCESS = "S";
	public static final String WARNING = "W";
	public static final String ERROR = "E";
	
	private String messageType;
	private String message;
	private String messageId;
}
