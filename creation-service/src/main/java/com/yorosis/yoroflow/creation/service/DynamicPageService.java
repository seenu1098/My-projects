package com.yorosis.yoroflow.creation.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Optional;
import java.util.Set;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import javax.transaction.Transactional;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yorosis.yoroapps.vo.EnableRowLevelComputationVO;
import com.yorosis.yoroapps.vo.FieldConfigVO;
import com.yorosis.yoroapps.vo.FieldVO;
import com.yorosis.yoroapps.vo.LabelTypeVO;
import com.yorosis.yoroapps.vo.PageFieldVO;
import com.yorosis.yoroapps.vo.PageVO;
import com.yorosis.yoroapps.vo.RowsVO;
import com.yorosis.yoroapps.vo.SectionVO;
import com.yorosis.yoroapps.vo.TableVO;
import com.yorosis.yoroapps.vo.ValidationVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.exception.YoroappsException;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class DynamicPageService {

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
	private static final String TRUE = "true";
	private static final String FALSE = "false";

	@Autowired
	private PageService pageService;

	@Autowired
	private EntityManager entityManager;

	@Autowired
	private ApplicationService applicationService;

	@PersistenceContext
	private EntityManager em;

	private String getDBDataType(FieldConfigVO fieldConfigVo)
			throws JsonMappingException, JsonProcessingException, YoroappsException {
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
				|| StringUtils.equalsAnyIgnoreCase(fieldConfigVo.getControlType(), MULTIPLESELECT, TEXTAREA)) {
			value = "varchar (" + length + ")";
		} else if (StringUtils.equalsIgnoreCase(INTEGER, fieldVo.getDataType())) {
			value = "int4";
		} else if (StringUtils.equalsIgnoreCase(LONG, fieldVo.getDataType())) {
			value = "int8";
		} else if (StringUtils.equalsIgnoreCase(FLOAT, fieldVo.getDataType())) {
			value = "float8";
		} else if (StringUtils.equalsIgnoreCase(DATE, fieldVo.getDataType())) {
			value = "timestamp";
		} else if (StringUtils.equalsIgnoreCase(FILE_UPLOAD, fieldConfigVo.getControlType())
				|| StringUtils.equalsIgnoreCase(SIGNATURE, fieldConfigVo.getControlType())) {
			length = 1000;
			value = "varchar (" + length + ")";
		} else if (StringUtils.equalsAnyIgnoreCase(fieldConfigVo.getControlType(), CHIP)) {
			if (!fieldConfigVo.getField().getValidations().isEmpty()) {
				for (int i = 0; i < fieldConfigVo.getField().getValidations().size(); i++) {
					if (StringUtils.equals(fieldConfigVo.getField().getValidations().get(i).getType(), MAXLENGTH)) {
						length = Integer.parseInt(fieldConfigVo.getField().getValidations().get(i).getValue())
								* fieldVo.getChipSize();
						value = "varchar (" + (length + fieldVo.getChipSize()) + ")";
					}
				}

			} else {
				value = "varchar (" + length + ")";
			}

		}

		return value + required;
	}

	private void createOrUpdateTables(List<String> ddlList) throws YoroappsException {
		for (String ddlStatement : ddlList) {
			Query nativeQuery = em.createNativeQuery(ddlStatement);
			log.info("Now executing: {}", ddlStatement);
			nativeQuery.executeUpdate();
		}

	}

	private Optional<ValidationVO> getValidation(FieldConfigVO fieldConfigVo, String type, boolean okIfNull) {
		FieldVO fieldVo = fieldConfigVo.getField();
		if (fieldVo.getValidations() != null && !fieldVo.getValidations().isEmpty()) {
			return fieldVo.getValidations().stream().filter(p -> (okIfNull || StringUtils.isNotBlank(p.getValue()))
					&& StringUtils.equalsIgnoreCase(type, p.getType())).findFirst();
		}

		return Optional.empty();
	}

	@Transactional
	public List<PageFieldVO> getFieldList(String pageIdentifier, Long version) throws IOException, YoroappsException {
		if (StringUtils.isNotBlank(pageIdentifier) && version != null) {
			List<PageFieldVO> fieldNamesList = new ArrayList<>();
			PageVO pageVO = pageService.getPageDetailsByPageIdentifier(pageIdentifier, version);

			if (pageVO != null) {
				String appPrefix = "";

				if (BooleanUtils.isTrue(pageVO.getManageFlag())) {
					appPrefix = applicationService.getApplicationPrefix(pageVO.getApplicationId()) + "_";
				}

				List<SectionVO> mainSections = pageVO.getSections();

				fieldNamesList.add(PageFieldVO.builder().controlType("primaryKey").datatype("uuid").fieldId("uuid")
						.fieldName("Primary Key").unique(TRUE).required(TRUE).fieldSize(10L).build());

				if (!mainSections.isEmpty()) {
					Map<String, List<SectionVO>> tableSectionsMap = new LinkedHashMap<>();
					Map<String, String> tablePrimaryKeyMap = new LinkedHashMap<>();

					SectionVO parentSectionVo = SectionVO.builder()
							.tableName(appPrefix + mainSections.get(0).getTableName()).build();
					resolveSections(parentSectionVo, mainSections, tableSectionsMap, tablePrimaryKeyMap, appPrefix,
							false);
					fieldNamesList = getFieldNameList(tableSectionsMap, pageVO, fieldNamesList, appPrefix);
				}
			} else {
				fieldNamesList = pageService.getFieldList(pageIdentifier);
			}
			return fieldNamesList;
		} else {
			return Collections.emptyList();
		}

	}

	public List<PageFieldVO> getFieldNameList(Map<String, List<SectionVO>> tableSectionsMap, PageVO pageVO,
			List<PageFieldVO> fieldNamesList, String appPrefix) throws JsonProcessingException, YoroappsException {
		String required = "";

		// Only the main section... No Nested at this time
		if (!tableSectionsMap.isEmpty()) {
			Map<String, FieldConfigVO> fieldMap = populateFieldMap(
					tableSectionsMap.entrySet().iterator().next().getValue(), appPrefix, pageVO);

			for (Entry<String, FieldConfigVO> fieldNamesEntry : fieldMap.entrySet()) {
				FieldConfigVO fieldConfigVo = fieldNamesEntry.getValue();
				String fieldName = fieldNamesEntry.getKey();

				LabelTypeVO label = fieldNamesEntry.getValue().getField().getLabel();
				if (label != null && StringUtils.isNotBlank(label.getLabelName())) {
					fieldName = label.getLabelName();
				}

				if (fieldNamesEntry.getValue().getField().getValidations() != null && StringUtils.equalsAnyIgnoreCase(
						fieldNamesEntry.getValue().getField().getValidations().get(0).getType(), REQUIRED)) {
					required = TRUE;
				} else {
					required = FALSE;
				}

				PageFieldVO pageFieldVO = PageFieldVO.builder().datatype(getDatatype(fieldConfigVo))
						.fieldId(getColumnName(fieldNamesEntry.getKey(), pageVO.getManageFlag())).fieldName(fieldName)
						.fieldSize(100L).controlType(fieldConfigVo.getControlType())
						.pageFieldName(fieldNamesEntry.getKey())
						.unique(booleanToChar(fieldNamesEntry.getValue().getField().isUnique())).required(required)
						.build();
				if (StringUtils.equals(fieldConfigVo.getControlType(), "date")
						&& StringUtils.isNotBlank(fieldConfigVo.getField().getDateFormat())) {
					pageFieldVO.setDateFormat(fieldConfigVo.getField().getDateFormat());
				}
				fieldNamesList.add(pageFieldVO);
			}
		}
		return fieldNamesList;
	}

	@Transactional
	public Map<String, List<PageFieldVO>> getFieldListForSubSection(String pageIdentifier, Long version)
			throws IOException, YoroappsException {
		Map<String, List<PageFieldVO>> subSection = new LinkedHashMap<>();
		if (StringUtils.isNotBlank(pageIdentifier) && version != null) {
			PageVO pageVO = pageService.getPageDetailsByPageIdentifier(pageIdentifier, version);
			List<SectionVO> mainSections = pageVO.getSections();
			List<PageFieldVO> fieldNamesList = new ArrayList<>();
			List<PageFieldVO> tableControlFieldNamesList = new ArrayList<>();
			List<PageFieldVO> childSectionFieldNamesList = new ArrayList<>();
			List<String> repeatableFieldNamesList = new ArrayList<>();
			if (!mainSections.isEmpty()) {
				Map<String, List<SectionVO>> tableSectionsMap = new LinkedHashMap<>();
				Map<String, String> tablePrimaryKeyMap = new LinkedHashMap<>();
				String appPrefix = "";
				String required = "";
				if (BooleanUtils.isTrue(pageVO.getManageFlag())) {
					appPrefix = applicationService.getApplicationPrefix(pageVO.getApplicationId()) + "_";
				}
				SectionVO parentSectionVo = SectionVO.builder()
						.tableName(appPrefix + mainSections.get(0).getTableName()).build();
				resolveSections(parentSectionVo, mainSections, tableSectionsMap, tablePrimaryKeyMap, appPrefix, true);
				// Only the main section... No Nested at this time
				if (!tableSectionsMap.isEmpty()) {
					for (Entry<String, List<SectionVO>> entry : tableSectionsMap.entrySet()) {
						List<TableVO> tableList = checkTableControlList(entry.getValue(), appPrefix);
						if (!tableList.isEmpty()) {
							for (TableVO table : tableList) {
								Map<String, FieldConfigVO> tableFieldMap = table.getFieldMap();

//						TableVO table = checkTableControl(entry.getValue(), appPrefix);

//						if (!tableFieldMap.isEmpty()) {
								for (Entry<String, FieldConfigVO> fieldNamesEntry : tableFieldMap.entrySet()) {
									FieldConfigVO fieldConfigVo = fieldNamesEntry.getValue();
									String fieldName = fieldNamesEntry.getKey();
									LabelTypeVO label = fieldNamesEntry.getValue().getField().getLabel();
									if (label != null && StringUtils.isNotBlank(label.getLabelName())) {
										fieldName = label.getLabelName();
									}
									if (fieldNamesEntry.getValue().getField().getValidations() != null
											&& StringUtils.equalsAnyIgnoreCase(fieldNamesEntry.getValue().getField()
													.getValidations().get(0).getType(), REQUIRED)) {
										required = "true";
									} else {
										required = "false";
									}

									PageFieldVO pageFieldVO = PageFieldVO.builder().datatype(getDatatype(fieldConfigVo))
											.fieldId(fieldNamesEntry.getKey()).fieldName(fieldName).fieldSize(100L)
											.controlType(fieldConfigVo.getControlType())
											.pageFieldName(fieldNamesEntry.getKey())
											.unique(booleanToChar(fieldNamesEntry.getValue().getField().isUnique()))
											.required(required).repeatableFieldName(table.getTableName())
											.repeatableFieldId(table.getTableId()).build();
									if (StringUtils.equals(fieldConfigVo.getControlType(), "date")
											&& StringUtils.isNotBlank(fieldConfigVo.getField().getDateFormat())) {
										pageFieldVO.setDateFormat(fieldConfigVo.getField().getDateFormat());
									}
									tableControlFieldNamesList.add(pageFieldVO);
								}
							}
//							subSection.put("tableControl", tableControlFieldNamesList);
						}

						Map<String, FieldConfigVO> fieldMap = populateFieldMap(entry.getValue(), appPrefix, pageVO);
						for (Entry<String, FieldConfigVO> fieldNamesEntry : fieldMap.entrySet()) {
							FieldConfigVO fieldConfigVo = fieldNamesEntry.getValue();
							if (!StringUtils.equalsIgnoreCase(fieldConfigVo.getControlType(), "label")) {
								String fieldName = fieldNamesEntry.getKey();
								LabelTypeVO label = fieldNamesEntry.getValue().getField().getLabel();
								if (label != null && StringUtils.isNotBlank(label.getLabelName())) {
									fieldName = label.getLabelName();
								}
								if (fieldNamesEntry.getValue().getField().getValidations() != null
										&& StringUtils.equalsAnyIgnoreCase(
												fieldNamesEntry.getValue().getField().getValidations().get(0).getType(),
												REQUIRED)) {
									required = "true";
								} else {
									required = "false";
								}
								// getColumnName(fieldNamesEntry.getKey(), pageVO.getManageFlag())
								if (fieldConfigVo.isChildSection()) {
									if (!StringUtils.isEmpty(entry.getValue().get(0).getRepeatableName())) {
										repeatableFieldNamesList.add(entry.getValue().get(0).getRepeatableName());

										PageFieldVO pageFieldVO = PageFieldVO.builder()
												.datatype(getDatatype(fieldConfigVo)).fieldId(fieldNamesEntry.getKey())
												.fieldName(fieldName).fieldSize(100L)
												.controlType(fieldConfigVo.getControlType())
												.pageFieldName(fieldNamesEntry.getKey())
												.unique(booleanToChar(fieldNamesEntry.getValue().getField().isUnique()))
												.required(required)
												.repeatableFieldId(entry.getValue().get(0).getRepeatableName())
												.repeatableFieldName(entry.getValue().get(0).getLogicalSectionName())
												.build();
										if (StringUtils.equals(fieldConfigVo.getControlType(), "date")
												&& StringUtils.isNotBlank(fieldConfigVo.getField().getDateFormat())) {
											pageFieldVO.setDateFormat(fieldConfigVo.getField().getDateFormat());
										}
										childSectionFieldNamesList.add(pageFieldVO);
									}
								} else {
									PageFieldVO pageFieldVO = PageFieldVO.builder().datatype(getDatatype(fieldConfigVo))
											.fieldId(fieldNamesEntry.getKey()).fieldName(fieldName).fieldSize(100L)
											.controlType(fieldConfigVo.getControlType())
											.pageFieldName(fieldNamesEntry.getKey())
											.unique(booleanToChar(fieldNamesEntry.getValue().getField().isUnique()))
											.required(required).build();
									if (StringUtils.equals(fieldConfigVo.getControlType(), "date")
											&& StringUtils.isNotBlank(fieldConfigVo.getField().getDateFormat())) {
										pageFieldVO.setDateFormat(fieldConfigVo.getField().getDateFormat());
									}
									fieldNamesList.add(pageFieldVO);
								}
							}
						}
					}
					if (!fieldNamesList.isEmpty())
						subSection.put("mainSection", fieldNamesList);
					if (!childSectionFieldNamesList.isEmpty())
						subSection.put("subSection", childSectionFieldNamesList);
					if (!tableControlFieldNamesList.isEmpty())
						subSection.put("tableControl", tableControlFieldNamesList);
				}
			}
		}
		return subSection;
	}

	private String booleanToChar(boolean value) {
		return value ? YoroappsConstants.YES : YoroappsConstants.NO;
	}

	@Transactional
	public List<String> generateUpdateTable(PageVO oldPageVo, PageVO newPageVo)
			throws YoroappsException, JsonMappingException, JsonProcessingException {
		List<String> ddlStatementsList = new ArrayList<>();
		if (BooleanUtils.isFalse(newPageVo.getManageFlag())) {
			return ddlStatementsList;
		}

		String appPrefix = "";
		if (BooleanUtils.isTrue(newPageVo.getManageFlag())) {
			appPrefix = applicationService.getApplicationPrefix(newPageVo.getApplicationId()) + "_";
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
				Map<String, FieldConfigVO> oldFieldMap = populateFieldMap(entry.getValue(), appPrefix, oldPageVo);
				Map<String, FieldConfigVO> newFieldMap = populateFieldMap(newTableSectionsMap.get(tableName), appPrefix,
						newPageVo);

				compareOldAndNewFieldMap(tableName, oldFieldMap, newFieldMap, ddlStatementsList,
						newPageVo.getManageFlag());

				String tableControlName = checkTableControl(entry.getValue(), appPrefix).getTableId();
				if (tableControlName != null) {
					Map<String, FieldConfigVO> oldFieldMapForTable = checkTableControl(entry.getValue(), appPrefix)
							.getFieldMap();
					Map<String, FieldConfigVO> newFieldMapForTable = checkTableControl(
							newTableSectionsMap.get(tableName), appPrefix).getFieldMap();
					compareOldAndNewFieldMap(appPrefix + tableControlName.trim().toLowerCase(), oldFieldMapForTable,
							newFieldMapForTable, ddlStatementsList, newPageVo.getManageFlag());
				}
			} else {
				// This table is not in new object, so it should be deleted. Since Yoroapps
				// doesn't drop tables, ignore this
			}
		}

		// Find all the extra new tables
		newTableNameSet.removeAll(oldTableNameSet);
		for (String extraTableName : newTableNameSet) {
			String primaryKeyName = newTablePrimaryKeyMap.get(extraTableName);

			Map<String, FieldConfigVO> newFieldMap = populateFieldMap(newTableSectionsMap.get(extraTableName), null,
					null);
			ddlStatementsList
					.add(getCreateTableScript(extraTableName, primaryKeyName, newFieldMap, newPageVo.getManageFlag()));
			addForeignKeyColumnScript(extraTableName, newTableSectionsMap.get(extraTableName), primaryKeyName,
					ddlStatementsList);
			addForeignKeyConstraitScript(newPageVo, extraTableName, newTableSectionsMap.get(extraTableName),
					primaryKeyName, ddlStatementsList);
		}

		return ddlStatementsList;
	}

	private List<TableVO> checkTableControlList(List<SectionVO> sectionList, String appPrefix)
			throws JsonMappingException, JsonProcessingException, YoroappsException {
		String tableId = null;
		String tableName = null;
		Map<String, FieldConfigVO> columnMap = new LinkedHashMap<>();
		List<TableVO> tableVoList = new ArrayList<>();
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
						tableName = tableVO.getTableName();
						for (FieldConfigVO fields : tableVO.getColumns()) {
							FieldVO tableField = fields.getField();
							if (tableField != null && tableField.getName() != null) {
								columnMap.put(tableField.getName(), fields);
							}
						}
						if (tableVO.getEnableRowLevelComputation() != null) {
							EnableRowLevelComputationVO enableRowLevelComputation = tableVO
									.getEnableRowLevelComputation();
							if (BooleanUtils.isTrue(enableRowLevelComputation.getOption())) {
								LabelTypeVO labelTypeVO = LabelTypeVO.builder()
										.labelName(enableRowLevelComputation.getComputationLabelName()).build();
								FieldVO field = FieldVO.builder()
										.name(enableRowLevelComputation.getComputationFieldName()).label(labelTypeVO)
										.build();
								FieldConfigVO build = FieldConfigVO.builder().controlType("input").field(field).build();
								columnMap.put(field.getName(), build);
							}
						}
						tableVoList.add(
								TableVO.builder().fieldMap(columnMap).tableId(tableId).tableName(tableName).build());
					}
				}
			}
		}
		return tableVoList;
	}

	private TableVO checkTableControl(List<SectionVO> sectionList, String appPrefix)
			throws JsonMappingException, JsonProcessingException, YoroappsException {
		String tableId = null;
		String tableName = null;
		Map<String, FieldConfigVO> columnMap = new LinkedHashMap<>();
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
						tableName = tableVO.getTableName();
						for (FieldConfigVO fields : tableVO.getColumns()) {
							FieldVO tableField = fields.getField();
							if (tableField != null && tableField.getName() != null) {
								columnMap.put(tableField.getName(), fields);
							}
						}
						if (tableVO.getEnableRowLevelComputation() != null) {
							EnableRowLevelComputationVO enableRowLevelComputation = tableVO
									.getEnableRowLevelComputation();
							if (BooleanUtils.isTrue(enableRowLevelComputation.getOption())) {
								LabelTypeVO labelTypeVO = LabelTypeVO.builder()
										.labelName(enableRowLevelComputation.getComputationLabelName()).build();
								FieldVO field = FieldVO.builder()
										.name(enableRowLevelComputation.getComputationFieldName()).label(labelTypeVO)
										.build();
								FieldConfigVO build = FieldConfigVO.builder().controlType("input").field(field).build();
								columnMap.put(field.getName(), build);
							}
						}
					}
				}
			}
		}
		return TableVO.builder().fieldMap(columnMap).tableId(tableId).tableName(tableName).build();
	}

	private void compareOldAndNewFieldMap(String tableName, Map<String, FieldConfigVO> oldFieldConfigMap,
			Map<String, FieldConfigVO> newFieldConfigMap, List<String> ddlStatementsList, Boolean isManagedPage)
			throws YoroappsException, JsonMappingException, JsonProcessingException {
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

		if (StringUtils.equalsIgnoreCase(newFieldConfigVo.getControlType(), CHIP)) {
			if (!newFieldConfigVo.getField().getValidations().isEmpty()) {
				for (int i = 0; i < newFieldConfigVo.getField().getValidations().size(); i++) {
					if (StringUtils.equals(newFieldConfigVo.getField().getValidations().get(i).getType(), MAXLENGTH)) {
						newLength = (Integer.parseInt(newFieldConfigVo.getField().getValidations().get(i).getValue())
								* newFieldVo.getChipSize()) + newFieldVo.getChipSize();
					}
				}
			}
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

	private void resolveSections(SectionVO parentSectionVo, List<SectionVO> childSections,
			Map<String, List<SectionVO>> tableSectionsMap, Map<String, String> tablePrimaryKeyMap, String appPrefix,
			boolean intialValue) {
		if (childSections != null && !childSections.isEmpty()) {
			for (SectionVO sectionVO : childSections) {
				String tableName = null;
				if (StringUtils.isNotBlank(sectionVO.getTableName())) {
					tableName = sectionVO.getTableName();
				} else if (parentSectionVo != null && StringUtils.isNotBlank(parentSectionVo.getTableName())) {
					tableName = parentSectionVo.getTableName();
				}

				if (StringUtils.isBlank(tableName) && !intialValue) {
					throw new IllegalArgumentException("Invalid section as the table name is empty");
				}
				if (StringUtils.isNotBlank(tableName)) {
					tableName = appPrefix + tableName.trim().toLowerCase();
					tableSectionsMap.computeIfAbsent(tableName, list -> new ArrayList<>()).add(sectionVO);
					tablePrimaryKeyMap.computeIfAbsent(tableName, list -> sectionVO.getPrimaryKey());

					resolveSections(sectionVO, sectionVO.getSections(), tableSectionsMap, tablePrimaryKeyMap, appPrefix,
							intialValue);
				}
			}
		}
	}

	private Map<String, FieldConfigVO> populateFieldMap(List<SectionVO> sectionList, String appPrefix, PageVO pageVO)
			throws JsonMappingException, JsonProcessingException, YoroappsException {
		Map<String, FieldConfigVO> columnMap = new LinkedHashMap<>();

		for (SectionVO tableSectionVo : sectionList) {
			List<RowsVO> rows = tableSectionVo.getRows();

			for (RowsVO rowsVo : rows) {
				List<FieldConfigVO> columns = rowsVo.getColumns();
				for (FieldConfigVO fieldConfigVo : columns) {
					if (BooleanUtils.isTrue(tableSectionVo.getChildSection())
							&& BooleanUtils.isTrue(tableSectionVo.getRepeatable())) {
						fieldConfigVo.setChildSection(true);
					} else {
						fieldConfigVo.setChildSection(false);
					}
					FieldVO field = fieldConfigVo.getField();
					if (field != null && field.getName() != null) {
						columnMap.put(field.getName(), fieldConfigVo);
					}
				}
			}
		}
		return columnMap;
	}

	public void createTableControl(String appPrefix, PageVO pageVo)
			throws JsonMappingException, JsonProcessingException, YoroappsException {
		List<String> ddlStatementsList = new ArrayList<>();
		ObjectMapper mapper = new ObjectMapper();
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		Map<String, FieldConfigVO> columnMap = new LinkedHashMap<>();
		String tableId = null;
		Map<String, List<SectionVO>> tableSectionsMap = new LinkedHashMap<>();
		Map<String, String> tablePrimaryKeyMap = new LinkedHashMap<>();

		populateFieldAndTableDetails(pageVo, tableSectionsMap, tablePrimaryKeyMap);

		for (Entry<String, List<SectionVO>> entry : tableSectionsMap.entrySet()) {
			for (SectionVO tableSectionVo : entry.getValue()) {
				List<RowsVO> rows = tableSectionVo.getRows();
				for (RowsVO rowsVo : rows) {
					List<FieldConfigVO> columns = rowsVo.getColumns();
					for (FieldConfigVO fieldConfigVo : columns) {
						FieldVO field = fieldConfigVo.getField();
						if (StringUtils.equals(fieldConfigVo.getControlType(), "table")) {
							TableVO tableVO = mapper.readValue(mapper.writeValueAsString(field.getControl()),
									TableVO.class);
							tableId = tableVO.getTableId();
							for (FieldConfigVO fields : tableVO.getColumns()) {
								FieldVO tableField = fields.getField();
								if (tableField != null && tableField.getName() != null) {
									columnMap.put(tableField.getName(), fields);
								}
							}
						}
					}
				}
			}
		}

		if (tableId != null) {
			ddlStatementsList.add(getCreateTableScript(appPrefix + tableId, "id", columnMap, true));
			addForeignKeyColumnScriptForTableControl(appPrefix + pageVo.getPageId(), appPrefix + tableId, "id",
					ddlStatementsList);
			addForeignKeyConstraintScriptForTableControl(appPrefix + pageVo.getPageId(), appPrefix + tableId, "id",
					ddlStatementsList);
			createOrUpdateTables(ddlStatementsList);
		}
	}

	private List<String> addForeignKeyColumnScriptForTableControl(String pageId, String tableName,
			String primaryKeyName, List<String> ddlStatementsList) {
		StringBuilder sql = new StringBuilder();

		sql.append(ALTER_TABLE).append(tableName).append(ADD_COLUMN).append(pageId + "_" + primaryKeyName).append(" ")
				.append("uuid");
		ddlStatementsList.add(sql.toString());

		return ddlStatementsList;

	}

	private List<String> addForeignKeyConstraintScriptForTableControl(String pageId, String tableName,
			String primaryKeyName, List<String> ddlStatementsList) {
		StringBuilder sql = new StringBuilder();
		StringBuilder constraintSql = new StringBuilder();

		constraintSql.append("ALTER TABLE ").append(tableName)
				.append("  DROP CONSTRAINT IF EXISTS fke1g9x7atjagstifalfjcvhltm");
		ddlStatementsList.add(constraintSql.toString());

		sql.append("alter table if exists ").append(tableName)
				.append(" add CONSTRAINT fke1g9x7atjagstifalfjcvhltm FOREIGN KEY ")
				.append("(" + pageId + "_" + primaryKeyName + ")").append(" REFERENCES ").append(pageId + "(uuid)");
		ddlStatementsList.add(sql.toString());
		return ddlStatementsList;

	}

	private String getColumnName(String key, Boolean isManagedPage) {
		if (StringUtils.equalsAnyIgnoreCase(key, "id", "uuid", "tenant_id", "created_by", "created_on", "modified_by",
				"modified_on", "active_flag")) {
			return key;
		}

		if (BooleanUtils.isTrue(isManagedPage)) {
			return "ya_" + key.toLowerCase();
		}

		return key.toLowerCase();
	}

	private String getDatatype(FieldConfigVO fieldConfigVo) {
		FieldVO fieldVo = fieldConfigVo.getField();
		if (StringUtils.equalsIgnoreCase(fieldConfigVo.getControlType(), CHECKBOX)) {
			return STRING;
		} else if (StringUtils.equalsIgnoreCase(STRING, fieldVo.getDataType())
				|| StringUtils.equalsAnyIgnoreCase(fieldConfigVo.getControlType(), CHIP, MULTIPLESELECT, TEXTAREA)) {
			return STRING;
		} else if (StringUtils.equalsAnyIgnoreCase(fieldVo.getDataType(), INTEGER, LONG)) {
			return LONG;
		} else if (StringUtils.equalsIgnoreCase(DATE, fieldVo.getDataType())) {
			return DATE;
		} else if (StringUtils.equalsIgnoreCase(FLOAT, fieldVo.getDataType())) {
			return FLOAT;
		}

		return STRING;
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
			resolveSections(parentSectionVo, mainSections, tableSectionsMap, tablePrimaryKeyMap, appPrefix, false);
		}
	}

	private String getCreateTableScript(String tableName, String primaryKeyName,
			Map<String, FieldConfigVO> fieldConfigMap, Boolean isManagedPage)
			throws JsonMappingException, JsonProcessingException, YoroappsException {
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

//		sql.append("alter table if exists ").append("")
//				.append("add CONSTRAINT fke1g9x7atjagstifalfjcvhltm FOREIGN KEY ").append("grid_id")
//				.append("REFERENCES yoroflow.grids(grid_id)");

		return sql.toString();
	}

	@Transactional
	public List<String> generateCreateTable(PageVO pageVo)
			throws JsonMappingException, JsonProcessingException, YoroappsException {
		List<String> ddlStatementsList = new ArrayList<>();
		if (BooleanUtils.isFalse(pageVo.getManageFlag())) {
			return ddlStatementsList;
		}

		String appPrefix = "";
		if (BooleanUtils.isTrue(pageVo.getManageFlag())) {
			appPrefix = applicationService.getApplicationPrefix(pageVo.getApplicationId()) + "_";
		}

		// Group by table names in section
		Map<String, List<SectionVO>> tableSectionsMap = new LinkedHashMap<>();
		Map<String, String> tablePrimaryKeyMap = new LinkedHashMap<>();

		populateFieldAndTableDetails(pageVo, tableSectionsMap, tablePrimaryKeyMap);

		for (Entry<String, List<SectionVO>> entry : tableSectionsMap.entrySet()) {
			String tableName = entry.getKey();
			Map<String, FieldConfigVO> fieldMap = populateFieldMap(entry.getValue(), appPrefix, pageVo);
			String primaryKeyName = tablePrimaryKeyMap.get(tableName);

			ddlStatementsList.add(getCreateTableScript(tableName, primaryKeyName, fieldMap, pageVo.getManageFlag()));
			addForeignKeyColumnScript(tableName, entry.getValue(), primaryKeyName, ddlStatementsList);
			addForeignKeyConstraitScript(pageVo, tableName, entry.getValue(), primaryKeyName, ddlStatementsList);
		}

		return ddlStatementsList;
	}

	private List<String> addForeignKeyConstraitScript(PageVO pageVo, String tableName, List<SectionVO> sectionList,
			String primaryKeyName, List<String> ddlStatementsList) {
		StringBuilder sql = new StringBuilder();
		StringBuilder constraintSql = new StringBuilder();
		String appPrefix = "";
		if (BooleanUtils.isTrue(pageVo.getManageFlag())) {
			appPrefix = applicationService.getApplicationPrefix(pageVo.getApplicationId()) + "_";
		}
		for (SectionVO tableSectionVo : sectionList) {
			if (BooleanUtils.isTrue(tableSectionVo.getChildSection())) {

				constraintSql.append("ALTER TABLE ").append(tableName)
						.append("  DROP CONSTRAINT IF EXISTS fke1g9x7atjagstifalfjcvhltm");
				ddlStatementsList.add(constraintSql.toString());

				sql.append("alter table if exists ").append(tableName)
						.append(" add CONSTRAINT fke1g9x7atjagstifalfjcvhltm FOREIGN KEY ")
						.append("(" + tableSectionVo.getParentTable() + "_" + primaryKeyName + ")")
						.append(" REFERENCES ").append(appPrefix + tableSectionVo.getParentTable() + "(uuid)");
				ddlStatementsList.add(sql.toString());
			}
		}
		return ddlStatementsList;

	}

	private List<String> addForeignKeyColumnScript(String tableName, List<SectionVO> sectionList, String primaryKeyName,
			List<String> ddlStatementsList) {
		StringBuilder sql = new StringBuilder();
		for (SectionVO tableSectionVo : sectionList) {
			if (BooleanUtils.isTrue(tableSectionVo.getChildSection())) {

				sql.append(ALTER_TABLE).append(tableName).append(ADD_COLUMN)
						.append(tableSectionVo.getParentTable() + "_" + primaryKeyName).append(" ").append("uuid");
				ddlStatementsList.add(sql.toString());
			}
		}

		return ddlStatementsList;

	}

}