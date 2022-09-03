package com.yorosis.yoroflow.service.type;

import java.text.ParseException;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.JsonNode;
import com.yorosis.yoroflow.entities.ProcessDefinitionTask;
import com.yorosis.yoroflow.entities.ProcessInstanceTask;
import com.yorosis.yoroflow.models.FieldVO;
import com.yorosis.yoroflow.models.TaskType;
import com.yorosis.yoroflow.models.YoroFlowException;

public interface TaskService {

	public TaskType getTaskType();

	public ProcessInstanceTask preProcessTask(ProcessInstanceTask procInstanceTask, ProcessDefinitionTask procDefinitionTask)
			throws YoroFlowException, ParseException;

	public ProcessInstanceTask processTask(ProcessInstanceTask procInstanceTask, ProcessDefinitionTask procDefinitionTask)
			throws YoroFlowException, ParseException;

	public boolean canProceed(ProcessInstanceTask procInstanceTask);

	public Map<String, List<FieldVO>> getFieldList(JsonNode taskProperty);
}
