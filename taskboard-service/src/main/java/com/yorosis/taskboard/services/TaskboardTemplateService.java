package com.yorosis.taskboard.services;

import java.sql.Timestamp;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.taskboard.models.ResponseStringVO;
import com.yorosis.taskboard.models.TaskboardTemplatesVO;
import com.yorosis.taskboard.repository.TaskboardTemplatesRepository;
import com.yorosis.taskboard.taskboard.entities.TaskboardTemplates;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class TaskboardTemplateService {
	@Autowired
	private TaskboardTemplatesRepository taskboardTemplatesRepository;

	private static final String CATEGORY = "export";

	private TaskboardTemplatesVO constructTemplatesDtoToVo(TaskboardTemplates taskboardTemplates) {
		return TaskboardTemplatesVO.builder().id(taskboardTemplates.getId()).templateName(taskboardTemplates.getTemplateName())
				.data(taskboardTemplates.getTemplateData()).category(taskboardTemplates.getCategory()).description(taskboardTemplates.getDescription()).build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public List<TaskboardTemplatesVO> getTaskboardTemplates() {
		return taskboardTemplatesRepository.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(YorosisContext.get().getTenantId(), YorosisConstants.YES).stream()
				.map(this::constructTemplatesDtoToVo).collect(Collectors.toList());
	}

	@Transactional
	public ResponseStringVO saveTaskboardTemplates(TaskboardTemplatesVO taskboardTemplatesVO) {
		Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());
		TaskboardTemplates taskboardTemplates = TaskboardTemplates.builder().templateName(taskboardTemplatesVO.getTemplateName())
				.templateData(taskboardTemplatesVO.getData()).activeFlag(YorosisConstants.YES).tenantId(YorosisContext.get().getTenantId())
				.createdOn(currentTimestamp).createdBy(YorosisContext.get().getUserName()).modifiedOn(currentTimestamp)
				.modifiedBy(YorosisContext.get().getUserName()).category(CATEGORY).build();
		taskboardTemplatesRepository.save(taskboardTemplates);
		return ResponseStringVO.builder().response("Taskboard templates saved successfully").build();
	}
}
