package com.yorosis.yoroflow.services;

import static java.util.stream.Collectors.collectingAndThen;
import static java.util.stream.Collectors.toCollection;
import static java.util.Comparator.comparing;
import static java.util.stream.Collectors.groupingBy;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeSet;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yorosis.yoroflow.entities.ProcessDefinitionTask;
import com.yorosis.yoroflow.entities.ProcessInstance;
import com.yorosis.yoroflow.entities.ProcessInstanceTask;
import com.yorosis.yoroflow.models.FilterValueVO;
import com.yorosis.yoroflow.models.PaginationVO;
import com.yorosis.yoroflow.models.ProcessInstancePropertyVO;
import com.yorosis.yoroflow.models.ProcessInstanceRequest;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.models.SmsFieldVO;
import com.yorosis.yoroflow.models.TableData;
import com.yorosis.yoroflow.models.WorkflowTaskProgressVo;
import com.yorosis.yoroflow.repository.ProcessDefinitionTaskRepo;
import com.yorosis.yoroflow.repository.ProcessInstanceRepo;
import com.yorosis.yoroflow.repository.ProcessInstanceTaskRepo;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class ProcessInstanseTaskService {
	private static final String ADD = "add";
	private static final String SUBTRACT = "subtraction";
	private static final String MULTIPLY = "multiplication";
	private static final String DIVIDE = "division";
	private static final String MODULUS = "modulo";
	private static final String DAYS_BETWEEN = "between";
	private static final String DATE = "date";
	private static final String EQUALS = "EQUALS";
	private static final String NOT_EQUALS = "NOT EQUALS";
	private static final String LESS_THAN = "LESS THAN";
	private static final String GREATER_THAN = "GREATER THAN";
	private static final String GREATER_THAN_EQUAL = "GREATER THAN/EQUAL TO";
	private static final String LESS_THAN_EQUAL = "LESS THAN/EQUAL TO";
	private static final String BEGINS_WITH = "BEGINS WITH";
	private static final String ENDS_WITH = "ENDS WITH";
	private static final String CONTAINS = "CONTAINS";
	private static final String PAGE_FIELDS = "pagefield";
	private static final String CONSTANT = "constant";
	private static final String TASKNAME = "Task Name";
	private static final String STARTDATE = "Start Date";
	private static final String ENDDATE = "Updated Date";
	private static final String TOTALTIMETAKEN = "Total Time Taken";
	private static final String TASKTYPE = "Task Type";
	private static final String TASKRESOLVEDBY = "Task Resolved By";
	private static final String APPROVAL_STATUS = "approvalStatus";
	private static final String APPROVED = "approved";
	private static final String REJECTED = "rejected";
	private static final String SENDBACK = "sendback";

	@Autowired
	private ProcessDefinitionTaskRepo processDefinitionTaskRepo;

	@Autowired
	private ProcessInstanceRepo processInstanceRepo;

	@Autowired
	private WorkflowService workflowService;

	@Autowired
	private ProcessInstanceTaskRepo processInstanceTaskRepo;

	@Autowired
	private SMSDataResolveService smsDataResolveService;

	@Autowired
	private ObjectMapper objectMapper;

	private ProcessInstanceTask constructProcessInstanceTaskVOTODTO(ProcessInstanceRequest processInstanceRequest) {
		return ProcessInstanceTask.builder().assignedTo(processInstanceRequest.getAssignedTo())
				.status(processInstanceRequest.getStatus()).endTime(processInstanceRequest.getEndTime())
				.createdBy("test").startTime(processInstanceRequest.getEndTime()).updatedBy("test").build();
	}

	@Transactional
	public ResponseStringVO addProcessInstanceTasks(ProcessInstanceRequest processInstanceRequest) {
		ProcessInstanceTask processInstanceTask = constructProcessInstanceTaskVOTODTO(processInstanceRequest);
		ProcessInstance processInstance = processInstanceRepo.findByProcessInstanceIdAndTenantId(
				processInstanceRequest.getProcessInstanceId(), YorosisContext.get().getTenantId());
		processInstanceTask.setProcessInstance(processInstance);
		ProcessDefinitionTask processDefinitionTask = processDefinitionTaskRepo
				.findByTaskIdAndTenantId(processInstanceRequest.getTaskId(), YorosisContext.get().getTenantId());
		processInstanceTask.setProcessDefinitionTask(processDefinitionTask);

		processInstanceTaskRepo.save(processInstanceTask);

		return ResponseStringVO.builder().response("Task Added Successfully").build();
	}

	protected Pageable getPageable(PaginationVO vo) {
		Sort sort = null;
		int pageSize = 10;
		if (vo.getSize() > 0) {
			pageSize = vo.getSize();
		}
		if (!StringUtils.isEmpty(vo.getColumnName())) {
			sort = Sort.by(new Sort.Order(Direction.ASC, vo.getColumnName()));
		}
		if (sort != null) {
			return PageRequest.of(vo.getIndex(), pageSize, sort);
		}
		return PageRequest.of(vo.getIndex(), pageSize);
	}

	@Transactional
	public TableData getProcessInstanceTaskList(PaginationVO pagination) {
		List<Map<String, String>> list = new ArrayList<>();
		Pageable pageable = getPageable(pagination);
		if (pagination.getFilterValue().length != 0) {
			List<ProcessInstanceTask> taskListWithFilter = processInstanceTaskRepo
					.getTaskListWithFilter(pagination.getProcessInstanceId(), YorosisContext.get().getTenantId());

			return getTasks(pagination, taskListWithFilter);
		}
		String totalCount = processInstanceTaskRepo.getTaskListCount(pagination.getProcessInstanceId(),
				YorosisContext.get().getTenantId());
		List<ProcessInstanceTask> taskList = processInstanceTaskRepo.getTaskList(pageable,
				pagination.getProcessInstanceId(), YorosisContext.get().getTenantId());
		for (ProcessInstanceTask processInstanceTask : taskList) {
			list.add(getTaskWithoutFilter(processInstanceTask));
		}
		return TableData.builder().data(list).totalRecords(totalCount).build();
	}

	private Map<String, String> getTaskWithoutFilter(ProcessInstanceTask processInstanceTask) {
		Map<String, String> dataMap = null;
		dataMap = new HashMap<>();
		dataMap.put("col1", processInstanceTask.getProcessInstanceTaskId().toString());
		dataMap.put("col2", processInstanceTask.getProcessDefinitionTask().getTaskName());
		dataMap.put("col3", processInstanceTask.getProcessDefinitionTask().getTaskType());
		dataMap.put("col4", processInstanceTask.getStartTime().toString());
		if (processInstanceTask.getEndTime() != null) {
			dataMap.put("col5", processInstanceTask.getEndTime().toString());
		}
//			dataMap.put("col6", processInstanceTask.getStatus());
		dataMap.put("col7", processInstanceTask.getUpdatedBy());
		dataMap.put("col8", getTime(processInstanceTask));
		return dataMap;
	}

	private TableData getTasks(PaginationVO pagination, List<ProcessInstanceTask> listOfTasks) {
		List<Map<String, String>> list = new ArrayList<>();

		int pageNumber = pagination.getIndex();
		int pageSize = pagination.getSize() > 0 ? pagination.getSize() : 10;
		int skipRecords = pageNumber * pageSize;

		int matchCount = 0;
		for (ProcessInstanceTask task : listOfTasks) {
			if (doesMatchesFilterValue(task, pagination.getFilterValue())) {
				matchCount++;
				if (matchCount > skipRecords && matchCount <= (skipRecords + pageSize)) {
					list.add(getTaskWithoutFilter(task));
				}
			}
		}

		return TableData.builder().data(list).totalRecords(String.valueOf(matchCount)).build();
	}

	private boolean doesMatchesFilterValue(ProcessInstanceTask filterField, FilterValueVO[] currentFilterList) {
		boolean isMatched = true;
		for (FilterValueVO filterValue : currentFilterList) {
			if (StringUtils.equalsAny(filterValue.getFilterIdColumn(), STARTDATE, ENDDATE, TASKNAME, TASKTYPE,
					TASKRESOLVEDBY, TOTALTIMETAKEN)) {
				String value = null;
				if (StringUtils.equals(filterValue.getFilterIdColumn(), TASKNAME)) {
					value = filterField.getProcessDefinitionTask().getTaskName();
				} else if (StringUtils.equals(filterValue.getFilterIdColumn(), TASKTYPE)) {
					value = filterField.getProcessDefinitionTask().getTaskType();
				} else if (StringUtils.equals(filterValue.getFilterIdColumn(), TASKRESOLVEDBY)) {
					value = filterField.getUpdatedBy();
				}
				if (value != null) {
					isMatched = FilterUtils.getValue(value, filterValue, isMatched);
				}
				LocalDateTime dateValue = null;
				DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
				if (StringUtils.equals(filterValue.getFilterIdColumn(), STARTDATE)) {
					dateValue = filterField.getStartTime();
					dateValue = LocalDateTime.parse(dateValue.toString().subSequence(0, 19), formatter);
				} else if (StringUtils.equals(filterValue.getFilterIdColumn(), ENDDATE)) {
					dateValue = filterField.getEndTime();
					dateValue = LocalDateTime.parse(dateValue.toString().subSequence(0, 19), formatter);
				}
				if (dateValue != null) {
					isMatched = FilterUtils.getDateValue(dateValue.toLocalDate(), filterValue, isMatched);
				}
				if (StringUtils.equals(filterValue.getFilterIdColumn(), TOTALTIMETAKEN)) {
					isMatched = FilterUtils.getTotalTimeFilter(filterField.getStartTime(), filterField.getEndTime(),
							filterValue, isMatched);
				}
			} else {
				isMatched = false;
				break;
			}
		}

		return isMatched;
	}

	private String getTime(ProcessInstanceTask processInstanceTask) {
		Long totalTimeTaken = null;
		String time = null;

		if (processInstanceTask.getStartTime() != null && processInstanceTask.getEndTime() != null) {
			totalTimeTaken = ChronoUnit.MINUTES.between(processInstanceTask.getStartTime(),
					processInstanceTask.getEndTime());
			if ((totalTimeTaken / 24 / 60) != 0) {
				time = totalTimeTaken / 24 / 60 + " " + "day" + " " + totalTimeTaken / 60 % 24 + " " + "hours" + " "
						+ totalTimeTaken % 60 + " " + "minutes";
			} else if ((totalTimeTaken / 60 % 24) != 0) {
				time = totalTimeTaken / 60 % 24 + " " + "hours" + " " + totalTimeTaken % 60 + " " + "minutes";
			} else {
				time = totalTimeTaken % 60 + " " + "minutes";
			}
		}
		return time;
	}

	private boolean getBoolean(JsonNode propertyValue, String key, Boolean defaultValue) {
		if (propertyValue != null && propertyValue.has(key)) {
			return propertyValue.get(key).asBoolean();
		}

		return defaultValue;
	}

	private String getText(JsonNode propertyValue, String key, String defaultValue) {
		if (propertyValue != null && propertyValue.has(key)) {
			return propertyValue.get(key).asText();
		}

		return defaultValue;
	}

	private String getComputeOperator(String operator) {
		if (StringUtils.equalsIgnoreCase(operator, ADD)) {
			return " + ";
		} else if (StringUtils.equalsIgnoreCase(operator, SUBTRACT)) {
			return " - ";
		} else if (StringUtils.equalsIgnoreCase(operator, DIVIDE)) {
			return " / ";
		} else if (StringUtils.equalsIgnoreCase(operator, MULTIPLY)) {
			return " * ";
		} else if (StringUtils.equalsIgnoreCase(operator, MODULUS)) {
			return " % ";
		} else if (StringUtils.equalsIgnoreCase(operator, DAYS_BETWEEN)) {
			return " & ";
		}
		return null;
	}

	private String getRightAssignmentValues(JsonNode propertyValue, String Rightkey, String Leftkey, String operator,
			String dataType, ProcessInstanceTask procInstanceTask) {
		StringBuilder computeValues = new StringBuilder();
		if (propertyValue != null && propertyValue.has(Rightkey) && propertyValue.has(Leftkey)
				&& propertyValue.has(operator)) {
			computeValues.append(propertyValue.get(Leftkey).asText());
			computeValues.append(" = ");
			List<JsonNode> rightAssignmentGroup = propertyValue.findValues(Rightkey);
			int i = 1;
			for (JsonNode rightAssignmentList : rightAssignmentGroup) {
				for (JsonNode rightAssignment : rightAssignmentList) {
					if (rightAssignment.has("variableName")) {
						computeValues.append(resolvePagefieldValues(rightAssignment, procInstanceTask));
					}
					if (i < rightAssignmentList.size() && propertyValue.has(operator)) {
						computeValues.append(getComputeOperator(propertyValue.get(operator).asText()));
					}
					++i;
				}
			}
			if (propertyValue.has(dataType)
					&& StringUtils.equalsIgnoreCase(propertyValue.get(dataType).asText(), DATE)) {
				computeValues.append(" days");
			}
		}

		return computeValues.toString();
	}

	private String resolvePagefieldValues(JsonNode value, ProcessInstanceTask procInstanceTask) {
		if (value.has("variableName") && value.has("variableType")
				&& StringUtils.equalsIgnoreCase(value.get("variableType").asText(), "pagefield")) {
			ValueType fieldValue = (workflowService.getFieldValue(
					procInstanceTask.getProcessInstance().getProcessInstanceId(), value.get("variableName").asText(),
					VariableType.PAGEFIELD));
			return fieldValue.getValue().toString();
		} else {
			return value.get("variableName").asText();
		}
	}

	private String getDecisionLogic(JsonNode propertyValue, String key, String operator) {
		if (propertyValue != null && propertyValue.has(key)) {
			JsonNode decisionLogic = propertyValue.get(key);
			if (decisionLogic != null && decisionLogic.has(operator)) {
				return decisionLogic.get(operator).asText();
			}
		}
		return null;
	}

	private String getResolvedDecisionOperator(String operator) {
		if (StringUtils.equalsIgnoreCase(operator, "eq")) {
			return EQUALS;
		} else if (StringUtils.equalsIgnoreCase(operator, "ne")) {
			return NOT_EQUALS;
		} else if (StringUtils.equalsIgnoreCase(operator, "lt")) {
			return LESS_THAN;
		} else if (StringUtils.equalsIgnoreCase(operator, "gt")) {
			return GREATER_THAN;
		} else if (StringUtils.equalsIgnoreCase(operator, "ge")) {
			return GREATER_THAN_EQUAL;
		} else if (StringUtils.equalsIgnoreCase(operator, "le")) {
			return LESS_THAN_EQUAL;
		} else if (StringUtils.equalsIgnoreCase(operator, "bw")) {
			return BEGINS_WITH;
		} else if (StringUtils.equalsIgnoreCase(operator, "ew")) {
			return ENDS_WITH;
		} else if (StringUtils.equalsIgnoreCase(operator, "cn")) {
			return CONTAINS;
		}
		return null;
	}

	private String getResolvedFields(String field) {
		if (StringUtils.equalsIgnoreCase(field, PAGE_FIELDS)) {
			return " (Field)";
		} else if (StringUtils.equalsIgnoreCase(field, CONSTANT)) {
			return " (Constant)";
		}
		return null;
	}

	private String getDecisionRules(JsonNode propertyValue, String key, String rules,
			ProcessInstanceTask processInstanceTask) {
		StringBuilder decisionValues = new StringBuilder();
		if (propertyValue != null && propertyValue.has(key)) {
			JsonNode decisionLogic = propertyValue.get(key);
			if (decisionLogic != null && decisionLogic.has(rules)) {
				List<JsonNode> decisionRules = propertyValue.findValues(rules);
				int i = 1;
				for (JsonNode ruleList : decisionRules) {
					for (JsonNode rule : ruleList) {
						if (rule.has("leftAssignment") && rule.has("operator") && rule.has("rightAssignment")) {
							decisionValues.append("Rule " + i + ": ");
							List<JsonNode> leftAssignmentValues = rule.findValues("leftAssignment");
							List<JsonNode> rightAssignmentValues = rule.findValues("rightAssignment");
							JsonNode operator = rule.get("operator");
							for (JsonNode leftAssignment : leftAssignmentValues) {
								if (leftAssignment.has("variableName")) {
									decisionValues.append(leftAssignment.get("variableName").asText()
											+ getResolvedFields(leftAssignment.get("variableType").asText()));
								}
							}
							decisionValues.append(" " + getResolvedDecisionOperator(operator.asText()) + " ");
							for (JsonNode rightAssignment : rightAssignmentValues) {
								if (rightAssignment.has("variableName")) {
									decisionValues.append(rightAssignment.get("variableName").asText()
											+ getResolvedFields(rightAssignment.get("variableType").asText()));
								}
							}
							decisionValues.append("\n");
							decisionValues.append("Rule " + i++ + " Evaluated: ");
							for (JsonNode leftAssignment : leftAssignmentValues) {
								if (leftAssignment.has("variableName")) {
									decisionValues.append(resolvePagefieldValues(leftAssignment, processInstanceTask));
								}
							}
							decisionValues.append(" " + getResolvedDecisionOperator(operator.asText()) + " ");
							for (JsonNode rightAssignment : rightAssignmentValues) {
								if (rightAssignment.has("variableName")) {
									decisionValues.append(resolvePagefieldValues(rightAssignment, processInstanceTask));
								}
							}
						}
						if (i <= rule.size()) {
							decisionValues.append("\n");
							decisionValues.append("\n");
						}
					}
				}
			}
		}
		return decisionValues.toString();
	}

	private Long getLong(JsonNode propertyValue, String key, Long defaultValue) {
		if (propertyValue != null && propertyValue.has(key)) {
			return propertyValue.get(key).asLong();
		}
		return defaultValue;
	}

	private ProcessInstancePropertyVO getProperty(ProcessInstanceTask processInstanceTask)
			throws JsonProcessingException {
		ProcessInstancePropertyVO processInstancePropertyVO = null;
		JsonNode propertyValue = null;
		if (!processInstanceTask.getProcessDefinitionTask().getTaskProperties().isEmpty()) {
			propertyValue = processInstanceTask.getProcessDefinitionTask().getTaskProperties().get(0)
					.getPropertyValue();
		}
		processInstancePropertyVO = ProcessInstancePropertyVO.builder()
				.taskType(processInstanceTask.getProcessDefinitionTask().getTaskType())
				.formId(processInstanceTask.getProcessDefinitionTask().getFormId())
				.isCustomForm(getBoolean(propertyValue, "isCustomForm", false))
				.version(getLong(propertyValue, "formVersion", 1L)).time(getLong(propertyValue, "time", 1L))
				.units(getText(propertyValue, "units", null)).name(getText(propertyValue, "name", null))
				.propertyType(getText(propertyValue, "propertyType", null))
				.computeDataType(getText(propertyValue, "dataType", null))
				.url(getText(propertyValue, "remoteUrl", null)).sqlType(getText(propertyValue, "actionType", null))
				.processInstanceId(processInstanceTask.getProcessInstance().getProcessInstanceId())
				.processInstanceTaskId(processInstanceTask.getProcessInstanceTaskId())
				.data(processInstanceTask.getData())
				.startType(processInstanceTask.getProcessDefinitionTask().getProcessDefinition().getStartType())
				.build();
		if (StringUtils.equalsIgnoreCase(processInstanceTask.getProcessDefinitionTask().getTaskType(),
				"APPROVAL_TASK")) {
			String approvalStatus = getText(processInstanceTask.getData(), APPROVAL_STATUS, null);

			if (StringUtils.equalsIgnoreCase(approvalStatus, APPROVED)) {
				processInstancePropertyVO.setApprovalStatus(getText(propertyValue, "name", null) + " was Approved");
			} else if (StringUtils.equalsIgnoreCase(approvalStatus, REJECTED)) {
				processInstancePropertyVO.setApprovalStatus(getText(propertyValue, "name", null) + " was Rejected");
			} else if (StringUtils.equalsIgnoreCase(approvalStatus, SENDBACK)) {
				processInstancePropertyVO.setApprovalStatus(getText(propertyValue, "name", null) + " was Send Back");
			}
		}
		if (StringUtils.equalsIgnoreCase(processInstanceTask.getProcessDefinitionTask().getTaskType(),
				"COMPUTE_TASK")) {
			processInstancePropertyVO.setComputeString(getRightAssignmentValues(propertyValue, "rightAssignment",
					"leftAssignment", "operator", "dataType", processInstanceTask));
		}
		if (StringUtils.equalsIgnoreCase(processInstanceTask.getProcessDefinitionTask().getTaskType(),
				"DECISION_TASK")) {
			processInstancePropertyVO
					.setDecisionLogic(getDecisionLogic(propertyValue, "decisionLogic", "logicOperator"));
			processInstancePropertyVO
					.setDecisionRules(getDecisionRules(propertyValue, "decisionLogic", "rules", processInstanceTask));
		}
		if (StringUtils.equalsIgnoreCase(processInstanceTask.getProcessDefinitionTask().getTaskType(), "SMS_TASK")) {
			processInstancePropertyVO.setMessageBody(smsDataResolveService.resolvedMessageBody(processInstanceTask,
					getText(propertyValue, "mesageBody", null)));
			SmsFieldVO smsFields = objectMapper.treeToValue(propertyValue, SmsFieldVO.class);
			List<String> mobileNumbersList = smsDataResolveService.resolvedMobileNumber(processInstanceTask,
					smsFields.getMobileNumbersList());
			processInstancePropertyVO.setMobileNumbers(mobileNumbersList.toString());
		}
		return processInstancePropertyVO;
	}

	@Transactional
	public ProcessInstancePropertyVO getPropertyValue(UUID instanceTaskId) throws JsonProcessingException {
		ProcessInstanceTask procInstanceTask = processInstanceTaskRepo.getOne(instanceTaskId);

		return getProperty(procInstanceTask);
	}

	@Transactional
	public WorkflowTaskProgressVo getProcessProgress(UUID instanceId) {
		List<ProcessInstanceTask> completedTaskCountList = processInstanceTaskRepo
				.getTaskListCountForProgress(instanceId, YorosisContext.get().getTenantId());
		if (completedTaskCountList != null && !completedTaskCountList.isEmpty()) {
			Integer completedTaskCount = completedTaskCountList.stream()
					.collect(groupingBy(t -> t.getProcessDefinitionTask().getTaskId(), Collectors.toList())).entrySet()
					.stream().map(n -> n.getKey()).collect(Collectors.toList()).size();
			Integer totalTaskCount = processDefinitionTaskRepo.getProcessTaskTotalList(
					completedTaskCountList.get(0).getProcessInstance().getProcessDefinition().getProcessDefinitionId(),
					YorosisContext.get().getTenantId());
			Float percentage = (float) 0;
			if (totalTaskCount > 0) {
				percentage = (completedTaskCount.floatValue() / totalTaskCount.floatValue()) * 100;
			}
			return WorkflowTaskProgressVo.builder().taskCount(completedTaskCount).statusPercentage(percentage)
					.totalTaskCount(totalTaskCount).build();
		}
		return WorkflowTaskProgressVo.builder().taskCount(0).totalTaskCount(0).statusPercentage(0).build();
	}

}
