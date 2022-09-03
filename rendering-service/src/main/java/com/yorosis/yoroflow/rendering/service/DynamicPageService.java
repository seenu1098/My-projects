package com.yorosis.yoroflow.rendering.service;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigInteger;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import javax.imageio.ImageIO;
import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.transaction.Transactional;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.jpa.TypedParameterValue;
import org.hibernate.type.StandardBasicTypes;
import org.hibernate.type.StringType;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.yorosis.yoroapps.entities.ServiceToken;
import com.yorosis.yoroapps.vo.DBDataVO;
import com.yorosis.yoroapps.vo.FieldConfigVO;
import com.yorosis.yoroapps.vo.FieldVO;
import com.yorosis.yoroapps.vo.FilterVO;
import com.yorosis.yoroapps.vo.LabelTypeVO;
import com.yorosis.yoroapps.vo.OptionsVO;
import com.yorosis.yoroapps.vo.PageDataVO;
import com.yorosis.yoroapps.vo.PageFieldVO;
import com.yorosis.yoroapps.vo.PageVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.RowsVO;
import com.yorosis.yoroapps.vo.SectionVO;
import com.yorosis.yoroapps.vo.SelectOptionVO;
import com.yorosis.yoroapps.vo.ServiceTokenVO;
import com.yorosis.yoroapps.vo.SortByVO;
import com.yorosis.yoroapps.vo.TableVO;
import com.yorosis.yoroapps.vo.TaskDetailsResponse;
import com.yorosis.yoroapps.vo.ValidationVO;
import com.yorosis.yoroapps.vo.YoroResponse;
import com.yorosis.yoroapps.vo.YoroResponse.YoroResponseBuilder;
import com.yorosis.yoroflow.rendering.constants.YoroappsConstants;
import com.yorosis.yoroflow.rendering.exception.YoroappsException;
import com.yorosis.yoroflow.rendering.repository.ServiceTokenRepository;
import com.yorosis.yoroflow.rendering.service.feign.clients.WorkflowClient;
import com.yorosis.yoroflow.rendering.service.vo.DataObject;
import com.yorosis.yoroflow.rendering.service.vo.DataObject.DataObjectBuilder;
import com.yorosis.yoroflow.rendering.service.vo.FileUploadVO;
import com.yorosis.yoroflow.rendering.service.vo.FilesVO;
import com.yorosis.yoroflow.rendering.service.vo.WorkflowVo;
import com.yorosis.yoroflow.request.filter.client.AuthDetailsVO;
import com.yorosis.yoroflow.request.filter.client.AuthnzServiceClient;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;

@Service
@Slf4j
public class DynamicPageService {
	private static final String YOROSIS_PAGE_ID = "yorosisPageId";
	private static final String WHERE = " where ";
	private static final String MULTIPLESELECT = "multipleselect";
	private static final String TEXTAREA = "textarea";
	private static final String CREATE_TABLE_IF_NOT_EXISTS = "create table IF NOT EXISTS ";
	private static final String ADD_COLUMN = " ADD COLUMN IF NOT EXISTS ";
	private static final String ALTER_COLUMN = " ALTER COLUMN ";
	private static final String REQUIRED = "required";
	private static final String MAXLENGTH = "maxlength";
	private static final String DATE = "date";
	private static final String LONG = "long";
	private static final String FLOAT = "float";
	private static final String INTEGER = "integer";
	private static final String STRING = "string";
	private static final String CHIP = "chip";
	private static final String CHECKBOX = "checkbox";
	private static final String ALTER_TABLE = "alter table ";
	private static final String FILE_UPLOAD = "fileupload";
	private static final String SIGNATURE = "signaturecontrol";
	private static final String BOOLEAN = "boolean";
	private static final String DOUBLE = "double";
	private static final String TOKEN_PREFIX = "Bearer ";
	private static final String SAVEANDCALLWORKFLOW = "saveAndCallWorkflow";
	private static final String WORKFLOWKEY = "workflowKey";
	private static final String WORKFLOWVERSION = "workflowVersion";
	private static final String DEFAULT_WORKSPACE = "6a6ad5ca-5a59-4165-84fc-675c5c503fdf";

	@Autowired
	private PageService pageService;

	@Autowired
	private EntityManager entityManager;

	@Autowired
	private ApplicationService applicationService;

	@Autowired
	private WorkflowClient workflowClient;

	@Autowired
	private FileManagerService fileManagerService;

	@Autowired
	private AuthnzServiceClient authnzServiceClient;

	@Autowired
	private ServiceTokenRepository serviceTokenRepository;

	@Autowired
	private ObjectMapper objMapper;

	@Transactional
	public List<OptionsVO> getListValues(String pageIdentifier, String controlName, Long version)
			throws ParseException, IOException {
		PageVO pageVO = pageService.getPageDetailsByPageIdentifier(pageIdentifier, version);

		List<SectionVO> mainSections = pageVO.getSections();
		FieldConfigVO fieldConfigVo = null;
		List<OptionsVO> dynamicSelectBoxValues = null;
		List<FieldConfigVO> fieldConfigVOList = new ArrayList<>();

		if (!mainSections.isEmpty()) {
			Map<String, List<SectionVO>> tableSectionsMap = new LinkedHashMap<>();
			Map<String, String> tablePrimaryKeyMap = new LinkedHashMap<>();

			String appPrefix = "";
			if (BooleanUtils.isTrue(pageVO.getManageFlag())) {
				appPrefix = applicationService.getApplicationPrefix(pageVO.getApplicationId()) + "_";
			}

			SectionVO parentSectionVo = SectionVO.builder().tableName(appPrefix + mainSections.get(0).getTableName())
					.build();
			resolveSections(parentSectionVo, mainSections, tableSectionsMap, tablePrimaryKeyMap, appPrefix);

			if (!tableSectionsMap.isEmpty()) {
				for (Entry<String, List<SectionVO>> entry : tableSectionsMap.entrySet()) {
					Map<String, FieldConfigVO> fieldMap = populateFieldMap(entry.getValue());
					fieldConfigVo = fieldMap.get(controlName);
					if (fieldConfigVo != null) {
						fieldConfigVOList.add(fieldConfigVo);
					}

				}
			}
		}

		for (FieldConfigVO vo : fieldConfigVOList) {
			dynamicSelectBoxValues = getDynamicSelectBoxValues(vo);
		}
		return dynamicSelectBoxValues;
	}

	private List<OptionsVO> getDynamicSelectBoxValues(FieldConfigVO fieldConfigVo) throws ParseException {
		if (fieldConfigVo != null
				&& (StringUtils.equalsIgnoreCase("select", fieldConfigVo.getControlType())
						|| (StringUtils.equalsIgnoreCase("radiobutton", fieldConfigVo.getControlType()))
						|| (StringUtils.equalsIgnoreCase("multipleselect", fieldConfigVo.getControlType()))
						|| (StringUtils.equalsIgnoreCase("imagegrid", fieldConfigVo.getControlType()))
						|| (StringUtils.equalsIgnoreCase("card", fieldConfigVo.getControlType())))
				&& fieldConfigVo.getField() != null && fieldConfigVo.getField().getControl() != null) {

			ObjectMapper mapper = new ObjectMapper();
			mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

			SelectOptionVO selectOptionVo = mapper.convertValue(fieldConfigVo.getField().getControl(),
					SelectOptionVO.class);
			if (StringUtils.equalsIgnoreCase("d", selectOptionVo.getOptionType())) {
				DBDataVO filter = selectOptionVo.getFilter();

				List<Object> argumentsList = new ArrayList<>();
				StringBuilder builder = getDynamicSelectQuery(argumentsList, filter, selectOptionVo);

				return executeAndGetResults(builder, argumentsList);
			}
		}
		return Collections.emptyList();
	}

	public List<OptionsVO> getDynamicSelectBoxValuesByFilterValue(SelectOptionVO selectOptionVo) throws ParseException {
		if (StringUtils.equalsIgnoreCase("d", selectOptionVo.getOptionType())) {
			DBDataVO filter = selectOptionVo.getFilter();

			List<Object> argumentsList = new ArrayList<>();
			StringBuilder builder = getDynamicSelectQuery(argumentsList, filter, selectOptionVo);

			return executeAndGetResults(builder, argumentsList);
		}
		return Collections.emptyList();

	}

	private StringBuilder getDynamicSelectQuery(List<Object> argumentsList, DBDataVO filter,
			SelectOptionVO selectOptionVo) throws ParseException {
		StringBuilder builder = new StringBuilder();
		// .append(", ").append(filter.getDescriptionColumnName())
		if (StringUtils.equals(filter.getKeyColumnName(), filter.getDescriptionColumnName())) {
			builder.append("select ").append("cast(" + filter.getKeyColumnName() + " as varchar) as keyColumn, ")
					.append("cast(" + filter.getKeyColumnName() + " as varchar) as descColumn").append(" from ")
					.append(filter.getTableName());
		} else {
			builder.append("select ").append("cast(" + filter.getKeyColumnName() + " as varchar)").append(", ")
					.append(filter.getDescriptionColumnName()).append(" from ").append(filter.getTableName());
		}

		StringBuilder whereBuilder = new StringBuilder();
		if (StringUtils.isNotBlank(filter.getJoinClause())) {
			whereBuilder.append(filter.getJoinClause());
		}

		List<FilterVO> filters = filter.getFilters() != null ? filter.getFilters() : selectOptionVo.getFilters();
		if (filters != null) {
			for (FilterVO filterVO : filters) {
				if (whereBuilder.length() > 0) {
					whereBuilder.append(" and ");
				}

				whereBuilder.append("cast(" + filterVO.getColumnName() + " as varchar)").append(" = ?");
				argumentsList.add(getValue(filterVO.getValue(), filterVO.getDataType()));

			}
		}

		if (whereBuilder.length() > 0) {
			builder.append(WHERE).append(whereBuilder.toString());
		}

		if (filter.getSortOption() != null && Boolean.TRUE.equals(filter.getSortOption()) && filter.getSortBy() != null
				&& !filter.getSortBy().isEmpty()) {
			StringBuilder orderByBuilder = new StringBuilder();
			orderByBuilder.append(" ORDER BY ");
			int i = 0;
			for (SortByVO sort : filter.getSortBy()) {
				orderByBuilder.append(sort.getSortColumnName()).append(" ");
				if (Boolean.TRUE.equals(sort.getSortType())) {
					orderByBuilder.append("DESC");
				} else {
					orderByBuilder.append("ASC");
				}
				if (i++ != filter.getSortBy().size() - 1) {
					orderByBuilder.append(",");
				}

			}
			builder.append(" ").append(orderByBuilder);
		}

		builder.append(" limit ?");
		argumentsList.add(100);

		log.info("SQL: {}, Parameters: {}", builder.toString(), argumentsList);
		System.out.println("SQL: " + builder + ", Parameters: " + argumentsList);

		return builder;
	}

