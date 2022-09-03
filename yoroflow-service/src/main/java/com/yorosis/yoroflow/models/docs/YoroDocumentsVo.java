package com.yorosis.yoroflow.models.docs;

import java.sql.Timestamp;
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
public class YoroDocumentsVo {
	private UUID documentId;
	private UUID parentDocumentId;
	private String documentName;
	private String documentKey;
	private String documentData;
	private String createdBy;
	private Timestamp createdOn;
	private String modifiedBy;
	private Timestamp modifiedOn;
	private int childCount;
	private List<YoroDocumentsVo> YoroDocumentsVo;
	private String workspaceName;
}
