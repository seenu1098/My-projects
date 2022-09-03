package com.yorosis.livetester.file.transfer;

import java.io.File;
import java.util.List;

import com.yorosis.livetester.file.transfer.model.FileDestination;
import com.yorosis.livetester.file.transfer.model.FileTransferException;

public interface FileTransfer {

	void copyFileToRemoteServer(List<File> sourceFile, FileDestination fileDest) throws FileTransferException;

	void copyStringToRemoteServer(List<String> sourceContents, FileDestination fileDest) throws FileTransferException;

}