	private List<OptionsVO> executeAndGetResults(StringBuilder sql, List<Object> argumentList) {
		Query nativeQuery = entityManager.createNativeQuery(sql.toString());
		int index = 1;
		for (Object object : argumentList) {
			nativeQuery.setParameter(index++, object);
		}

		List<OptionsVO> responseList = new ArrayList<>();

		@SuppressWarnings("unchecked")
		List<Object[]> resultList = nativeQuery.getResultList();
		for (Object[] objects : resultList) {
			if (objects.length == 2) {
				responseList.add(
						OptionsVO.builder().code(objects[0].toString()).description(objects[1].toString()).build());
			} else if (objects.length == 3) {
				responseList.add(OptionsVO.builder().code(objects[0].toString())
						.description(objects[1].toString() + "-" + objects[2].toString()).build());
			}

		}

		return responseList;
	}

	@Transactional
	public List<OptionsVO> getDynamicAutoCompleteList(DBDataVO vo) throws ParseException {
		List<Object> argumentsList = new ArrayList<>();
		StringBuilder builder = new StringBuilder();
		builder.append("select ").append("cast(" + vo.getKeyColumnName() + " as varchar) as keyColumn").append(", ")
				.append(vo.getDescriptionColumnName()).append(" from ").append(vo.getTableName());
		StringBuilder whereBuilder = new StringBuilder();
		whereBuilder.append(" lower(").append(vo.getAutoCompleteColumnName()).append(")");
		whereBuilder.append(String.format(" LIKE '%s'", vo.getFilterValue().toLowerCase() + "%"));
		List<FilterVO> filters = vo.getFilters();
		if (filters != null) {
			for (FilterVO filterVO : filters) {
				if (whereBuilder.length() > 0) {
					whereBuilder.append(" and ");
				}
				whereBuilder.append("cast(" + filterVO.getColumnName() + " as varchar)").append(" = ?");
				argumentsList.add(getValue(filterVO.getValue(), filterVO.getDataType()));

			}
		}
		if (whereBuilder.length() > 0) {
			builder.append(WHERE).append(whereBuilder.toString());
		}

		builder.append(" limit ?");
		argumentsList.add(100);

		return executeAndGetResults(builder, argumentsList);
	}

	@Transactional
	public List<PageFieldVO> getFieldList(String pageIdentifier, Long version) throws IOException {
		PageVO pageVO = pageService.getPageDetailsByPageIdentifier(pageIdentifier, version);

		List<SectionVO> mainSections = pageVO.getSections();
		List<PageFieldVO> fieldNamesList = new ArrayList<>();

		if (!mainSections.isEmpty()) {
			Map<String, List<SectionVO>> tableSectionsMap = new LinkedHashMap<>();
			Map<String, String> tablePrimaryKeyMap = new LinkedHashMap<>();

			String appPrefix = "";
			if (BooleanUtils.isTrue(pageVO.getManageFlag())) {
				appPrefix = applicationService.getApplicationPrefix(pageVO.getApplicationId()) + "_";
			}

			SectionVO parentSectionVo = SectionVO.builder().tableName(appPrefix + mainSections.get(0).getTableName())
					.build();
			resolveSections(parentSectionVo, mainSections, tableSectionsMap, tablePrimaryKeyMap, appPrefix);

			// Only the main section... No Nested at this time
			if (!tableSectionsMap.isEmpty()) {
				Map<String, FieldConfigVO> fieldMap = populateFieldMap(
						tableSectionsMap.entrySet().iterator().next().getValue());

				for (Entry<String, FieldConfigVO> fieldNamesEntry : fieldMap.entrySet()) {
					FieldConfigVO fieldConfigVo = fieldNamesEntry.getValue();
					String fieldName = fieldNamesEntry.getKey();

					LabelTypeVO label = fieldNamesEntry.getValue().getField().getLabel();
					if (label != null && StringUtils.isNotBlank(label.getLabelName())) {
						fieldName = label.getLabelName();
					}

					fieldNamesList.add(PageFieldVO.builder().datatype(getDatatype(fieldConfigVo))
							.fieldId(fieldNamesEntry.getKey()).fieldName(fieldName).build());
				}
			}
		}

		return fieldNamesList;
	}

	private List<String> saveFile(MultipartFile file, List<String> fileKeyList) throws IOException {
		try (InputStream inputStream = file.getInputStream()) {
			String imageKey = new StringBuilder(UUID.randomUUID().toString()).append(LocalTime.now()).toString();
			fileManagerService.uploadFile(imageKey, file.getInputStream(), file.getSize());
			fileKeyList.add(imageKey);
		}
		return fileKeyList;
	}

	private List<String> saveImages(String base64Image, List<String> fileKeyList) throws IOException {
//		String imageKey = new StringBuilder(UUID.randomUUID().toString()).append(LocalTime.now()).toString();
//		fileManagerService.uploadImage(imageKey, base64Image);
		String imageThumbNail = getImageThumbNail(base64Image);
		fileKeyList.add(imageThumbNail);
		return fileKeyList;
	}

//	@Transactional
//	public YoroResponse saves(JSONObject request, List<MultipartFile> fileList) throws IOException {
//		if (!CollectionUtils.isEmpty(fileList)) {
//			for (MultipartFile file : fileList) {
//				if (file != null) {
//					saveFile(file);
//				}
//			}
//		}
//		return null;
//	}

	@Transactional
	public YoroResponse savePublicForms(JSONObject request, List<MultipartFile> fileList)
			throws IOException, ParseException, YoroappsException {
		YoroResponseBuilder responseBuilder = YoroResponse.builder().messageType(YoroResponse.SUCCESS);
		String message = null;
		if (!StringUtils.equals(request.getString(YOROSIS_PAGE_ID), "null")) {

			PageVO pageVO = pageService.getPageDetails(UUID.fromString(request.getString(YOROSIS_PAGE_ID)));

			if (request.has(SAVEANDCALLWORKFLOW) && request.has(WORKFLOWKEY) && request.has(WORKFLOWVERSION)
					&& StringUtils.isNotBlank(request.get(WORKFLOWKEY).toString())
					&& StringUtils.isNotBlank(request.get(WORKFLOWVERSION).toString())
					&& !StringUtils.equals(request.get(WORKFLOWKEY).toString(), "null")
					&& !StringUtils.equals(request.get(WORKFLOWVERSION).toString(), "null")) {
				if (pageVO.getWorkflowKey() == null && pageVO.getWorkflowVersion() == null) {
					pageVO.setWorkflowKey(request.getString(WORKFLOWKEY));
					pageVO.setWorkflowVersion(request.getString(WORKFLOWVERSION));
				}
			}

			List<SectionVO> mainSections = pageVO.getSections();
			log.warn("Main section total size = {}", mainSections.size());
		}
		ServiceTokenVO serviceTokenVO = loadServiceTokenByUserName(YorosisContext.get().getTenantId());
		AuthDetailsVO authDetailsVo = authnzServiceClient.authenticateToken("token", serviceTokenVO.getApiKey(),
				serviceTokenVO.getSecretKey());
		String token = null;
		if (authDetailsVo != null) {
			token = TOKEN_PREFIX.concat(authDetailsVo.getToken());
		}
		YorosisContext context = YorosisContext.builder().token(token).tenantId(YorosisContext.get().getTenantId())
				.build();
		YorosisContext.set(context);
		Boolean captchaVerified = authnzServiceClient.verifyInfo(request.get("captcha").toString(), Long.valueOf(2));

		log.info("Captcha validated status: {}", captchaVerified);
		if (captchaVerified) {
			startWorkflow(request.get(WORKFLOWKEY).toString(), request.get(WORKFLOWVERSION).toString(), request,
					fileList, UUID.fromString(DEFAULT_WORKSPACE));
		}
		message = workflowClient.getMessageInfo(token, request.get(WORKFLOWKEY).toString());
		return responseBuilder.message("Data saved successfully").messageId(message).build();
	}

