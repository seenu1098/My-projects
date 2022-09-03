package com.yorosis.yoroflow.services.docs;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import javax.transaction.Transactional;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yorosis.yoroflow.entities.YoroDocumentComment;
import com.yorosis.yoroflow.entities.YoroDocuments;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.models.docs.DocCommentListVo;
import com.yorosis.yoroflow.models.docs.DocsCommentVo;
import com.yorosis.yoroflow.repository.YoroDocsCommentRepository;
import com.yorosis.yoroflow.repository.YoroDocumentRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class YoroDocsCommentService {

	@Autowired
	private YoroDocsCommentRepository yoroDocsCommentRepository;

	@Autowired
	private YoroDocumentRepository yoroDocumentRepository;

	private YoroDocumentComment constructYoroDocumentComment(DocsCommentVo docsCommentVo) {
		Timestamp timeStamp = new Timestamp(System.currentTimeMillis());
		return YoroDocumentComment.builder().comment(docsCommentVo.getComment())
				.commentedSection(docsCommentVo.getCommentSection())
				.replyToCommentId(docsCommentVo.getParentCommentId()).createdBy(YorosisContext.get().getUserName())
				.modifiedBy(YorosisContext.get().getUserName()).createdOn(timeStamp).modifiedOn(timeStamp)
				.activeFlag(YorosisConstants.YES).tenantId(YorosisContext.get().getTenantId())
				.length(docsCommentVo.getLength()).index(docsCommentVo.getIndex()).build();
	}

	@Transactional
	public ResponseStringVO saveOrUpdateDocsComment(DocsCommentVo docsCommentVo) {
		String response = "No comment to save";
		if (docsCommentVo != null && docsCommentVo.getDocId() != null) {
			YoroDocuments yoroDocuments = yoroDocumentRepository.getBasedonIdAndTenantIdAndActiveFlag(
					docsCommentVo.getDocId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
			if (docsCommentVo.getId() == null) {
				YoroDocumentComment yoroDocumentComment = constructYoroDocumentComment(docsCommentVo);
				yoroDocumentComment.setYoroDocuments(yoroDocuments);
				yoroDocumentComment = yoroDocsCommentRepository.save(yoroDocumentComment);
				return ResponseStringVO.builder().id(yoroDocumentComment.getId()).response("Comment added successfully")
						.build();
			} else {
				YoroDocumentComment yoroDocumentComment = yoroDocsCommentRepository.getDocsCommentsByCommentId(
						docsCommentVo.getId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
				if (yoroDocumentComment != null) {
					Timestamp timeStamp = new Timestamp(System.currentTimeMillis());
					yoroDocumentComment.setComment(docsCommentVo.getComment());
					yoroDocumentComment.setCommentedSection(docsCommentVo.getCommentSection());
//					yoroDocumentComment.setReplyToCommentId(docsCommentVo.getParentCommentId());
					yoroDocumentComment.setModifiedBy(YorosisContext.get().getUserName());
					yoroDocumentComment.setModifiedOn(timeStamp);
					yoroDocumentComment = yoroDocsCommentRepository.save(yoroDocumentComment);
					return ResponseStringVO.builder().id(yoroDocumentComment.getId())
							.response("Comment updated successfully").build();
				}
			}
		}
		return ResponseStringVO.builder().response(response).build();
	}

	@Transactional
	public DocCommentListVo getTaskCommentsById(UUID docsId) {
		List<DocsCommentVo> docsCommentVoList = new ArrayList<>();
		int count = 0;
		List<YoroDocumentComment> docsCommentsList = yoroDocsCommentRepository.getDocsCommentsById(docsId,
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (docsCommentsList != null && !docsCommentsList.isEmpty()) {
			UUID docId = docsCommentsList.get(0).getYoroDocuments().getId();
			count = docsCommentsList.size();
			docsCommentsList.stream().filter(f -> f.getReplyToCommentId() == null).collect(Collectors.toList())
					.forEach(d -> {
						docsCommentVoList.add(constructDocsCommentVo(d, docsCommentsList, docId));
					});
		}
		return DocCommentListVo.builder().docsCommentVoList(docsCommentVoList).commentLength(count).build();
	}

	private DocsCommentVo constructDocsCommentVo(YoroDocumentComment yoroDocumentComment,
			List<YoroDocumentComment> docsCommentsList, UUID docId) {
		List<DocsCommentVo> docsCommentVoList = new ArrayList<>();
		List<YoroDocumentComment> docsCommentList = new ArrayList<>();
		docsCommentList = docsCommentsList
				.stream().filter(f -> f.getReplyToCommentId() != null && StringUtils
						.equals(f.getReplyToCommentId().toString(), yoroDocumentComment.getId().toString()))
				.collect(Collectors.toList());
		if (docsCommentList != null && !docsCommentList.isEmpty()) {
			docsCommentList.stream().forEach(d -> {
				docsCommentVoList.add(constructDocsCommentVo(d, docsCommentsList, docId));
			});
		}
		int count = 0;
		count = docsCommentVoList.size();
		return DocsCommentVo.builder().comment(yoroDocumentComment.getComment())
				.commentSection(yoroDocumentComment.getCommentedSection()).createdBy(yoroDocumentComment.getCreatedBy())
				.docId(docId).createdOn(yoroDocumentComment.getCreatedOn()).id(yoroDocumentComment.getId())
				.parentCommentId(yoroDocumentComment.getReplyToCommentId()).length(yoroDocumentComment.getLength())
				.index(yoroDocumentComment.getIndex()).modifiedOn(yoroDocumentComment.getModifiedOn())
				.nestedDocsCommentVo(docsCommentVoList).commentLength(count).build();
	}

}
