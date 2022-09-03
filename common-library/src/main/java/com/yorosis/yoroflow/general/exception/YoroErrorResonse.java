package com.yorosis.yoroflow.general.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class YoroErrorResonse {
	private String message;
	private int code;
	private String errorMessage;
}
