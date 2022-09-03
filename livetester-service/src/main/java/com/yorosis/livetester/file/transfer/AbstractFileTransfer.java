package com.yorosis.livetester.file.transfer;

import org.apache.commons.lang3.StringUtils;

import com.jcraft.jsch.JSch;
import com.jcraft.jsch.JSchException;
import com.jcraft.jsch.Session;
import com.yorosis.livetester.file.transfer.model.FileDestination;

public abstract class AbstractFileTransfer {

	protected Session getSessionInfo(FileDestination fileDest) throws JSchException {
		JSch jsch = new JSch();

		Session session = jsch.getSession(fileDest.getUserName(), fileDest.getRemoteHost(), 22);

		String privateKeyText = fileDest.getPrivateKeyFileText();
		if (StringUtils.isNotBlank(privateKeyText)) {
			byte[] keyByteArray = privateKeyText.getBytes();
			String passphrase = fileDest.getPrivateKeyPassphrase();

			jsch.addIdentity(fileDest.getUserName(), keyByteArray, StringUtils.isNotBlank(passphrase) ? passphrase.getBytes() : null, null);
		} else {
			session.setPassword(fileDest.getPwd());
		}

		java.util.Properties config = new java.util.Properties();
		config.put("StrictHostKeyChecking", "no");

		session.setConfig(config);
		return session;

	}

}
