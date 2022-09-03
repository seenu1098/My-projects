package com.yorosis.yoroflow.service.type;

import java.text.ParseException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.yorosis.yoroflow.entities.ErrorProcessInstance;
import com.yorosis.yoroflow.entities.ProcessDefinitionTask;
import com.yorosis.yoroflow.entities.ProcessInstanceTask;
import com.yorosis.yoroflow.entities.User;
import com.yorosis.yoroflow.models.FieldVO;
import com.yorosis.yoroflow.models.Status;
import com.yorosis.yoroflow.models.YoroFlowException;
import com.yorosis.yoroflow.repository.ErrorProcessInstanceRepository;
import com.yorosis.yoroflow.repository.ProcessInstanceTaskRepo;
import com.yorosis.yoroflow.repository.UsersRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public abstract class AbstractBaseTypeService {

	@Autowired
	private ProcessInstanceTaskRepo processInstanceTaskRepo;

	@Autowired
	private ErrorProcessInstanceRepository errorProcessInstanceRepository;
	
	@Autowired
	private UsersRepository userRepository;

	public void setProcessInstanceTaskRepo(ProcessInstanceTaskRepo processInstanceTaskRepo) {
		this.processInstanceTaskRepo = processInstanceTaskRepo;
	}

	public ProcessInstanceTask preProcessTask(ProcessInstanceTask procInstanceTask, ProcessDefinitionTask procDefinitionTask) throws YoroFlowException {
		return procInstanceTask;
	}

	@Transactional
	public ProcessInstanceTask processTask(ProcessInstanceTask procInstanceTask, ProcessDefinitionTask procDefinitionTask) {
		try {
			boolean isCompleted = processTypeSpecificService(procInstanceTask, procDefinitionTask);
			if (isCompleted) {
				procInstanceTask.setTargetStepKey(procInstanceTask.getTargetStepKey());
				procInstanceTask.setStatus(Status.COMPLETED.toString());
				procInstanceTask.setUpdatedBy(YorosisContext.get().getUserName());
				procInstanceTask.setEndTime(LocalDateTime.now());
				User user = userRepository.findByUserName(YorosisContext.get().getUserName());
				if (user != null) {
				procInstanceTask.setAssignedTo(user.getUserId());
				}
			} else {
				procInstanceTask.setStatus(Status.IN_PROCESS.toString());
			}
			processInstanceTaskRepo.save(procInstanceTask);
		} catch (Exception exception) {
			log.warn("Exception occured", exception);
			procInstanceTask.setStatus(Status.ERROR.toString());
			procInstanceTask.setDescription(StringUtils.substring(ExceptionUtils.getStackTrace(exception), 0, 999));
			// errorHandler.persist(processInstanceTaskRepo, procInstanceTask);
			saveErrorTask(procInstanceTask, procDefinitionTask, StringUtils.substring(ExceptionUtils.getStackTrace(exception), 0, 999));
		}
		return procInstanceTask;

	}

	private void saveErrorTask(ProcessInstanceTask procInstanceTask, ProcessDefinitionTask procDefinitionTask, String exception) {
		ErrorProcessInstance errorProcessInstance = ErrorProcessInstance.builder().errorDescription(exception)
				.processDefId(procDefinitionTask.getProcessDefinition().getProcessDefinitionId())
				.processInstanceId(procInstanceTask.getProcessInstance().getProcessInstanceId())
				.processInstanceTaskId(procInstanceTask.getProcessInstanceTaskId()).tenantId(YorosisContext.get().getTenantId())
				.createdBy(YorosisContext.get().getUserName()).updatedBy(YorosisContext.get().getUserName()).build();
		errorProcessInstanceRepository.save(errorProcessInstance);
	}

	public Map<String, List<FieldVO>> getFieldList(JsonNode taskProperty) {
		Map<String, List<FieldVO>> fieldList = new LinkedHashMap<>();
		return fieldList;
	}

	public abstract boolean processTypeSpecificService(ProcessInstanceTask procInstanceTask, ProcessDefinitionTask procDefinitionTask)
			throws YoroFlowException, ParseException;

}
