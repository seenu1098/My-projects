package com.yorosis.livetester.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Builder
@AllArgsConstructor
@Data
@EqualsAndHashCode(callSuper = true)
public class LicenseException extends RuntimeException {
	private static final long serialVersionUID = 1L;
	private final String errorId;
	private final String errorMessage;
	private final Throwable rootException;
}
