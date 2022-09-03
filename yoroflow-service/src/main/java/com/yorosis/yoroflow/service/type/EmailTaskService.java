package com.yorosis.yoroflow.service.type;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import com.yorosis.yoroflow.entities.ProcessDefTaskProperty;
import com.yorosis.yoroflow.entities.ProcessDefinitionTask;
import com.yorosis.yoroflow.entities.ProcessInstanceTask;
import com.yorosis.yoroflow.models.TaskType;
import com.yorosis.yoroflow.models.YoroFlowException;
import com.yorosis.yoroflow.services.EmailTaskServiceHelper;

@Service
public class EmailTaskService extends AbstractBaseTypeService implements TaskService {

	@Autowired
	private EmailTaskServiceHelper emailTaskService;

	@Override
	public TaskType getTaskType() {
		return TaskType.EMAIL_TASK;
	}

	@Override
	public boolean canProceed(ProcessInstanceTask procInstanceTask) {
		return true;
	}

	@Override
	public boolean processTypeSpecificService(ProcessInstanceTask procInstanceTask, ProcessDefinitionTask procDefinitionTask) throws YoroFlowException {
		List<ProcessDefTaskProperty> listTaskProperties = procDefinitionTask.getTaskProperties();

		if (!CollectionUtils.isEmpty(listTaskProperties)) {
			ProcessDefTaskProperty procDefTaskProperty = listTaskProperties.get(0);
			emailTaskService.emailTaskService(procInstanceTask, procDefTaskProperty.getPropertyValue(), false);
		}

		procInstanceTask.setTargetStepKey(procDefinitionTask.getTargetStepKey());
		return true;
	}
}
