package com.yorosis.yoroflow.service.type;

import java.text.ParseException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yorosis.yoroflow.entities.ProcessDefinitionTask;
import com.yorosis.yoroflow.entities.ProcessInstanceTask;
import com.yorosis.yoroflow.models.TaskDetailsRequest;
import com.yorosis.yoroflow.models.TaskType;
import com.yorosis.yoroflow.models.YoroFlowException;
import com.yorosis.yoroflow.services.FlowEngineService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class EndTaskService extends AbstractBaseTypeService implements TaskService {

	@Autowired
	private FlowEngineService flowEngineService;

	@Override
	public TaskType getTaskType() {
		return TaskType.END_TASK;
	}

	@Override
	public boolean canProceed(ProcessInstanceTask procInstanceTask) {
		return true;
	}

	@Override
	public boolean processTypeSpecificService(ProcessInstanceTask procInstanceTask, ProcessDefinitionTask procDefinitionTask) {
		if (procInstanceTask != null && procInstanceTask.getProcessInstance() != null) {
			try {
				ProcessInstanceTask initiatedProcessInstance = flowEngineService
						.getIntiatedByTaskId(procInstanceTask.getProcessInstance().getProcessInstanceId());
				if (initiatedProcessInstance != null && initiatedProcessInstance.getProcessInstanceTaskId() != null
						&& initiatedProcessInstance.getProcessInstance().getProcessInstanceId() != null) {
					flowEngineService.completeTask(TaskDetailsRequest.builder().instanceTaskId(initiatedProcessInstance.getProcessInstanceTaskId())
							.instanceId(initiatedProcessInstance.getProcessInstance().getProcessInstanceId()).build());
				}

			} catch (YoroFlowException | ParseException e) {
				log.error("Error occurred for End task", e);
				return false;
			}

		}
		return true;
	}
}
