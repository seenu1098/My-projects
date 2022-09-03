package com.yorosis.yoroflow.services;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yorosis.yoroflow.entities.ErrorProcessInstance;
import com.yorosis.yoroflow.entities.ProcessInstanceTask;
import com.yorosis.yoroflow.models.ErrorInstanceVO;
import com.yorosis.yoroflow.repository.ErrorProcessInstanceRepository;
import com.yorosis.yoroflow.repository.ProcessInstanceTaskRepo;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class ErrorProcessService {

	@Autowired
	private ErrorProcessInstanceRepository errorProcessInstanceRepository;

	@Autowired
	private ProcessInstanceTaskRepo processInstanceTaskRepo;

	private ErrorInstanceVO constructDtoToVo(ErrorProcessInstance errorProcessInstance) {
		return ErrorInstanceVO.builder().errorDescription(errorProcessInstance.getErrorDescription()).id(errorProcessInstance.getId())
				.taskName(getTaskName(errorProcessInstance.getProcessInstanceTaskId())).build();
	}

	private String getTaskName(UUID taskId) {
		ProcessInstanceTask processInstanceTask = processInstanceTaskRepo.findByProcessInstanceTaskId(taskId);
		if (processInstanceTask != null) {
			return processInstanceTask.getProcessDefinitionTask().getTaskName();
		}
		return null;
	}

	public List<ErrorInstanceVO> getErrortask(UUID instanceId) {
		List<ErrorInstanceVO> errorInstanceVOList = new ArrayList<ErrorInstanceVO>();
		for (ErrorProcessInstance errorProcessInstance : errorProcessInstanceRepository.getListBasedonTenantIdAndActiveFlag(instanceId,
				YorosisContext.get().getTenantId())) {
			errorInstanceVOList.add(constructDtoToVo(errorProcessInstance));
		}
		return errorInstanceVOList;
	}
}
