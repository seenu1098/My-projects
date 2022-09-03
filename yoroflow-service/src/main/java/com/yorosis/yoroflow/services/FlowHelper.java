package com.yorosis.yoroflow.services;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yorosis.yoroflow.models.LinkNode;
import com.yorosis.yoroflow.models.Process;
import com.yorosis.yoroflow.models.Task;
import com.yorosis.yoroflow.models.TaskNode;
import com.yorosis.yoroflow.models.TaskType;
import com.yorosis.yoroflow.models.WorkFlow;
import com.yorosis.yoroflow.models.YoroFlowException;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class FlowHelper {

	@Autowired
	private ObjectMapper objMapper;

	public Process convertFlowModel(JsonNode workflowJson) {
		WorkFlow workFlow = objMapper.convertValue(workflowJson, WorkFlow.class);
		log.debug(workflowJson.toString());
		List<Task> taskNodeList = (convertTaskNodeToTask(workFlow.getTaskNodeList()));

		List<Task> taskLinkList = (convertListNodeToTask(workFlow.getLinkNodeList()));
		taskLinkList.addAll(sourceToTasks(taskNodeList, workFlow.getLinkNodeList()));
		return Process.builder().key(workFlow.getKey()).startType(workFlow.getStartType()).name(workFlow.getName()).taskList(taskLinkList)
				.startKey(workFlow.getStartKey()).workflowStructure(workflowJson.toString()).build();
	}

	private List<Task> convertListNodeToTask(List<LinkNode> linkNodeList) {
		return linkNodeList.stream().map(s -> Task.builder().key(s.getKey()).taskType(TaskType.SEQ_FLOW).targetTask(s.getTarget()).build())
				.collect(Collectors.toList());
	}

	private List<Task> convertTaskNodeToTask(List<TaskNode> taskNodeList) {
		return taskNodeList.stream().map(
				s -> (Task.builder().taskProperty(s.getTaskProperty()).key(s.getKey()).name(s.getLabel()).taskType(TaskType.valueOf(s.getTaskType())).build()))
				.collect(Collectors.toList());
	}

	private List<Task> sourceToTasks(List<Task> taskNodeList, List<LinkNode> linkNodeList) {
		Set<Task> taskNode = new HashSet<>();
		linkNodeList.stream().forEach(s -> getTaskBasedOnKey(taskNodeList, s.getSource()).ifPresent(t -> {
			t.setTargetTask(s.getKey());
			taskNode.add(t);
		}));

		taskNodeList.stream().filter(s -> s.getTaskType() == TaskType.END_TASK).forEach(taskNode::add);
		return new ArrayList<>(taskNode);
	}

	private Optional<Task> getTaskBasedOnKey(List<Task> taskList, String key) {
		return taskList.stream().filter(s -> StringUtils.equalsIgnoreCase(s.getKey(), key)).findFirst();
	}

	public List<String> getAssignableFields(String destinationTaskKey, WorkFlow workFlow) throws YoroFlowException {
		String startKey = workFlow.getStartKey();
		if (StringUtils.isBlank(startKey)) {
			throw new YoroFlowException("StarKey is mandatory");
		}
		int flowCount = 0;
		List<LinkNode> listPotentialTasks = getTaskfromList(workFlow.getLinkNodeList(), destinationTaskKey, startKey, flowCount);

		return listPotentialTasks.stream().map(LinkNode::getSource).distinct().collect(Collectors.toList());
	}

	Optional<TaskNode> getFieldInfoForEachTask(List<TaskNode> listTaskNode, String taskName) {
		return listTaskNode.stream().filter(s -> StringUtils.equalsIgnoreCase(taskName, s.getKey())).findFirst();
	}

	private List<LinkNode> getTaskfromList(List<LinkNode> listTasks, String destinationTaskKey, String startKey, int flowCount) throws YoroFlowException {

		List<LinkNode> someList = new ArrayList<>();
		if (StringUtils.equalsIgnoreCase(startKey, destinationTaskKey)) {
			// return Collections.emptyList();
		}
		// .filter(s -> !StringUtils.equalsIgnoreCase("Se Back", s.getLinkLabel()))
		List<LinkNode> listLinkNode = listTasks.stream().filter(s -> StringUtils.equalsIgnoreCase(s.getTarget(), destinationTaskKey))
				.collect(Collectors.toList());
		if (listTasks.size() > flowCount) {
			for (LinkNode linkNode : listLinkNode) {
				flowCount++;
				someList.addAll(getTaskfromList(listTasks, linkNode.getSource(), startKey, flowCount));
			}
		}
		someList.addAll(listLinkNode);

		return someList;
	}
}
