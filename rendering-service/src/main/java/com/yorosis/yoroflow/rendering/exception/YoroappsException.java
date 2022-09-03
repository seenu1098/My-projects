package com.yorosis.yoroflow.rendering.exception;

public class YoroappsException extends Exception {
	private static final long serialVersionUID = 1L;

	public YoroappsException(String errorMessage) {
		super(errorMessage);
	}
	
	

	public YoroappsException(Exception ex) {
		super(ex);
	}
}
