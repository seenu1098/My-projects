package com.yorosis.livetester.file.transfer.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FileDestination {
	private String remoteHost;
	private String remotePort;
	private String userName;
	private String protocol;
	private String pwd;
	private String privateKeyFileText;
	private String privateKeyPassphrase;
	private String remoteFolder;
	private String remoteFileName;
}