	@Transactional
	public YoroResponse save(JSONObject request, List<MultipartFile> fileList, UUID workspaceId)
			throws IOException, ParseException, YoroappsException {
		PageVO pageVO = pageService.getPageDetails(UUID.fromString(request.getString(YOROSIS_PAGE_ID)));

		YoroResponseBuilder responseBuilder = YoroResponse.builder().messageType(YoroResponse.SUCCESS);
		String message = "";

		boolean isSaveEnabled = true;
		boolean canCallworkflow = false;
		if (request.has(SAVEANDCALLWORKFLOW) && request.has(WORKFLOWKEY) && request.has(WORKFLOWVERSION)
				&& StringUtils.isNotBlank(request.get(WORKFLOWKEY).toString())
				&& StringUtils.isNotBlank(request.get(WORKFLOWVERSION).toString())
				&& !StringUtils.equals(request.get(WORKFLOWKEY).toString(), "null")
				&& !StringUtils.equals(request.get(WORKFLOWVERSION).toString(), "null")) {
			isSaveEnabled = request.getBoolean(SAVEANDCALLWORKFLOW);
			canCallworkflow = true;
			if (pageVO.getWorkflowKey() == null && pageVO.getWorkflowVersion() == null) {
				pageVO.setWorkflowKey(request.getString(WORKFLOWKEY));
				pageVO.setWorkflowVersion(request.getString(WORKFLOWVERSION));
			}
		}

		List<SectionVO> mainSections = pageVO.getSections();
		log.warn("Main section size = {}", mainSections.size());
		if (BooleanUtils.isTrue(pageVO.getIsWorkflowForm())) {
			long start = System.currentTimeMillis();
			UUID instanceTaskId = makeWorkflowServiceCall(request, fileList);
			responseBuilder.message(instanceTaskId == null ? "Invalid Task Details" : "Task Submitted Successfully")
					.messageId(instanceTaskId == null ? null : instanceTaskId.toString());
			log.warn("Total save time for workflow service is: {} milliseconds", (System.currentTimeMillis() - start));
		} else if (!mainSections.isEmpty()) {
			if (isSaveEnabled) {
				// Group by table names in section
				Map<String, List<SectionVO>> tableSectionsMap = new LinkedHashMap<>();
				Map<String, String> tablePrimaryKeyMap = new LinkedHashMap<>();

				String appPrefix = "";
				if (BooleanUtils.isTrue(pageVO.getManageFlag())) {
					appPrefix = applicationService.getApplicationPrefix(pageVO.getApplicationId()) + "_";
				}

				SectionVO parentSectionVo = SectionVO.builder()
						.tableName(appPrefix + mainSections.get(0).getTableName()).build();
				resolveSections(parentSectionVo, mainSections, tableSectionsMap, tablePrimaryKeyMap, appPrefix);

				parentSectionVo.getRows();

				for (Entry<String, List<SectionVO>> entry : tableSectionsMap.entrySet()) {
					String tableName = entry.getKey();
					Boolean childSection = entry.getValue().get(0).getChildSection();
					String parentTable = entry.getValue().get(0).getParentTable();
					String repeatableName = entry.getValue().get(0).getRepeatableName();
					Map<String, DataObject> insertOrUpdateDataMap = null;
					Map<String, FieldConfigVO> fieldMap = populateFieldMap(entry.getValue());
					Map<String, FieldConfigVO> tableFieldMap = checkTableControl(entry.getValue()).getFieldMap();
					Map<String, DataObject> insertOrUpdateTableDataMap = null;
					String tableControlName = checkTableControl(entry.getValue()).getTableId();

					if (BooleanUtils.isTrue(childSection)) {
						insertOrUpdateDataMap = prepareDataForInsertOrUpdateChildSection(fieldMap, repeatableName,
								request, fileList);

					} else {
						insertOrUpdateDataMap = prepareDataForInsertOrUpdate(fieldMap, request, fileList);
					}

					String primaryKeyName = tablePrimaryKeyMap.get(tableName);

					if (StringUtils.equals(primaryKeyName, "id") && BooleanUtils.isTrue(childSection)) {
						JSONArray jsonArray = request.getJSONArray(repeatableName);
						for (int k = 0; k < jsonArray.length(); k++) {
							Map<String, DataObject> newArrayMap = new LinkedHashMap<>();
							for (Map.Entry<String, DataObject> sectionSet : insertOrUpdateDataMap.entrySet()) {
								if (sectionSet.getKey().split("_")[1] != null
										&& Integer.parseInt(sectionSet.getKey().split("_")[1]) == k) {
									newArrayMap.put(sectionSet.getKey().split("_")[0], sectionSet.getValue());
								}
							}
							JSONObject objects = jsonArray.getJSONObject(k);
							String value1 = (String) objects.get("id");

							if (!StringUtils.equals(value1, "-1")) {
								if (pageVO.getForeignKey() == null) {
									String foreignKey = getForeignKey(value1, parentTable + "_" + primaryKeyName,
											tableName, primaryKeyName, true);
									pageVO.setForeignKey(foreignKey);
								}
								updateData(newArrayMap, tableName, false, primaryKeyName, value1,
										pageVO.getManageFlag(), pageVO);
							} else {
								insertData(newArrayMap, primaryKeyName, tableName, pageVO.getManageFlag(),
										entry.getValue(), pageVO, parentTable, childSection);
							}
						}
					} else if (!StringUtils.equals(request.getString(primaryKeyName), "-1")) {
						updateData(insertOrUpdateDataMap, tableName, false, primaryKeyName,
								request.getString(primaryKeyName), pageVO.getManageFlag(), pageVO);
						message = "Data updated successfully";
					} else {
						insertData(insertOrUpdateDataMap, primaryKeyName, tableName, pageVO.getManageFlag(),
								entry.getValue(), pageVO, parentTable, childSection);
						message = "Data created successfully";
					}

					if (!tableFieldMap.isEmpty()) {
						insertOrUpdateTableDataMap = prepareDataForInsertOrUpdateChildSection(tableFieldMap,
								tableControlName, request, fileList);
						JSONArray jsonArray = request.getJSONArray(tableControlName);
						for (int k = 0; k < jsonArray.length(); k++) {
							Map<String, DataObject> newArrayMap = new LinkedHashMap<>();
							for (Map.Entry<String, DataObject> sectionSet : insertOrUpdateTableDataMap.entrySet()) {
								if (sectionSet.getKey().split("_")[1] != null
										&& Integer.parseInt(sectionSet.getKey().split("_")[1]) == k) {
									newArrayMap.put(sectionSet.getKey().split("_")[0], sectionSet.getValue());
								}
							}
							JSONObject objects = jsonArray.getJSONObject(k);
							String value1 = (String) objects.get("id");

							if (!StringUtils.equals(value1, "-1")) {
								if (pageVO.getForeignKey() == null) {
									String foreignKey = getForeignKey(value1, tableName + "_" + "id",
											appPrefix + tableControlName, "id", true);
									pageVO.setForeignKey(foreignKey);
								}
								updateData(newArrayMap, appPrefix + tableControlName, false, "id", value1,
										pageVO.getManageFlag(), pageVO);
							} else {
								insertData(newArrayMap, "id", appPrefix + tableControlName, pageVO.getManageFlag(),
										entry.getValue(), pageVO, tableName, true);
							}
						}

					}

				}
				responseBuilder.message(message);
			}

			if (canCallworkflow) {
				startWorkflow(pageVO.getWorkflowKey(), pageVO.getWorkflowVersion(), request, fileList, workspaceId);
				responseBuilder.message("Workflow called successfully");
			}
		} else {
			log.warn("No main section found");
			responseBuilder.messageType(YoroResponse.ERROR);
			responseBuilder
					.message("Invalid page as it ,contains no sections.  Please update your page and try again.");
		}

		return responseBuilder.build();
	}

	public String getForeignKey(String id, String foreignKey, String tableName, String primaryKeyName,
			Boolean isManagedPage) {
		StringBuilder builder = new StringBuilder();
		List<DataObject> valueList = new ArrayList<>();

		builder.append("select ").append("cast(" + foreignKey + " as varchar)").append(" from ")
				.append(YorosisContext.get().getTenantId()).append(".").append(tableName).append(WHERE)
				.append(primaryKeyName).append(" = ? ");
		if (BooleanUtils.isTrue(isManagedPage)) {
			builder.append(" and tenant_id = ? and active_flag = ?");
		}

		valueList.add(DataObject.builder().type(StandardBasicTypes.UUID_CHAR).value(UUID.fromString(id)).build());

		if (BooleanUtils.isTrue(isManagedPage)) {
			StringType stringType = StandardBasicTypes.STRING;

			valueList.add(DataObject.builder().type(stringType).value(YorosisContext.get().getTenantId()).build());
			valueList.add(DataObject.builder().type(stringType).value(YoroappsConstants.YES).build());
		}

		Query nativeQuery = entityManager.createNativeQuery(builder.toString());
		int index = 1;
		for (DataObject object : valueList) {
			if (object.getType() == StandardBasicTypes.UUID_CHAR) {
				nativeQuery.setParameter(index, object.getValue());
			} else {
				nativeQuery.setParameter(index, new TypedParameterValue(object.getType(), object.getValue()));
			}

			index++;
		}
		return nativeQuery.getSingleResult().toString();
	}

	private void insertData(Map<String, DataObject> insertOrUpdateDataMap, String primaryKeyName, String tableName,
			Boolean isManagedPage, List<SectionVO> sectionList, PageVO pageVO, String parentTable, Boolean childSection)
			throws YoroappsException {

		StringBuilder builder = new StringBuilder();
		StringBuilder values = new StringBuilder();
		List<DataObject> valueList = new ArrayList<>();

		UUID uuid = UUID.randomUUID();

		if (pageVO.getForeignKey() == null) {
			pageVO.setForeignKey(uuid.toString());
		}

		builder.append("insert into ").append(YorosisContext.get().getTenantId()).append(".").append(tableName)
				.append("(");
		builder.append(primaryKeyName + " ");
		values.append("?");
		valueList.add(DataObject.builder().type(StandardBasicTypes.UUID_CHAR).value(uuid).build());

		if (BooleanUtils.isTrue(childSection) && pageVO.getForeignKey() != null) {
			builder.append(", ");
			builder.append(parentTable + "_" + primaryKeyName);
			values.append(", ");
			values.append("? ");
			valueList.add(DataObject.builder().type(StandardBasicTypes.UUID_CHAR)
					.value(UUID.fromString(pageVO.getForeignKey())).build());
		}

		for (Entry<String, DataObject> entry : insertOrUpdateDataMap.entrySet()) {
			if (values.length() > 0) {
				values.append(", ");
				builder.append(", ");
			}

			if (entry.getKey().contains("_")) {
				builder.append(getColumnName(entry.getKey().split("_")[0], isManagedPage));
			} else {
				builder.append(getColumnName(entry.getKey(), isManagedPage));
			}

			values.append("?");

			valueList.add(entry.getValue());
//		DataObject dataObject = entry.getValue();
//		if (dataObject != null && dataObject.getValue() != null && StringUtils.equals(dataObject.getValue().toString(), "-1")) {
//			valueList.add(DataObject.builder().type(StandardBasicTypes.UUID_CHAR).value(uuid.toString()).build());
//		} else {
//			valueList.add(entry.getValue());
//		}
		}

		/*
		 * int checkUniqueCount = checkUnique(pageVO, valueList, tableName);
		 * 
		 * if (checkUniqueCount > 0) { throw new
		 * YoroappsException("Data Already Exist");
		 * 
		 * } else {
		 */

		// Insert value
		if (BooleanUtils.isTrue(isManagedPage)) {
			addDefaultColumnsInsert(builder, values, valueList);
		}
		builder.append(") values (").append(values).append(")");

		processDBQuery(builder, valueList);

		// }
	}

