package com.yorosis.taskboard.services;

import java.io.ByteArrayInputStream;
import java.io.IOException;

import javax.annotation.PostConstruct;

import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

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
import com.yorosis.taskboard.models.FileUploadVO;
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
		AWSCredentialsProvider doCred = new AWSStaticCredentialsProvider(new BasicAWSCredentials(accessKey, accessSecret));
		s3Buckets = AmazonS3ClientBuilder.standard().withCredentials(doCred)
				.withEndpointConfiguration(new EndpointConfiguration(serviceEndPoint, serviceRegion)).build();
	}

	public void saveUploadFile(FileUploadVO fileUploadVO) {
		String tenantId = YorosisContext.get().getTenantId();
		ObjectMetadata fileObjectMetadata = new ObjectMetadata();
		fileObjectMetadata.setContentLength(fileUploadVO.getContentSize());
		fileObjectMetadata.setContentType(fileUploadVO.getContentType());
		ByteArrayInputStream inputStream = new ByteArrayInputStream(fileUploadVO.getInputStream());
		s3Buckets.putObject(new PutObjectRequest(bucketName, tenantId + "/" + fileUploadVO.getKey(), inputStream, fileObjectMetadata));
	}

	public byte[] downloadFile(String key) throws IOException {
		String tenantId = YorosisContext.get().getTenantId();
		S3Object s3Object = null;

		try {
			s3Object = s3Buckets.getObject(new GetObjectRequest(bucketName, tenantId + "/" + key));
		} catch (AmazonServiceException amEx) {
			log.warn(" No File present for key {} and tenant id {}", key, tenantId);
			try {
				s3Object = s3Buckets.getObject(new GetObjectRequest(bucketName, key));
			} catch (AmazonServiceException amExc) {
				log.warn(" No File present for key {} and tenant id {}", key, tenantId);
			}
		}

		if (s3Object != null) {
			return IOUtils.toByteArray(s3Object.getObjectContent());
		}

		return new byte[0];
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
