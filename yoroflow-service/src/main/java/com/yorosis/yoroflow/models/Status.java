package com.yorosis.yoroflow.models;

public enum Status {
	COMPLETED("COMPLETED"), ABORTED("ABORTED"), IN_PROCESS("IN_PROCESS"), ERROR("ERROR");

	private final String value;

	Status(String value) {
		this.value = value;
	}

	public String getValue() {
		return value;
	}
}
