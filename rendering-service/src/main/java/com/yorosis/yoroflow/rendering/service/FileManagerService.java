package com.yorosis.yoroflow.rendering.service;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

import javax.annotation.PostConstruct;

import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.auth.AWSCredentialsProvider;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder.EndpointConfiguration;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.GetObjectRequest;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.S3ObjectInputStream;
import com.yorosis.yoroapps.vo.GridImagesVO;
import com.yorosis.yoroapps.vo.ImageKeysVO;
import com.yorosis.yoroflow.rendering.service.vo.FileUploadVO;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class FileManagerService {

	@Value("${file.bucket-name}")
	private String bucketName;

	@Value("${file.access-key}")
	private String accessKey;

	@Value("${file.access-secret}")
	private String accessSecret;

	@Value("${file.service-endpoint}")
	private String serviceEndPoint;

	@Value("${file.service-region}")
	private String serviceRegion;

	private AmazonS3 s3Buckets;

	@PostConstruct
	public void initialize() {
		AWSCredentialsProvider doCred = new AWSStaticCredentialsProvider(
				new BasicAWSCredentials(accessKey, accessSecret));
		s3Buckets = AmazonS3ClientBuilder.standard().withCredentials(doCred)
				.withEndpointConfiguration(new EndpointConfiguration(serviceEndPoint, serviceRegion)).build();
	}

	public void uploadFile(String key, File file) {
		String tenantId = YorosisContext.get().getTenantId();

		s3Buckets.putObject(new PutObjectRequest(bucketName, tenantId + "/" + key, file));
	}

	public void uploadFile(String key, InputStream inputStream, long contentSize) {
		ObjectMetadata fileObjectMetadata = new ObjectMetadata();
		fileObjectMetadata.setContentLength(contentSize);
		fileObjectMetadata.setContentType("image/jpeg");

		String tenantId = YorosisContext.get().getTenantId();
		s3Buckets.putObject(new PutObjectRequest(bucketName, tenantId + "/" + key, inputStream, fileObjectMetadata));
	}

	public void saveUploadFile(FileUploadVO fileUploadVO) throws IOException {
		String tenantId = YorosisContext.get().getTenantId();
		ObjectMetadata fileObjectMetadata = new ObjectMetadata();
		fileObjectMetadata.setContentLength(fileUploadVO.getContentSize());
		fileObjectMetadata.setContentType(fileUploadVO.getContentType());
		ByteArrayInputStream inputStream = new ByteArrayInputStream(fileUploadVO.getInputStream());
		s3Buckets.putObject(new PutObjectRequest(bucketName, tenantId + "/" + fileUploadVO.getKey(), inputStream,
				fileObjectMetadata));
	}

	public void uploadImage(String key, String base64Data) {
		byte[] bI = org.apache.commons.codec.binary.Base64
				.decodeBase64((base64Data.substring(base64Data.indexOf(",") + 1)).getBytes());

		InputStream inputStream = new ByteArrayInputStream(bI);

		ObjectMetadata fileObjectMetadata = new ObjectMetadata();
		fileObjectMetadata.setContentLength(bI.length);
		fileObjectMetadata.setContentType("image/jpeg");

		String tenantId = YorosisContext.get().getTenantId();
		s3Buckets.putObject(new PutObjectRequest(bucketName, tenantId + "/" + key, inputStream, fileObjectMetadata));
	}

	public byte[] downloadFile(String key) throws IOException {
		String tenantId = YorosisContext.get().getTenantId();
		S3Object s3Object = null;

		try {
			s3Object = s3Buckets.getObject(new GetObjectRequest(bucketName, tenantId + "/" + key));
		} catch (AmazonServiceException amEx) {
			log.warn(" No File present for key {} and tenant id {}", key, tenantId);
		}

		if (s3Object != null) {
			return IOUtils.toByteArray(s3Object.getObjectContent());
		}

		return new byte[0];
	}

	public StreamingResponseBody downloadFileAsStream(String key) {
		String tenantId = YorosisContext.get().getTenantId();
		S3Object s3Object = null;
		try {
			s3Object = s3Buckets.getObject(new GetObjectRequest(bucketName, tenantId + "/" + key));
			return getStreamData(s3Object);
		} catch (AmazonServiceException amEx) {
			log.warn(" No File present for key {} and tenant id {}", key, tenantId);
			try {
				s3Object = s3Buckets.getObject(new GetObjectRequest(bucketName, key));
				return getStreamData(s3Object);
			} catch (AmazonServiceException amExc) {
				log.warn(" No File present for key {} and tenant id {}", key, tenantId);
			}
		}
		return null;
	}
	
	public StreamingResponseBody getStreamData(S3Object s3Object) {
		final StreamingResponseBody body;
		S3ObjectInputStream finalObject = s3Object.getObjectContent();
		body = outputStream -> {
			int numberOfBytesToWrite = 0;
			byte[] data = new byte[1024];
			while ((numberOfBytesToWrite = finalObject.read(data, 0, data.length)) != -1) {
				outputStream.write(data, 0, numberOfBytesToWrite);
			}
			finalObject.close();
		};
		return body;
	}

	public List<GridImagesVO> getGridImages(ImageKeysVO imageKeysVO) throws IOException {
		List<GridImagesVO> gridImagesVO = new ArrayList<>();
		if (!CollectionUtils.isEmpty(imageKeysVO.getImageKeys())) {
			for (String imageKey : imageKeysVO.getImageKeys()) {
				String dataurl = Base64.getEncoder().encodeToString(downloadFile(imageKey));
				String imageValue = "data:image/jpeg;base64," + dataurl;
				gridImagesVO.add(constructGridImageVo(imageValue, imageKey));
			}
		}
		return gridImagesVO;
	}

	public GridImagesVO getImageFromKey(String key) throws IOException {
		String dataurl = Base64.getEncoder().encodeToString(downloadFile(key));
		String imageValue = "data:image/jpeg;base64," + dataurl;
		return constructGridImageVo(imageValue, key);
	}

	private GridImagesVO constructGridImageVo(String imageValue, String imageKey) {
		return GridImagesVO.builder().imageKey(imageKey).imageString(imageValue).build();
	}

	public void deleteFile(String key) {
		String tenantId = YorosisContext.get().getTenantId();
		try {
			s3Buckets.deleteObject(bucketName, tenantId + "/" + key);
		} catch (AmazonServiceException amEx) {
			log.warn(" No File present for key {} and tenant id {}", key, tenantId);
		}
	}

}