	private String getColumnName(String key, Boolean isManagedPage) {
		if (StringUtils.equalsAnyIgnoreCase(key, "uuid", "tenant_id", "created_by", "created_on", "modified_by",
				"modified_on", "active_flag")) {
			return key;
		}

		if (BooleanUtils.isTrue(isManagedPage)) {
			return "ya_" + key.toLowerCase();
		}

		return key.toLowerCase();
	}

	private void updateData(Map<String, DataObject> updateDataMap, String tableName, boolean isDeleted,
			String primaryKeyName, String idValue, Boolean isManagedPage, PageVO pageVO) {
		StringBuilder builder = new StringBuilder();
		List<DataObject> valueList = new ArrayList<>();

		builder.append("update ").append(YorosisContext.get().getTenantId()).append(".").append(tableName)
				.append(" set ");
		for (Entry<String, DataObject> entry : updateDataMap.entrySet()) {
			if (!valueList.isEmpty()) {
				builder.append(", ");
			}
			builder.append(getColumnName(entry.getKey(), isManagedPage)).append(" = ?");
			valueList.add(entry.getValue());
		}

		if (BooleanUtils.isTrue(isManagedPage)) {
			addDefaultColumnsUpdate(builder, isDeleted, valueList);
		}

		builder.append(WHERE).append(primaryKeyName).append(" = ? ");
		if (BooleanUtils.isTrue(isManagedPage)) {
			builder.append(" and tenant_id = ? and active_flag = ?");
		}

		valueList.add(DataObject.builder().type(StandardBasicTypes.UUID_CHAR).value(UUID.fromString(idValue)).build());

		if (BooleanUtils.isTrue(isManagedPage)) {
			StringType stringType = StandardBasicTypes.STRING;

			valueList.add(DataObject.builder().type(stringType).value(YorosisContext.get().getTenantId()).build());
			valueList.add(DataObject.builder().type(stringType).value(YoroappsConstants.YES).build());
		}

		processDBQuery(builder, valueList);
	}

	private void startWorkflow(String workflowKey, String workflowVersion, JSONObject request,
			List<MultipartFile> fileList, UUID workspaceId) throws IOException {
		ObjectMapper objectMapper = new ObjectMapper();
		JsonNode jsonNode = objectMapper.readTree(request.toString());
		if (StringUtils.isBlank(workflowVersion) || StringUtils.equalsIgnoreCase(workflowVersion, "latest")) {
			workflowClient.startLatestWorkflow(YorosisContext.get().getToken(), workflowKey, workspaceId.toString(),
					setImageKey(jsonNode, fileList));
		} else {
			workflowClient.startWorkflow(YorosisContext.get().getToken(), workflowKey, Long.valueOf(workflowVersion),
					workspaceId.toString(), setImageKey(jsonNode, fileList));
		}
	}

	private UUID makeWorkflowServiceCall(JSONObject request, List<MultipartFile> fileList) throws IOException {
		if (request.has("isWorkflow") && request.getBoolean("isWorkflow")) {
			String workflowId = request.getString("workflowId");
			String taskId = request.getString("workflowTaskId");

			ObjectMapper objectMapper = new ObjectMapper();
			WorkflowVo workflowVo = WorkflowVo.builder().instanceId(workflowId).instanceTaskId(taskId)
					.taskData(setImageKey(objectMapper.readTree(request.toString()), fileList)).build();
			TaskDetailsResponse taskDetailsResponse = workflowClient
					.completeWorkflowStep(YorosisContext.get().getToken(), workflowVo);
			return taskDetailsResponse.getInstanceTaskId();
		}
		return null;
	}

	private int checkUnique(PageVO pageVO, List<Object> valueList, String tableName) {
		List<Object> uniqueList = new ArrayList<>();
		List<Object> queryFieldName = new ArrayList<>();
		List<Object> unqiueValueList = new ArrayList<>();

		List<SectionVO> mainSections = pageVO.getSections();

		for (RowsVO rows : mainSections.get(0).getRows()) {
			for (FieldConfigVO columns : rows.getColumns()) {
				uniqueList.add(columns.getField().isUnique());
				queryFieldName.add(columns.getField().getName());
			}
		}

		if (uniqueList.contains(true)) {
			StringBuilder sql = new StringBuilder();
			sql.append("select count(1)").append(" from ").append(tableName).append(WHERE);

			if (BooleanUtils.isTrue(pageVO.getManageFlag())) {
				sql.append(" tenant_id = ? and active_flag = ? and ");
			}

			Iterator<Object> uniqueIterator = uniqueList.iterator();
			Iterator<Object> queryFieldNameIterator = queryFieldName.iterator();

			sql.append(" ( ");
			int listValue = 0;
			while (uniqueIterator.hasNext()) {

				if ((boolean) uniqueIterator.next()) {

					sql.append(getColumnName(queryFieldName.iterator().next().toString(), pageVO.getManageFlag()))
							.append(" = ? ");
					unqiueValueList.add(valueList.get(listValue));
					sql.append(" or ");
				}

				listValue++;
			}
			// sql.setLength(sql.length() - 3);
			sql.append(" ) ");

			Query pageCountQuery = entityManager.createNativeQuery(sql.toString());
			pageCountQuery.setParameter(1, YorosisContext.get().getTenantId());
			pageCountQuery.setParameter(2, YoroappsConstants.YES);

			int pageCountIndex = 3;
			for (Object value : unqiueValueList) {
				pageCountQuery.setParameter(pageCountIndex++, value);
			}

			Object pageCountResult = pageCountQuery.getSingleResult();

			return ((BigInteger) pageCountResult).intValue();
		}
		return 0;

	}

	private void addDefaultColumnsInsert(StringBuilder builder, StringBuilder values, List<DataObject> valueList) {
		builder.append(", tenant_id, created_by, created_on, modified_by, modified_on, active_flag");
		values.append(", ?, ?, ?, ?, ?, ?");

		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		StringType stringType = StandardBasicTypes.STRING;

		valueList.add(DataObject.builder().type(stringType).value(YorosisContext.get().getTenantId()).build());
		valueList.add(DataObject.builder().type(stringType).value(YorosisContext.get().getUserName()).build());
		valueList.add(DataObject.builder().type(StandardBasicTypes.TIMESTAMP).value(timestamp).build());
		valueList.add(DataObject.builder().type(stringType).value(YorosisContext.get().getUserName()).build());
		valueList.add(DataObject.builder().type(StandardBasicTypes.TIMESTAMP).value(timestamp).build());
		valueList.add(DataObject.builder().type(stringType).value(YoroappsConstants.YES).build());
	}

	private void addDefaultColumnsUpdate(StringBuilder builder, boolean isDelete, List<DataObject> valueList) {
		builder.append(", modified_by = ?, modified_on = ?, active_flag = ?");

		StringType stringType = StandardBasicTypes.STRING;
		valueList.add(DataObject.builder().type(stringType).value(YorosisContext.get().getUserName()).build());
		valueList.add(DataObject.builder().type(StandardBasicTypes.TIMESTAMP)
				.value(new Timestamp(System.currentTimeMillis())).build());

		String flag = isDelete ? YoroappsConstants.NO : YoroappsConstants.YES;
		valueList.add(DataObject.builder().type(stringType).value(flag).build());
	}

	private void resolveSections(SectionVO parentSectionVo, List<SectionVO> childSections,
			Map<String, List<SectionVO>> tableSectionsMap, Map<String, String> tablePrimaryKeyMap, String appPrefix) {
		if (childSections != null && !childSections.isEmpty()) {
			for (SectionVO sectionVO : childSections) {
				String tableName = null;
				if (StringUtils.isNotBlank(sectionVO.getTableName())) {
					tableName = sectionVO.getTableName();
				} else if (parentSectionVo != null && StringUtils.isNotBlank(parentSectionVo.getTableName())) {
					tableName = parentSectionVo.getTableName();
				}

				if (StringUtils.isBlank(tableName)) {
					throw new IllegalArgumentException("Invalid section as the table name is empty");
				}

				tableName = appPrefix + tableName.trim().toLowerCase();
				tableSectionsMap.computeIfAbsent(tableName, list -> new ArrayList<>()).add(sectionVO);
				tablePrimaryKeyMap.computeIfAbsent(tableName, list -> sectionVO.getPrimaryKey());

				resolveSections(sectionVO, sectionVO.getSections(), tableSectionsMap, tablePrimaryKeyMap, appPrefix);
			}
		}
	}

	private Map<String, DataObject> prepareDataForInsertOrUpdate(Map<String, FieldConfigVO> columnMap,
			JSONObject request, List<MultipartFile> fileList) throws ParseException, IOException {
		Map<String, DataObject> valueMap = new LinkedHashMap<>();
		for (Entry<String, FieldConfigVO> entrySet : columnMap.entrySet()) {
			if (request.has(entrySet.getKey())) {
				DataObject value = getValue(entrySet.getValue(), entrySet.getKey(), request, fileList);
				if (value != null && value.getValue() instanceof Boolean) {
					String newValue = Boolean.toString((boolean) value.getValue());
					value.setType(StandardBasicTypes.STRING);
					value.setValue(newValue);
				}
				valueMap.put(entrySet.getValue().getField().getName(), value);
			}
		}

		return valueMap;
	}

	private Map<String, DataObject> prepareDataForInsertOrUpdateChildSection(Map<String, FieldConfigVO> columnMap,
			String repeatableName, JSONObject request, List<MultipartFile> fileList)
			throws ParseException, IOException {
		Map<String, DataObject> valueMap = new LinkedHashMap<>();
		for (Entry<String, FieldConfigVO> entrySet : columnMap.entrySet()) {
			if (request.has(repeatableName)) {
				JSONArray jsonArray = request.getJSONArray(repeatableName);
				for (int i = 0; i < jsonArray.length(); i++) {
					JSONObject objects = jsonArray.getJSONObject(i);
					DataObject value = getValue(entrySet.getValue(), entrySet.getKey(), objects, fileList);
					if (value != null && value.getValue() instanceof Boolean) {
						String newValue = Boolean.toString((boolean) value.getValue());
						value.setType(StandardBasicTypes.STRING);
						value.setValue(newValue);
					}
					valueMap.put(entrySet.getValue().getField().getName() + "_" + i, value);
				}
			}
		}

		return valueMap;
	}

