package com.yorosis.livetester.file.transfer.model;

public class FileTransferException extends Exception {

	private static final long serialVersionUID = 1L;

	public FileTransferException(Exception e) {
		super(e);
	}

}
