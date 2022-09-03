package com.yorosis.yoroflow.service.type;

import java.text.ParseException;
import java.time.LocalDateTime;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yorosis.yoroflow.entities.ProcessDefTaskProperty;
import com.yorosis.yoroflow.entities.ProcessDefinitionTask;
import com.yorosis.yoroflow.entities.ProcessInstanceTask;
import com.yorosis.yoroflow.models.DelayTimerVO;
import com.yorosis.yoroflow.models.TaskType;
import com.yorosis.yoroflow.models.YoroFlowException;

@Component
public class DelayTimerTask extends AbstractBaseTypeService implements TaskService {

	@Override
	public TaskType getTaskType() {
		return TaskType.DELAY_TIMER;
	}

	@Autowired
	private ObjectMapper objectMapper;

	@Override
	public boolean canProceed(ProcessInstanceTask procInstanceTask) {
		return false;
	}

	@Override
	public ProcessInstanceTask preProcessTask(ProcessInstanceTask procInstanceTask, ProcessDefinitionTask procDefinitionTask) throws YoroFlowException {

		List<ProcessDefTaskProperty> listTaskProperties = procDefinitionTask.getTaskProperties();

		if (!CollectionUtils.isEmpty(listTaskProperties)) {
			ProcessDefTaskProperty procDefTaskProperty = listTaskProperties.get(0);

			try {
				DelayTimerVO delayTimer = objectMapper.treeToValue(procDefTaskProperty.getPropertyValue(), DelayTimerVO.class);
				if (delayTimer == null || StringUtils.isBlank(delayTimer.getUnits())) {
					throw new YoroFlowException("Delay timer values not set properly");
				}
				procInstanceTask.setDueDate(calculateDateTime(delayTimer));
			} catch (JsonProcessingException e) {
				throw new YoroFlowException("Parsing error occurred");
			}

		}

		return procInstanceTask;

	}

	@Override
	public boolean processTypeSpecificService(ProcessInstanceTask procInstanceTask, ProcessDefinitionTask procDefinitionTask)
			throws YoroFlowException, ParseException {
		if (procInstanceTask.getDueDateEventProcessedOn() == null || procInstanceTask.getDueDate().isAfter(procInstanceTask.getDueDateEventProcessedOn())) {
			procInstanceTask.setDueDateEventProcessedOn(LocalDateTime.now());
			procInstanceTask.setTargetStepKey(procDefinitionTask.getTargetStepKey());
			return true;
		}

		return false;

	}

	private LocalDateTime calculateDateTime(DelayTimerVO delayTimer) {
		switch (StringUtils.lowerCase(delayTimer.getUnits())) {

		case "minutes":
			return LocalDateTime.now().plusMinutes(delayTimer.getTime());
		case "hours":
			return LocalDateTime.now().plusHours(delayTimer.getTime());
		case "days":
			return LocalDateTime.now().plusDays(delayTimer.getTime());
		case "seconds":
			return LocalDateTime.now().plusSeconds(delayTimer.getTime());

		default:
			throw new IllegalArgumentException("Unsupported timeformat " + delayTimer.getUnits());
		}

	}

}
