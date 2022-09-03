package com.yorosis.yoroflow.creation.service;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.sql.Timestamp;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import javax.imageio.ImageIO;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.yorosis.yoroapps.entities.Page;
import com.yorosis.yoroapps.entities.PagePermissions;
import com.yorosis.yoroapps.entities.TableObjects;
import com.yorosis.yoroapps.entities.TableObjectsColumns;
import com.yorosis.yoroapps.vo.ApplicationVO;
import com.yorosis.yoroapps.vo.GroupVO;
import com.yorosis.yoroapps.vo.PageFieldVO;
import com.yorosis.yoroapps.vo.PageVO;
import com.yorosis.yoroapps.vo.ResolvedSecurityForPageVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.ShoppingCartImageVo;
import com.yorosis.yoroapps.vo.UsersVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.exception.YoroappsException;
import com.yorosis.yoroflow.creation.repository.ApplicationRepository;
import com.yorosis.yoroflow.creation.repository.PageRepository;
import com.yorosis.yoroflow.creation.repository.TableObjectsColumnsRepository;
import com.yorosis.yoroflow.creation.repository.TableObjectsRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;

@Service
@Slf4j
public class PageService {
	@Autowired
	private PageRepository pageRepository;

	@Autowired
	private ApplicationRepository applicationRepository;

	@Autowired
	private DynamicPageService dynamicPageService;

	@Autowired
	private ApplicationService applicationService;

	@Autowired
	private TableObjectsRepository tableObjectsRepository;

	@Autowired
	private TableObjectsColumnsRepository tableObjectsColumnsRepository;

	@Autowired
	private UserService userService;

	@Autowired
	private FileManagerService fileManagerService;

	@PersistenceContext
	private EntityManager em;

	@Transactional
	public ResponseStringVO savePage(PageVO pageVO, UUID workspaceId, Boolean fromImport)
			throws YoroappsException, IOException {
		if (pageVO.getYorosisPageId() == null || BooleanUtils.isTrue(fromImport)) {
			List<Page> checkPageExist = pageRepository.findByPageIdAndVersionAndTenantIdAndActiveFlag(
					pageVO.getPageId(), pageVO.getVersion(), YorosisContext.get().getTenantId(), YoroappsConstants.YES);

			if (checkPageExist != null && !checkPageExist.isEmpty()) {
				return ResponseStringVO.builder()
						.response(String.format("Page [%s] already exist", pageVO.getPageName()))
						.pageName(pageVO.getPageName()).responseId(pageVO.getPageId()).version(pageVO.getVersion())
						.build();
			}
		}
		String name = null;
		Long version = null;
		ObjectMapper mapper = new ObjectMapper();
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		Set<TableObjectsColumns> tableObjectsList = new HashSet<>();
		String appPrefix = "";
		String tableIdentifier = "";
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());

		log.debug("Create page.... ");
		List<Page> pageList = pageRepository.getPageId(pageVO.getPageId(), YoroappsConstants.YES,
				YorosisContext.get().getTenantId());

		if (pageVO.getVersion() == 0 || BooleanUtils.isTrue(fromImport)) {
			pageVO.setVersion(1L);
			name = pageVO.getPageName();
		} else if (Boolean.TRUE.equals(pageVO.getIsWorkflowForm())) {
			if (!pageList.isEmpty()) {
				version = pageList.get(0).getVersion() + 1;
			} else {
				version = 1L;
			}

			name = pageVO.getPageName() + " " + "(" + "Version" + " " + version + ")";
			pageVO.setVersion(version);
		}

		if (BooleanUtils.isTrue(pageVO.getManageFlag()) && pageVO.getApplicationId() != null
				&& StringUtils.isNotBlank(pageVO.getPageId())) {
			appPrefix = applicationService.getApplicationPrefix(pageVO.getApplicationId()) + "_";
			tableIdentifier = appPrefix + pageVO.getPageId();
			pageVO.setPageIdWithPrefix(tableIdentifier);
		}

