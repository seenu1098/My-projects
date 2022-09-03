package com.yorosis.taskboard.exceptions;

public class YoroFlowException extends Exception {

	private static final long serialVersionUID = 1L;

	public YoroFlowException(String errorMessage) {
		super(errorMessage);

	}

	public YoroFlowException(Exception ex) {
		super(ex);

	}
}