	private TableVO checkTableControl(List<SectionVO> sectionList) throws ParseException, IOException {
		String tableId = null;
		Map<String, FieldConfigVO> valueMap = new LinkedHashMap<>();
		for (SectionVO tableSectionVo : sectionList) {
			List<RowsVO> rows = tableSectionVo.getRows();

			for (RowsVO rowsVo : rows) {
				List<FieldConfigVO> columns = rowsVo.getColumns();
				for (FieldConfigVO fieldConfigVo : columns) {
					FieldVO fieldVo = fieldConfigVo.getField();
					if (StringUtils.equals(fieldConfigVo.getControlType(), "table")) {
						ObjectMapper mapper = new ObjectMapper();
						mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
						TableVO tableVO = mapper.readValue(mapper.writeValueAsString(fieldVo.getControl()),
								TableVO.class);
						tableId = tableVO.getTableId();
						for (FieldConfigVO tableField : tableVO.getColumns()) {
							valueMap.put(tableField.getField().getName(), tableField);
						}
					}
				}
			}
		}
		return TableVO.builder().fieldMap(valueMap).tableId(tableId).build();
	}

	private Map<String, FieldConfigVO> populateFieldMap(List<SectionVO> sectionList) {
		Map<String, FieldConfigVO> columnMap = new LinkedHashMap<>();
		for (SectionVO tableSectionVo : sectionList) {
			List<RowsVO> rows = tableSectionVo.getRows();
			for (RowsVO rowsVo : rows) {
				List<FieldConfigVO> columns = rowsVo.getColumns();
				for (FieldConfigVO fieldConfigVo : columns) {
					FieldVO field = fieldConfigVo.getField();
					if (field != null && field.getName() != null) {
						columnMap.put(field.getName(), fieldConfigVo);
					}
				}
			}
		}

		return columnMap;
	}

	private Map<String, FieldConfigVO> populateFieldMapForTable(List<SectionVO> sectionList) {
		Map<String, FieldConfigVO> columnMap = new LinkedHashMap<>();
		for (SectionVO tableSectionVo : sectionList) {
			List<RowsVO> rows = tableSectionVo.getRows();
			for (RowsVO rowsVo : rows) {
				List<FieldConfigVO> columns = rowsVo.getColumns();
				for (FieldConfigVO fieldConfigVo : columns) {
					FieldVO fieldVo = fieldConfigVo.getField();

				}
			}
		}

		return columnMap;
	}

	private DataObject getValue(FieldConfigVO fieldConfigVo, String jsonColumn, JSONObject request,
			List<MultipartFile> fileList) throws ParseException, IOException {
		DataObjectBuilder value = DataObject.builder().value("").type(StandardBasicTypes.STRING);

		FieldVO fieldVo = fieldConfigVo.getField();
		if ((StringUtils.equalsIgnoreCase(fieldConfigVo.getControlType(), CHECKBOX))) {
			value.type(StandardBasicTypes.BOOLEAN).value(null);
			if (!request.isNull(jsonColumn)) {
				value.value(request.getBoolean(jsonColumn));
			}
		} else if (!request.isNull(jsonColumn)
				&& (StringUtils.equalsAnyIgnoreCase(fieldConfigVo.getControlType(), MULTIPLESELECT, CHIP))) {
			value.type(StandardBasicTypes.STRING).value(getJsonArrayAsCsv(request.getJSONArray(jsonColumn)));
		} else if (!request.isNull(jsonColumn) && (StringUtils.equalsIgnoreCase(STRING, fieldVo.getDataType())
				|| StringUtils.equalsAnyIgnoreCase(fieldConfigVo.getControlType(), TEXTAREA))) {
			value.type(StandardBasicTypes.STRING).value(request.getString(jsonColumn));
		} else if (!request.isNull(jsonColumn)
				&& StringUtils.equalsAnyIgnoreCase(fieldConfigVo.getControlType(), SIGNATURE)) {
			value.type(StandardBasicTypes.STRING).value(null);
			if (!CollectionUtils.isEmpty(fileList)) {
				List<String> fileKeyList = new ArrayList<>();
				for (MultipartFile file : fileList) {
					if (file != null
							&& StringUtils.endsWith(file.getOriginalFilename(), fieldConfigVo.getField().getName())) {

						List<String> saveFile = saveFile(file, fileKeyList);
						value.value(StringUtils.join(saveFile, ","));
					}
				}
			}
		} else if (!request.isNull(jsonColumn)
				&& StringUtils.equalsAnyIgnoreCase(fieldConfigVo.getControlType(), FILE_UPLOAD)) {
//			JSONArray jsonArray = request.getJSONArray(jsonColumn);
//			String[] stringArray = new String[jsonArray.length()];
//			List<String> fileKeyList = new ArrayList<>();
//			for (int i = 0; i < jsonArray.length(); i++) {
//				stringArray[i] = jsonArray.getString(i);
//				List<String> saveFile = saveImages(stringArray[i], fileKeyList);
//				value.value(StringUtils.join(saveFile, ","));
//			}
			value.value(request.get(jsonColumn).toString());
		} else if (StringUtils.equalsIgnoreCase(INTEGER, fieldVo.getDataType())) {
			value.type(StandardBasicTypes.INTEGER).value(null);
			if (!request.isNull(jsonColumn) && StringUtils.isNotBlank(request.getString(jsonColumn))) {
				value.value(request.getString(jsonColumn));
			}
		} else if (StringUtils.equalsIgnoreCase(LONG, fieldVo.getDataType())) {
			value.type(StandardBasicTypes.LONG).value(null);
			if (!request.isNull(jsonColumn)) {
				value.value(request.getLong(jsonColumn));
			}
		} else if (StringUtils.equalsIgnoreCase(FLOAT, fieldVo.getDataType())) {
			value.type(StandardBasicTypes.DOUBLE).value(null);
			if (!request.isNull(jsonColumn)) {
				value.value(request.getDouble(jsonColumn));
			}
		} else if (StringUtils.equalsIgnoreCase(DATE, fieldVo.getDataType())) {
			value = value.type(StandardBasicTypes.TIMESTAMP).value(null);
			if (!request.isNull(jsonColumn)) {
				value.value(formatDate(request.getString(jsonColumn), fieldVo.getDateFormat()));
			}
		} else if (!request.isNull(jsonColumn)) {
			value.type(StandardBasicTypes.STRING).value(request.getString(jsonColumn));
		}
		return value.build();
	}

	private Object getValue(String inputValue, String dataType) throws ParseException {
		Object value = "";

		if (StringUtils.isNotBlank(inputValue)) {
			if (StringUtils.equalsIgnoreCase(INTEGER, dataType)) {
				value = Integer.parseInt(inputValue);
			} else if (StringUtils.equalsIgnoreCase(LONG, dataType)) {
				value = Long.parseLong(inputValue);
			} else if (StringUtils.equalsIgnoreCase(FLOAT, dataType)) {
				value = Double.parseDouble(inputValue);
			} else if (StringUtils.equalsIgnoreCase(DATE, dataType)) {
				value = formatDate(inputValue, null);
			} else {
				value = inputValue;
			}
		}

		return value;
	}

	private String getJsonArrayAsCsv(JSONArray jsonArray) {
		if (jsonArray != null && jsonArray.length() > 0) {
			String[] arr = new String[jsonArray.length()];
			for (int i = 0; i < jsonArray.length(); i++) {
				arr[i] = jsonArray.getString(i);
			}

			return StringUtils.join(arr, ",");
		}

		return "";
	}

	private String getDatatype(FieldConfigVO fieldConfigVo) {
		FieldVO fieldVo = fieldConfigVo.getField();
		if (StringUtils.equalsIgnoreCase(fieldConfigVo.getControlType(), CHECKBOX)) {
			return BOOLEAN;
		} else if (StringUtils.equalsIgnoreCase(STRING, fieldVo.getDataType())
				|| StringUtils.equalsAnyIgnoreCase(fieldConfigVo.getControlType(), CHIP, MULTIPLESELECT, TEXTAREA)) {
			return STRING;
		} else if (StringUtils.equalsAnyIgnoreCase(fieldVo.getDataType(), INTEGER, LONG)) {
			return LONG;
		} else if (StringUtils.equalsIgnoreCase(DATE, fieldVo.getDataType())) {
			return DATE;
		} else if (StringUtils.equalsAnyIgnoreCase(fieldVo.getDataType(), FLOAT, DOUBLE)) {
			return DOUBLE;
		}
		return STRING;
	}

	private String getDBDataType(FieldConfigVO fieldConfigVo) {
		String value = "varchar(100)";
		String required = "";
		int length = 100;

		Optional<ValidationVO> maxLengthValidation = getValidation(fieldConfigVo, MAXLENGTH, false);
		if (maxLengthValidation.isPresent()) {
			length = Integer.parseInt(maxLengthValidation.get().getValue());
		}

		Optional<ValidationVO> requiredValidation = getValidation(fieldConfigVo, REQUIRED, true);
		if (requiredValidation.isPresent()) {
			required = " not null";
		}

		FieldVO fieldVo = fieldConfigVo.getField();
		if (StringUtils.equalsIgnoreCase(fieldConfigVo.getControlType(), CHECKBOX)) {
			length = 5; // boolean so, 5 chars in length
			value = "varchar (" + length + ")";
		} else if (StringUtils.equalsIgnoreCase(STRING, fieldVo.getDataType())
				|| StringUtils.equalsAnyIgnoreCase(fieldConfigVo.getControlType(), CHIP, MULTIPLESELECT, TEXTAREA)) {
			value = "varchar (" + length + ")";
		} else if (StringUtils.equalsIgnoreCase(INTEGER, fieldVo.getDataType())) {
			value = "int4";
		} else if (StringUtils.equalsIgnoreCase(LONG, fieldVo.getDataType())) {
			value = "int8";
		} else if (StringUtils.equalsIgnoreCase(FLOAT, fieldVo.getDataType())) {
			value = "float8";
		} else if (StringUtils.equalsIgnoreCase(DATE, fieldVo.getDataType())) {
			value = "timestamp";
		}

		return value + required;
	}

