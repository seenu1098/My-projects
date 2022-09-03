package com.yorosis.livetester.file.transfer;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;

import org.apache.commons.io.IOUtils;
import org.springframework.stereotype.Component;

import com.jcraft.jsch.ChannelExec;
import com.jcraft.jsch.JSchException;
import com.jcraft.jsch.Session;
import com.yorosis.livetester.file.transfer.model.FileDestination;
import com.yorosis.livetester.file.transfer.model.FileTransferException;

import lombok.extern.slf4j.Slf4j;

@Component("scp")
@Slf4j
public class SCPFileTransfer extends AbstractFileTransfer implements FileTransfer {

	@Override
	public void copyFileToRemoteServer(List<File> sourceFileList, FileDestination fileDest) throws FileTransferException {
		try {
			for (File sourceFile : sourceFileList) {
				copyLocalFileToRemote(sourceFile.getPath(), fileDest.getRemoteFolder(), fileDest);
			}

		} catch (JSchException | IOException e) {
			throw new FileTransferException(e);
		}
	}

	@Override
	public void copyStringToRemoteServer(List<String> sourceContents, FileDestination fileDest) throws FileTransferException {
		try {
			for (String sourceContent : sourceContents) {
				copyStringToRemote(sourceContent, fileDest.getRemoteFolder(), fileDest);
			}

		} catch (JSchException | IOException e) {
			throw new FileTransferException(e);
		}
	}

	private void copyStringToRemote(String sourceContents, String to, FileDestination fileDest) throws JSchException, IOException {

		Session session = getSessionInfo(fileDest);
		session.connect();
		// exec 'scp -t rfile' remotely
		String command = "scp -t " + to;
		ChannelExec channelExec = (ChannelExec) session.openChannel("exec");
		channelExec.setCommand(command);

		try (InputStream fis = IOUtils.toInputStream(sourceContents); OutputStream out = channelExec.getOutputStream(); InputStream in = channelExec.getInputStream();) {

			channelExec.connect();

			checkAck(in);

			// send "C0644 filesize filename", where filename should not include '/'
			long filesize = sourceContents.length();
			command = "C0644 " + filesize + " ";

			command += fileDest.getRemoteFileName();

			command += "\n";
			out.write(command.getBytes());
			out.flush();

			checkAck(in);

			writeContentsAsBytes(fis, out);

			checkAck(in);

		} finally {
			clearSession(session, channelExec);
		}

	}

	private void copyLocalFileToRemote(String sourceFilePath, String to, FileDestination fileDest) throws JSchException, IOException {
		Session session = getSessionInfo(fileDest);
		session.connect();
		// exec 'scp -t rfile' remotely
		String command = "scp -t " + to;
		ChannelExec channelExec = (ChannelExec) session.openChannel("exec");
		channelExec.setCommand(command);

		try (FileInputStream fis = new FileInputStream(sourceFilePath); OutputStream out = channelExec.getOutputStream(); InputStream in = channelExec.getInputStream();) {

			channelExec.connect();

			checkAck(in);

			File sourceFile = new File(sourceFilePath);

			// send "C0644 filesize filename", where filename should not include '/'
			long filesize = sourceFile.length();
			command = "C0644 " + filesize + " ";
			command += fileDest.getRemoteFileName();

			command += "\n";
			out.write(command.getBytes());
			out.flush();

			checkAck(in);

			writeContentsAsBytes(fis, out);

			checkAck(in);

		} finally {
			clearSession(session, channelExec);
		}

	}

	private static void clearSession(Session session, ChannelExec channelExec) {
		if (channelExec.isConnected()) {
			channelExec.disconnect();
		}

		if (session.isConnected()) {
			session.disconnect();
		}
	}

	private static void writeContentsAsBytes(InputStream fis, OutputStream out) throws IOException {
		byte[] buf = new byte[1024];
		while (true) {
			int len = fis.read(buf, 0, buf.length);
			if (len <= 0)
				break;
			out.write(buf, 0, len);
		}

		// send '\0'
		buf[0] = 0;
		out.write(buf, 0, 1);
		out.flush();
	}

	private static int checkAck(InputStream in) throws IOException {
		int b = in.read();
		// b may be 0 for success,
		// 1 for error,
		// 2 for fatal error,
		// -1
		if (b == 0)
			return b;
		if (b == -1)
			return b;

		if (b == 1 || b == 2) {
			StringBuilder sb = new StringBuilder();
			int c;
			do {
				c = in.read();
				sb.append((char) c);
			} while (c != '\n');
			if (b == 1) { // error
				log.error("Some error occured {}", sb.toString());
				throw new IOException(sb.toString());
			}
			if (b == 2) { // fatal error
				log.error("Some Fatal error occured {}", sb.toString());
				throw new IOException(sb.toString());

			}
		}
		return b;
	}

}
