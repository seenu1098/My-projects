package com.yorosis.yoroflow.services;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroflow.entities.ProcessDefTaskProperty;
import com.yorosis.yoroflow.models.ProcessDefTaskPropertyVO;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.repository.ProcessDefTaskPropertyRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class ProcessDefTaskPropertyService {

	@Autowired
	private ProcessDefTaskPropertyRepository processDefTaskPropertyRepo;

	private ProcessDefTaskProperty constructVOToDTO(ProcessDefTaskPropertyVO vo) {
		return ProcessDefTaskProperty.builder().processDefinitionId(vo.getProcessDefinitionId()).propertyName(vo.getPropertyName())
				.propertyValue(vo.getPropertyValue()).createdBy("admin").updatedBy("admin").build();
	}

	private ProcessDefTaskPropertyVO constructDTOToVO(ProcessDefTaskProperty taskProperty) {
		return ProcessDefTaskPropertyVO.builder().processDefinitionId(taskProperty.getProcessDefinitionId()).propertyName(taskProperty.getPropertyName())
				.propertyValue(taskProperty.getPropertyValue()).build();
	}

	@Transactional
	public ResponseStringVO saveTaskProperty(ProcessDefTaskPropertyVO vo) {
		processDefTaskPropertyRepo.save(constructVOToDTO(vo));
		return ResponseStringVO.builder().response("Task Property Created Successfully").build();
	}

	@Transactional
	public ProcessDefTaskPropertyVO getTaskPropertyInfo(UUID id) {
		return constructDTOToVO(processDefTaskPropertyRepo.findProcessDefTaskPropertyByTaskProperty(YorosisContext.get().getTenantId(), id));
	}

}