	private Optional<ValidationVO> getValidation(FieldConfigVO fieldConfigVo, String type, boolean okIfNull) {
		FieldVO fieldVo = fieldConfigVo.getField();
		if (fieldVo.getValidations() != null && !fieldVo.getValidations().isEmpty()) {
			return fieldVo.getValidations().stream().filter(p -> (okIfNull || StringUtils.isNotBlank(p.getValue()))
					&& StringUtils.equalsIgnoreCase(type, p.getType())).findFirst();
		}

		return Optional.empty();
	}

	private Object formatDate(String date, String dateFormat) throws ParseException {
		if (StringUtils.isBlank(date)) {
			return null;
		}

		if (StringUtils.isBlank(dateFormat)) {
			dateFormat = "dd MMM yyyy";
		}

		Date parseDate = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").parse(date);
		String stringDate = new SimpleDateFormat(dateFormat).format(parseDate);
		Date simpleDateFormat = new SimpleDateFormat(dateFormat).parse(stringDate);
		// return Timestamp.valueOf(stringDate);
		return new Timestamp(simpleDateFormat.getTime());
	}

	private void processDBQuery(StringBuilder query, List<DataObject> valueList) {
		Query nativeQuery = entityManager.createNativeQuery(query.toString());
		int index = 1;
		for (DataObject object : valueList) {
			if (object.getType() == StandardBasicTypes.UUID_CHAR) {
				nativeQuery.setParameter(index, object.getValue());
			} else {
				nativeQuery.setParameter(index, new TypedParameterValue(object.getType(), object.getValue()));
			}

			index++;
		}

		int executeUpdate = nativeQuery.executeUpdate();
		log.info("Total created/records: {}", executeUpdate);
	}

	public PageDataVO getDataForField(String pageIdentifier, String fieldName, Object fieldValue, Long version)
			throws IOException, ParseException {
		return getData(pageIdentifier, fieldName, fieldValue, version);
	}

	public PageDataVO getData(String pageIdentifier, UUID id, Long version) throws IOException, ParseException {
		return getData(pageIdentifier, null, id, version);
	}

	private PageDataVO getData(String pageIdentifier, String queryFieldName, Object value, Long version)
			throws IOException, ParseException {
		PageVO pageDetails = pageService.getPageDetailsByPageIdentifier(pageIdentifier, version);

		PageDataVO pageDataVo = PageDataVO.builder().build();
		String appPrefix = "";
		if (BooleanUtils.isTrue(pageDetails.getManageFlag())) {
			appPrefix = applicationService.getApplicationPrefix(pageDetails.getApplicationId()) + "_";
		}

		Map<String, Object> dataMap = new LinkedHashMap<>();

		// Group by table names in section
		Map<String, List<SectionVO>> tableSectionsMap = new LinkedHashMap<>();
		Map<String, String> tablePrimaryKeyMap = new LinkedHashMap<>();

		populateFieldAndTableDetails(pageDetails, tableSectionsMap, tablePrimaryKeyMap);

		for (Entry<String, List<SectionVO>> entry : tableSectionsMap.entrySet()) {
			String tableName = entry.getKey();

			Map<String, FieldConfigVO> fieldConfigMap = populateFieldMap(entry.getValue());
			Map<Integer, String> columnIndexFieldNameMap = new HashMap<>();

			String primaryKey = entry.getValue().get(0).getPrimaryKey();
			String parentTable = entry.getValue().get(0).getParentTable();
			Boolean childSection = entry.getValue().get(0).getChildSection();
			String repeatableName = entry.getValue().get(0).getRepeatableName();
			Map<String, FieldConfigVO> tableFieldMap = checkTableControl(entry.getValue()).getFieldMap();
			String tableControlName = checkTableControl(entry.getValue()).getTableId();
			int index = 0;
			StringBuilder sql = new StringBuilder();

			columnIndexFieldNameMap.put(index++, primaryKey);

			sql.append("select ").append("cast(" + primaryKey + " as varchar)");
			for (Entry<String, FieldConfigVO> fieldVoEntry : fieldConfigMap.entrySet()) {
				if (fieldVoEntry.getKey() != null) {
					String fieldName = fieldVoEntry.getKey().toLowerCase();
					columnIndexFieldNameMap.put(index++, fieldVoEntry.getKey());

					sql.append(", ").append(getColumnName(fieldName, pageDetails.getManageFlag()));
				}
			}

			sql.append(" from ").append(tableName).append(WHERE);

			// If the query field name is NULL, then it is going to be queried using Primary
			// key.
			if (StringUtils.isBlank(queryFieldName)) {
				if (BooleanUtils.isTrue(childSection)) {
					sql.append(parentTable + "_" + primaryKey).append(" = ? ");
				} else {
					sql.append(primaryKey).append(" = ? ");
				}
			} else {
				sql.append(getColumnName(queryFieldName, pageDetails.getManageFlag())).append(" = ? ");
			}

			if (BooleanUtils.isTrue(pageDetails.getManageFlag())) {
				sql.append(" and tenant_id = ? and active_flag = ? ");
			}

			List<Object> argumentList = Arrays.asList(value);
			if (BooleanUtils.isTrue(pageDetails.getManageFlag())) {
				argumentList = Arrays.asList(value, YorosisContext.get().getTenantId(), YoroappsConstants.YES);
			}

			pageDataVo = executeAndGetResults(sql, argumentList, columnIndexFieldNameMap, fieldConfigMap, dataMap,
					childSection, repeatableName);

			if (!tableFieldMap.isEmpty()) {
				Map<Integer, String> tableIndexFieldNameMap = new HashMap<>();
				int tableIndex = 0;
				StringBuilder tableSql = new StringBuilder();
				tableIndexFieldNameMap.put(tableIndex++, "id");

				tableSql.append("select ").append("cast(" + "id" + " as varchar)");
				for (Entry<String, FieldConfigVO> fieldVoEntry : tableFieldMap.entrySet()) {
					if (fieldVoEntry.getKey() != null) {
						String fieldName = fieldVoEntry.getKey().toLowerCase();
						tableIndexFieldNameMap.put(tableIndex++, fieldVoEntry.getKey());

						tableSql.append(", ").append(getColumnName(fieldName, pageDetails.getManageFlag()));
					}
				}
				tableSql.append(" from ").append(appPrefix + tableControlName).append(WHERE);
				tableSql.append(tableName + "_id").append(" = ? ");

				if (BooleanUtils.isTrue(pageDetails.getManageFlag())) {
					tableSql.append(" and tenant_id = ? and active_flag = ? ");
				}

				List<Object> tableArgumentList = Arrays.asList(value);
				if (BooleanUtils.isTrue(pageDetails.getManageFlag())) {
					tableArgumentList = Arrays.asList(value, YorosisContext.get().getTenantId(), YoroappsConstants.YES);
				}

				pageDataVo = executeAndGetResults(tableSql, tableArgumentList, tableIndexFieldNameMap, fieldConfigMap,
						dataMap, true, tableControlName);
			}

		}

		return pageDataVo;
	}

	private PageDataVO executeAndGetResults(StringBuilder sql, List<Object> argumentList,
			Map<Integer, String> columnIndexFieldNameMap, Map<String, FieldConfigVO> fieldConfigMap,
			Map<String, Object> dataMap, Boolean childSection, String repeatableName) throws IOException {
		Query nativeQuery = entityManager.createNativeQuery(sql.toString());
		int index = 1;
		for (Object object : argumentList) {
			nativeQuery.setParameter(index++, object);
		}

		PageDataVO pageDataVo = PageDataVO.builder().data(dataMap).build();
		Map<String, Object> arrayMap = new LinkedHashMap<>();

		if (BooleanUtils.isTrue(childSection)) {
			int i = 0;
			@SuppressWarnings("unchecked")
			List<Object[]> resultList = nativeQuery.getResultList();
			Set<Map<String, Object>> sectionList = new LinkedHashSet<>();
			for (Object[] objects : resultList) {
				int newIndex = 0;
				for (Object value : objects) {
					String name = columnIndexFieldNameMap.get(newIndex++);
					FieldConfigVO fieldConfigVo = fieldConfigMap.get(name);
					value = getValueForUI(value, fieldConfigVo);
					arrayMap.put(name + "_" + i, value);

				}
				i++;
			}

			for (int k = 0; k < i; k++) {
				Map<String, Object> newArrayMap = new LinkedHashMap<>();
				for (Map.Entry<String, Object> sectionSet : arrayMap.entrySet()) {
					if (sectionSet.getKey().split("_")[1] != null
							&& Integer.parseInt(sectionSet.getKey().split("_")[1]) == k)
						newArrayMap.put(sectionSet.getKey().split("_")[0], sectionSet.getValue());

				}
				sectionList.add(newArrayMap);
			}

			dataMap.put(repeatableName, sectionList);
		} else {
			@SuppressWarnings("unchecked")
			List<Object[]> resultList = nativeQuery.getResultList();
			for (Object[] objects : resultList) {
				int newIndex = 0;
				for (Object value : objects) {
					String name = columnIndexFieldNameMap.get(newIndex++);

					FieldConfigVO fieldConfigVo = fieldConfigMap.get(name);
					value = getValueForUI(value, fieldConfigVo);
					dataMap.put(name, value);
				}
			}
		}

		return pageDataVo;
	}

	private Object getValueForUI(Object value, FieldConfigVO fieldConfigVo) throws IOException {
		if (fieldConfigVo != null) {
			if (StringUtils.equalsIgnoreCase(fieldConfigVo.getControlType(), CHECKBOX)
					&& StringUtils.isNotBlank((String) value)) {
				value = Boolean.valueOf((String) value);
			} else if (StringUtils.equalsAnyIgnoreCase(fieldConfigVo.getControlType(), CHIP, MULTIPLESELECT)) {
				if (StringUtils.isNotBlank((String) value)) {
					value = StringUtils.split((String) value, ",");
				} else {
					value = new String[0];
				}
			} else if ((StringUtils.equalsAnyIgnoreCase(fieldConfigVo.getControlType(), FILE_UPLOAD)
					|| StringUtils.equalsAnyIgnoreCase(fieldConfigVo.getControlType(), SIGNATURE))
					&& StringUtils.isNotBlank((String) value) && !StringUtils.isEmpty(value.toString())) {
				String[] arr = value.toString().split(",");
				value = arr;
			}
		}

		return value;
	}

