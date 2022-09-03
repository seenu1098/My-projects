package com.yorosis.yoroflow.rendering.service.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileUploadVO {
	private String key;
	private String contentType;
	private byte[] inputStream;
	private long contentSize;
}
