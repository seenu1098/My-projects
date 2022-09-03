package com.yorosis.yoroflow.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroflow.entities.WorkflowTemplates;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.WorkflowTemplatesVO;
import com.yorosis.yoroflow.repository.WorkflowTemplatesRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class WorkflowTemplatesService {
	@Autowired
	private WorkflowTemplatesRepository workflowTemplatesRepository;

	private WorkflowTemplatesVO constructTemplatesDtoToVo(WorkflowTemplates workflowTemplates) {
		return WorkflowTemplatesVO.builder().id(workflowTemplates.getId())
				.templateName(workflowTemplates.getProcessDefinitionName())
				.description(workflowTemplates.getDescription()).workflowData(workflowTemplates.getWorkflowData())
				.category(workflowTemplates.getCategory()).build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public List<WorkflowTemplatesVO> getWorkflowTemplates() {
		List<WorkflowTemplatesVO> templatesList = workflowTemplatesRepository
				.findByTenantIdIgnoreCaseAndActiveFlagIgnoreCase(YorosisContext.get().getTenantId(),
						YorosisConstants.YES)
				.stream().map(this::constructTemplatesDtoToVo).collect(Collectors.toList());
		return templatesList;
	}
}
