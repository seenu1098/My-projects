package com.yorosis.yoroflow.models;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskboardTaskFilesVO {
	private UUID id;
	private String fileType;
	private String filePath;
	private String fileName;
}
