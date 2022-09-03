package com.yorosis.yoroflow.creation.table.service;

import java.io.IOException;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.hibernate.jpa.TypedParameterValue;
import org.hibernate.type.StandardBasicTypes;
import org.hibernate.type.StringType;
import org.hibernate.type.Type;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.yorosis.yoroapps.entities.TableObjects;
import com.yorosis.yoroapps.entities.TableObjectsColumns;
import com.yorosis.yoroapps.grid.vo.PaginationVO;
import com.yorosis.yoroapps.vo.DataObject;
import com.yorosis.yoroapps.vo.ExcelGenerationVo;
import com.yorosis.yoroapps.vo.ExcelHeadersVo;
import com.yorosis.yoroapps.vo.FilterValueVO;
import com.yorosis.yoroapps.vo.GroupVO;
import com.yorosis.yoroapps.vo.PageVO;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.UsersVO;
import com.yorosis.yoroflow.creation.constants.YoroappsConstants;
import com.yorosis.yoroflow.creation.exception.YoroappsException;
import com.yorosis.yoroflow.creation.repository.TableObjectsColumnsRepository;
import com.yorosis.yoroflow.creation.repository.TableObjectsRepository;
import com.yorosis.yoroflow.creation.service.ExcelGenerationService;
import com.yorosis.yoroflow.creation.service.UserService;
import com.yorosis.yoroflow.creation.table.vo.ColumnDataVO;
import com.yorosis.yoroflow.creation.table.vo.DataTableListVo;
import com.yorosis.yoroflow.creation.table.vo.DataTableVO;
import com.yorosis.yoroflow.creation.table.vo.DeleteDataTableValuesVO;
import com.yorosis.yoroflow.creation.table.vo.ExcelVO;
import com.yorosis.yoroflow.creation.table.vo.MapVO;
import com.yorosis.yoroflow.creation.table.vo.TableListVO;
import com.yorosis.yoroflow.creation.table.vo.TableObjectsColumnsVO;
import com.yorosis.yoroflow.creation.table.vo.TableObjectsVO;
import com.yorosis.yoroflow.creation.table.vo.TableSecurityVOList;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class TableObjectsService {

	@Autowired
	private ExcelGenerationService excelGenerationService;

	private static final String CREATE_TABLE_IF_NOT_EXISTS = "create table IF NOT EXISTS ";
	private static final String ADD_COLUMN = " ADD COLUMN IF NOT EXISTS ";
	private static final String ALTER_COLUMN = " ALTER COLUMN ";
	private static final String DATE = "date";
	private static final String LONG = "long";
	private static final String FLOAT = "float";
	private static final String INTEGER = "integer";
	private static final String STRING = "string";
	private static final String ALTER_TABLE = "alter table ";
	private static final String TIMESTAMP = "timestamp";
	private static final String WHERE = " where ";
	private static final String UUIDTYPE = "uuid";

	private static final Map<String, String> REGEX = populateRegExMap();

	private static HashMap<String, String> populateRegExMap() {
		HashMap<String, String> regEx = new HashMap<>();
		regEx.put("^\\d{8}$", "yyyyMMdd");
		regEx.put("^\\d{1,2}-\\d{1,2}-\\d{4}$", "dd-MM-yyyy");
		regEx.put("^\\d{4}-\\d{1,2}-\\d{1,2}$", "yyyy-MM-dd");
		regEx.put("^\\d{1,2}/\\d{1,2}/\\d{4}$", "MM/dd/yyyy");
		regEx.put("^\\d{4}/\\d{1,2}/\\d{1,2}$", "yyyy/MM/dd");
		regEx.put("^\\d{1,2}\\s[a-z]{3}\\s\\d{4}$", "dd MMM yyyy");
		regEx.put("^\\d{1,2}\\s[a-z]{4,}\\s\\d{4}$", "dd MMMM yyyy");
		regEx.put("^\\d{12}$", "yyyyMMddHHmm");
		regEx.put("^\\d{8}\\s\\d{4}$", "yyyyMMdd HHmm");
		regEx.put("^\\d{1,2}-\\d{1,2}-\\d{4}\\s\\d{1,2}:\\d{2}$", "dd-MM-yyyy HH:mm");
		regEx.put("^\\d{4}-\\d{1,2}-\\d{1,2}\\s\\d{1,2}:\\d{2}$", "yyyy-MM-dd HH:mm");
		regEx.put("^\\d{1,2}/\\d{1,2}/\\d{4}\\s\\d{1,2}:\\d{2}$", "MM/dd/yyyy HH:mm");
		regEx.put("^\\d{4}/\\d{1,2}/\\d{1,2}\\s\\d{1,2}:\\d{2}$", "yyyy/MM/dd HH:mm");
		regEx.put("^\\d{1,2}\\s[a-z]{3}\\s\\d{4}\\s\\d{1,2}:\\d{2}$", "dd MMM yyyy HH:mm");
		regEx.put("^\\d{1,2}\\s[a-z]{4,}\\s\\d{4}\\s\\d{1,2}:\\d{2}$", "dd MMMM yyyy HH:mm");
		regEx.put("^\\d{14}$", "yyyyMMddHHmmss");
		regEx.put("^\\d{8}\\s\\d{6}$", "yyyyMMdd HHmmss");
		regEx.put("^\\d{1,2}-\\d{1,2}-\\d{4}\\s\\d{1,2}:\\d{2}:\\d{2}$", "dd-MM-yyyy HH:mm:ss");
		regEx.put("^\\d{4}-\\d{1,2}-\\d{1,2}\\s\\d{1,2}:\\d{2}:\\d{2}$", "yyyy-MM-dd HH:mm:ss");
		regEx.put("^\\d{1,2}/\\d{1,2}/\\d{4}\\s\\d{1,2}:\\d{2}:\\d{2}$", "MM/dd/yyyy HH:mm:ss");
		regEx.put("^\\d{4}/\\d{1,2}/\\d{1,2}\\s\\d{1,2}:\\d{2}:\\d{2}$", "yyyy/MM/dd HH:mm:ss");
		regEx.put("^\\d{1,2}\\s[a-z]{3}\\s\\d{4}\\s\\d{1,2}:\\d{2}:\\d{2}$", "dd MMM yyyy HH:mm:ss");
		regEx.put("^\\d{1,2}\\s[a-z]{4,}\\s\\d{4}\\s\\d{1,2}:\\d{2}:\\d{2}$", "dd MMMM yyyy HH:mm:ss");
		regEx.put("^(\\d{1,2}\\/){2}\\d{4}\\s+((\\d+)(\\:)){2}\\d+\\s+(am|pm)", "dd-MMM-yyyy hh:mm a");
		regEx.put("^\\d{1,2}\\/\\d{1,2}\\/\\d{4} \\d{1,2}:\\d{1,2} [ap]m$", "MM/dd/yyyy HH:mm a");
		return regEx;

	}

	public static String determineDateFormat(String dateString) {

		for (Map.Entry<String, String> entry : REGEX.entrySet()) {
			if (dateString.toLowerCase().matches(entry.getKey())) {
				return REGEX.get(entry.getKey());
			}
		}
		return null; // Unknown format.
	}

	@PersistenceContext
	private EntityManager entityManager;

	@Autowired
	private TableObjectsRepository tableObjectsRepository;

	@Autowired
	private UserService userService;

	@Autowired
	private TableObjectsColumnsRepository tableObjectsColumnsRepository;

	@Autowired
	private TableObjectsSecurityService tableObjectsSecurityService;

	private String booleanToChar(Boolean value) {
		return BooleanUtils.isTrue(value) ? YoroappsConstants.YES : YoroappsConstants.NO;
	}

	private boolean charToBoolean(String value) {
		return StringUtils.equalsIgnoreCase(YoroappsConstants.YES, value);
	}

	private TableObjects constructTableObjectionsVOTODTO(TableObjectsVO vo) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());

		return TableObjects.builder().tableName(vo.getTableName()).tenantId(YorosisContext.get().getTenantId())
				.createdBy(YorosisContext.get().getUserName()).createdOn(timestamp)
				.tableDescription(vo.getTableDescription()).modifiedBy(YorosisContext.get().getUserName())
				.modifiedOn(timestamp).activeFlag(YoroappsConstants.YES)
				.tableIdentifier("ya_" + vo.getTableIdentifier()).activeFlag(YoroappsConstants.YES)
				.managedFlag(YoroappsConstants.NO).publicTable(booleanToChar(vo.getPublicTable())).build();
	}

	private TableObjectsVO constructTableObjectionsDTOTOVO(TableObjects tableObjections) {
		return TableObjectsVO.builder().tableObjectId(tableObjections.getTableObjectsId())
				.tableName(tableObjections.getTableName()).tableIdentifier(tableObjections.getTableIdentifier())
				.publicTable(charToBoolean(tableObjections.getPublicTable()))
				.tableDescription(tableObjections.getTableDescription()).build();
	}

	private TableObjectsColumns constructTableObjectsColumnsVOTODTO(TableObjectsColumnsVO vo) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());

		return TableObjectsColumns.builder().columnName(vo.getColumnName())
				.isRequired(booleanToChar(vo.getIsRequired()))
				.columnIdentifier(getColumnName(vo.getColumnIdentifier(), true))
				.isUnique(booleanToChar(vo.getIsUnique())).fieldSize(vo.getFieldSize()).dataType(vo.getDataType())
				.tenantId(YorosisContext.get().getTenantId()).createdBy(YorosisContext.get().getUserName())
				.createdOn(timestamp).modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp)
				.activeFlag(YoroappsConstants.YES).build();
	}

	private TableObjectsColumnsVO constructTableObjectsColumnsDTOTOVO(TableObjectsColumns tableObjectsColumns) {

		return TableObjectsColumnsVO.builder().id(tableObjectsColumns.getId())
				.columnIdentifier(tableObjectsColumns.getColumnIdentifier())
				.columnName(tableObjectsColumns.getColumnName())
				.isRequired(charToBoolean(tableObjectsColumns.getIsRequired()))
				.isUnique(charToBoolean(tableObjectsColumns.getIsUnique()))
				.fieldSize(tableObjectsColumns.getFieldSize()).dataType(tableObjectsColumns.getDataType()).build();
	}

	private Set<TableObjectsColumns> constructTableObjectsColumnsSetVOTODTO(List<TableObjectsColumnsVO> vo) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());

		Set<TableObjectsColumns> columnsList = new HashSet<>();
		for (TableObjectsColumnsVO list : vo) {
			TableObjectsColumns tableObjectsColumns = TableObjectsColumns.builder().id(list.getId())
					.columnName(list.getColumnName()).isRequired(booleanToChar(list.getIsRequired()))
					.columnIdentifier(list.getColumnIdentifier()).isUnique(booleanToChar(list.getIsUnique()))
					.fieldSize(list.getFieldSize()).dataType(list.getDataType())
					.tenantId(YorosisContext.get().getTenantId()).createdBy(YorosisContext.get().getUserName())
					.createdOn(timestamp).modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp)
					.activeFlag(YoroappsConstants.YES).build();
			columnsList.add(tableObjectsColumns);

		}
		return columnsList;
	}

	@Transactional
	public ResponseStringVO saveTableObjects(TableObjectsVO vo) {
		Set<TableObjectsColumns> tableObjectsList = new HashSet<>();

		deleteTableObjectColumns(vo);

		if (vo.getTableObjectId() == null) {
			if (StringUtils.isNotBlank(vo.getTableName())) {
				TableObjects name = tableObjectsRepository.findByTableNameAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
						vo.getTableName(), YorosisContext.get().getTenantId(), YoroappsConstants.YES);
				if (name != null) {
					return ResponseStringVO.builder().response("Table Name Already Exist").build();
				}
			}
			TableObjects object = constructTableObjectionsVOTODTO(vo);

			if (vo.getTableObjectsColumns() != null && !vo.getTableObjectsColumns().isEmpty()) {
				for (TableObjectsColumnsVO tableObjectsColumnsVO : vo.getTableObjectsColumns()) {
					TableObjectsColumns tableObjectsColumns = constructTableObjectsColumnsVOTODTO(
							tableObjectsColumnsVO);
					tableObjectsColumns.setTableObjects(object);
					tableObjectsList.add(tableObjectsColumns);
				}
				object.setTableObjectsColumns(tableObjectsList);
			}
			object = tableObjectsRepository.save(object);
			tableObjectsSecurityService.saveDataTableSecurityDefaultGroup(object);
			List<String> ddlStatementsList = new ArrayList<>();
			ddlStatementsList.add(
					getCreateTableScript(object.getTableIdentifier(), UUIDTYPE, object.getTableObjectsColumns(), true));

			createOrUpdateTables(ddlStatementsList);
			return ResponseStringVO.builder().response("Table Objects Created Successfully")
					.tableId(object.getTableObjectsId().toString()).tableName(object.getTableName()).build();
		} else {
			TableObjects object = tableObjectsRepository
					.findByTableObjectsIdAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(vo.getTableObjectId(),
							YoroappsConstants.YES, YorosisContext.get().getTenantId());
			Set<TableObjectsColumns> newTableObjectsColumnsList = constructTableObjectsColumnsSetVOTODTO(
					vo.getTableObjectsColumns());
			object.setTableName(vo.getTableName());
			object.setTableIdentifier(vo.getTableIdentifier());
			object.setTableDescription(vo.getTableDescription());
			object.setPublicTable(booleanToChar(vo.getPublicTable()));
			for (TableObjectsColumnsVO tableObjectsColumnsVO : vo.getTableObjectsColumns()) {
				TableObjectsColumns tableObjectsColumns = null;
				Timestamp timestamp = new Timestamp(System.currentTimeMillis());

				if (tableObjectsColumnsVO.getId() != null) {
					tableObjectsColumns = tableObjectsColumnsRepository
							.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(tableObjectsColumnsVO.getId(),
									YorosisContext.get().getTenantId(), YoroappsConstants.YES);
					tableObjectsColumns.setColumnName(tableObjectsColumnsVO.getColumnName());
					tableObjectsColumns
							.setColumnIdentifier(getColumnName(tableObjectsColumnsVO.getColumnIdentifier(), true));
					tableObjectsColumns.setDataType(tableObjectsColumnsVO.getDataType());
					tableObjectsColumns.setFieldSize(tableObjectsColumnsVO.getFieldSize());
					tableObjectsColumns.setIsRequired(booleanToChar(tableObjectsColumnsVO.getIsRequired()));
					tableObjectsColumns.setIsUnique(booleanToChar(tableObjectsColumnsVO.getIsUnique()));
					tableObjectsColumns.setModifiedBy(YorosisContext.get().getUserName());
					tableObjectsColumns.setModifiedOn(timestamp);

				} else {
					tableObjectsColumns = constructTableObjectsColumnsVOTODTO(tableObjectsColumnsVO);
					tableObjectsColumns.setTableObjects(object);
					tableObjectsList.add(tableObjectsColumns);
				}

				tableObjectsColumnsRepository.save(tableObjectsColumns);
			}
			tableObjectsRepository.save(object);

			ResponseStringVO response = getUpdateTableScript(object.getTableIdentifier(), newTableObjectsColumnsList,
					true);

			if (response.getResponse() != null && response.getResponse().contains("has null values")) {
				return ResponseStringVO.builder().response(response.getResponse()).build();
			} else {
				createOrUpdateTables(response.getQuery());
				return ResponseStringVO.builder().response("Table Objects Updated Successfully")
						.tableId(object.getTableObjectsId().toString()).tableName(object.getTableName()).build();
			}

		}
	}

	@Transactional
	public ResponseStringVO saveTableObjectsList(List<TableObjectsVO> vo) {
		for (TableObjectsVO tableObjectsVO : vo) {
			Set<TableObjectsColumns> tableObjectsList = new HashSet<>();
			if (StringUtils.isNotBlank(tableObjectsVO.getTableName())) {
				TableObjects name = tableObjectsRepository.findByTableNameAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
						tableObjectsVO.getTableName(), YorosisContext.get().getTenantId(), YoroappsConstants.YES);
				if (name == null) {
					TableObjects object = constructTableObjectionsVOTODTO(tableObjectsVO);

					for (TableObjectsColumnsVO tableObjectsColumnsVO : tableObjectsVO.getTableObjectsColumns()) {
						TableObjectsColumns tableObjectsColumns = constructTableObjectsColumnsVOTODTO(
								tableObjectsColumnsVO);
						tableObjectsColumns.setTableObjects(object);
						tableObjectsList.add(tableObjectsColumns);
					}
					object.setTableObjectsColumns(tableObjectsList);

					tableObjectsRepository.save(object);

					List<String> ddlStatementsList = new ArrayList<>();
					ddlStatementsList.add(getCreateTableScript(object.getTableIdentifier(), UUIDTYPE,
							object.getTableObjectsColumns(), true));

					createOrUpdateTables(ddlStatementsList);
				}
			}
		}
		return ResponseStringVO.builder().response("Table Objects Created Successfully").build();
	}

	private void createOrUpdateTables(List<String> ddlList) {
		for (String ddlStatement : ddlList) {
			Query nativeQuery = entityManager.createNativeQuery(ddlStatement);
			nativeQuery.executeUpdate();
		}
	}

	private String getCreateTableScript(String tableName, String primaryKeyName,
			Set<TableObjectsColumns> tableObjectsColumns, Boolean isManagedPage) {
		StringBuilder sql = new StringBuilder();
		sql.append(CREATE_TABLE_IF_NOT_EXISTS).append(YorosisContext.get().getTenantId()).append(".").append(tableName)
				.append("(");

		sql.append(getColumnName(primaryKeyName, isManagedPage)).append(" uuid");
		if (tableObjectsColumns != null) {
			for (TableObjectsColumns columns : tableObjectsColumns) {
				if (columns.getColumnIdentifier() != null) {
					String fieldName = columns.getColumnIdentifier().toLowerCase();

					String dbDataType = getDBDataType(columns);
					sql.append(", ").append(getColumnName(fieldName, isManagedPage)).append(" ").append(dbDataType);
				}
			}
		}

		sql.append(
				", tenant_id varchar(60) not null, created_by varchar(100) not null, created_on timestamp not null, modified_by varchar(100), modified_on timestamp not null, active_flag varchar(1) not null, primary key(")
				.append(primaryKeyName).append(")) ");

		return sql.toString();
	}

	private ResponseStringVO getUpdateTableScript(String tableName, Set<TableObjectsColumns> tableObjectsColumns,
			Boolean isManagedPage) {
		ResponseStringVO vo = ResponseStringVO.builder().build();
		List<String> ddlStatementsList = new ArrayList<>();
		for (TableObjectsColumns columns : tableObjectsColumns) {
			if (columns.getColumnIdentifier() != null) {
				String dbDataType = getDBDataType(columns);
				StringBuilder sql = new StringBuilder();
				String fieldName = columns.getColumnIdentifier().toLowerCase();
				if (columns.getId() == null) {
					sql.append(ALTER_TABLE).append(tableName).append(ADD_COLUMN)
							.append(getColumnName(fieldName, isManagedPage)).append(" ").append(dbDataType);
				} else {
					if (StringUtils.equals(columns.getIsRequired(), "true")) {
						StringBuilder validationSql = new StringBuilder();
						validationSql.append("select 1 from ").append(tableName).append(WHERE)
								.append(getColumnName(fieldName, isManagedPage)).append(" is null ");

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
							sql.append(ALTER_TABLE).append(tableName).append(ALTER_COLUMN)
									.append(getColumnName(fieldName, isManagedPage)).append(" SET NOT NULL");
						} else {
							vo.setResponse(String.format(
									"Column: %s has null values which cannot be modified to a required for the existing data",
									columns.getColumnName()));
						}
					} else {
						sql.append(ALTER_TABLE).append(tableName).append(ALTER_COLUMN)
								.append(getColumnName(fieldName, isManagedPage)).append(" DROP NOT NULL");
					}

				}

				ddlStatementsList.add(sql.toString());
			}
		}

		vo.setQuery(ddlStatementsList);

		return vo;
	}

	private String getColumnName(String key, Boolean isManagedPage) {
		if (StringUtils.equalsAnyIgnoreCase(key, "id", "uuid", "tenant_id", "created_by", "created_on", "modified_by",
				"modified_on", "active_flag")) {
			return key;
		}

		if (BooleanUtils.isTrue(isManagedPage) && !StringUtils.contains(key.toLowerCase(), "ya_")) {
			return "ya_" + key.toLowerCase();
		}

		return key.toLowerCase();
	}

	private String getDBDataType(TableObjectsColumns columns) {
		String value = "varchar(100)";
		String required = "";
		long length = 100;

		if (columns.getFieldSize() != null) {
			length = columns.getFieldSize();
		}

		if (StringUtils.equals(columns.getIsRequired(), "true")) {
			required = " not null";
		}

		if (StringUtils.equalsIgnoreCase(STRING, columns.getDataType())) {
			value = "varchar (" + length + ")";
		} else if (StringUtils.equalsIgnoreCase(INTEGER, columns.getDataType())) {
			value = "int4";
		} else if (StringUtils.equalsIgnoreCase(LONG, columns.getDataType())) {
			value = "int8";
		} else if (StringUtils.equalsIgnoreCase(FLOAT, columns.getDataType())) {
			value = "float8";
		} else if (StringUtils.equalsIgnoreCase(DATE, columns.getDataType())) {
			value = DATE;
		} else if (StringUtils.equalsIgnoreCase(TIMESTAMP, columns.getDataType())) {
			value = TIMESTAMP;
		} else if (StringUtils.equalsIgnoreCase(UUIDTYPE, columns.getDataType())) {
			value = UUIDTYPE;
		}
		return value + required;
	}

	public ResponseStringVO checkTableName(String tableName) {
		TableObjects name = tableObjectsRepository.findByTableNameAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
				tableName, YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		if (name != null) {
			return ResponseStringVO.builder().response("Table Name Already Exist").build();
		}
		return ResponseStringVO.builder().response("New Name").build();

	}

	private void deleteTableObjectColumns(TableObjectsVO vo) {
		if (vo.getDeletedColumnIDList() != null && !vo.getDeletedColumnIDList().isEmpty()) {
			for (UUID id : vo.getDeletedColumnIDList()) {
				TableObjectsColumns tableObjectsColumns = tableObjectsColumnsRepository
						.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(id, YorosisContext.get().getTenantId(),
								YoroappsConstants.YES);
				tableObjectsColumns.setActiveFlag(YoroappsConstants.NO);
				tableObjectsColumnsRepository.save(tableObjectsColumns);
			}
		}
	}

	@Transactional
	public ResponseStringVO deleteTable(UUID tableId) {
		TableObjects table = tableObjectsRepository.findByTableObjectsIdAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(
				tableId, YoroappsConstants.YES, YorosisContext.get().getTenantId());
		if (table != null) {
			List<TableObjectsColumns> dataTableColumnList = tableObjectsColumnsRepository
					.findByTableObjectsIdAndActiveFlagIgnoreCaseAndTenantId(tableId, YoroappsConstants.YES,
							YorosisContext.get().getTenantId());
			if (dataTableColumnList != null && !dataTableColumnList.isEmpty()) {
				dataTableColumnList.stream().forEach(tc -> {
					tc.setActiveFlag(YoroappsConstants.NO);
				});
				tableObjectsColumnsRepository.saveAll(dataTableColumnList);
			}
			table.setActiveFlag(YoroappsConstants.NO);
			tableObjectsRepository.save(table);
			StringBuilder deleteStringbuilder = new StringBuilder();
			deleteStringbuilder.append("drop table if exists ").append(table.getTableIdentifier());
			Query nativeQuery = entityManager.createNativeQuery(deleteStringbuilder.toString());
			log.info("Now executing: {}", deleteStringbuilder.toString());
			nativeQuery.executeUpdate();
			return ResponseStringVO.builder().response("Table deleted successfully").build();
		}
		return ResponseStringVO.builder().response("Table not deleted").build();
	}

	@Transactional
	public ResponseStringVO createOrEditColumn(TableObjectsColumnsVO tableObjectsColumnsVO, UUID tableId) {
		TableObjectsColumns columns = null;
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());
		String response = null;
		TableObjects object = tableObjectsRepository.findByTableObjectsIdAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(
				tableId, YoroappsConstants.YES, YorosisContext.get().getTenantId());
		if (object != null) {
			if (tableObjectsColumnsVO.getId() != null) {
				columns = tableObjectsColumnsRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(
						tableObjectsColumnsVO.getId(), YorosisContext.get().getTenantId(), YoroappsConstants.YES);
				columns.setColumnName(tableObjectsColumnsVO.getColumnName());
				columns.setColumnIdentifier(getColumnName(tableObjectsColumnsVO.getColumnIdentifier(), true));
				columns.setDataType(tableObjectsColumnsVO.getDataType());
				columns.setFieldSize(tableObjectsColumnsVO.getFieldSize());
				columns.setIsRequired(booleanToChar(tableObjectsColumnsVO.getIsRequired()));
				columns.setIsUnique(booleanToChar(tableObjectsColumnsVO.getIsUnique()));
				columns.setModifiedBy(YorosisContext.get().getUserName());
				columns.setModifiedOn(timestamp);
				response = "Column updated successfully";
			} else {
				columns = constructTableObjectsColumnsVOTODTO(tableObjectsColumnsVO);
				columns.setTableObjects(object);
				response = "Column added successfully";
			}
			String vo = getUpdateData(object.getTableIdentifier(), columns, true);
			if (StringUtils.equals(vo, "saved")) {
				tableObjectsColumnsRepository.save(columns);
			} else {
				response = vo;
			}
			return ResponseStringVO.builder().response(response).tableId(columns.getId().toString()).build();
		}
		return ResponseStringVO.builder().response("Column not added").build();
	}

	private String getUpdateData(String tableName, TableObjectsColumns columns, Boolean isManagedPage) {
//		ResponseStringVO vo = ResponseStringVO.builder().build();
		if (columns.getColumnIdentifier() != null) {
			String dbDataType = getDBDataType(columns);
			StringBuilder sql = new StringBuilder();
			String fieldName = columns.getColumnIdentifier().toLowerCase();
			if (columns.getId() == null) {
				sql.append(ALTER_TABLE).append(tableName).append(ADD_COLUMN)
						.append(getColumnName(fieldName, isManagedPage)).append(" ").append(dbDataType);
			} else {
				if (StringUtils.equals(columns.getIsRequired(), "true")) {
					StringBuilder validationSql = new StringBuilder();
					validationSql.append("select 1 from ").append(tableName).append(WHERE)
							.append(getColumnName(fieldName, isManagedPage)).append(" is null ");

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
						sql.append(ALTER_TABLE).append(tableName).append(ALTER_COLUMN)
								.append(getColumnName(fieldName, isManagedPage)).append(" SET NOT NULL");
					} else {
						return (String.format(
								"Column: %s has null values which cannot be modified to a required for the existing data",
								columns.getColumnName()));
					}
				} else {
					sql.append(ALTER_TABLE).append(tableName).append(ALTER_COLUMN)
							.append(getColumnName(fieldName, isManagedPage)).append(" DROP NOT NULL");
				}
			}
			Query nativeQuery = entityManager.createNativeQuery(sql.toString());
			log.info("Now executing: {}", sql.toString());
			nativeQuery.executeUpdate();
		}
		return "saved";
	}

	@Transactional
	public ResponseStringVO deleteColumn(UUID columnId) {
		TableObjectsColumns tableObjectsColumns = tableObjectsColumnsRepository
				.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(columnId, YorosisContext.get().getTenantId(),
						YoroappsConstants.YES);
		if (tableObjectsColumns != null) {
			String tableName = tableObjectsColumns.getTableObjects().getTableIdentifier();
			tableObjectsColumns.setActiveFlag(YoroappsConstants.NO);
			tableObjectsColumnsRepository.save(tableObjectsColumns);
			StringBuilder deleteStringbuilder = new StringBuilder();
			deleteStringbuilder.append("ALTER TABLE ").append(tableName).append(" DROP COLUMN ")
					.append(tableObjectsColumns.getColumnIdentifier());
			Query nativeQuery = entityManager.createNativeQuery(deleteStringbuilder.toString());
			log.info("Now executing: {}", deleteStringbuilder.toString());
			nativeQuery.executeUpdate();
			return ResponseStringVO.builder().response("Column deleted successfully").build();
		}
		return ResponseStringVO.builder().response("Column not deleted").build();
	}

	@Transactional
	public List<TableObjectsVO> getTableObjectsListVO(TableListVO vo) {
		List<TableObjectsVO> tableVOList = new ArrayList<>();
		for (String tableId : vo.getTableList()) {
			TableObjects table = tableObjectsRepository
					.findByTableIdentifierAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(tableId,
							YorosisContext.get().getTenantId(), YoroappsConstants.YES);
			if (table != null) {
				TableObjectsVO tableObjectsVO = constructTableObjectionsDTOTOVO(table);
				List<TableObjectsColumnsVO> tableObjectsColumnsVO = new ArrayList<>();
				for (TableObjectsColumns columns : table.getTableObjectsColumns()) {
					if (!StringUtils.equals(columns.getActiveFlag(), YoroappsConstants.NO)) {
						tableObjectsColumnsVO.add(constructTableObjectsColumnsDTOTOVO(columns));
					}
				}
				tableObjectsVO.setTableObjectsColumns(tableObjectsColumnsVO);
				tableVOList.add(tableObjectsVO);
			}

		}
		return tableVOList;
	}

	@Transactional
	public TableObjectsVO getTableObjectInfoById(UUID id) throws IOException {
		TableObjects object = tableObjectsRepository.findByTableObjectsIdAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(
				id, YoroappsConstants.YES, YorosisContext.get().getTenantId());
		return getTableObjectInfo(object);
	}

	@Transactional
	public TableObjectsVO getTableObjectUsingName(String name) throws IOException {
		TableObjects object = tableObjectsRepository.findByTableNameAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(name,
				YorosisContext.get().getTenantId(), YoroappsConstants.YES);
		return getTableObjectInfo(object);
	}

	private TableObjectsVO getTableObjectInfo(TableObjects object) throws IOException {
		TableObjectsVO vo = null;
		if (object != null) {
			vo = constructTableObjectionsDTOTOVO(object);
			List<TableObjectsColumnsVO> tableObjectsColumnsVO = object.getTableObjectsColumns().stream()
					.filter(t -> StringUtils.equals(t.getActiveFlag(), YoroappsConstants.YES))
					.sorted(Comparator.comparing(TableObjectsColumns::getCreatedOn))
					.map(this::constructTableObjectsColumnsDTOTOVO).collect(Collectors.toList());

			vo.setTableObjectsColumns(tableObjectsColumnsVO);
			vo.setTableSecurityVOList(
					tableObjectsSecurityService.getDataTableSecurityForSave(object.getTableObjectsId()));
		}

		return vo;
	}

	@Transactional
	public List<TableObjectsVO> getTableNames() throws IOException {
		UsersVO userVO = userService.getLoggedInUserDetails();
		List<UUID> groupIdList = getGroupIdList(userVO);
		List<TableObjects> object = tableObjectsRepository
				.findByActiveFlagIgnoreCaseAndTenantIdIgnoreCaseWithPermission(YoroappsConstants.YES,
						YorosisContext.get().getTenantId(), userVO.getUserId(), groupIdList);
		List<TableObjectsVO> tableNamesList = new ArrayList<>();
		for (TableObjects columns : object) {
			TableObjectsVO vo = TableObjectsVO.builder().tableName(columns.getTableName())
					.tableDescription(columns.getTableDescription()).tableObjectId(columns.getTableObjectsId())
					.tableIdentifier(columns.getTableIdentifier()).build();
			tableNamesList.add(vo);
		}
		return tableNamesList;
	}

	private List<UUID> getGroupIdList(UsersVO userVO) {
		List<UUID> groupIdList = new ArrayList<>();
		if (userVO.getGroupVOList() != null) {
			groupIdList = userVO.getGroupVOList().stream().map(GroupVO::getGroupId).collect(Collectors.toList());
		}
		return groupIdList;
	}

	@Transactional
	public List<PageVO> getTableNamesForPage() {
		List<TableObjects> object = tableObjectsRepository.findByActiveFlagIgnoreCaseAndTenantIdIgnoreCase(
				YoroappsConstants.YES, YorosisContext.get().getTenantId());
		List<PageVO> tableNamesList = new ArrayList<>();
		for (TableObjects tableObjects : object) {
			tableNamesList.add(
					PageVO.builder().pageName(tableObjects.getTableName()).pageId(tableObjects.getTableIdentifier())
							.pageIdWithPrefix(tableObjects.getTableIdentifier()).version(1L).build());
		}
		return tableNamesList;
	}

	@Transactional
	public List<TableObjectsColumnsVO> getTableObjectColumns(UUID tableObjectId) {
		List<TableObjectsColumns> fieldNames = tableObjectsColumnsRepository
				.findByTableObjectsIdAndActiveFlagIgnoreCaseAndTenantId(tableObjectId, YoroappsConstants.YES,
						YorosisContext.get().getTenantId());

		List<TableObjectsColumnsVO> fieldNamesList = new ArrayList<>();
		for (TableObjectsColumns tableObjectsColumns : fieldNames) {
			TableObjectsColumnsVO vo = TableObjectsColumnsVO.builder().columnName(tableObjectsColumns.getColumnName())
					.dataType(tableObjectsColumns.getDataType())
					.isRequired(charToBoolean(tableObjectsColumns.getIsRequired()))
					.isUnique(charToBoolean(tableObjectsColumns.getIsUnique()))
					.fieldSize(tableObjectsColumns.getFieldSize())
					.columnIdentifier(tableObjectsColumns.getColumnIdentifier()).build();
			fieldNamesList.add(vo);
		}
		return fieldNamesList;
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

	@Transactional
	public DataTableListVo getDataTableValues(PaginationVO vo, UUID tableObjectsId) throws ParseException {
		List<DataTableVO> dataTableListVo = new ArrayList<>();
		List<TableObjectsColumns> columnList = tableObjectsColumnsRepository
				.findByTableObjectsIdAndActiveFlagIgnoreCaseAndTenantId(tableObjectsId, YoroappsConstants.YES,
						YorosisContext.get().getTenantId());
		if (columnList != null && !columnList.isEmpty()) {
			List<String> aliasList = new ArrayList<>();
			List<Object> argumentValuesList = new ArrayList<>();
			String tableName = columnList.get(0).getTableObjects().getTableIdentifier();
			StringBuilder builder = new StringBuilder();
			StringBuilder selectClauseBuilder = getSelectClause(columnList, aliasList, tableName);
			StringBuilder whereClauseBuilder = new StringBuilder();
			whereClauseBuilder.append("where active_flag = 'Y'");
			if (vo != null) {
				whereClauseBuilder.append(getWhereClause(vo, argumentValuesList));
				builder.append(selectClauseBuilder).append(whereClauseBuilder);
			} else {
				builder.append(selectClauseBuilder);
			}
			StringBuilder pageCountBuilder = new StringBuilder();
			pageCountBuilder.append("select count(1) ").append(" from ").append(tableName).append(" ")
					.append(whereClauseBuilder);

			Query pageCountQuery = entityManager.createNativeQuery(pageCountBuilder.toString());
			int pageCountIndex = 1;
			for (Object value : argumentValuesList) {
				pageCountQuery.setParameter(pageCountIndex++, value);
			}
			Object pageCountResult = pageCountQuery.getSingleResult();

			builder.append(getOrderByClause(vo));
			if (vo != null) {
				builder.append(getPaginationQuery(vo.getIndex(), vo.getSize(), argumentValuesList));
			}
			StringBuilder queryBuilder = new StringBuilder();
			queryBuilder.append("select ").append(builder);
			dataTableListVo = executeAndGetResults(queryBuilder.toString(), argumentValuesList, aliasList);
			return DataTableListVo.builder().dataTableVOList(dataTableListVo).totalRecords("" + pageCountResult)
					.build();
		}
		return DataTableListVo.builder().dataTableVOList(dataTableListVo).totalRecords("0").build();
	}

	private StringBuilder getOrderByClause(PaginationVO vo) {
		StringBuilder orderByClauseBuilder = new StringBuilder();
		if (vo != null && StringUtils.isNotBlank(vo.getColumnName()) && StringUtils.isNotBlank(vo.getDirection())) {
			StringBuilder orderByBuilder = new StringBuilder();
			orderByBuilder.append(" ORDER BY ").append(vo.getColumnName()).append(" ").append(vo.getDirection())
					.append(" ");

			orderByClauseBuilder.append(" ").append(orderByBuilder);
		} else {
			orderByClauseBuilder.append(" ORDER BY created_on desc ");
		}
		return orderByClauseBuilder;
	}

	private StringBuilder getPaginationQuery(int pageNo, int size, List<Object> filterValuesList) {
		size = size <= 0 ? 10 : size;
		pageNo = (pageNo < 1) ? 1 : pageNo + 1;

		StringBuilder paginationBuilder = new StringBuilder();
		paginationBuilder.append(" LIMIT ?");
		filterValuesList.add(size <= 0 ? 10 : size);

		if (pageNo > 1) {
			paginationBuilder.append(" OFFSET ? ");
			filterValuesList.add(size * (pageNo - 1));
		}

		return paginationBuilder;
	}

	private StringBuilder getSelectClause(List<TableObjectsColumns> columnList, List<String> aliasList,
			String tableName) {
		StringBuilder selectClauseBuilder = new StringBuilder();
		aliasList.add("uuid");
		selectClauseBuilder.append("cast(uuid as varchar) ");
		for (TableObjectsColumns column : columnList) {
			aliasList.add(column.getColumnIdentifier());
			if (selectClauseBuilder.length() > 8) {
				selectClauseBuilder.append(" , ").append(column.getColumnIdentifier());
			} else {
				selectClauseBuilder.append(column.getColumnIdentifier());
			}
		}
		selectClauseBuilder.append(" from ").append(tableName).append(" ");
		return selectClauseBuilder;
	}

	private StringBuilder getWhereClause(PaginationVO pagination, List<Object> argumentValuesList)
			throws ParseException {
		StringBuilder whereClauseBuilder = new StringBuilder();
		if (pagination != null) {
			FilterValueVO[] filterList = pagination.getFilterValue();
			if (filterList == null || filterList.length == 0) {
				return whereClauseBuilder;
			}

			for (FilterValueVO filter : filterList) {
				if (StringUtils.isNotBlank(filter.getFilterIdColumn())) {
					whereClauseBuilder.append(" and ");

					boolean isCaseInsensitive = isString(filter.getFilterDataType())
							&& StringUtils.equalsAnyIgnoreCase(filter.getOperators(), "bw", "ew", "cn");

					whereClauseBuilder.append(isCaseInsensitive ? "lower(" : "").append(filter.getFilterIdColumn())
							.append(isCaseInsensitive ? ")" : "");
					whereClauseBuilder.append(getOperator(filter.getOperators()));
					whereClauseBuilder.append(" ? ");
					argumentValuesList.add(getOperand(filter.getOperators(), filter.getFilterIdColumnValue(),
							filter.getFilterDataType()));
				}
			}
		}

		return whereClauseBuilder;
	}

	private Object getOperand(String operator, String filterValue, String dataType) throws ParseException {
		if (isString(dataType)) {
			switch (operator.toLowerCase().trim()) {
			case "bw":
				filterValue = filterValue.toLowerCase() + '%';
				break;
			case "ew":
				filterValue = '%' + filterValue.toLowerCase();
				break;
			case "cn":
				filterValue = '%' + filterValue.toLowerCase() + '%';
				break;
			default:
			}
		}

		return getValue(dataType, filterValue);
	}

	private boolean isString(String dataType) {
		return (StringUtils.equalsAnyIgnoreCase(dataType, "text", "string"));
	}

	private Object getValue(String dataType, String value) throws ParseException {
		Object newValue = value;

		if (value != null && StringUtils.isNotBlank(dataType)) {

			if (StringUtils.equalsIgnoreCase(dataType, "date")) {
				Date date = new SimpleDateFormat("yyyy-MM-dd").parse(value);
				newValue = date;
			}
			if (StringUtils.equalsIgnoreCase(dataType, "timestamp")) {
				Date date = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").parse(value);
				Timestamp ts = new Timestamp(date.getTime());
				newValue = ts;
			} else if (StringUtils.equalsAnyIgnoreCase(dataType, "long", "number")) {
				newValue = Long.parseLong(value);
			} else if (StringUtils.equalsAnyIgnoreCase(dataType, "double", "float")) {
				newValue = Double.parseDouble(value);
			}
		}

		return newValue;
	}

	private String getOperator(String operator) {
		String actualOperator = null;
		switch (operator.toLowerCase().trim()) {
		case "eq":
			actualOperator = " = ";
			break;
		case "ne":
			actualOperator = " != ";
			break;
		case "bw":
		case "ew":
		case "cn":
			actualOperator = " like ";
			break;
		case "gt":
			actualOperator = " > ";
			break;
		case "ge":
			actualOperator = " >= ";
			break;

		case "lt":
			actualOperator = " < ";
			break;

		case "le":
			actualOperator = " <= ";
			break;

		default:
			actualOperator = " = ";
		}

		return actualOperator;
	}

	private StringBuilder getSortByClause(PaginationVO pagination, List<Object> argumentValuesList) {
		StringBuilder sortByClauseBuilder = new StringBuilder();
		int size = pagination.getSize();
		int pageNo = pagination.getIndex();
		size = size <= 0 ? 10 : size;
		pageNo = (pageNo < 1) ? 1 : pageNo + 1;

		sortByClauseBuilder.append(" order by ")
				.append(StringUtils.isNotBlank(pagination.getDirection()) ? pagination.getDirection() : "asc");

		sortByClauseBuilder.append(" LIMIT ?");
		argumentValuesList.add(size <= 0 ? 10 : size);

		if (pageNo > 1) {
			sortByClauseBuilder.append(" OFFSET ? ");
			argumentValuesList.add(size * (pageNo - 1));
		}
		return sortByClauseBuilder;
	}

	private List<DataTableVO> executeAndGetResults(String sql, List<Object> argumentList, List<String> aliasList) {
		Query nativeQuery = getNativeQuery(sql, argumentList);

		List<?> resultList = nativeQuery.getResultList();
		List<DataTableVO> dataTableListVo = new ArrayList<>();
		for (Object rows : resultList) {
			Object[] arrObject = null;
			if (aliasList.size() == 1) {
				arrObject = new Object[] { rows };
			} else {
				arrObject = (Object[]) rows;
			}
			dataTableListVo.add(constructDataVo(arrObject, aliasList));
		}

		return dataTableListVo;
	}

	private DataTableVO constructDataVo(Object[] arrObject, List<String> aliasList) {
		List<ColumnDataVO> columnDataTableListVo = new ArrayList<>();
		int index = 0;
		UUID primaryKey = null;
		for (Object col : arrObject) {
			if (index == 0) {
				primaryKey = UUID.fromString(col.toString());
			} else {
				columnDataTableListVo.add(ColumnDataVO.builder().columnIdentifier(aliasList.get(index))
						.columnValue(col == null ? null : col.toString()).build());
			}
			index++;
		}
		return DataTableVO.builder().id(primaryKey).values(columnDataTableListVo).build();
	}

	private Query getNativeQuery(String sql, List<Object> argumentList) {
		Query nativeQuery = entityManager.createNativeQuery(sql);
		int index = 1;
		for (Object object : argumentList) {
			nativeQuery.setParameter(index++, object);
		}

		return nativeQuery;
	}

	@Transactional
	public ResponseStringVO deleteDataTableValues(DeleteDataTableValuesVO deleteDataTableValuesVO)
			throws ParseException, IOException {
		if (deleteDataTableValuesVO != null && deleteDataTableValuesVO.getTableId() != null) {
			TableSecurityVOList tableSecurityVOList = tableObjectsSecurityService
					.getDataTableSecurity(deleteDataTableValuesVO.getTableId());
			if (StringUtils.isNoneBlank(tableSecurityVOList.getTableName())
					&& BooleanUtils.isTrue(tableSecurityVOList.getUpdateAllowed())) {
				List<Query> nativeQueryList = new ArrayList<Query>();
				String tableIdentifier = tableSecurityVOList.getTableName();
				if (deleteDataTableValuesVO.getIdList() != null && !deleteDataTableValuesVO.getIdList().isEmpty()) {
					for (UUID id : deleteDataTableValuesVO.getIdList()) {
						List<DataObject> valueList = new ArrayList<>();
						StringBuilder builder = new StringBuilder();
						builder.append("delete from ").append(YorosisContext.get().getTenantId()).append(".")
								.append(tableIdentifier).append(" where uuid = ?");
						valueList.add(DataObject.builder().type(StandardBasicTypes.UUID_CHAR).value(id).build());
						getprocessDBQueryList(builder, valueList, nativeQueryList);
					}
				}
				runProcessDBQuery(nativeQueryList);
				return ResponseStringVO.builder().response("Data deleted successfully").build();
			}
		}
		return ResponseStringVO.builder().response("Data not deleted").build();
	}

	@Transactional
	public ResponseStringVO saveDataTable(List<DataTableVO> vo, UUID tableObjectsId)
			throws ParseException, IOException {
		TableSecurityVOList tableSecurityVOList = tableObjectsSecurityService.getDataTableSecurity(tableObjectsId);
		if (StringUtils.isNoneBlank(tableSecurityVOList.getTableName())
				&& BooleanUtils.isTrue(tableSecurityVOList.getUpdateAllowed())) {

			List<Query> nativeQueryList = new ArrayList<>();
			String tableIdentifier = tableSecurityVOList.getTableName();
			UUID id = null;
			for (DataTableVO dataTableVO : vo) {
				if (dataTableVO.getId() != null && StringUtils.isNotBlank(dataTableVO.getId().toString())) {
					id = updateData(dataTableVO, tableIdentifier, nativeQueryList);
				} else {
					id = insertData(dataTableVO, tableIdentifier, nativeQueryList);
				}
			}
			runProcessDBQuery(nativeQueryList);
			return ResponseStringVO.builder().tableId(id.toString()).response("Data added successfully").build();
		}
		return ResponseStringVO.builder().tableId(null).response("Data not added").build();
	}

	private void runProcessDBQuery(List<Query> nativeQueryList) {
		for (Query nativeQuery : nativeQueryList) {
			int executeUpdate = nativeQuery.executeUpdate();
			log.info("Total created/records: {}", executeUpdate);
		}
	}

	private void getprocessDBQueryList(StringBuilder query, List<DataObject> valueList, List<Query> nativeQueryList) {
		Query nativeQuery = entityManager.createNativeQuery(query.toString());
		int index = 1;
		for (DataObject object : valueList) {
			if (object.getType() == StandardBasicTypes.UUID_CHAR) {
				nativeQuery.setParameter(index, object.getValue());
			} else if (object.getValue() == null && object.getType() == StandardBasicTypes.STRING) {
				nativeQuery.setParameter(index, object.getValue());
			} else {
				nativeQuery.setParameter(index, new TypedParameterValue(object.getType(), object.getValue()));
			}

			index++;
		}
		nativeQueryList.add(nativeQuery);

	}

	private UUID insertData(DataTableVO dataTableVO, String tableIdentifier, List<Query> nativeQueryList)
			throws ParseException {
		if (dataTableVO.getValues() != null && !dataTableVO.getValues().isEmpty()) {
			StringBuilder builder = new StringBuilder();
			StringBuilder values = new StringBuilder();
			List<DataObject> valueList = new ArrayList<>();
			UUID uuid = UUID.randomUUID();
			builder.append("insert into ").append(YorosisContext.get().getTenantId()).append(".")
					.append(tableIdentifier).append("(");
			builder.append("uuid ");
			values.append("?");
			valueList.add(DataObject.builder().type(StandardBasicTypes.UUID_CHAR).value(uuid).build());
			for (ColumnDataVO columnDataVO : dataTableVO.getValues()) {
				if (values.length() > 0) {
					values.append(", ");
					builder.append(", ");
				}

				builder.append(columnDataVO.getColumnIdentifier());

				values.append("?");

				valueList.add(DataObject.builder()
						.value(StringUtils.isNotBlank(columnDataVO.getColumnValue())
								? getValues(columnDataVO.getDataType(), columnDataVO.getColumnValue())
								: null)
						.type(getType(columnDataVO.getDataType())).build());
			}
			addDefaultColumnsInsert(builder, values, valueList);
			builder.append(") values (").append(values).append(")");
			getprocessDBQueryList(builder, valueList, nativeQueryList);
			return uuid;
		}
		return null;
	}

	@Transactional
	public ResponseStringVO saveImportExcelDataTable(List<DataTableVO> vo, MapVO mapVO)
			throws ParseException, IOException {
		TableSecurityVOList tableSecurityVOList = tableObjectsSecurityService
				.getDataTableSecurity(UUID.fromString(mapVO.getTableObjectsId()));
		if (StringUtils.isNoneBlank(tableSecurityVOList.getTableName())
				&& BooleanUtils.isTrue(tableSecurityVOList.getUpdateAllowed())) {

			List<Query> nativeQueryList = new ArrayList<>();
			String tableIdentifier = tableSecurityVOList.getTableName();
			UUID id = null;
			if (mapVO.getDuplicateColumns().isEmpty()) {
				for (DataTableVO dataTableVO : vo) {
					id = insertData(dataTableVO, tableIdentifier, nativeQueryList);
				}
				runProcessDBQuery(nativeQueryList);
			} else {
				Set<String> uuidList = new HashSet<>();
				for (DataTableVO dataTableVO : vo) {
					checkUnique(dataTableVO, tableIdentifier, mapVO, uuidList, nativeQueryList);
				}
				runProcessDBQuery(nativeQueryList);

			}

			return ResponseStringVO.builder().tableId(id != null ? id.toString() : "")
					.response("Data added successfully").build();
		}
		return ResponseStringVO.builder().tableId(null).response("Data not added").build();
	}

	private void checkUnique(DataTableVO dataTableVO, String tableIdentifier, MapVO mapVO, Set<String> uuidList,
			List<Query> nativeQueryList) throws ParseException {
		StringBuilder builder = new StringBuilder();
		List<DataObject> valueList = new ArrayList<>();

		builder.append("select cast(uuid as varchar) from ").append(YorosisContext.get().getTenantId()).append(".")
				.append(tableIdentifier).append(" where active_flag = 'Y' and tenant_id=? and ");
		valueList.add(DataObject.builder().value(getValues("string", YorosisContext.get().getTenantId()))
				.type(getType("string")).build());
		int i = 0;
		for (String columnName : mapVO.getDuplicateColumns()) {
			if (i > 0) {
				builder.append(" and ");
			}

			ColumnDataVO columnDataVO = dataTableVO.getValues().stream()
					.filter(t -> StringUtils.equals(t.getColumnIdentifier(), columnName)).collect(Collectors.toList())
					.get(0);
			builder.append(columnDataVO.getColumnIdentifier()).append(" = ?");
			valueList.add(DataObject.builder()
					.value(StringUtils.isNotBlank(columnDataVO.getColumnValue())
							? getValues(columnDataVO.getDataType(), columnDataVO.getColumnValue())
							: null)
					.type(getType(columnDataVO.getDataType())).build());
			i++;
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
		List<?> list = nativeQuery.getResultList();
		if (!list.isEmpty()) {
			for (Object rows : list) {
				Object[] arrObject = null;
				if (list.size() == 1) {
					arrObject = new Object[] { rows };
				} else {
					arrObject = (Object[]) rows;
				}
				for (Object col : arrObject) {
					dataTableVO.setId(UUID.fromString(col.toString()));
					updateData(dataTableVO, tableIdentifier, nativeQueryList);
				}
			}
		} else {
			insertData(dataTableVO, tableIdentifier, nativeQueryList);
		}
	}

	private UUID updateData(DataTableVO dataTableVO, String tableIdentifier, List<Query> nativeQueryList)
			throws ParseException {
		if (dataTableVO.getValues() != null && !dataTableVO.getValues().isEmpty()) {
			StringBuilder builder = new StringBuilder();
			List<DataObject> valueList = new ArrayList<>();
			builder.append("update ").append(YorosisContext.get().getTenantId()).append(".").append(tableIdentifier)
					.append(" set ");
			int i = 0;
			for (ColumnDataVO columnDataVO : dataTableVO.getValues()) {
				if (i > 0) {
					builder.append(", ");
				}

				builder.append(columnDataVO.getColumnIdentifier()).append(" = ?");

				valueList.add(DataObject.builder()
						.value(StringUtils.isNotBlank(columnDataVO.getColumnValue())
								? getValues(columnDataVO.getDataType(), columnDataVO.getColumnValue().toString())
								: null)
						.type(getType(columnDataVO.getDataType())).build());
				i++;
			}
			builder.append(" where uuid = ?");
			valueList.add(DataObject.builder().type(StandardBasicTypes.UUID_CHAR).value(dataTableVO.getId()).build());
			getprocessDBQueryList(builder, valueList, nativeQueryList);
		}
		return dataTableVO.getId();
	}

	private Object getValues(String dataType, String value) throws ParseException {
		Object object = value;
		if (StringUtils.equalsIgnoreCase(dataType, "int")) {
			return Integer.valueOf(value);
		} else if (StringUtils.equalsIgnoreCase(dataType, "long")) {
			return Long.valueOf(value);
		} else if (StringUtils.equalsAnyIgnoreCase(dataType, "float", "double")) {
			return Double.valueOf(value);
		} else if (StringUtils.equalsIgnoreCase(dataType, "date")) {
			return formatDate(value, dataType);
		} else if (StringUtils.equalsIgnoreCase(dataType, "timestamp")) {
			return formatDate(value, dataType);
		} else {
			return object == null ? object : object.toString();
		}
	}

	private Object formatDate(String date, String dataType) throws ParseException {
		if (StringUtils.isBlank(date)) {
			return null;
		}
		String dateFormat = "dd MMM yyyy";
		String pattern = determineDateFormat(date);
		Date parseDate = null;
		if (StringUtils.isNotBlank(pattern)) {
			parseDate = new SimpleDateFormat(pattern).parse(date);
		} else {
			parseDate = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").parse(date);
		}

		String stringDate = new SimpleDateFormat(dateFormat).format(parseDate);

//		String dateString = new SimpleDateFormat("dd/MM/yyyy").format(dateFormat);

		if (StringUtils.equals(DATE, dataType)) {
			return new SimpleDateFormat(dateFormat).parse(stringDate);
		} else {
			return new Timestamp(parseDate.getTime());
		}

	}

	private Type getType(String dataType) {

		if (StringUtils.equalsIgnoreCase(INTEGER, dataType)) {
			return StandardBasicTypes.INTEGER;
		} else if (StringUtils.equalsIgnoreCase(LONG, dataType)) {
			return StandardBasicTypes.LONG;
		} else if (StringUtils.equalsIgnoreCase(FLOAT, dataType)) {
			return StandardBasicTypes.DOUBLE;
		} else if (StringUtils.equalsIgnoreCase(DATE, dataType)) {
			return StandardBasicTypes.DATE;
		} else if (StringUtils.equalsIgnoreCase(TIMESTAMP, dataType)) {
			return StandardBasicTypes.TIMESTAMP;
		} else {
			return StandardBasicTypes.STRING;
		}
	}

	@Transactional
	public ResponseStringVO importExcel(MultipartFile file, MapVO mapVO) {

		try (XSSFWorkbook excelWorkBook = new XSSFWorkbook(file.getInputStream())) {

			// Get all excel sheet count.
			int totalSheetNumber = excelWorkBook.getNumberOfSheets();

			// Loop in all excel sheet.
			for (int i = 0; i < totalSheetNumber; i++) {
				// Get current sheet.
				Sheet sheet = excelWorkBook.getSheetAt(i);

				// Get sheet name.
				String sheetName = sheet.getSheetName();

				if (sheetName != null && sheetName.length() > 0) {
					// Get current sheet data in a list table.
					List<List<String>> sheetDataTable = getSheetDataList(sheet);

					// Generate JSON format of above sheet data and write to a JSON file.
					List<Map<String, String>> list = getJSONStringFromList(sheetDataTable);
					List<DataTableVO> dataTableVOList = setDataColumnVO(list, mapVO);
					return saveImportExcelDataTable(dataTableVOList, mapVO);
				}
			}
		} catch (Exception ex) {
			return ResponseStringVO.builder().response(ex.getMessage()).build();
		}
		return null;
	}

	@Transactional
	public ExcelVO getExcelHeaders(MultipartFile file) {

		try (XSSFWorkbook excelWorkBook = new XSSFWorkbook(file.getInputStream())) {

			// Get all excel sheet count.
			int totalSheetNumber = excelWorkBook.getNumberOfSheets();

			// Loop in all excel sheet.
			for (int i = 0; i < totalSheetNumber; i++) {
				// Get current sheet.
				Sheet sheet = excelWorkBook.getSheetAt(i);

				// Get sheet name.
				String sheetName = sheet.getSheetName();

				if (sheetName != null && sheetName.length() > 0) {
					// Get current sheet data in a list table.
					List<List<String>> sheetDataTable = getSheetDataList(sheet);

					// Generate JSON format of above sheet data and write to a JSON file.
					List<String> list = getExcelHeader(sheetDataTable);
					return ExcelVO.builder().response("headers exist").excelHeaders(list).build();
				}
			}
		} catch (Exception ex) {
			return ExcelVO.builder().response(ex.getMessage()).excelHeaders(null).build();
		}
		return null;
	}

	private List<DataTableVO> setDataColumnVO(List<Map<String, String>> list, MapVO mapVO) throws ParseException {
		List<DataTableVO> dataTableVOList = new ArrayList<>();

		list.stream().forEach(vo -> {
			List<ColumnDataVO> columnDataVOList = new ArrayList<>();
			mapVO.getListOfMapVO().stream().forEach(mapVo -> {
				if (StringUtils.equals(mapVo.getVariableType(), "constant")) {
					columnDataVOList.add(ColumnDataVO.builder().columnIdentifier(mapVo.getFieldName())
							.columnValue(mapVo.getValue()).dataType(mapVo.getDataType()).build());
				} else {
					columnDataVOList.add(ColumnDataVO.builder().columnIdentifier(mapVo.getFieldName())
							.columnValue(vo.get(mapVo.getValue())).dataType(mapVo.getDataType()).build());
				}
			});
			dataTableVOList.add(DataTableVO.builder().id(null).values(columnDataVOList).build());
		});

		return dataTableVOList;
	}

	private List<List<String>> getSheetDataList(Sheet sheet) {
		List<List<String>> ret = new ArrayList<>();

		// Get the first and last sheet row number.
		int firstRowNum = sheet.getFirstRowNum();
		int lastRowNum = sheet.getLastRowNum();

		if (lastRowNum > 0) {
			// Loop in sheet rows.
			for (int i = firstRowNum; i < lastRowNum + 1; i++) {
				// Get current row object.
				Row row = sheet.getRow(i);

				// Get first and last cell number.
				int firstCellNum = row.getFirstCellNum();
				int lastCellNum = row.getLastCellNum();

				// Create a String list to save column data in a row.
				List<String> rowDataList = new ArrayList<>();

				// Loop in the row cells.
				for (int j = firstCellNum; j < lastCellNum; j++) {
					// Get current cell.
					Cell cell = row.getCell(j);

					// Get cell type.

					if (cell != null) {
						if (cell.getCellType() == CellType.NUMERIC) {
							if (DateUtil.isCellDateFormatted(cell)) {
								Date date = cell.getDateCellValue();

								DateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
								String stringCellValue = df.format(date);

								rowDataList.add(stringCellValue);

							} else {
								double numberValue = cell.getNumericCellValue();

								String stringCellValue = BigDecimal.valueOf(numberValue).toPlainString();

								rowDataList.add(stringCellValue);

							}

						} else if (cell.getCellType() == CellType.STRING) {
							String cellValue = cell.getStringCellValue();

							rowDataList.add(cellValue);

						} else if (cell.getCellType() == CellType.BOOLEAN) {
							boolean numberValue = cell.getBooleanCellValue();

							String stringCellValue = String.valueOf(numberValue);

							rowDataList.add(stringCellValue);

						} else if (cell.getCellType() == CellType.BLANK) {
							rowDataList.add("");
						}
					} else {
						rowDataList.add("");
					}
				}

				// Add current row data list in the return list.
				ret.add(rowDataList);
			}
		}
		return ret;
	}

	/* Return a JSON string from the string list. */
	private List<Map<String, String>> getJSONStringFromList(List<List<String>> dataTable) {
		List<Map<String, String>> jsonDataList = new ArrayList<>();
		if (dataTable != null) {
			int rowCount = dataTable.size();

			if (rowCount > 1) {
				// The first row is the header row, store each column name.
				List<String> headerRow = dataTable.get(0);

				int columnCount = headerRow.size();

				// Loop in the row data list.
				for (int i = 1; i < rowCount; i++) {
					// Get current row data.
					List<String> dataRow = dataTable.get(i);

					Map<String, String> dataMap = new LinkedHashMap<>();
					for (int j = 0; j < columnCount; j++) {

						String columnName = headerRow.get(j);
						String columnValue = dataRow.get(j);

						dataMap.put(columnName, columnValue);
					}
					jsonDataList.add(dataMap);
				}
			}
		}
		return jsonDataList;
	}

	private List<String> getExcelHeader(List<List<String>> dataTable) {
		if (dataTable != null) {
			int rowCount = dataTable.size();

			if (rowCount > 1) {
				// The first row is the header row, store each column name.
				return dataTable.get(0);

			}
		}
		return null;
	}

	public void getExcel(UUID tableId, HttpServletResponse response)
			throws YoroappsException, ParseException, IOException {
		List<Map<String, String>> excelDataList = new ArrayList<>();

		List<ExcelHeadersVo> reportHeaders = new ArrayList<>();
		TableObjectsVO tableObjectsVO = getTableObjectInfoById(tableId);
		if (tableObjectsVO != null) {
			if (tableObjectsVO.getTableObjectsColumns() != null) {
				tableObjectsVO.getTableObjectsColumns().stream().forEach(t -> {
					reportHeaders.add(ExcelHeadersVo.builder().headerId(t.getColumnIdentifier())
							.headerName(t.getColumnName()).build());
				});
			}
			DataTableListVo dataTableListVo = getDataTableValues(null, tableId);
			for (DataTableVO dataTableVO : dataTableListVo.getDataTableVOList()) {
				Map<String, String> dataMap = new LinkedHashMap<>();
				for (ColumnDataVO columnDataVO : dataTableVO.getValues()) {
					dataMap.put(columnDataVO.getColumnIdentifier(),
							columnDataVO.getColumnValue() == null ? "" : columnDataVO.getColumnValue());
				}
				excelDataList.add(dataMap);
			}

			ExcelGenerationVo report = ExcelGenerationVo.builder().reportName(tableObjectsVO.getTableName())
					.data(excelDataList).reportHeaders(reportHeaders).build();
			excelGenerationService.getExcel(report, response);
		}
	}

}
