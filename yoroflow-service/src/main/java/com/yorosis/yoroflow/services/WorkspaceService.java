package com.yorosis.yoroflow.services;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroapps.vo.WorkspaceDetailsVo;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.PaginationVO;
import com.yorosis.yoroflow.models.TaskBoardTaskSummaryVo;
import com.yorosis.yoroflow.models.WorkflowSummaryVO;
import com.yorosis.yoroflow.repository.ProcessDefinitionRepo;
import com.yorosis.yoroflow.repository.TaskboardRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;
import com.yorosis.yoroflow.services.docs.YoroDocumentService;

@Service
public class WorkspaceService {

	@Autowired
	private YoroDocumentService yoroDocumentService;

	@Autowired
	private TaskboardService taskboardService;

	@Autowired
	private WorkflowService workFlowService;

	@Autowired
	private TaskboardRepository taskboardRepository;

	@Autowired
	private ProcessDefinitionRepo processDefinitionRepo;

	protected Pageable getPageable(PaginationVO vo, boolean hasFilter) {
		Sort sort = null;
		int pageSize = 10;
		if (vo != null) {
			if (vo.getSize() > 0) {
				pageSize = vo.getSize();
			}
//			if (!StringUtils.isEmpty(vo.getColumnName())) {
//				if (StringUtils.equals(vo.getDirection(), "desc")) {
//					sort = Sort.by(new Sort.Order(Direction.DESC, "inProcess"));
//				} else {
//					sort = Sort.by(new Sort.Order(Direction.ASC, "inProcess"));
//				}
//			}
//			if (hasFilter && sort != null) {
//				return PageRequest.of(0, 100000, sort);
//			} else if (hasFilter) {
//				return PageRequest.of(0, 100000);
//			}
//
//			if (sort != null) {
//				return PageRequest.of(vo.getIndex(), pageSize, sort);
//			}
		}
		return PageRequest.of(vo.getIndex(), pageSize);
	}

	@Transactional
	public WorkspaceDetailsVo getNamesListForWorkspace() {
		return WorkspaceDetailsVo.builder().taskboardNamesVOList(taskboardService.getTaskBoardNameList())
				.workflowNamesVOList(workFlowService.getWorkflowNameList())
				.yorDocsNamesVoList(yoroDocumentService.getYoroDocsNamesList()).build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public WorkspaceDetailsVo getAllNamesListForWorkspace() {
		return WorkspaceDetailsVo.builder().taskboardNamesVOList(taskboardService.getAllTaskBoardNameList())
				.workflowNamesVOList(workFlowService.getAllWorkflowNameList())
				.yorDocsNamesVoList(yoroDocumentService.getAllYoroDocsNamesList()).build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public List<WorkflowSummaryVO> getAllWorkflowNameList(UUID workspaceId, PaginationVO vo) {
		List<WorkflowSummaryVO> workflowCountListVo = new ArrayList<>();
		Pageable pageable = getPageable(vo, true);
		List<Object[]> processInstanceList = processDefinitionRepo.getAllInprocessAndCompletedTaskCountByWorkspace(
				YorosisContext.get().getTenantId(), YorosisConstants.YES, workspaceId, pageable);
		if (processInstanceList != null) {
			workflowCountListVo = processInstanceList.stream().map(this::constructWorkflowNames)
					.collect(Collectors.toList());
		}
		return workflowCountListVo;
	}

	private WorkflowSummaryVO constructWorkflowNames(Object[] taskboardNamesVo) {
		return WorkflowSummaryVO.builder().processDefinitionName((String) taskboardNamesVo[0])
				.inProcessCount((long) taskboardNamesVo[1]).completedCount((long) taskboardNamesVo[2]).build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public List<TaskBoardTaskSummaryVo> getAllTaskboardNameList(UUID workspaceId, PaginationVO vo) {
		List<TaskBoardTaskSummaryVo> taskBoardTaskSummaryVo = new ArrayList<>();
		Pageable pageable = getPageable(vo, true);
		List<Object[]> taskBoardTasksList = taskboardRepository.getAllInprocessAndCompletedTaskCountByWorkspace(
				YorosisContext.get().getTenantId(), YorosisConstants.YES, workspaceId, pageable);
		if (taskBoardTasksList != null) {
			taskBoardTaskSummaryVo = taskBoardTasksList.stream().map(this::constructTaskboardNames)
					.collect(Collectors.toList());
		}
		return taskBoardTaskSummaryVo;
	}

	private TaskBoardTaskSummaryVo constructTaskboardNames(Object[] taskboardNamesVo) {
		return TaskBoardTaskSummaryVo.builder().taskboardName((String) taskboardNamesVo[0])
				.inProcessCount((long) taskboardNamesVo[1]).completedCount((long) taskboardNamesVo[2]).build();
	}
}
