package com.yorosis.authnz.exception;

public class YorosisException extends Exception {
	private static final long serialVersionUID = 1L;

	public YorosisException(String errorMessage) {
		super(errorMessage);
	}

	public YorosisException(Exception ex) {
		super(ex);
	}
}
