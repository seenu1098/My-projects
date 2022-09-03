package com.yorosis.yoroflow.services;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yorosis.yoroflow.entities.TableObjects;
import com.yorosis.yoroflow.entities.TableObjectsColumns;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.ResponseStringVO;
import com.yorosis.yoroflow.models.TableObjectsColumnsVO;
import com.yorosis.yoroflow.models.TableObjectsVO;
import com.yorosis.yoroflow.repository.TableObjectsColumnsRepository;
import com.yorosis.yoroflow.repository.TableObjectsRepository;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class TableObjectsService {
	private static final String CREATE_TABLE_IF_NOT_EXISTS = "create table IF NOT EXISTS ";
	private static final String DATE = "date";
	private static final String LONG = "long";
	private static final String FLOAT = "float";
	private static final String INTEGER = "integer";
	private static final String STRING = "string";

	@Autowired
	private TableObjectsRepository tableObjectsRepository;

	@Autowired
	private TableObjectsColumnsRepository tableObjectsColumnsRepository;

	@PersistenceContext
	private EntityManager em;

	private TableObjects constructTableObjectionsVOTODTO(TableObjectsVO vo) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());

		return TableObjects.builder().tableName(vo.getTableName()).tenantId(YorosisContext.get().getTenantId()).createdBy(YorosisContext.get().getUserName())
				.createdOn(timestamp).modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp).activeFlag(YorosisConstants.YES)
				.tableIdentifier(vo.getTableIdentifier()).activeFlag(YorosisConstants.YES).build();
	}

	private TableObjectsVO constructTableObjectionsDTOTOVO(TableObjects tableObjections) {
		return TableObjectsVO.builder().tableObjectId(tableObjections.getTableObjectsId()).tableName(tableObjections.getTableName())
				.tableIdentifier(tableObjections.getTableIdentifier()).build();
	}

	private TableObjectsColumns constructTableObjectsColumnsVOTODTO(TableObjectsColumnsVO vo) {
		Timestamp timestamp = new Timestamp(System.currentTimeMillis());

		return TableObjectsColumns.builder().columnName(vo.getColumnName()).isRequired(vo.getIsRequired()).columnIdentifier(vo.getColumnIdentifier())
				.isUnique(vo.getIsUnique()).fieldSize(vo.getFieldSize()).dataType(vo.getDataType()).tenantId(YorosisContext.get().getTenantId())
				.createdBy(YorosisContext.get().getUserName()).createdOn(timestamp).modifiedBy(YorosisContext.get().getUserName()).modifiedOn(timestamp)
				.activeFlag(YorosisConstants.YES).build();
	}

	private TableObjectsColumnsVO constructTableObjectsColumnsDTOTOVO(TableObjectsColumns tableObjectsColumns) {

		return TableObjectsColumnsVO.builder().id(tableObjectsColumns.getId()).columnIdentifier(tableObjectsColumns.getColumnIdentifier())
				.columnName(tableObjectsColumns.getColumnName()).isRequired(tableObjectsColumns.getIsRequired()).isUnique(tableObjectsColumns.getIsUnique())
				.fieldSize(tableObjectsColumns.getFieldSize()).dataType(tableObjectsColumns.getDataType()).build();
	}

	@Transactional
	public ResponseStringVO saveTableObjects(TableObjectsVO vo) {
		Set<TableObjectsColumns> tableObjectsList = new HashSet<>();

		deleteTableObjectColumns(vo);

		if (vo.getTableObjectId() == null) {
			if (StringUtils.isNotBlank(vo.getTableName())) {
				TableObjects name = tableObjectsRepository.findByTableNameAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(vo.getTableName(),
						YorosisContext.get().getTenantId(), YorosisConstants.YES);
				if (name != null) {
					return ResponseStringVO.builder().response("Table Name Already Exist").build();
				}
			}
			TableObjects object = constructTableObjectionsVOTODTO(vo);

			for (TableObjectsColumnsVO tableObjectsColumnsVO : vo.getTableObjectsColumns()) {
				TableObjectsColumns tableObjectsColumns = constructTableObjectsColumnsVOTODTO(tableObjectsColumnsVO);
				tableObjectsColumns.setTableObjects(object);
				tableObjectsList.add(tableObjectsColumns);
			}
			object.setTableObjectsColumns(tableObjectsList);
			tableObjectsRepository.save(object);

			createOrUpdateTables(getCreateTableScript(object.getTableName(), "uuid", object.getTableObjectsColumns(), true));
			return ResponseStringVO.builder().response("Table Objects Created Successfully").build();
		} else {
			TableObjects object = tableObjectsRepository.findByTableObjectsIdAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(vo.getTableObjectId(),
					YorosisConstants.YES, YorosisConstants.YES);
			object.setTableName(vo.getTableName());
			object.setTableIdentifier(vo.getTableIdentifier());
			for (TableObjectsColumnsVO tableObjectsColumnsVO : vo.getTableObjectsColumns()) {
				TableObjectsColumns tableObjectsColumns = null;
				Timestamp timestamp = new Timestamp(System.currentTimeMillis());

				if (tableObjectsColumnsVO.getId() != null) {
					tableObjectsColumns = tableObjectsColumnsRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(tableObjectsColumnsVO.getId(),
							YorosisContext.get().getTenantId(), YorosisConstants.YES);
					tableObjectsColumns.setColumnName(tableObjectsColumnsVO.getColumnName());
					tableObjectsColumns.setColumnIdentifier(tableObjectsColumnsVO.getColumnIdentifier());
					tableObjectsColumns.setDataType(tableObjectsColumnsVO.getDataType());
					tableObjectsColumns.setFieldSize(tableObjectsColumnsVO.getFieldSize());
					tableObjectsColumns.setIsRequired(tableObjectsColumnsVO.getIsRequired());
					tableObjectsColumns.setIsUnique(tableObjectsColumnsVO.getIsUnique());
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
			return ResponseStringVO.builder().response("Table Objects Updated Successfully").build();
		}
	}

	private void createOrUpdateTables(String ddl) {
		Query nativeQuery = em.createNativeQuery(ddl);
		log.info("Now executing: {}", ddl);
		nativeQuery.executeUpdate();
	}

	private String getCreateTableScript(String tableName, String primaryKeyName, Set<TableObjectsColumns> tableObjectsColumns, Boolean isManagedPage) {
		StringBuilder sql = new StringBuilder();
		sql.append(CREATE_TABLE_IF_NOT_EXISTS).append(YorosisContext.get().getTenantId()).append(".").append(tableName).append("(");

		sql.append(getColumnName(primaryKeyName, isManagedPage)).append(" uuid");
		for (TableObjectsColumns columns : tableObjectsColumns) {
			if (columns.getColumnIdentifier() != null) {
				String fieldName = columns.getColumnIdentifier().toLowerCase();

				String dbDataType = getDBDataType(columns);
				sql.append(", ").append(getColumnName(fieldName, isManagedPage)).append(" ").append(dbDataType);
			}
		}

		sql.append(
				", tenant_id varchar(60) not null, created_by varchar(100) not null, created_on timestamp not null, modified_by varchar(100), modified_on timestamp not null, active_flag varchar(1) not null, primary key(")
				.append(primaryKeyName).append(")) ");

		return sql.toString();
	}

	private String getColumnName(String key, Boolean isManagedPage) {
		if (StringUtils.equalsAnyIgnoreCase(key, "uuid", "tenant_id", "created_by", "created_on", "modified_by", "modified_on", "active_flag")) {
			return key;
		}

		if (BooleanUtils.isTrue(isManagedPage)) {
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
			value = "timestamp";
		}
		return value + required;
	}

	@Transactional
	public ResponseStringVO checkTableName(String tableName) {
		TableObjects name = tableObjectsRepository.findByTableNameAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(tableName, YorosisContext.get().getTenantId(),
				YorosisConstants.YES);
		if (name != null) {
			return ResponseStringVO.builder().response("Table Name Already Exist").build();
		}
		return null;

	}

	private void deleteTableObjectColumns(TableObjectsVO vo) {
		if (!vo.getDeletedColumnIDList().isEmpty()) {
			for (UUID id : vo.getDeletedColumnIDList()) {
				TableObjectsColumns tableObjectsColumns = tableObjectsColumnsRepository.findByIdAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(id,
						YorosisContext.get().getTenantId(), YorosisConstants.YES);
				tableObjectsColumns.setActiveFlag(YorosisConstants.NO);
				tableObjectsColumnsRepository.save(tableObjectsColumns);
			}
		}
	}

	@Transactional
	public TableObjectsVO getTableObjectInfoById(UUID id) {
		TableObjects object = tableObjectsRepository.findByTableObjectsIdAndActiveFlagIgnoreCaseAndTenantIdIgnoreCase(id, YorosisConstants.YES,
				YorosisContext.get().getTenantId());
		return getTableObjectInfo(object);
	}

	@Transactional
	public TableObjectsVO getTableObjectUsingName(String name) {
		TableObjects object = tableObjectsRepository.findByTableNameAndTenantIdIgnoreCaseAndActiveFlagIgnoreCase(name, YorosisContext.get().getTenantId(),
				YorosisConstants.YES);
		return getTableObjectInfo(object);
	}

	private TableObjectsVO getTableObjectInfo(TableObjects object) {
		TableObjectsVO vo = null;
		if (object != null) {
			vo = constructTableObjectionsDTOTOVO(object);
			List<TableObjectsColumnsVO> tableObjectsColumnsVO = new ArrayList<>();
			for (TableObjectsColumns columns : object.getTableObjectsColumns()) {
				if (!StringUtils.equals(columns.getActiveFlag(), YorosisConstants.NO)) {
					tableObjectsColumnsVO.add(constructTableObjectsColumnsDTOTOVO(columns));
				}
			}

			vo.setTableObjectsColumns(tableObjectsColumnsVO);
		}

		return vo;
	}

	@Transactional
	public List<TableObjectsVO> getTableNames() {
		List<TableObjects> object = tableObjectsRepository.findByActiveFlagIgnoreCaseAndTenantIdIgnoreCase(YorosisConstants.YES,
				YorosisContext.get().getTenantId());
		List<TableObjectsVO> tableNamesList = new ArrayList<>();
		for (TableObjects columns : object) {
			TableObjectsVO vo = TableObjectsVO.builder().tableName(columns.getTableName()).tableObjectId(columns.getTableObjectsId())
					.tableIdentifier(columns.getTableIdentifier()).build();
			tableNamesList.add(vo);
		}
		return tableNamesList;
	}

	@Transactional
	public List<TableObjectsColumnsVO> getTableObjectColumns(UUID tableObjectId) {
		List<TableObjectsColumns> fieldNames = tableObjectsColumnsRepository.findByTableObjectsIdAndActiveFlagIgnoreCaseAndTenantId(tableObjectId,
				YorosisConstants.YES, YorosisContext.get().getTenantId());

		List<TableObjectsColumnsVO> fieldNamesList = new ArrayList<>();
		for (TableObjectsColumns tableObjectsColumns : fieldNames) {
			TableObjectsColumnsVO vo = TableObjectsColumnsVO.builder().columnName(tableObjectsColumns.getColumnName())
					.dataType(tableObjectsColumns.getDataType()).isRequired(tableObjectsColumns.getIsRequired()).isUnique(tableObjectsColumns.getIsUnique())
					.fieldSize(tableObjectsColumns.getFieldSize()).columnIdentifier(tableObjectsColumns.getColumnIdentifier()).build();
			fieldNamesList.add(vo);
		}

		return fieldNamesList;
	}

}
