package com.yorosis.yoroflow.service.type;

import java.text.ParseException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.yorosis.yoroflow.entities.CounterValues;
import com.yorosis.yoroflow.entities.ProcessDefTaskProperty;
import com.yorosis.yoroflow.entities.ProcessDefinitionTask;
import com.yorosis.yoroflow.entities.ProcessInstanceTask;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.CounterTaskVO;
import com.yorosis.yoroflow.models.FieldVO;
import com.yorosis.yoroflow.models.TaskType;
import com.yorosis.yoroflow.models.YoroFlowException;
import com.yorosis.yoroflow.repository.CounterValuesRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;
import com.yorosis.yoroflow.services.WorkflowUtils;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class CounterTaskTypeService extends AbstractBaseTypeService implements TaskService {

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private CounterValuesRepository processInstanceCounterRepository;

	private static final String MAIN_SECTION = "mainSection";

	@Override
	public TaskType getTaskType() {
		return TaskType.COUNTER_TASK;
	}

	@Override
	public boolean canProceed(ProcessInstanceTask procInstanceTask) {
		return true;
	}

	@Override
	public Map<String, List<FieldVO>> getFieldList(JsonNode taskProperty) {
		Map<String, List<FieldVO>> fieldList = new LinkedHashMap<>();
		fieldList.put(MAIN_SECTION, WorkflowUtils.getValueFromDataForCounterTask(taskProperty));
		return fieldList;
	}

	@Override
	@Transactional
	public boolean processTypeSpecificService(ProcessInstanceTask procInstanceTask, ProcessDefinitionTask procDefinitionTask)
			throws YoroFlowException, ParseException {
		List<ProcessDefTaskProperty> listTaskProperties = procDefinitionTask.getTaskProperties();

		if (!CollectionUtils.isEmpty(listTaskProperties)) {
			ProcessDefTaskProperty procDefTaskProperty = listTaskProperties.get(0);

			try {
				CounterTaskVO counterTaskVO = objectMapper.treeToValue(procDefTaskProperty.getPropertyValue(), CounterTaskVO.class);
				CounterValues processInstanceCounter = processInstanceCounterRepository.findByProcessDefinitionKey(
						procDefinitionTask.getProcessDefinition().getKey(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
				LocalDate today = LocalDate.now(ZoneId.of(counterTaskVO.getTimeZone()));
				if (processInstanceCounter != null) {
					if (StringUtils.equals(counterTaskVO.getCounterType(), "global")) {
						if (processInstanceCounter.getResetAt() == null) {
							if (processInstanceCounter.getCounterValue() == null) {
								processInstanceCounter.setCounterValue(counterTaskVO.getCountStartAt().longValue());
							} else {
								processInstanceCounter.setCounterValue(processInstanceCounter.getCounterValue() + counterTaskVO.getCountIncreasedBy());
							}
						} else {
							if (processInstanceCounter.getCounterValue() == null) {
								processInstanceCounter.setCounterValue(counterTaskVO.getCountStartAt().longValue());
							} else if ((counterTaskVO.getResetAt() >= (processInstanceCounter.getCounterValue() + counterTaskVO.getCountIncreasedBy())
									|| counterTaskVO.getResetAt() == 0)) {
								processInstanceCounter.setCounterValue(processInstanceCounter.getCounterValue() + counterTaskVO.getCountIncreasedBy());
							} else if (StringUtils.equals(counterTaskVO.getCounterType(), "global")
									&& (counterTaskVO.getResetAt() < (processInstanceCounter.getCounterValue() + counterTaskVO.getCountIncreasedBy()))) {
								processInstanceCounter.setCounterValue(counterTaskVO.getCountStartAt().longValue());
							}
						}
					} else if (StringUtils.equals(counterTaskVO.getCounterType(), "daily")) {
						if (processInstanceCounter.getResetAt() == null) {
							if (today.equals(processInstanceCounter.getCounterDate())) {
								if (processInstanceCounter.getCounterValue() == null) {
									processInstanceCounter.setCounterValue(counterTaskVO.getCountStartAt().longValue());
								} else {
									processInstanceCounter.setCounterValue(processInstanceCounter.getCounterValue() + counterTaskVO.getCountIncreasedBy());
								}
							} else {
								processInstanceCounter.setCounterDate(today);
								processInstanceCounter.setCounterValue(counterTaskVO.getCountStartAt().longValue());
							}
						} else {
							if (processInstanceCounter.getCounterValue() == null && today.equals(processInstanceCounter.getCounterDate())) {
//								processInstanceCounter.setCounterDate(today);
								processInstanceCounter.setCounterValue(counterTaskVO.getCountStartAt().longValue());
							} else if (today.equals(processInstanceCounter.getCounterDate())
									&& ((counterTaskVO.getResetAt() >= (processInstanceCounter.getCounterValue() + counterTaskVO.getCountIncreasedBy()))
											|| counterTaskVO.getResetAt() == 0)) {
								processInstanceCounter
										.setCounterValue(processInstanceCounter.getCounterValue() + counterTaskVO.getCountIncreasedBy().longValue());
							} else if (StringUtils.equals(counterTaskVO.getCounterType(), "daily") && today.equals(processInstanceCounter.getCounterDate())
									&& counterTaskVO.getResetAt() < (processInstanceCounter.getCounterValue() + counterTaskVO.getCountIncreasedBy())) {
								processInstanceCounter.setCounterValue(counterTaskVO.getCountStartAt().longValue());
							} else if (StringUtils.equals(counterTaskVO.getCounterType(), "daily")) {
								processInstanceCounter.setCounterDate(today);
								processInstanceCounter.setCounterValue(counterTaskVO.getCountStartAt().longValue());
							}
						}
					}
					processInstanceCounter.setUpdatedBy(YorosisContext.get().getUserName());
					processInstanceCounter.setUpdatedDate(LocalDateTime.now());
					processInstanceCounterRepository.save(processInstanceCounter);
				}
				if (!StringUtils.isEmpty(counterTaskVO.getName())) {
					ObjectNode node = JsonNodeFactory.instance.objectNode();
					node.put(counterTaskVO.getName(), processInstanceCounter.getCounterValue());
					procInstanceTask.setData(node);
				}
				procInstanceTask.setTargetStepKey(procDefinitionTask.getTargetStepKey());

			} catch (JsonProcessingException e) {
				throw new YoroFlowException(ExceptionUtils.getRootCauseMessage(e));
			}
		}

		return true;
	}

}
