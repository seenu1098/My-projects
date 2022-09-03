package com.yorosis.yoroflow.models.docs;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class YoroDocumentVO {
	private UUID documentId;
	private UUID parentDocumentId;
	private String documentName;
	private String documentKey;
	private String documentData;
	private List<String> mentionedUsersEmail;
	private List<UUID> mentionedUsersId;
}
