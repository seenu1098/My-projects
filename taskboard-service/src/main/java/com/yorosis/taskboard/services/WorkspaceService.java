package com.yorosis.taskboard.services;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.taskboard.models.TaskBoardTaskSummaryVo;
import com.yorosis.taskboard.repository.TaskboardRepository;
import com.yorosis.yoroapps.grid.vo.PaginationVO;
import com.yorosis.yoroapps.vo.WorkspaceDetailsVo;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class WorkspaceService {

	@Autowired
	private TaskboardService taskboardService;

	@Autowired
	private TaskboardRepository taskboardRepository;

	protected Pageable getPageable(PaginationVO vo, boolean hasFilter) {
		int pageSize = 10;
		if (vo != null) {
			if (vo.getSize() > 0) {
				pageSize = vo.getSize();
			}
		}
		return PageRequest.of(vo.getIndex(), pageSize);
	}

	@Transactional
	public WorkspaceDetailsVo getNamesListForWorkspace() {
		return WorkspaceDetailsVo.builder().taskboardNamesVOList(taskboardService.getTaskBoardNameList()).build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public WorkspaceDetailsVo getAllNamesListForWorkspace() {
		return WorkspaceDetailsVo.builder().taskboardNamesVOList(taskboardService.getAllTaskBoardNameList()).build();
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public List<TaskBoardTaskSummaryVo> getAllTaskboardNameList(UUID workspaceId, PaginationVO vo) {
		List<TaskBoardTaskSummaryVo> taskBoardTaskSummaryVo = new ArrayList<>();
		Pageable pageable = getPageable(vo, true);
		List<Object[]> taskBoardTasksList = taskboardRepository.getAllInprocessAndCompletedTaskCountByWorkspace(YorosisContext.get().getTenantId(),
				YorosisConstants.YES, workspaceId, pageable);
		if (taskBoardTasksList != null) {
			taskBoardTaskSummaryVo = taskBoardTasksList.stream().map(this::constructTaskboardNames).collect(Collectors.toList());
		}
		return taskBoardTaskSummaryVo;
	}

	private TaskBoardTaskSummaryVo constructTaskboardNames(Object[] taskboardNamesVo) {
		return TaskBoardTaskSummaryVo.builder().taskboardName((String) taskboardNamesVo[0]).inProcessCount((long) taskboardNamesVo[1])
				.completedCount((long) taskboardNamesVo[2]).build();
	}
}