	private void populateFieldAndTableDetails(PageVO pageVo, Map<String, List<SectionVO>> tableSectionsMap,
			Map<String, String> tablePrimaryKeyMap) {
		List<SectionVO> mainSections = pageVo.getSections();
		log.warn("Main section size = {}", mainSections.size());

		if (!mainSections.isEmpty()) {
			String appPrefix = "";
			if (BooleanUtils.isTrue(pageVo.getManageFlag())) {
				appPrefix = applicationService.getApplicationPrefix(pageVo.getApplicationId()) + "_";
			}

			SectionVO parentSectionVo = SectionVO.builder().tableName(appPrefix + mainSections.get(0).getTableName())
					.build();
			resolveSections(parentSectionVo, mainSections, tableSectionsMap, tablePrimaryKeyMap, appPrefix);
		}
	}

	@Transactional
	public List<String> generateCreateTable(PageVO pageVo) {
		List<String> ddlStatementsList = new ArrayList<>();
		if (BooleanUtils.isFalse(pageVo.getManageFlag())) {
			return ddlStatementsList;
		}

		// Group by table names in section
		Map<String, List<SectionVO>> tableSectionsMap = new LinkedHashMap<>();
		Map<String, String> tablePrimaryKeyMap = new LinkedHashMap<>();

		populateFieldAndTableDetails(pageVo, tableSectionsMap, tablePrimaryKeyMap);

		for (Entry<String, List<SectionVO>> entry : tableSectionsMap.entrySet()) {
			String tableName = entry.getKey();
			Map<String, FieldConfigVO> fieldMap = populateFieldMap(entry.getValue());
			String primaryKeyName = tablePrimaryKeyMap.get(tableName);

			ddlStatementsList.add(getCreateTableScript(tableName, primaryKeyName, fieldMap, pageVo.getManageFlag()));
		}

		return ddlStatementsList;
	}

	private String getCreateTableScript(String tableName, String primaryKeyName,
			Map<String, FieldConfigVO> fieldConfigMap, Boolean isManagedPage) {
		StringBuilder sql = new StringBuilder();
		sql.append(CREATE_TABLE_IF_NOT_EXISTS).append(YorosisContext.get().getTenantId()).append(".").append(tableName)
				.append("(");

		sql.append(getColumnName(primaryKeyName, isManagedPage)).append(" uuid");
		for (Entry<String, FieldConfigVO> fieldVoEntry : fieldConfigMap.entrySet()) {
			if (fieldVoEntry.getKey() != null) {
				String fieldName = fieldVoEntry.getKey().toLowerCase();

				String dbDataType = getDBDataType(fieldVoEntry.getValue());
				sql.append(", ").append(getColumnName(fieldName, isManagedPage)).append(" ").append(dbDataType);
			}
		}

		sql.append(
				", tenant_id varchar(60) not null, created_by varchar(100) not null, created_on timestamp not null, modified_by varchar(100), modified_on timestamp not null, active_flag varchar(1) not null, primary key(")
				.append(primaryKeyName).append(")) ");

		return sql.toString();
	}

	@Transactional
	public List<String> generateUpdateTable(PageVO oldPageVo, PageVO newPageVo) throws YoroappsException {
		List<String> ddlStatementsList = new ArrayList<>();
		if (BooleanUtils.isFalse(newPageVo.getManageFlag())) {
			return ddlStatementsList;
		}

		// Group by table names in section
		Map<String, List<SectionVO>> oldTableSectionsMap = new LinkedHashMap<>();
		Map<String, String> oldTablePrimaryKeyMap = new LinkedHashMap<>();
		populateFieldAndTableDetails(oldPageVo, oldTableSectionsMap, oldTablePrimaryKeyMap);

		Map<String, List<SectionVO>> newTableSectionsMap = new LinkedHashMap<>();
		Map<String, String> newTablePrimaryKeyMap = new LinkedHashMap<>();
		populateFieldAndTableDetails(newPageVo, newTableSectionsMap, newTablePrimaryKeyMap);

		Set<String> oldTableNameSet = oldTableSectionsMap.keySet();
		Set<String> newTableNameSet = newTableSectionsMap.keySet();

		for (Entry<String, List<SectionVO>> entry : oldTableSectionsMap.entrySet()) {
			String tableName = entry.getKey();

			// check each table in new against the old tables
			// if not present, then it is supposed to be deleted, but no action needed at
			// this time
			// if present, then look for field differences (length, required, etc).
			// If the old is required and new is not required, then fine.
			// If the old is not required but the new is required, it needs the table level
			// check on the column for any null values. if the null is present then it can't
			// be changed
			// if the new table has a table that is not present in old, then it is a new
			// table that needs to be created

			if (newTableSectionsMap.containsKey(tableName)) {
				Map<String, FieldConfigVO> oldFieldMap = populateFieldMap(entry.getValue());
				Map<String, FieldConfigVO> newFieldMap = populateFieldMap(newTableSectionsMap.get(tableName));

				compareOldAndNewFieldMap(tableName, oldFieldMap, newFieldMap, ddlStatementsList,
						newPageVo.getManageFlag());
			} else {
				// This table is not in new object, so it should be deleted. Since Yoroapps
				// doesn't drop tables, ignore this
			}
		}

		// Find all the extra new tables
		newTableNameSet.removeAll(oldTableNameSet);
		for (String extraTableName : newTableNameSet) {
			String primaryKeyName = newTablePrimaryKeyMap.get(extraTableName);

			Map<String, FieldConfigVO> newFieldMap = populateFieldMap(newTableSectionsMap.get(extraTableName));
			ddlStatementsList
					.add(getCreateTableScript(extraTableName, primaryKeyName, newFieldMap, newPageVo.getManageFlag()));
		}

		return ddlStatementsList;
	}

	private void compareOldAndNewFieldMap(String tableName, Map<String, FieldConfigVO> oldFieldConfigMap,
			Map<String, FieldConfigVO> newFieldConfigMap, List<String> ddlStatementsList, Boolean isManagedPage)
			throws YoroappsException {
		for (Entry<String, FieldConfigVO> oldFieldVoEntry : oldFieldConfigMap.entrySet()) {
			if (newFieldConfigMap.containsKey(oldFieldVoEntry.getKey())) {
				// Field present in old and new - So look for field differences (length,
				// required, etc).
				validateAndGenerateDDLForMaxLength(oldFieldVoEntry.getValue(),
						newFieldConfigMap.get(oldFieldVoEntry.getKey()), tableName, ddlStatementsList, isManagedPage);
				validateAndGenerateDDLForRequired(oldFieldVoEntry.getValue(),
						newFieldConfigMap.get(oldFieldVoEntry.getKey()), tableName, ddlStatementsList, isManagedPage);
			} else {
				// Field has been removed in the new mapping. Should be set to Null as the
				// column can't be dropped
				StringBuilder sql = new StringBuilder();
				sql.append(ALTER_TABLE).append(tableName).append(ALTER_COLUMN)
						.append(getColumnName(oldFieldVoEntry.getValue().getField().getName(), isManagedPage))
						.append(" DROP NOT NULL");
				ddlStatementsList.add(sql.toString());
			}
		}

		Set<String> newFieldNames = newFieldConfigMap.keySet();
		Set<String> oldFieldNames = oldFieldConfigMap.keySet();

		// Find any new columns
		newFieldNames.removeAll(oldFieldNames);
		if (!newFieldNames.isEmpty()) {
			for (String columnName : newFieldNames) {
				FieldConfigVO fieldConfigVo = newFieldConfigMap.get(columnName);

				String dbDataType = getDBDataType(fieldConfigVo);

				StringBuilder sql = new StringBuilder();
				sql.append(ALTER_TABLE).append(tableName).append(ADD_COLUMN)
						.append(getColumnName(columnName, isManagedPage)).append(" ").append(dbDataType);
				ddlStatementsList.add(sql.toString());
			}
		}
	}

	private void validateAndGenerateDDLForMaxLength(FieldConfigVO oldFieldConfigVo, FieldConfigVO newFieldConfigVo,
			String tableName, List<String> ddlStatementsList, Boolean isManagedPage) {
		FieldVO oldFieldVo = oldFieldConfigVo.getField();
		FieldVO newFieldVo = newFieldConfigVo.getField();

		int oldLength = -1;
		Optional<ValidationVO> oldMaxLengthValidation = getValidation(oldFieldConfigVo, MAXLENGTH, false);
		if (oldMaxLengthValidation.isPresent()) {
			oldLength = Integer.parseInt(oldMaxLengthValidation.get().getValue());
		}

		if (StringUtils.equalsIgnoreCase(oldFieldConfigVo.getControlType(), CHECKBOX)) {
			oldLength = 5; // boolean so, 5 chars in length
		}

		int newLength = -1;
		Optional<ValidationVO> newMaxLengthValidation = getValidation(newFieldConfigVo, MAXLENGTH, false);
		if (newMaxLengthValidation.isPresent()) {
			newLength = Integer.parseInt(newMaxLengthValidation.get().getValue());
		}

		if (StringUtils.equalsIgnoreCase(newFieldConfigVo.getControlType(), CHECKBOX)) {
			newLength = 5; // boolean so, 5 chars in length
		}

		if (oldLength < newLength && ((StringUtils.equalsIgnoreCase(STRING, oldFieldVo.getDataType())
				&& StringUtils.equalsIgnoreCase(STRING, newFieldVo.getDataType()))
				|| (StringUtils.equalsIgnoreCase(oldFieldConfigVo.getControlType(), CHECKBOX)
						&& StringUtils.equalsIgnoreCase(newFieldConfigVo.getControlType(), CHECKBOX))
				|| (StringUtils.equalsIgnoreCase(oldFieldConfigVo.getControlType(), MULTIPLESELECT)
						&& StringUtils.equalsIgnoreCase(newFieldConfigVo.getControlType(), MULTIPLESELECT))
				|| (StringUtils.equalsIgnoreCase(oldFieldConfigVo.getControlType(), CHIP)
						&& StringUtils.equalsIgnoreCase(newFieldConfigVo.getControlType(), CHIP))
				|| (StringUtils.equalsIgnoreCase(oldFieldConfigVo.getControlType(), TEXTAREA)
						&& StringUtils.equalsIgnoreCase(newFieldConfigVo.getControlType(), TEXTAREA)))) {
			// Do the change here
			StringBuilder sql = new StringBuilder();
			sql.append(ALTER_TABLE).append(tableName).append(ALTER_COLUMN)
					.append(getColumnName(newFieldVo.getName(), isManagedPage)).append(" TYPE varchar (")
					.append(newLength).append(")");
			ddlStatementsList.add(sql.toString());
		}
	}

