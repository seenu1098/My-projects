package com.yorosis.yoroflow.service.type;

import java.text.ParseException;
import java.util.List;

import org.jasypt.encryption.StringEncryptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import com.yorosis.yoroflow.entities.ProcessDefTaskProperty;
import com.yorosis.yoroflow.entities.ProcessDefinitionTask;
import com.yorosis.yoroflow.entities.ProcessInstanceTask;
import com.yorosis.yoroflow.models.TaskType;
import com.yorosis.yoroflow.models.YoroFlowException;
import com.yorosis.yoroflow.services.SmstaskServiceHelper;

@Service
public class SmsTaskService extends AbstractBaseTypeService implements TaskService {
	@Autowired
	private SmstaskServiceHelper smstaskServiceHelper;

	@Autowired
	@Qualifier("jasyptEncryptor")
	private StringEncryptor jasyptEncryptor;

	@Override
	public TaskType getTaskType() {
		return TaskType.SMS_TASK;
	}

	@Override
	public boolean canProceed(ProcessInstanceTask procInstanceTask) {
		return true;
	}

	@Override
	public boolean processTypeSpecificService(ProcessInstanceTask procInstanceTask, ProcessDefinitionTask procDefinitionTask)
			throws YoroFlowException, ParseException {
		List<ProcessDefTaskProperty> listTaskProperties = procDefinitionTask.getTaskProperties();

		if (!CollectionUtils.isEmpty(listTaskProperties)) {
			ProcessDefTaskProperty procDefTaskProperty = listTaskProperties.get(0);

			smstaskServiceHelper.smsTaskService(procInstanceTask, procDefTaskProperty.getPropertyValue(), false);
		}

		procInstanceTask.setTargetStepKey(procDefinitionTask.getTargetStepKey());
		return true;
	}

}
