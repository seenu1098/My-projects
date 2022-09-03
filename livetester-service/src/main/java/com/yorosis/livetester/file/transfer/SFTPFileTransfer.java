package com.yorosis.livetester.file.transfer;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.springframework.stereotype.Component;

import com.jcraft.jsch.ChannelSftp;
import com.jcraft.jsch.JSchException;
import com.jcraft.jsch.Session;
import com.jcraft.jsch.SftpException;
import com.yorosis.livetester.file.transfer.model.FileDestination;
import com.yorosis.livetester.file.transfer.model.FileTransferException;

@Component("sftp")
public class SFTPFileTransfer extends AbstractFileTransfer implements FileTransfer {

	@Override
	public void copyFileToRemoteServer(List<File> sourceFileList, FileDestination fileDest) throws FileTransferException {

		Session session = null;
		ChannelSftp channelSftp = null;
		for (File sourceFile : sourceFileList) {
			try (InputStream is = FileUtils.openInputStream(sourceFile)) {
				session = getSessionInfo(fileDest);
				session.connect();
				channelSftp = getChannelInfo(fileDest, session);
				channelSftp.put(is, fileDest.getRemoteFileName(), ChannelSftp.OVERWRITE);
			} catch (JSchException | SftpException | IOException e) {
				throw new FileTransferException(e);
			} finally {
				clearSession(session, channelSftp);
			}
		}

	}

	@Override
	public void copyStringToRemoteServer(List<String> sourceContents, FileDestination fileDest) throws FileTransferException {

		Session session = null;
		ChannelSftp channelSftp = null;
		for (String sourceContent : sourceContents) {
			try (InputStream is = IOUtils.toInputStream(sourceContent)) {
				session = getSessionInfo(fileDest);
				channelSftp = getChannelInfo(fileDest, session);
				channelSftp.put(is, fileDest.getRemoteFileName(), ChannelSftp.OVERWRITE);
			} catch (JSchException | SftpException | IOException e) {
				// TODO: Fix it.
				// throw new FileTransferException(e);
			} finally {
				clearSession(session, channelSftp);
			}
		}

	}

	private void clearSession(Session session, ChannelSftp channelSftp) {
		if (channelSftp != null && channelSftp.isConnected()) {
			channelSftp.disconnect();
		}

		if (session != null && session.isConnected()) {
			session.disconnect();
		}
	}

	private ChannelSftp getChannelInfo(FileDestination fileDest, Session session) throws JSchException, SftpException {
		ChannelSftp channelSftp;
		session.connect();
		channelSftp = (ChannelSftp) session.openChannel("sftp");
		channelSftp.connect();
		channelSftp.cd(fileDest.getRemoteFolder());
		return channelSftp;
	}
}
