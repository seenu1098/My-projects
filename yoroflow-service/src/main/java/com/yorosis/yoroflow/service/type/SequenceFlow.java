package com.yorosis.yoroflow.service.type;

import org.springframework.stereotype.Service;

import com.yorosis.yoroflow.entities.ProcessDefinitionTask;
import com.yorosis.yoroflow.entities.ProcessInstanceTask;
import com.yorosis.yoroflow.models.TaskType;

@Service
public class SequenceFlow extends AbstractBaseTypeService implements TaskService {

	@Override
	public TaskType getTaskType() {
		return TaskType.SEQ_FLOW;
	}

	@Override
	public boolean canProceed(ProcessInstanceTask procInstanceTask) {
		return true;
	}

	@Override
	public boolean processTypeSpecificService(ProcessInstanceTask procInstanceTask, ProcessDefinitionTask procDefinitionTask) {
		procInstanceTask.setTargetStepKey(procDefinitionTask.getTargetStepKey());
		return true;
	}

}
