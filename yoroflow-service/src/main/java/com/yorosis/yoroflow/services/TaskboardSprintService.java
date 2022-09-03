package com.yorosis.yoroflow.services;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
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

import com.yorosis.yoroflow.entities.Taskboard;
import com.yorosis.yoroflow.entities.TaskboardSprintSettings;
import com.yorosis.yoroflow.entities.TaskboardSprintTask;
import com.yorosis.yoroflow.entities.TaskboardSprintWorkLog;
import com.yorosis.yoroflow.entities.TaskboardSprints;
import com.yorosis.yoroflow.entities.TaskboardTask;
import com.yorosis.yoroflow.entities.User;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.PaginationVO;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.models.TaskboardTaskVO;
import com.yorosis.yoroflow.models.sprint.SaveSprintVo;
import com.yorosis.yoroflow.models.sprint.SprintSettingsVo;
import com.yorosis.yoroflow.models.sprint.SprintTasksVo;
import com.yorosis.yoroflow.models.sprint.SprintsVO;
import com.yorosis.yoroflow.models.sprint.WorkLogListVo;
import com.yorosis.yoroflow.models.sprint.WorkLogVo;
import com.yorosis.yoroflow.repository.TaskboardRepository;
import com.yorosis.yoroflow.repository.TaskboardSprintSettingsRepository;
import com.yorosis.yoroflow.repository.TaskboardSprintTasksRepository;
import com.yorosis.yoroflow.repository.TaskboardSprintWorkLogRepository;
import com.yorosis.yoroflow.repository.TaskboardSprintsRepository;
import com.yorosis.yoroflow.repository.TaskboardTaskRepository;
import com.yorosis.yoroflow.repository.UsersRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class TaskboardSprintService {

	@Autowired
	private TaskboardRepository taskboardRepository;

	@Autowired
	private TaskboardSprintsRepository taskboardSprintsRepository;

	@Autowired
	private TaskboardSprintSettingsRepository taskboardSprintSettingsRepository;

	@Autowired
	private TaskboardSprintTasksRepository taskboardSprintTasksRepository;

	@Autowired
	private TaskboardTaskRepository taskboardTaskRepository;

	@Autowired
	private TaskboardSprintWorkLogRepository taskboardSprintWorkLogRepository;

	@Autowired
	private UsersRepository userRepository;

	private TaskboardSprints constructSprintSettingsVoToDto(SprintsVO sprintsVO) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return TaskboardSprints.builder().sprintStatus("p").activeFlag(YorosisConstants.YES)
				.tenantId(YorosisContext.get().getTenantId()).createdBy(YorosisContext.get().getUserName())
				.modifiedBy(YorosisContext.get().getUserName()).createdOn(timestamp).modifiedOn(timestamp).build();
	}

	public TaskboardSprintSettings constructSprintSettingsVOToDto(SprintSettingsVo sprintSettingsVo) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return TaskboardSprintSettings.builder().sprintDuration(sprintSettingsVo.getSprintDuration())
				.activeFlag(YorosisConstants.YES).tenantId(YorosisContext.get().getTenantId())
				.createdBy(YorosisContext.get().getUserName()).modifiedBy(YorosisContext.get().getUserName())
				.createdOn(timestamp).modifiedOn(timestamp).sprintStartDay(sprintSettingsVo.getSprintStartDay())
				.sprintDurationType(sprintSettingsVo.getSprintDurationType())
				.sprintEstimations(sprintSettingsVo.getSprintEstimations()).build();
	}

	private SprintSettingsVo constructSprintSettingsDtoToVo(TaskboardSprintSettings taskboardSprintSettings) {
		return SprintSettingsVo.builder().sprintSettingsId(taskboardSprintSettings.getSprintSettingId())
				.sprintDuration(taskboardSprintSettings.getSprintDuration())
				.sprintStartDay(taskboardSprintSettings.getSprintStartDay())
				.sprintEstimations(taskboardSprintSettings.getSprintEstimations())
				.sprintDurationType(taskboardSprintSettings.getSprintDurationType())
				.taskboardId(taskboardSprintSettings.getTaskboard().getId()).build();
	}

	private SprintsVO constructSprintsDtoToVo(TaskboardSprints taskboardSettings) {
		return SprintsVO.builder().sprintId(taskboardSettings.getSprintId())
				.sprintSeqNumber(taskboardSettings.getSprintSeqNumber())
				.sprintTotalEstimatedHours(taskboardSettings.getSprintTotalEstimatedHours())
				.sprintTotalWorkedHours(taskboardSettings.getSprintTotalWorkedHours())
				.sprintTotalOriginalPoints(taskboardSettings.getSprintTotalOriginalPoints())
				.sprintEndDate(taskboardSettings.getSprintEndDate()).sprintStatus(taskboardSettings.getSprintStatus())
				.sprintStartDate(taskboardSettings.getSprintStartDate()).sprintName(taskboardSettings.getSprintName())
				.build();
	}

	private TaskboardSprintWorkLog constructWorkLogVoToDto(WorkLogVo workLogVo) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return TaskboardSprintWorkLog.builder().description(workLogVo.getDescription())
				.workDate(workLogVo.getWorkDate()).timespent(workLogVo.getTimespent()).activeFlag(YorosisConstants.YES)
				.tenantId(YorosisContext.get().getTenantId()).createdBy(YorosisContext.get().getUserName())
				.modifiedBy(YorosisContext.get().getUserName()).createdOn(timestamp).modifiedOn(timestamp).build();
	}

	private WorkLogVo constructWorkLogDtoToVo(TaskboardSprintWorkLog taskboardSprintWorkLog) {
		return WorkLogVo.builder().description(taskboardSprintWorkLog.getDescription())
				.workDate(taskboardSprintWorkLog.getWorkDate()).timespent(taskboardSprintWorkLog.getTimespent())
				.userId(taskboardSprintWorkLog.getUser().getUserId()).workLogId(taskboardSprintWorkLog.getWorkLogId())
				.loggedatTime(taskboardSprintWorkLog.getCreatedOn())
				.sprintTaskId(taskboardSprintWorkLog.getTaskboardSprintTask().getSprintTaskId()).build();
	}

	protected Pageable getPageable(PaginationVO vo, boolean hasFilter) {
		Sort sort = null;
		int pageSize = 10;
		if (vo.getSize() > 0) {
			pageSize = vo.getSize();
		}
		if (!StringUtils.isEmpty(vo.getColumnName())) {
			if (StringUtils.equals(vo.getDirection(), "desc")) {
				sort = Sort.by(new Sort.Order(Direction.DESC, vo.getColumnName()));
			} else {
				sort = Sort.by(new Sort.Order(Direction.ASC, vo.getColumnName()));
			}
		}
		if (hasFilter && sort != null) {
			return PageRequest.of(0, 100000, sort);
		} else if (hasFilter) {
			return PageRequest.of(0, 100000);
		}

		if (sort != null) {
			return PageRequest.of(vo.getIndex(), pageSize, sort);
		}
		return PageRequest.of(vo.getIndex(), pageSize);
	}

	@Transactional
	public ResponseStringVO saveAndUpdateSprintSetting(SprintSettingsVo sprintSettingsVo, Taskboard taskboard) {
		if (sprintSettingsVo.getSprintSettingsId() == null) {
			if (taskboard == null) {
				taskboard = taskboardRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
						sprintSettingsVo.getTaskboardId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
			}
			if (taskboard != null) {
				if (taskboardSprintSettingsRepository.getTaskboardSprintSettingsCountByTaskboardId(
						sprintSettingsVo.getTaskboardId(), YorosisContext.get().getTenantId(),
						YorosisConstants.YES) > 0) {
					return ResponseStringVO.builder().response("Sprint Settings already added").build();
				}
				if (!StringUtils.equals(taskboard.getSprintEnabled(), YorosisConstants.YES)) {
					taskboard.setSprintEnabled(YorosisConstants.YES);
					taskboardRepository.save(taskboard);
				}
				TaskboardSprintSettings taskboardSprintSettings = constructSprintSettingsVOToDto(sprintSettingsVo);
				taskboardSprintSettings.setTaskboard(taskboard);
				taskboardSprintSettings = taskboardSprintSettingsRepository.save(taskboardSprintSettings);
				return ResponseStringVO.builder().response("Sprint Saved Successfully")
						.id(taskboardSprintSettings.getSprintSettingId()).build();
			} else {
				return ResponseStringVO.builder().response("Sprint not enabled for this taskboard").build();
			}
		} else {
			TaskboardSprintSettings taskboardSprintSettings = taskboardSprintSettingsRepository
					.getTaskboardSprintSettingsById(sprintSettingsVo.getSprintSettingsId(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES);
			if (taskboardSprintSettings != null) {
				Timestamp timestamp = new Timestamp(System.currentTimeMillis());
				taskboardSprintSettings.setSprintEstimations(sprintSettingsVo.getSprintEstimations());
				taskboardSprintSettings.setSprintDuration(sprintSettingsVo.getSprintDuration());
				taskboardSprintSettings.setSprintStartDay(sprintSettingsVo.getSprintStartDay());
				taskboardSprintSettings.setSprintDurationType(sprintSettingsVo.getSprintDurationType());
				taskboardSprintSettings.setModifiedBy(YorosisContext.get().getUserName());
				taskboardSprintSettings.setModifiedOn(timestamp);
				taskboardSprintSettingsRepository.save(taskboardSprintSettings);
				return ResponseStringVO.builder().response("Sprint Updated Successfully").build();
			}
		}
		return ResponseStringVO.builder().response("Sprint Not Saved").build();
	}

	@Transactional
	public ResponseStringVO deleteSprintSettings(UUID sprintSettingsId) {
		TaskboardSprintSettings taskboardSprintSettings = taskboardSprintSettingsRepository
				.getTaskboardSprintSettingsById(sprintSettingsId, YorosisContext.get().getTenantId(),
						YorosisConstants.YES);
		if (taskboardSprintSettings != null) {
			taskboardSprintSettings.setActiveFlag(YorosisConstants.NO);
			taskboardSprintSettingsRepository.save(taskboardSprintSettings);
		}
		return ResponseStringVO.builder().response("Sprint Settings Disabled Successfully").build();
	}

	@Transactional
	public ResponseStringVO addEstimateHoursForTask(TaskboardTaskVO vo) {
		TaskboardTask taskboardTask = taskboardTaskRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
				vo.getId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskboardTask != null
				&& StringUtils.equals(taskboardTask.getTaskboard().getSprintEnabled(), YorosisConstants.YES)) {
			Float hours = taskboardTask.getEstimateHours();
			taskboardTask.setEstimateHours(vo.getEstimateHours());
			taskboardTask = taskboardTaskRepository.save(taskboardTask);
			updateOriginalAndEstimateHoursForTask(taskboardTask, "estimate", hours, null);
			return ResponseStringVO.builder().response("Estimate hours added successfully").build();
		}
		return ResponseStringVO.builder().response("Taskboard is not sprint enabled").build();
	}

	private void updateOriginalAndEstimateHoursForTask(TaskboardTask taskboardTask, String type, Float hours,
			Integer points) {
		List<TaskboardSprints> taskboardSprintsList = taskboardSprintsRepository.getTaskboardSprintsListByTaskboard(
				taskboardTask.getTaskboard().getId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
		List<TaskboardSprintTask> sprintTaskList = new ArrayList<>();
		List<TaskboardSprints> taskboardSprintsListForSave = new ArrayList<>();
		if (taskboardSprintsList != null && !taskboardSprintsList.isEmpty()) {
			for (TaskboardSprints taskboardSprints : taskboardSprintsList) {
				if (StringUtils.equals(taskboardSprints.getSprintStatus(), "p")) {
					TaskboardSprintTask sprintTask = taskboardSprintTasksRepository.getTaskboardSprintTasksById(
							taskboardTask.getId(), taskboardSprints.getSprintId(), YorosisContext.get().getTenantId(),
							YorosisConstants.YES);
					if (sprintTask != null) {
						if (StringUtils.equals(type, "original")) {
							Integer totalSprintEstimatePoints = taskboardSprints.getSprintTotalOriginalPoints() == null
									? 0
									: taskboardSprints.getSprintTotalOriginalPoints();
							sprintTask.setSprintEstimatedPoints(taskboardTask.getOriginalPoints());
							totalSprintEstimatePoints = (totalSprintEstimatePoints
									+ (taskboardTask.getOriginalPoints() == null ? 0
											: taskboardTask.getOriginalPoints()))
									- (points == null ? 0 : points);
							taskboardSprints.setSprintTotalOriginalPoints(totalSprintEstimatePoints);
						}
						if (StringUtils.equals(type, "estimate")) {
							Double totalSprintEstimateHours = taskboardSprints.getSprintTotalEstimatedHours() == null
									? 0.0
									: taskboardSprints.getSprintTotalEstimatedHours();
							sprintTask.setSprintEstimatedHours(taskboardTask.getEstimateHours());
							totalSprintEstimateHours = (totalSprintEstimateHours
									+ (taskboardTask.getEstimateHours() == null ? 0 : taskboardTask.getEstimateHours()))
									- (hours == null ? 0.0 : hours);
							taskboardSprints.setSprintTotalEstimatedHours(totalSprintEstimateHours);
						}
						sprintTaskList.add(sprintTask);
						taskboardSprintsListForSave.add(taskboardSprints);
					}
				}
			}
		}
		if (!sprintTaskList.isEmpty())
			taskboardSprintTasksRepository.saveAll(sprintTaskList);
		if (!taskboardSprintsListForSave.isEmpty())
			taskboardSprintsRepository.saveAll(taskboardSprintsListForSave);
	}

	@Transactional
	public ResponseStringVO addOriginalPointsForTask(TaskboardTaskVO vo) {
		TaskboardTask taskboardTask = taskboardTaskRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
				vo.getId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskboardTask != null
				&& StringUtils.equals(taskboardTask.getTaskboard().getSprintEnabled(), YorosisConstants.YES)) {
			Integer points = taskboardTask.getOriginalPoints();
			taskboardTask.setOriginalPoints(vo.getOriginalPoints());
			taskboardTask = taskboardTaskRepository.save(taskboardTask);
			updateOriginalAndEstimateHoursForTask(taskboardTask, "original", null, points);
			return ResponseStringVO.builder().response("Original points added successfully").build();
		}
		return ResponseStringVO.builder().response("Taskboard is not sprint enabled").build();
	}

	@Transactional
	public SaveSprintVo saveAndUpdateSprint(SprintsVO sprintsVo) {
		if (sprintsVo != null) {
			if (sprintsVo.getSprintId() == null) {
				TaskboardSprintSettings taskboardSprintSettings = taskboardSprintSettingsRepository
						.getTaskboardSprintSettingsById(sprintsVo.getSprintSettingsId(),
								YorosisContext.get().getTenantId(), YorosisConstants.YES);
				if (taskboardSprintSettings != null) {
//					TaskboardSprints taskboardSprints = constructSprintSettingsVoToDto(sprintsVo);
					LocalDateTime startDate = sprintsVo.getSprintStartDate().toLocalDateTime();
					LocalDateTime endDate = sprintsVo.getSprintStartDate().toLocalDateTime();
					if (StringUtils.equals(taskboardSprintSettings.getSprintDurationType(), "w")) {
						endDate = startDate
								.plusWeeks(taskboardSprintSettings.getSprintDuration() * sprintsVo.getSprintCounts());
						endDate = endDate.minusDays(1);
					} else {
						endDate = startDate.plusDays(
								(taskboardSprintSettings.getSprintDuration() * sprintsVo.getSprintCounts()) - 1);
					}
					int taskboardSprintSettingsCountBetweenDays = taskboardSprintsRepository
							.getTaskboardSprintsCountByStartAndEndDate(taskboardSprintSettings.getSprintSettingId(),
									YorosisContext.get().getTenantId(), YorosisConstants.YES,
									Timestamp.valueOf(startDate), Timestamp.valueOf(endDate));
					if (taskboardSprintSettingsCountBetweenDays == 0) {
						int taskboardSprintSettingsCount = taskboardSprintsRepository
								.getTaskboardSprintsCountByTaskboard(taskboardSprintSettings.getSprintSettingId(),
										YorosisContext.get().getTenantId(), YorosisConstants.YES);
						List<TaskboardSprints> taskboardSprintsList = new ArrayList<>();
						int i = 1;
						endDate = sprintsVo.getSprintStartDate().toLocalDateTime();
						while (i <= sprintsVo.getSprintCounts()) {
							TaskboardSprints taskboardSprints = constructSprintSettingsVoToDto(sprintsVo);
							startDate = sprintsVo.getSprintStartDate().toLocalDateTime();
							endDate = sprintsVo.getSprintStartDate().toLocalDateTime();
							if (i == 1) {
								taskboardSprints.setSprintStartDate(sprintsVo.getSprintStartDate());
								if (StringUtils.equals(taskboardSprintSettings.getSprintDurationType(), "w")) {
									endDate = startDate.plusWeeks(taskboardSprintSettings.getSprintDuration());
									endDate = endDate.minusDays(1);
								} else {
									endDate = startDate.plusDays(taskboardSprintSettings.getSprintDuration() - 1);
								}
								taskboardSprints.setSprintEndDate(Timestamp.valueOf(endDate));
							} else {
								if (StringUtils.equals(taskboardSprintSettings.getSprintDurationType(), "w")) {
									startDate = startDate
											.plusWeeks(taskboardSprintSettings.getSprintDuration() * (i - 1));
									taskboardSprints.setSprintStartDate(Timestamp.valueOf(startDate));
									endDate = startDate.plusWeeks(taskboardSprintSettings.getSprintDuration());
									endDate = endDate.minusDays(1);
									taskboardSprints.setSprintEndDate(Timestamp.valueOf(endDate));
								} else {
									startDate = startDate.plusDays(1);
									startDate = startDate
											.plusDays(taskboardSprintSettings.getSprintDuration() * (i - 1));
									taskboardSprints.setSprintStartDate(Timestamp.valueOf(startDate));
									endDate = startDate.plusDays(taskboardSprintSettings.getSprintDuration() - 1);
									taskboardSprints.setSprintEndDate(Timestamp.valueOf(endDate));
								}

							}
							taskboardSprints.setSprintName("Sprint " + (taskboardSprintSettingsCount + i));
							taskboardSprints.setSprintSeqNumber(taskboardSprintSettingsCount + i);
							taskboardSprints.setTaskboardSprintSettings(taskboardSprintSettings);
							taskboardSprintsList.add(taskboardSprints);
							i++;
						}
						taskboardSprintsRepository.saveAll(taskboardSprintsList);
						return SaveSprintVo.builder().response("Sprint Saved Successfully")
								.sprintVoList(getSprintBySprintSettings(taskboardSprintSettings.getSprintSettingId()))
								.build();
					} else {
						return SaveSprintVo.builder().response(
								"The selected date range matches or overlaps with the existing sprints. Please select new date range for this sprint.")
								.sprintVoList(null).build();
					}
				} else {
					return null;
				}
			} else {
				TaskboardSprints taskboardSprints = taskboardSprintsRepository.getTaskboardSprintsById(
						sprintsVo.getSprintId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
				if (taskboardSprints != null) {
					Timestamp timestamp = new Timestamp(System.currentTimeMillis());
					taskboardSprints.setSprintName(sprintsVo.getSprintName());
//				taskboardSprints.setSprintStartDate(sprintsVo.getSprintStartDate());
//				taskboardSprints.setSprintEndDate(sprintsVo.getSprintEndDate());
					taskboardSprints.setSprintStatus(sprintsVo.getSprintStatus());
					taskboardSprints.setModifiedBy(YorosisContext.get().getUserName());
					taskboardSprints.setModifiedOn(timestamp);
					taskboardSprints = taskboardSprintsRepository.save(taskboardSprints);
					return SaveSprintVo.builder().response("Sprint Updated Successfully")
							.sprintVoList(getSprintBySprintSettings(
									taskboardSprints.getTaskboardSprintSettings().getSprintSettingId()))
							.build();
				}
			}
		}
		return null;
	}

	@Transactional
	public void deleteSprintByTaskboard(UUID taskboardId) {
		List<TaskboardSprints> taskboardSprintsList = taskboardSprintsRepository
				.getTaskboardSprintsListByTaskboardAndRunning(taskboardId, YorosisContext.get().getTenantId(),
						YorosisConstants.YES);
		if (taskboardSprintsList != null && !taskboardSprintsList.isEmpty()) {
			taskboardSprintsList.stream().forEach(ts -> {
				ts.setSprintStatus("c");
			});
			taskboardSprintsRepository.saveAll(taskboardSprintsList);
		}
	}

	@Transactional
	public ResponseStringVO deleteSprint(UUID sprintId) {
		TaskboardSprints taskboardSprints = taskboardSprintsRepository.getTaskboardSprintsById(sprintId,
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskboardSprints != null && StringUtils.equals(taskboardSprints.getSprintStatus(), "p")) {
			taskboardSprints.setActiveFlag(YorosisConstants.NO);
			taskboardSprintsRepository.save(taskboardSprints);
			return ResponseStringVO.builder().response("Sprint Deleted Successfully").build();
		}
		return ResponseStringVO.builder().response(taskboardSprints == null ? "Sprint does not exist"
				: StringUtils.equals(taskboardSprints.getSprintStatus(), "c") ? "Completed Sprint will not be deleted"
						: StringUtils.equals(taskboardSprints.getSprintStatus(), "r")
								? "Running Sprint will not be deleted"
								: "Sprint not deleted")
				.build();
	}

	private Boolean checkStartDate(Timestamp startDate) {
		Timestamp now = new Timestamp(System.currentTimeMillis());
		return (now.compareTo(startDate)) >= -1;
	}

	@Transactional
	public ResponseStringVO checkCompleteSprint(UUID sprintId, UUID taskboardId) {
		List<UUID> sprintTaskIdList = taskboardSprintTasksRepository.getTaskboardSprintTasksBySprintId(sprintId,
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (sprintTaskIdList != null && !sprintTaskIdList.isEmpty()) {
			List<String> taskIdList = taskboardTaskRepository.checkAllAndGetTaskIdTasksInDone(sprintTaskIdList,
					YorosisContext.get().getTenantId(), YorosisConstants.YES, taskboardId);
			StringBuilder taskId = new StringBuilder();
			if (taskIdList == null || taskIdList.size() == 0) {
				return ResponseStringVO.builder().response("Allow Complete").build();
			} else {
				int i = 0;
				for (String t : taskIdList) {
					if (i == 0) {
						taskId.append(t);
					}
					taskId.append(", ").append(t);
				}
				return ResponseStringVO.builder().taskId(taskId.toString()).response("Tasks Pending").build();
			}
		}
		return ResponseStringVO.builder().response("Allow Complete").build();
	}

	@Transactional
	public ResponseStringVO completeSprint(UUID sprintId) {
		TaskboardSprints taskboardSprints = taskboardSprintsRepository.getTaskboardSprintsById(sprintId,
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskboardSprints != null && StringUtils.equals(taskboardSprints.getSprintStatus(), "r")) {
			ResponseStringVO responseStringVO = checkCompleteSprint(taskboardSprints.getSprintId(),
					taskboardSprints.getTaskboardSprintSettings().getTaskboard().getId());
			if (StringUtils.equals(responseStringVO.getResponse(), "Allow Complete")) {
				taskboardSprints.setSprintStatus("c");
				taskboardSprintsRepository.save(taskboardSprints);
				return ResponseStringVO.builder().response("Sprint Completed Successfully").build();
			} else {
				return responseStringVO;
			}
		}

		return ResponseStringVO.builder().response("Sprint Not Completed").build();
	}

	@Transactional
	public List<SprintsVO> getSprintByTaskBoard(UUID taskboardId) {
		List<SprintsVO> SprintSettingsVoList = new ArrayList<>();
		List<TaskboardSprints> taskboardSprintsList = taskboardSprintsRepository.getTaskboardSprintsListByTaskboard(
				taskboardId, YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskboardSprintsList != null && !taskboardSprintsList.isEmpty()) {
			SprintSettingsVoList = taskboardSprintsList.stream().map(this::constructSprintsDtoToVo)
					.collect(Collectors.toList());
		}
		return SprintSettingsVoList;
	}

	@Transactional
	public List<SprintsVO> getSprintBySprintSettings(UUID sprintSettingId) {
		List<SprintsVO> SprintSettingsVoList = new ArrayList<>();
		List<TaskboardSprints> taskboardSprintsList = taskboardSprintsRepository
				.getTaskboardSprintsListBySprintSettings(sprintSettingId, YorosisContext.get().getTenantId(),
						YorosisConstants.YES);
		if (taskboardSprintsList != null && !taskboardSprintsList.isEmpty()) {
			SprintSettingsVoList = taskboardSprintsList.stream().map(this::constructSprintsDtoToVo)
					.collect(Collectors.toList());
		}
		return SprintSettingsVoList;
	}

	@Transactional
	public List<SprintsVO> getSprintWithInPreparationByTaskboard(UUID taskboardId) {
		List<SprintsVO> SprintSettingsVoList = new ArrayList<>();
		List<TaskboardSprints> taskboardSprintsList = taskboardSprintsRepository
				.getTaskboardSprintsInPreparationListByTaskboard(taskboardId, YorosisContext.get().getTenantId(),
						YorosisConstants.YES);
		if (taskboardSprintsList != null && !taskboardSprintsList.isEmpty()) {
			SprintSettingsVoList = taskboardSprintsList.stream().map(this::constructSprintsDtoToVo)
					.collect(Collectors.toList());
		}
		return SprintSettingsVoList;
	}

	@Transactional
	public SprintSettingsVo getSprintSettingsByTaskBoard(UUID taskboardId) {
		SprintSettingsVo sprintSettingsVo = null;
		TaskboardSprintSettings taskboardSprintSettings = taskboardSprintSettingsRepository
				.getTaskboardSprintSettingsByTaskboardId(taskboardId, YorosisContext.get().getTenantId(),
						YorosisConstants.YES);
		if (taskboardSprintSettings != null) {
			sprintSettingsVo = constructSprintSettingsDtoToVo(taskboardSprintSettings);
		}
		return sprintSettingsVo;
	}

	@Transactional
	public ResponseStringVO startSprint(UUID sprintId) {
		TaskboardSprints taskboardSprints = taskboardSprintsRepository.getTaskboardSprintsById(sprintId,
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskboardSprints != null) {
			if (taskboardSprintsRepository.checkStartTaskboardSprintsById(sprintId, YorosisContext.get().getTenantId(),
					YorosisConstants.YES) == 0) {
				if (checkStartDate(taskboardSprints.getSprintStartDate())
						&& StringUtils.equals(taskboardSprints.getSprintStatus(), "p")) {
//				saveTaskEstimations(taskboardSprints, sprintId);
					taskboardSprints.setSprintStatus("r");
					taskboardSprintsRepository.save(taskboardSprints);
					return ResponseStringVO.builder().response("Sprint Started Successfully").build();
				} else {
					return ResponseStringVO.builder()
							.response(!StringUtils.equals(taskboardSprints.getSprintStatus(), "p")
									? "Sprint Already Started"
									: "Sprint Not Started")
							.build();
				}
			} else {
				return ResponseStringVO.builder().response("Another sprint is running").build();
			}
		}
		return ResponseStringVO.builder().response("Sprint Not Started").build();
	}

	@Transactional
	public ResponseStringVO checkStartSprint(UUID sprintId) {
		TaskboardSprints taskboardSprints = taskboardSprintsRepository.getTaskboardSprintsById(sprintId,
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskboardSprints != null) {
			return ResponseStringVO.builder().response(StringUtils.equals(taskboardSprints.getSprintStatus(), "p") ? "p"
					: StringUtils.equals(taskboardSprints.getSprintStatus(), "r") ? "r" : "c").build();
		}
		return ResponseStringVO.builder().response("invalid").build();
	}

	private void saveTaskEstimations(TaskboardSprints taskboardSprints, UUID sprintId) {
		List<TaskboardSprintTask> sprintTaskList = taskboardSprintTasksRepository.getTaskboardSprintTasksListBySprintId(
				sprintId, YorosisContext.get().getTenantId(), YorosisConstants.YES);
		List<UUID> taskIdList = new ArrayList<>();
		sprintTaskList.stream().forEach(ts -> {
			taskIdList.add(ts.getTaskboardTask().getId());
		});
		int totalSprintEstimatePoints = taskboardSprints.getSprintTotalOriginalPoints() == null ? 0
				: taskboardSprints.getSprintTotalOriginalPoints();
		Double totalSprintEstimateHours = taskboardSprints.getSprintTotalEstimatedHours() == null ? 0.0
				: taskboardSprints.getSprintTotalEstimatedHours();
		if (!taskIdList.isEmpty()) {
			List<TaskboardTask> taskboardTaskList = taskboardTaskRepository.getTasksById(taskIdList,
					YorosisContext.get().getTenantId(), YorosisConstants.YES);
			if (taskboardTaskList != null && !taskboardTaskList.isEmpty()) {
				for (TaskboardSprintTask st : sprintTaskList) {
					List<TaskboardTask> taskboardTaskLists = taskboardTaskList.stream().filter(
							ts -> StringUtils.equals(ts.getId().toString(), st.getTaskboardTask().getId().toString()))
							.collect(Collectors.toList());
					if (!taskboardTaskLists.isEmpty()) {
						TaskboardTask t = taskboardTaskLists.get(0);
						st.setSprintEstimatedPoints(t.getOriginalPoints());
						st.setSprintEstimatedHours(t.getEstimateHours());
						totalSprintEstimatePoints = totalSprintEstimatePoints
								+ (t.getOriginalPoints() == null ? 0 : t.getOriginalPoints());
						totalSprintEstimateHours = totalSprintEstimateHours
								+ (t.getEstimateHours() == null ? 0 : t.getEstimateHours());
					}
				}
				taskboardSprints.setSprintTotalEstimatedHours(totalSprintEstimateHours);
				taskboardSprints.setSprintTotalOriginalPoints(totalSprintEstimatePoints);
				taskboardSprintTasksRepository.saveAll(sprintTaskList);
			}
		}
	}

	private TaskboardSprintTask constructTaskboardSprintTaskVoToDto(SprintTasksVo sprintTasksVo,
			TaskboardSprints taskboardSprints) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		return TaskboardSprintTask.builder().activeFlag(YorosisConstants.YES)
				.tenantId(YorosisContext.get().getTenantId()).createdBy(YorosisContext.get().getUserName())
				.modifiedBy(YorosisContext.get().getUserName()).createdOn(timestamp).modifiedOn(timestamp)
				.taskboardSprint(taskboardSprints).build();
	}

	@Transactional
	public ResponseStringVO saveAndUpdateSprintTasks(SprintTasksVo sprintTasksVo) {
		TaskboardSprints taskboardSprints = taskboardSprintsRepository.getTaskboardSprintsById(
				sprintTasksVo.getSprintId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskboardSprints != null) {
			List<TaskboardSprintTask> taskboardSprintTaskList = new ArrayList<>();
			int totalSprintEstimatePoints = taskboardSprints.getSprintTotalOriginalPoints() == null ? 0
					: taskboardSprints.getSprintTotalOriginalPoints();
			Double totalSprintEstimateHours = taskboardSprints.getSprintTotalEstimatedHours() == null ? 0.0
					: taskboardSprints.getSprintTotalEstimatedHours();
			List<TaskboardTask> taskboardTaskList = taskboardTaskRepository.getTasksById(
					sprintTasksVo.getTaskboardTaskId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
			if (taskboardTaskList != null && !taskboardTaskList.isEmpty()) {
				List<String> taskIdList = new ArrayList<>();
				for (TaskboardTask t : taskboardTaskList) {
					List<UUID> sprintTaskIdList = taskboardSprintTasksRepository.getTaskboardSprintTasksBySprintId(
							sprintTasksVo.getSprintId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
					if (sprintTaskIdList == null || !sprintTaskIdList.contains(t.getId())) {
						TaskboardSprintTask taskboardSprintTask = constructTaskboardSprintTaskVoToDto(sprintTasksVo,
								taskboardSprints);
						taskboardSprintTask.setTaskboardTask(t);
//					if (StringUtils.equals(taskboardSprints.getSprintStatus(), "r")) {
						taskboardSprintTask.setSprintEstimatedPoints(t.getOriginalPoints());
						taskboardSprintTask.setSprintEstimatedHours(t.getEstimateHours());
						totalSprintEstimatePoints = totalSprintEstimatePoints
								+ (t.getOriginalPoints() == null ? 0 : t.getOriginalPoints());
						totalSprintEstimateHours = totalSprintEstimateHours
								+ (t.getEstimateHours() == null ? 0 : t.getEstimateHours());
//					}
						taskboardSprintTaskList.add(taskboardSprintTask);
					} else {
						taskIdList.add(t.getTaskId());
					}
				}
				taskboardSprints.setSprintTotalEstimatedHours(totalSprintEstimateHours);
				taskboardSprints.setSprintTotalOriginalPoints(totalSprintEstimatePoints);
				taskboardSprintsRepository.save(taskboardSprints);
				taskboardSprintTasksRepository.saveAll(taskboardSprintTaskList);
				return ResponseStringVO.builder().response(taskIdList.isEmpty() ? "Sprint Task Saved Successfully"
						: taskIdList.toString() + " already saved to this sprint").build();
			}
			return ResponseStringVO.builder().response("No task to save").build();
		}
		return ResponseStringVO.builder().response("Invalid sprint").build();
	}

	@Transactional
	public ResponseStringVO deleteSprintTask(SprintTasksVo sprintTasksVo) {
		TaskboardSprintTask taskboardSprintTask = taskboardSprintTasksRepository.getTaskboardSprintTasksById(
				sprintTasksVo.getSprintTaskId(), sprintTasksVo.getSprintId(), YorosisContext.get().getTenantId(),
				YorosisConstants.YES);
		if (taskboardSprintTask != null) {
			taskboardSprintTask.setActiveFlag(YorosisConstants.NO);
			taskboardSprintTasksRepository.save(taskboardSprintTask);
		}
		return ResponseStringVO.builder().response("Sprint Deleted Successfully").build();
	}

	@Transactional
	public ResponseStringVO saveWorklog(WorkLogVo workLogVo) {
		User user = userRepository.findByUserNameIgnoreCaseAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
				YorosisContext.get().getUserName(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
		TaskboardSprintTask taskboardSprintTask = taskboardSprintTasksRepository.getTaskboardSprintTasksById(
				workLogVo.getSprintTaskId(), YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (workLogVo.getWorkLogId() == null) {
			if (taskboardSprintTask != null) {
				TaskboardSprintWorkLog taskboardSprintWorkLog = constructWorkLogVoToDto(workLogVo);
				taskboardSprintWorkLog.setUser(user);
				taskboardSprintWorkLog.setTaskboardSprintTask(taskboardSprintTask);
				saveTaskWorkLog(taskboardSprintTask, workLogVo, null);
				taskboardSprintWorkLogRepository.save(taskboardSprintWorkLog);
				return ResponseStringVO.builder().response("Work Log Saved Successfully").build();
			}
		} else {
			TaskboardSprintWorkLog taskboardSprintWorkLog = taskboardSprintWorkLogRepository
					.getTaskboardSprintWorkLogById(workLogVo.getWorkLogId(), YorosisContext.get().getTenantId(),
							YorosisConstants.YES);
			if (taskboardSprintWorkLog != null && taskboardSprintTask != null
					&& StringUtils.equals(user.getUserName(), YorosisContext.get().getUserName())) {
				saveTaskWorkLog(taskboardSprintTask, workLogVo, taskboardSprintWorkLog);
				Timestamp timestamp = new Timestamp(System.currentTimeMillis());
				taskboardSprintWorkLog.setTimespent(workLogVo.getTimespent());
				taskboardSprintWorkLog.setDescription(workLogVo.getDescription());
				taskboardSprintWorkLog.setWorkDate(workLogVo.getWorkDate());
				taskboardSprintWorkLog.setModifiedBy(YorosisContext.get().getUserName());
				taskboardSprintWorkLog.setModifiedOn(timestamp);
			}
		}
		return null;
	}

	private void saveTaskWorkLog(TaskboardSprintTask taskboardSprintTask, WorkLogVo workLogVo,
			TaskboardSprintWorkLog taskboardSprintWorkLog) {
		Float totalHoursSpent = taskboardSprintTask.getSprintTotalHoursSpent() == null ? 0
				: taskboardSprintTask.getSprintTotalHoursSpent();
		totalHoursSpent = totalHoursSpent + (workLogVo.getTimespent() == null ? 0 : workLogVo.getTimespent());
		if (taskboardSprintWorkLog != null) {
			totalHoursSpent = totalHoursSpent - taskboardSprintWorkLog.getTimespent();
		}
		taskboardSprintTask.setSprintTotalHoursSpent(totalHoursSpent);
		taskboardSprintTasksRepository.save(taskboardSprintTask);
	}

	public SprintsVO getSprintVo(UUID sprintId) {
		TaskboardSprints taskboardSprints = taskboardSprintsRepository.getTaskboardSprintsById(sprintId,
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskboardSprints != null) {
			return constructSprintsDtoToVo(taskboardSprints);
		}
		return null;
	}

	public void getRemainingHours(TaskboardTaskVO taskVO, UUID sprintId) {
		TaskboardSprintTask taskboardSprintTask = taskboardSprintTasksRepository.getTaskboardSprintTasksById(
				taskVO.getId(), sprintId, YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskboardSprintTask != null) {
			taskVO.setEstimateHours(taskboardSprintTask.getSprintEstimatedHours());
			taskVO.setOriginalPoints(taskboardSprintTask.getSprintEstimatedPoints());
			taskVO.setSprintTaskId(taskboardSprintTask.getSprintTaskId());
			taskVO.setSprintsVo(getSprintVo(sprintId));
			if (taskboardSprintTask.getSprintEstimatedHours() != null) {
				if (taskboardSprintTask.getSprintTotalHoursSpent() == null) {
					taskVO.setRemainingHours(taskboardSprintTask.getSprintEstimatedHours());
				} else {
					Float remainingHours = taskboardSprintTask.getSprintEstimatedHours()
							- taskboardSprintTask.getSprintTotalHoursSpent();
					taskVO.setRemainingHours(remainingHours > 0 ? remainingHours : 0);
				}
			} else {
				taskVO.setRemainingHours(null);
			}
		}
	}

	@Transactional
	public TaskboardTaskVO getRemainingHours(UUID sprintTaskId) {
		TaskboardSprintTask taskboardSprintTask = taskboardSprintTasksRepository
				.getTaskboardSprintTasksById(sprintTaskId, YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskboardSprintTask != null) {
			if (taskboardSprintTask.getSprintTotalHoursSpent() == null
					|| taskboardSprintTask.getSprintEstimatedHours() == null) {
				return TaskboardTaskVO.builder().remainingHours(taskboardSprintTask.getSprintEstimatedHours()).build();
			} else {
				Float remainingHours = taskboardSprintTask.getSprintEstimatedHours()
						- taskboardSprintTask.getSprintTotalHoursSpent();
				return TaskboardTaskVO.builder().remainingHours(remainingHours > 0 ? remainingHours : 0).build();
			}
		}
		return null;
	}

	@Transactional
	public WorkLogListVo getWorklogList(PaginationVO vo) {
		List<WorkLogVo> workLogVoList = new ArrayList<>();
		Pageable pageable = getPageable(vo, true);
		Integer count = 0;
		List<TaskboardSprintWorkLog> taskboardSprintWorkLogList = taskboardSprintWorkLogRepository
				.getTaskboardSprintWorkLogByTaskId(vo.getTaskboardId(), YorosisContext.get().getTenantId(),
						YorosisConstants.YES, pageable);
		count = taskboardSprintWorkLogRepository.getTaskboardSprintWorkLogCountByTaskId(vo.getTaskboardId(),
				YorosisContext.get().getTenantId(), YorosisConstants.YES);
		if (taskboardSprintWorkLogList != null && !taskboardSprintWorkLogList.isEmpty()) {
			workLogVoList = taskboardSprintWorkLogList.stream().map(this::constructWorkLogDtoToVo)
					.collect(Collectors.toList());
		}
		return WorkLogListVo.builder().taskId(vo.getTaskboardId()).totalRecords(count).workLogVoList(workLogVoList)
				.build();
	}

}