	private void validateAndGenerateDDLForRequired(FieldConfigVO oldFieldConfigVo, FieldConfigVO newFieldConfigVo,
			String tableName, List<String> ddlStatementsList, Boolean isManagedPage) throws YoroappsException {
		Optional<ValidationVO> oldRequiredValidation = getValidation(oldFieldConfigVo, REQUIRED, true);
		Optional<ValidationVO> newRequiredValidation = getValidation(newFieldConfigVo, REQUIRED, true);

		if (oldRequiredValidation.isPresent() || newRequiredValidation.isPresent()) {
			FieldVO newFieldVo = newFieldConfigVo.getField();

			if (newRequiredValidation.isPresent() && !oldRequiredValidation.isPresent()) {
				// Add NOT NULL to the column but need to make sure that the column doesn't have
				// any null values
				StringBuilder validationSql = new StringBuilder();
				validationSql.append("select 1 from ").append(tableName).append(WHERE)
						.append(getColumnName(newFieldVo.getName(), isManagedPage)).append(" is null ");

				if (BooleanUtils.isTrue(isManagedPage)) {
					validationSql.append(" and tenant_id = ? and active_flag = ? ");
				}
				validationSql.append(" limit 2");

				Query nativeQuery = entityManager.createNativeQuery(validationSql.toString());
				if (BooleanUtils.isTrue(isManagedPage)) {
					nativeQuery.setParameter(1, YorosisContext.get().getTenantId());
					nativeQuery.setParameter(2, YoroappsConstants.YES);
				}

				List<?> resultList = nativeQuery.getResultList();
				if (resultList != null && resultList.isEmpty()) {
					StringBuilder sql = new StringBuilder();
					sql.append(ALTER_TABLE).append(tableName).append(ALTER_COLUMN)
							.append(getColumnName(newFieldVo.getName(), isManagedPage)).append(" SET NOT NULL");
					ddlStatementsList.add(sql.toString());
				} else {
					throw new YoroappsException(String.format(
							"Column: %s has null values which cannot be modified to a required for the existing data",
							newFieldVo.getLabel().getLabelName()));
				}
			} else if (!newRequiredValidation.isPresent()) {
				// Make the column as NULLABLE
				StringBuilder sql = new StringBuilder();
				sql.append(ALTER_TABLE).append(tableName).append(ALTER_COLUMN)
						.append(getColumnName(newFieldVo.getName(), isManagedPage)).append(" DROP NOT NULL");
				ddlStatementsList.add(sql.toString());
			}
		}
	}

	private void deleteData(String tableName, String idValue, Boolean isManagedPage) {
		List<DataObject> valueList = new ArrayList<>();
		StringBuilder builder = new StringBuilder();
		builder.append("delete from ").append(tableName).append(WHERE).append("uuid").append(" = ? ");
		if (BooleanUtils.isTrue(isManagedPage)) {
			builder.append(" and tenant_id = ? and active_flag = ?");
		}
		valueList.add(DataObject.builder().type(StandardBasicTypes.UUID_CHAR).value(UUID.fromString(idValue)).build());
		if (BooleanUtils.isTrue(isManagedPage)) {
			StringType stringType = StandardBasicTypes.STRING;

			valueList.add(DataObject.builder().type(stringType).value(YorosisContext.get().getTenantId()).build());
			valueList.add(DataObject.builder().type(stringType).value(YoroappsConstants.YES).build());
		}

		processDBQuery(builder, valueList);
	}

	@Transactional
	public YoroResponse deleteData(JSONObject request) throws IOException {
		PageVO pageVO = pageService.getPageDetails(UUID.fromString(request.getString(YOROSIS_PAGE_ID)));
		YoroResponseBuilder responseBuilder = YoroResponse.builder().messageType(YoroResponse.SUCCESS);
		String message = "";
		List<SectionVO> mainSections = pageVO.getSections();

		if (!mainSections.isEmpty()) {

			String appPrefix = "";
			if (BooleanUtils.isTrue(pageVO.getManageFlag())) {
				appPrefix = applicationService.getApplicationPrefix(pageVO.getApplicationId()) + "_";
			}

			if (request.has("uuid")) {
				deleteData(appPrefix + mainSections.get(0).getTableName(), request.get("uuid").toString(),
						pageVO.getManageFlag());
				message = "Data deleted successfully";
			} else {
				message = "Column does not exist";
			}
			responseBuilder.message(message);
		}
		return responseBuilder.build();
	}

	public ServiceTokenVO loadServiceTokenByUserName(String tenantId) {

		ServiceToken serviceToken = serviceTokenRepository.getInternalServiceTokenByTenantId(tenantId);
		if (serviceToken == null || StringUtils.isBlank(serviceToken.getApiKey())
				|| StringUtils.isBlank(serviceToken.getSecretKey())) {
			return null;
		}
		if (StringUtils.isNotEmpty(serviceToken.getSecretKey())) {
			// String secretKey = jasyptEncryptor.decrypt(serviceToken.getSecretKey());

			return ServiceTokenVO.builder().apiKey(serviceToken.getApiKey()).secretKey(serviceToken.getSecretKey())
					.build();
		}

		return null;

	}

	private JsonNode setImageKey(JsonNode taskData, List<MultipartFile> fileList) throws IOException {
		if (taskData != null) {
			Iterator<String> fieldNames = taskData.fieldNames();
			while (fieldNames.hasNext()) {
				String fieldName = fieldNames.next();
				JsonNode field = taskData.get(fieldName);
				if (field.isArray()) {
					setNormalFieldImage(taskData, fieldName);
				}
			}
		}
		return taskData;
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

	private void setNormalFieldImage(JsonNode taskData, String fieldName) throws IOException {
		boolean isRepeatableSection = false;
		boolean isS3Added = false;
		if (!CollectionUtils.isEmpty(taskData.findValues(fieldName))) {
			List<JsonNode> listAssigneeGroups = taskData.findValues(fieldName);
			List<String> imageKeyList = new ArrayList<>();
			for (JsonNode assigneeGroups : listAssigneeGroups) {
				for (JsonNode assigneeGroup : assigneeGroups) {
					Iterator<String> arrayFieldNames = assigneeGroup.fieldNames();
					if (!arrayFieldNames.hasNext()) {
						if (StringUtils.startsWith(assigneeGroup.asText(), "data:image/")) {
							String imageKeyThumbnail = getImageThumbNail(assigneeGroup.asText());
							isS3Added = true;
							imageKeyList.add(imageKeyThumbnail);
						}
					} else if (!isRepeatableSection) {
						isRepeatableSection = true;
						setRepeatableImage(taskData.get(fieldName));
					}
				}
			}
			if (isS3Added && !CollectionUtils.isEmpty(imageKeyList)) {
				change(taskData, fieldName, imageKeyList);
			}
		}
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

	private void setRepeatableImage(JsonNode field) throws IOException {
		for (int i = 0; i < field.size(); i++) {
			Iterator<String> arrayFieldNames = field.get(i).fieldNames();
			while (arrayFieldNames.hasNext()) {
				String arrayFieldName = arrayFieldNames.next();
				if (field.get(i).get(arrayFieldName) != null && (field.get(i).get(arrayFieldName).isArray())) {
					setNormalFieldImage(field.get(i), arrayFieldName);
				}
			}
		}
	}

	private void change(JsonNode parent, String fieldName, List<String> newValue) {
		ArrayNode arrayNode = objMapper.createArrayNode();
		for (String item : newValue) {
			arrayNode.add(item);
		}
		if (parent.has(fieldName)) {
			((ObjectNode) parent).putArray(fieldName).addAll(arrayNode);
		}
		// Now, recursively invoke this method on all properties
		for (JsonNode child : parent) {
			change(child, fieldName, newValue);
		}
	}

	/*
	 * public PageDataVO getData(String pageId, Long dataId, String parameterName) {
	 * 
	 * return null; }
	 */

	private boolean checkFileType(String fileName) {
		List<String> splitList = new ArrayList<>();
		String[] splitArray = StringUtils.split(fileName, ".");
		splitList = Arrays.asList(splitArray);
		if (splitList != null && !splitList.isEmpty()) {
			String fileType = splitList.get(splitList.size() - 1);
			if (StringUtils.isNotEmpty(fileType) && !StringUtils.equalsAnyIgnoreCase(fileType, "exe", "jar", "msi",
					"zip", "js", "apk", "bin", "iso")) {
				return true;
			}
		}
		return false;
	}

	@Transactional
	public ResponseStringVO saveAttachments(String name, MultipartFile file) throws IOException, YoroappsException {
		if (checkFileType(file.getOriginalFilename())) {
			String fileKey = new StringBuilder(UUID.randomUUID().toString()).append(LocalTime.now()).toString();
			FileUploadVO fileUploadVO = FileUploadVO.builder().key(fileKey).contentSize(file.getSize())
					.inputStream(file.getBytes()).contentType(file.getContentType()).build();
			fileManagerService.saveUploadFile(fileUploadVO);

			return ResponseStringVO.builder().response(fileKey).build();
		} else {
			throw new YoroappsException("Executable files are not allowed");
		}
	}

	@Transactional
	public byte[] getFile(String filepath) throws IOException {
		if (filepath != null) {
			return fileManagerService.downloadFile(filepath);
		}
		return null;

	}

	@Transactional
	public ResponseStringVO deleteFile(List<FilesVO> filesVO) {
		if (filesVO != null) {
			for (FilesVO fileVO : filesVO) {
				fileManagerService.deleteFile(fileVO.getFilePath());
			}
			return ResponseStringVO.builder().response(String.format("Files Removed Successfully")).build();
		}
		return ResponseStringVO.builder().response("Invalid File").build();
	}

}