		JsonNode jsonNode = mapper.readTree(mapper.writeValueAsString(pageVO));
		((ObjectNode) jsonNode).remove("security");
		Page page = Page.builder().pageId(pageVO.getPageId()).description(pageVO.getDescription())
				.pageName(pageVO.getPageName()).pageData(jsonNode).createdBy(YorosisContext.get().getUserName())
				.createdOn(timestamp).modifiedBy(YorosisContext.get().getUserName())
				.applicationId(pageVO.getApplicationId()).tenantId(YorosisContext.get().getTenantId())
				.status(pageVO.getStatus()).qualifier(pageVO.getQualifier()).modifiedOn(timestamp)
				.activeFlag(YoroappsConstants.YES).version(pageVO.getVersion()).layoutType(pageVO.getLayoutType())
				.isWorkflowForm(pageVO.getIsWorkflowForm().toString()).managedFlag(YoroappsConstants.NO).build();
		page.setWorkspaceId(workspaceId);
		pageRepository.save(page);

		if (BooleanUtils.isFalse(pageVO.getIsWorkflowForm())
				&& !StringUtils.equals(pageVO.getLayoutType(), "applicationPageLayout")) {
			if (StringUtils.isNotBlank(pageVO.getPageName())) {
				TableObjects tableName = tableObjectsRepository
						.findByTableNameAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(pageVO.getPageName(),
								YorosisContext.get().getTenantId(), YoroappsConstants.YES);
				if (tableName == null) {
					TableObjects object = TableObjects.builder().tableName(pageVO.getPageName())
							.tenantId(YorosisContext.get().getTenantId()).createdBy(YorosisContext.get().getUserName())
							.createdOn(timestamp).modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp)
							.activeFlag(YoroappsConstants.YES).tableIdentifier(pageVO.getPageId())
							.managedFlag(YoroappsConstants.NO).build();
					object.setTableIdentifier(tableIdentifier);

					List<PageFieldVO> pageFieldList = dynamicPageService.getFieldList(pageVO.getPageId(),
							page.getVersion());

					for (PageFieldVO fieldList : pageFieldList) {
						if (!StringUtils.equals(fieldList.getControlType(), "primaryKey")) {
							TableObjectsColumns tableObjectsColumns = TableObjectsColumns.builder()
									.columnName(fieldList.getFieldName()).columnIdentifier(fieldList.getFieldId())
									.dataType(fieldList.getDatatype()).fieldSize(fieldList.getFieldSize())
									.isUnique(fieldList.getUnique()).isRequired(fieldList.getRequired())
									.tenantId(YorosisContext.get().getTenantId())
									.createdBy(YorosisContext.get().getUserName()).createdOn(timestamp)
									.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp)
									.activeFlag(YoroappsConstants.YES).build();
							tableObjectsColumns.setTableObjects(object);
							tableObjectsList.add(tableObjectsColumns);
						}
					}
					object.setTableObjectsColumns(tableObjectsList);
					tableObjectsRepository.save(object);

					List<String> newTableList = dynamicPageService.generateCreateTable(pageVO);
					createOrUpdateTables(newTableList);
					dynamicPageService.createTableControl(appPrefix, pageVO);
				}

			}

		}

		return ResponseStringVO.builder().response(String.format("Page [%s] created successfully", name))
				.pageName(pageVO.getPageName()).responseId(pageVO.getPageId()).version(pageVO.getVersion())
				.pageId(page.getId()).build();
	}

	private void createOrUpdateTables(List<String> ddlList) throws YoroappsException {
		for (String ddlStatement : ddlList) {
			Query nativeQuery = em.createNativeQuery(ddlStatement);
			log.info("Now executing: {}", ddlStatement);
			nativeQuery.executeUpdate();
		}

	}

	@Transactional
	public ResponseStringVO checkPageName(String pageName) {
		String message = null;
		int findByPageName = pageRepository.findByPageNameAndTenantId(pageName.toUpperCase().trim(),
				YoroappsConstants.YES, YorosisContext.get().getTenantId());

		if (findByPageName > 0) {
			message = String.format("Page [%s] already exist", pageName);
		} else {
			message = String.format("Page [%s] does not exist", pageName);
		}
		return ResponseStringVO.builder().response(message).build();
	}

	@Transactional
	public List<PageVO> getPageNames() throws IOException {
		List<PageVO> pageNameList = new ArrayList<>();

		List<TableObjects> object = tableObjectsRepository.findByActiveFlagIgnoreCaseAndTenantIdIgnoreCase(
				YoroappsConstants.YES, YorosisContext.get().getTenantId());
		for (TableObjects tableObjects : object) {
			PageVO vo = PageVO.builder().pageName(tableObjects.getTableName()).pageId(tableObjects.getTableIdentifier())
					.pageIdWithPrefix(tableObjects.getTableIdentifier()).version(1L).build();
			pageNameList.add(vo);
		}

		return pageNameList;

	}

	@Transactional
	public List<PageVO> getPageNameForLoggedInUser(UUID workspaceId) throws IOException {
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<GroupVO> listGroupVO = userVO.getGroupVOList();
		List<PageVO> pageNameList = new ArrayList<>();
		if (!CollectionUtils.isEmpty(listGroupVO)) {
			List<UUID> listUUID = listGroupVO.stream().map(GroupVO::getGroupId).collect(Collectors.toList());
			Set<Page> page = new HashSet<Page>();
			if (!CollectionUtils.isEmpty(listUUID)) {
				page = pageRepository.getpageNamesBasedOnUser(YorosisContext.get().getTenantId(), listUUID,
						YoroappsConstants.YES, workspaceId);
			}
			for (Page code : page) {
				if (code.getPageData().has("isWorkflowForm") && !code.getPageData().get("isWorkflowForm").asBoolean()
						&& !StringUtils.equals(code.getLayoutType(), "applicationPageLayout")) {
					PageVO vo = PageVO.builder().pageName(code.getPageName()).pageId(code.getPageId())
							.version(code.getVersion()).build();
					vo.setSecurity(setPagePermission(code.getPagePermissions(), vo.getSecurity(), listUUID));
					pageNameList.add(vo);
				}
			}
		}

		return pageNameList;
	}

	private ResolvedSecurityForPageVO setPagePermission(Set<PagePermissions> listProcessDefPermission,
			ResolvedSecurityForPageVO vo, List<UUID> uuidList) {
		ResolvedSecurityForPageVO builder = ResolvedSecurityForPageVO.builder().read(false).create(false).update(false)
				.delete(false).admin(false).build();
		for (UUID uuid : uuidList) {
			for (PagePermissions permission : listProcessDefPermission) {
				if (StringUtils.equalsIgnoreCase(permission.getCreateAllowed(), YoroappsConstants.YES)
						&& StringUtils.equals(uuid.toString(), permission.getYoroGroups().getId().toString())) {
					builder.setCreate(true);
				}
				if (StringUtils.equalsIgnoreCase(permission.getReadAllowed(), YoroappsConstants.YES)
						&& StringUtils.equals(uuid.toString(), permission.getYoroGroups().getId().toString())) {
					builder.setRead(true);
				}
				if (StringUtils.equalsIgnoreCase(permission.getUpdateAllowed(), YoroappsConstants.YES)
						&& StringUtils.equals(uuid.toString(), permission.getYoroGroups().getId().toString())) {
					builder.setUpdate(true);
				}
				if (StringUtils.equalsIgnoreCase(permission.getDeleteAllowed(), YoroappsConstants.YES)
						&& StringUtils.equals(uuid.toString(), permission.getYoroGroups().getId().toString())) {
					builder.setDelete(true);
				}
			}
		}
		return builder;
	}

	@Transactional
	public ApplicationVO getAppPrefix(String pageId, Long version) throws IOException {
		String appPrefix = "";
		PageVO pageVO = getPageDetailsByPageIdentifier(pageId, version);

		if (BooleanUtils.isTrue(pageVO.getManageFlag())) {
			appPrefix = applicationService.getApplicationPrefix(pageVO.getApplicationId()) + "_";
		}
		return ApplicationVO.builder().appPrefix(appPrefix + pageId).build();
	}

	@Transactional
	public List<PageVO> getWorkflowFormPageNames(String layoutType, UUID workspaceId) {
		List<PageVO> pageNameList = new ArrayList<>();
		if (StringUtils.equals(layoutType, "true")) {
			layoutType = "publicForm";
		} else {
			layoutType = "workflowForms";
		}
		for (Page pageName : pageRepository.getPageName(YoroappsConstants.YES, YorosisContext.get().getTenantId(),
				layoutType, workspaceId)) {
			PageVO vo = PageVO.builder().yorosisPageId(pageName.getId()).pageName(pageName.getPageName())
					.pageId(pageName.getPageId()).version(pageName.getVersion()).build();
			pageNameList.add(vo);
		}
		return pageNameList;
	}

	@Transactional
	public List<PageVO> getPageVersion(String pageId, String layoutType) {
		String pageName = pageId.toLowerCase();
		List<PageVO> pageVersionList = new ArrayList<>();
		if (StringUtils.equals(layoutType, "true")) {
			layoutType = "publicForm";
		} else {
			layoutType = "workflowForms";
		}
		for (Page pageVersion : pageRepository.getPageId(pageName, YoroappsConstants.YES,
				YorosisContext.get().getTenantId(), layoutType)) {
			PageVO vo = PageVO.builder().yorosisPageId(pageVersion.getId()).pageName(pageVersion.getPageName())
					.pageId(pageVersion.getPageId()).version(pageVersion.getVersion()).build();
			pageVersionList.add(vo);
		}
		return pageVersionList;
	}

	@Transactional
	public List<PageVO> getPageNamesByApplicationId(UUID id) {
		List<Page> page = pageRepository.findByApplicationIdAndTenantIdAndActiveFlag(id,
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);

		String appPrefix = applicationService.getApplicationPrefix(id) + "_";
		List<PageVO> pageNameList = new ArrayList<>();
		for (Page pageNames : page) {

			PageVO vo = PageVO.builder().yorosisPageId(pageNames.getId()).pageName(pageNames.getPageName())
					.pageId(pageNames.getPageId()).pageIdWithPrefix(appPrefix + pageNames.getPageId()).build();
			pageNameList.add(vo);

		}

		return pageNameList;
	}

	@Transactional
	public List<PageVO> getPageName(String pageName, String isPublicForm) throws IOException {
		CriteriaBuilder criteriaTableBuilder = em.getCriteriaBuilder();

		List<PageVO> pageNameList = new ArrayList<>();

		Predicate predicateForPublicForm = null;
		Predicate predicateForTableList = null;
		Predicate predicateForNonPublicTableList = null;

		CriteriaQuery<TableObjects> criteriaTableQuery = criteriaTableBuilder.createQuery(TableObjects.class);
		Root<TableObjects> tableObjectRoot = criteriaTableQuery.from(TableObjects.class);

		Predicate predicateForTableName = criteriaTableBuilder.or(criteriaTableBuilder.like(
				criteriaTableBuilder.lower(tableObjectRoot.get("tableName")), "%" + pageName.toLowerCase() + "%"));

		Predicate predicateForActiveFlag = criteriaTableBuilder.equal(tableObjectRoot.get("activeFlag"),
				YoroappsConstants.YES);

		Predicate predicateForManageFlag = criteriaTableBuilder.equal(tableObjectRoot.get("managedFlag"),
				YoroappsConstants.NO);

		if (StringUtils.equals(isPublicForm, YoroappsConstants.YES)) {
			predicateForPublicForm = criteriaTableBuilder.equal(tableObjectRoot.get("publicTable"),
					YoroappsConstants.YES);
			predicateForTableList = criteriaTableBuilder.and(predicateForTableName, predicateForActiveFlag,
					predicateForManageFlag, predicateForPublicForm);
			criteriaTableQuery.select(tableObjectRoot).where(predicateForTableList);
		} else {
			predicateForNonPublicTableList = criteriaTableBuilder.and(predicateForTableName, predicateForActiveFlag,
					predicateForManageFlag);
			criteriaTableQuery.select(tableObjectRoot).where(predicateForNonPublicTableList);
		}

		TypedQuery<TableObjects> createTableQuery = em.createQuery(criteriaTableQuery);
		List<TableObjects> tablelist = createTableQuery.getResultList();

		for (TableObjects tableObjects : tablelist) {
			PageVO vo = PageVO.builder().pageName(tableObjects.getTableName()).pageId(tableObjects.getTableIdentifier())
					.pageIdWithPrefix(tableObjects.getTableIdentifier()).version(1L).build();
			pageNameList.add(vo);

		}
		return pageNameList;
	}

	@Transactional
	public List<PageFieldVO> getFieldList(String pageIdentifier) throws IOException, YoroappsException {
		if (StringUtils.isNotBlank(pageIdentifier)) {
			TableObjects object = tableObjectsRepository
					.findByTableIdentifierAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(pageIdentifier,
							YorosisContext.get().getTenantId(), YoroappsConstants.YES);

			List<TableObjectsColumns> fieldNames = tableObjectsColumnsRepository
					.findByTableObjectsIdAndActiveFlagIgnoreCaseAndTenantId(object.getTableObjectsId(),
							YoroappsConstants.YES, YorosisContext.get().getTenantId());

			List<PageFieldVO> fieldNamesList = new ArrayList<>();

			fieldNamesList.add(PageFieldVO.builder().controlType("primaryKey").datatype("uuid").fieldId("uuid")
					.fieldName("Primary Key").unique("true").required("true").fieldSize(10L).build());
			for (TableObjectsColumns tableObjectsColumns : fieldNames) {
				PageFieldVO vo = PageFieldVO.builder().datatype(tableObjectsColumns.getDataType())
						.fieldId(tableObjectsColumns.getColumnIdentifier())
						.fieldName(tableObjectsColumns.getColumnName()).fieldSize(tableObjectsColumns.getFieldSize())
						.unique(tableObjectsColumns.getIsUnique()).required(tableObjectsColumns.getIsRequired())
						.build();
				fieldNamesList.add(vo);
			}
			return fieldNamesList;
		} else {
			return Collections.emptyList();
		}

	}

	@Transactional
	public ResponseStringVO updatePage(PageVO newPageVo, UUID id) throws Exception {
		ResponseStringVO response = null;
		ObjectMapper mapper = new ObjectMapper();
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

		PageVO oldPageVo = getPageDetailsByPageIdentifier(newPageVo.getPageId(), newPageVo.getVersion());
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		String appPrefix = "";
		String tableIdentifier = "";
		log.debug("Update page.... ");

		Page page = pageRepository.getOne(id);
		page.setPageData(mapper.readTree(mapper.writeValueAsString(newPageVo)));
		page.setDescription(newPageVo.getDescription());
		page.setModifiedBy(YorosisContext.get().getUserName());
		page.setModifiedOn(timestamp);
		page.setApplicationId(newPageVo.getApplicationId());
		page.setLayoutType(newPageVo.getLayoutType());

		pageRepository.save(page);

		if (BooleanUtils.isTrue(newPageVo.getManageFlag()) && newPageVo.getApplicationId() != null
				&& StringUtils.isNotBlank(newPageVo.getPageId()) && BooleanUtils.isFalse(newPageVo.getIsWorkflowForm())
				&& !StringUtils.equals(newPageVo.getLayoutType(), "applicationPageLayout")) {
			appPrefix = applicationService.getApplicationPrefix(page.getApplicationId()) + "_";
			tableIdentifier = appPrefix + newPageVo.getPageId();

			TableObjects object = tableObjectsRepository
					.findByTableIdentifierAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(tableIdentifier,
							YorosisContext.get().getTenantId(), YoroappsConstants.YES);

			if (object != null) {
				object.setTableName(newPageVo.getPageName());
				object.setTableIdentifier(tableIdentifier);

				Set<TableObjectsColumns> tableObjectsList = new HashSet<>();

				for (PageFieldVO fieldList : dynamicPageService.getFieldList(page.getPageId(), page.getVersion())) {
					if (!StringUtils.equals(fieldList.getControlType(), "primaryKey")) {
						TableObjectsColumns tableObjectsColumns = tableObjectsColumnsRepository.getTableObjects(
								object.getTableObjectsId(), fieldList.getFieldName(),
								YorosisContext.get().getTenantId(), YoroappsConstants.YES);
						if (tableObjectsColumns != null) {
							tableObjectsColumns.setColumnName(fieldList.getFieldName());
							tableObjectsColumns.setColumnIdentifier(fieldList.getFieldId());
							tableObjectsColumns.setDataType(fieldList.getDatatype());
							tableObjectsColumns.setFieldSize(fieldList.getFieldSize());
							tableObjectsColumns.setIsRequired(fieldList.getRequired());
							tableObjectsColumns.setIsUnique(fieldList.getUnique());
							tableObjectsColumns.setModifiedBy(YorosisContext.get().getUserName());
							tableObjectsColumns.setModifiedOn(timestamp);
						} else {
							tableObjectsColumns = TableObjectsColumns.builder().columnName(fieldList.getFieldName())
									.columnIdentifier(fieldList.getFieldId()).dataType(fieldList.getDatatype())
									.fieldSize(fieldList.getFieldSize()).isUnique(fieldList.getUnique())
									.isRequired(fieldList.getRequired()).tenantId(YorosisContext.get().getTenantId())
									.createdBy(YorosisContext.get().getUserName()).createdOn(timestamp)
									.modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp)
									.activeFlag(YoroappsConstants.YES).build();
							tableObjectsColumns.setTableObjects(object);
							tableObjectsList.add(tableObjectsColumns);
						}
						tableObjectsColumnsRepository.save(tableObjectsColumns);
					}
				}
				tableObjectsRepository.save(object);
			}
		}

		if (BooleanUtils.isFalse(newPageVo.getIsWorkflowForm())
				&& !StringUtils.equals(newPageVo.getLayoutType(), "applicationPageLayout")) {
			List<String> ddlList = dynamicPageService.generateUpdateTable(oldPageVo, newPageVo);
			createOrUpdateTables(ddlList);
		}

		if (Boolean.TRUE.equals(newPageVo.getIsWorkflowForm())) {
			response = ResponseStringVO.builder()
					.response(String.format("Page [%s] updated successfully",
							page.getPageName() + " " + "(" + "Version" + " " + newPageVo.getVersion() + ")"))
					.pageName(newPageVo.getPageName()).responseId(newPageVo.getPageId()).version(newPageVo.getVersion())
					.build();
		} else {
			response = ResponseStringVO.builder()
					.response(String.format("Page [%s] updated successfully", page.getPageName()))
					.pageName(newPageVo.getPageName()).responseId(newPageVo.getPageId()).version(newPageVo.getVersion())
					.build();
		}
		return response;
	}

	@Transactional
	public PageVO getPageDetailsByPageIdentifier(String id, Long version) throws IOException {
		List<Page> pageList = pageRepository.findByPageIdAndVersionAndTenantIdAndActiveFlag(id, version,
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		if (pageList == null || pageList.isEmpty()) {
			return null;
		} else {
			return getPageVO(pageList.get(0));
		}
	}

	@Transactional
	public PageVO getPageDetails(UUID id) throws IOException {
		return getPageVO(pageRepository.findByIdAndTenantIdAndActiveFlag(id, YorosisContext.get().getTenantId(),
				YoroappsConstants.YES));
	}

	private PageVO getPageVO(Page page) throws IOException {
		ObjectMapper mapper = new ObjectMapper();
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

		PageVO pageVO = mapper.readValue(mapper.writeValueAsString(page.getPageData()), PageVO.class);
		pageVO.setApplicationId(page.getApplicationId());
		pageVO.setApplicationName(applicationRepository.getOne(pageVO.getApplicationId()).getAppName());
		pageVO.setYorosisPageId(page.getId());
		pageVO.setLayoutType(page.getLayoutType());
		pageVO.setStatus(page.getStatus());
		pageVO.setPageIdWithPrefix(
				applicationService.getApplicationPrefix(pageVO.getApplicationId()) + "_" + pageVO.getPageId());

//		ResolvedSecurityForPageVO resolvedPageSecurity = pageSecurityService.getResolvedPageSecurity(pageVO.getPageId());
//		pageVO.setSecurity(resolvedPageSecurity);

		return pageVO;
	}

	@Transactional
	public ResponseStringVO publishPage(UUID id) {
		Page page = pageRepository.getOne(id);
		page.setStatus("published");
		pageRepository.save(page);
		return ResponseStringVO.builder().response("Page Published successfully").build();
	}

	@Transactional
	public List<PageVO> getPageNameWithPrefix(String pageName) throws IOException {

		String appPrefix = "";

		CriteriaBuilder criteriaBuilder = em.getCriteriaBuilder();
		CriteriaQuery<Page> criteriaQuery = criteriaBuilder.createQuery(Page.class);
		Root<Page> root = criteriaQuery.from(Page.class);

		criteriaQuery.select(root).where(criteriaBuilder.or(
				criteriaBuilder.like(criteriaBuilder.lower(root.get("pageName")), "%" + pageName.toLowerCase() + "%")));

		TypedQuery<Page> createQuery = em.createQuery(criteriaQuery);
		List<Page> list = createQuery.getResultList();

		List<PageVO> pageNameList = new ArrayList<>();

		for (Page code : list) {
			PageVO pageVO = getPageDetailsByPageIdentifier(code.getPageId(), code.getVersion());

			if (BooleanUtils.isTrue(pageVO.getManageFlag())) {
				appPrefix = applicationService.getApplicationPrefix(pageVO.getApplicationId()) + "_";
			}
			PageVO vo = PageVO.builder().pageName(appPrefix + code.getPageName()).pageId(code.getPageId()).build();
			pageNameList.add(vo);
		}

		return pageNameList;
	}

	@Transactional
	public List<PageVO> getPageNamesForImport(UUID workspaceId) {
		List<PageVO> pageNameList = new ArrayList<>();
		for (Page page : pageRepository.getPageNames(YoroappsConstants.YES, YorosisContext.get().getTenantId(),
				workspaceId)) {
			PageVO pageVO = PageVO.builder().pageName(page.getPageName()).pageId(page.getPageId()).build();
			pageNameList.add(pageVO);
		}
		return pageNameList;
	}

	@Transactional
	public ResponseStringVO savePages(List<PageVO> pageVO, UUID workspaceId) throws YoroappsException, IOException {
		List<String> pageIdList = pageRepository.getPageId(YoroappsConstants.YES, YorosisContext.get().getTenantId());
		for (PageVO pageVo : pageVO) {
			if (!pageIdList.contains(pageVo.getPageId())) {
				savePage(pageVo, workspaceId, true);
			}
		}
		return ResponseStringVO.builder().response("Pages Saved Successfully").build();
	}

	public ShoppingCartImageVo saveShoppingCartImage(ShoppingCartImageVo imageVo) throws IOException {
//		String imageKey = new StringBuilder(UUID.randomUUID().toString()).append(LocalTime.now()).toString();
//		fileManagerService.uploadImage(imageKey, base64Image);
		String imageThumbNail = getImageThumbNail(imageVo.getImageUrl());
		return ShoppingCartImageVo.builder().imagekey(imageThumbNail).build();
	}

	private String getImageThumbNail(String str) throws IOException {
		String thumbnailImage = str;
		String ThumbnailSeparator = "data:image/";
		thumbnailImage = str.substring(ThumbnailSeparator.length(), str.indexOf(";"));
		String separator = "-";
		int sepPos = str.indexOf(",");
		str = str.substring(sepPos + separator.length());
		byte[] bytes = Base64.getDecoder().decode(str);
		String imageKey = UUID.randomUUID().toString() + LocalTime.now();
		saveImageInS3(imageKey, bytes);
		bytes = Base64.getDecoder().decode(addThumbnailImage(str, thumbnailImage));
		String imageKeyThumbnail = imageKey + "thumbnail";
		saveImageInS3(imageKeyThumbnail, bytes);
		return imageKeyThumbnail;
	}

	private void saveImageInS3(String imageKey, byte[] bytes) {
		fileManagerService.uploadFile(imageKey, new ByteArrayInputStream(bytes), bytes.length);
	}

	private String addThumbnailImage(String image, String thumbnailImageType) throws IOException {
		byte[] imageByte = Base64.getDecoder().decode(image);
//		InputStream streams = new ByteArrayInputStream(image.getBytes());
		ByteArrayInputStream bis = new ByteArrayInputStream(imageByte);
		BufferedImage originalImage = ImageIO.read(bis);
		bis.close();
		if (originalImage != null) {
			BufferedImage thumbnail = Thumbnails.of(originalImage).scale(0.25).asBufferedImage();
			ByteArrayOutputStream os = new ByteArrayOutputStream();
			ImageIO.write(thumbnail, thumbnailImageType, os);
			return Base64.getEncoder().encodeToString(os.toByteArray());
		} else {
			return image;
		}
	}
}
