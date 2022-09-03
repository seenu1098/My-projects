package com.yorosis.yoroflow.models;

public class YoroFlowException extends Exception {

	private static final long serialVersionUID = 1L;

	public YoroFlowException(String errorMessage) {
		super(errorMessage);

	}

	public YoroFlowException(Exception ex) {
		super(ex);

	}
}