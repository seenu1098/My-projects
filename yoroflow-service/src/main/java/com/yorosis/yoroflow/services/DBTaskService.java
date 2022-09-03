package com.yorosis.yoroflow.services;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.persistence.EntityManager;
import javax.persistence.Query;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.yorosis.yoroflow.general.constants.YorosisConstants;
import com.yorosis.yoroflow.models.ProcessDefTaskPropertyVO;
import com.yorosis.yoroflow.models.TableObjectsColumnsVO;
import com.yorosis.yoroflow.models.TableObjectsVO;
import com.yorosis.yoroflow.models.YoroFlowException;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

@Service
public class DBTaskService {
	private static final String ALIAS_NAME = "aliasName";
	private static final String PAGE_FIELDS = "pageFields";
	private static final String INSERT_FIELD_VARIABLE_TYPE = "insertFieldVariableType";
	private static final String INSERT_VALUE = "insertValue";
	private static final String FIELD_NAME = "fieldName";
	private static final String FIELD_VALUES = "fieldValues";
	private static final String ACTION_TYPE = "actionType";
	private static final String TABLE_NAME = "tableName";
	private static final String DB_TYPE = "dbType";
	private static final String TABLE_ID = "tableId";

	@Autowired
	private YoroappsServiceClient webserviceClient;

	@Autowired
	private WorkflowService workflowService;

	@Autowired
	private ProcessDefTaskPropertyService processDefTaskPropertyService;

	@Autowired
	private EntityManager entityManager;

	@Autowired
	private ObjectMapper mapper;

	@Transactional
	public List<ObjectNode> execute(UUID processInstanceId, UUID taskDefinitionId) throws YoroFlowException {
		ProcessDefTaskPropertyVO defTaskPropertyVo = processDefTaskPropertyService
				.getTaskPropertyInfo(taskDefinitionId);
		if (defTaskPropertyVo == null) {
			return Collections.emptyList();
		}

		JsonNode propertyValue = defTaskPropertyVo.getPropertyValue();
		if (propertyValue != null && propertyValue.get(DB_TYPE) != null && propertyValue.get(TABLE_ID) != null
				&& propertyValue.get(TABLE_NAME) != null && propertyValue.get(ACTION_TYPE) != null) {

			JsonNode actionTypeNode = propertyValue.get(ACTION_TYPE);

			if (StringUtils.equalsIgnoreCase(actionTypeNode.asText(), "select")) {
				return handleSelectQuery(propertyValue, processInstanceId);
			} else if (StringUtils.equalsIgnoreCase(actionTypeNode.asText(), "update")) {
				return handleUpdateQuery(propertyValue, processInstanceId);
			} else if (StringUtils.equalsIgnoreCase(actionTypeNode.asText(), "insert")) {
				return handleInsertQuery(propertyValue, processInstanceId);
			} else if (StringUtils.equalsIgnoreCase(actionTypeNode.asText(), "delete")) {
				return handleDeleteQuery(propertyValue, processInstanceId);
			} else {
				throw new YoroFlowException("Unsupported DB Action Type: " + actionTypeNode.asText());
			}
		}

		return Collections.emptyList();
	}

	private JsonNode getNode(String key, JsonNode node) {
		return node.get(key);
	}

	private List<ObjectNode> handleInsertQuery(JsonNode propertyValue, UUID processInstanceId)
			throws YoroFlowException {
		TableObjectsVO tableObject = getTableObject(propertyValue.get(TABLE_ID).asText());
		ArrayNode fieldValuesNode = getArrayField(FIELD_VALUES, propertyValue);
		if (!propertyValue.has("fieldType") && !propertyValue.get("fieldType").asBoolean()
				&& (tableObject == null || fieldValuesNode == null || fieldValuesNode.isEmpty())) {
			return Collections.emptyList();
		}

		Map<String, TableObjectsColumnsVO> tableColumnMap = getTableColumnMap(tableObject);

		StringBuilder insertClauseBuilder = new StringBuilder();
		List<Object> argumentValuesList = new ArrayList<>();
		List<ObjectNode> responseList = new ArrayList<>();
		ObjectNode node = mapper.createObjectNode();
		responseList.add(node);

		if (propertyValue.has("fieldType") && propertyValue.get("fieldType").asBoolean()
				&& propertyValue.has("arrayFieldId")
				&& StringUtils.isNotEmpty(propertyValue.get("arrayFieldId").asText())) {
			ValueType fieldValue = workflowService.getFieldValue(processInstanceId,
					propertyValue.get("arrayFieldId").asText(), VariableType.PAGEFIELD);
			JsonNode jsonFieldValue = mapper.convertValue(fieldValue.getValue(), JsonNode.class);
			if (jsonFieldValue.isArray()) {
				for (JsonNode objNode : jsonFieldValue) {
					ArrayList<String> listArray = new ArrayList<>();
					StringBuilder insertArrayClauseBuilder = new StringBuilder();
					List<Object> argumentValuesArrayList = new ArrayList<>();

					// Iterator<String> fieldNames = objNode.fieldNames();

					UUID uuid = UUID.randomUUID();
					insertArrayClauseBuilder.append("uuid");
					argumentValuesArrayList.add((uuid));
					for (JsonNode jsonNode : fieldValuesNode) {
						JsonNode fieldNameNode = getNode(FIELD_NAME, jsonNode);
						JsonNode insertValue = getNode(INSERT_VALUE, jsonNode);
						if (objNode.has(insertValue.asText())) {
							listArray.add(fieldNameNode.asText());
							JsonNode insertValueArray = objNode.get(insertValue.asText());
							appendInsertBuilder(jsonNode, insertValueArray, fieldNameNode, tableColumnMap,
									insertArrayClauseBuilder, node, processInstanceId, argumentValuesArrayList, true);
						}
					}

					for (JsonNode jsonNode : fieldValuesNode) {
						JsonNode fieldNameNode = getNode(FIELD_NAME, jsonNode);
						JsonNode insertValue = getNode(INSERT_VALUE, jsonNode);
						if (!listArray.contains(fieldNameNode.asText())) {
							appendInsertBuilder(jsonNode, insertValue, fieldNameNode, tableColumnMap,
									insertArrayClauseBuilder, node, processInstanceId, argumentValuesArrayList, false);
						}
					}
					generateInsertSql(node, insertArrayClauseBuilder, tableObject, argumentValuesArrayList);

				}

			}
		} else {
			UUID uuid = UUID.randomUUID();
			insertClauseBuilder.append("uuid");
			argumentValuesList.add((uuid));
			for (JsonNode jsonNode : fieldValuesNode) {
				JsonNode fieldNameNode = getNode(FIELD_NAME, jsonNode);
				JsonNode insertValue = getNode(INSERT_VALUE, jsonNode);
				appendInsertBuilder(jsonNode, insertValue, fieldNameNode, tableColumnMap, insertClauseBuilder, node,
						processInstanceId, argumentValuesList, false);
			}

			generateInsertSql(node, insertClauseBuilder, tableObject, argumentValuesList);
		}
		return responseList;
	}

	private void appendInsertBuilder(JsonNode jsonNode, JsonNode insertValue, JsonNode fieldNameNode,
			Map<String, TableObjectsColumnsVO> tableColumnMap, StringBuilder insertArrayClauseBuilder, ObjectNode node,
			UUID processInstanceId, List<Object> argumentValuesList, Boolean isArray) {
		String insertFieldType = getNode(INSERT_FIELD_VARIABLE_TYPE, jsonNode) != null
				? getNode(INSERT_FIELD_VARIABLE_TYPE, jsonNode).asText()
				: "";

		if (fieldNameNode != null && StringUtils.isNotBlank(fieldNameNode.asText())) {
			if (insertArrayClauseBuilder.length() > 0) {
				insertArrayClauseBuilder.append(", ");
			}

			TableObjectsColumnsVO columnsVo = tableColumnMap.get(fieldNameNode.asText());
			if (!fieldNameNode.asText().contains("ya_")) {
				insertArrayClauseBuilder.append("ya_").append(fieldNameNode.asText());
			} else {
				insertArrayClauseBuilder.append(fieldNameNode.asText());
			}

			if (StringUtils.equalsIgnoreCase(insertFieldType, PAGE_FIELDS) && BooleanUtils.isFalse(isArray)) {
				ValueType fieldValues = workflowService.getFieldValue(processInstanceId, insertValue.asText(),
						VariableType.PAGEFIELD);
				if (StringUtils.equalsIgnoreCase(columnsVo.getDataType(), "uuid")) {
					argumentValuesList.add(UUID.fromString(fieldValues.getValue().toString()));
				} else {
					JsonNode jsonFieldValues = mapper.convertValue(fieldValues.getValue(), JsonNode.class);
					argumentValuesList.add(getValues(columnsVo.getDataType(), jsonFieldValues));
					updateObjectNode(node, getValues(columnsVo.getDataType(), jsonFieldValues), fieldNameNode.asText());
				}
			} else {
				if (StringUtils.equalsIgnoreCase(columnsVo.getDataType(), "uuid")) {
					argumentValuesList.add(UUID.fromString(insertValue.asText()));
				} else {
					argumentValuesList.add(getValues(columnsVo.getDataType(), insertValue));
					updateObjectNode(node, getValues(columnsVo.getDataType(), insertValue), fieldNameNode.asText());
				}
			}
		}
	}

	private void generateInsertSql(ObjectNode node, StringBuilder insertClauseBuilder, TableObjectsVO tableObject,
			List<Object> argumentValuesList) {

		insertClauseBuilder.append(", tenant_id, created_by, created_on, modified_by, modified_on, active_flag");

		Timestamp timestamp = new Timestamp(System.currentTimeMillis());

		argumentValuesList.add(YorosisContext.get().getTenantId());
		updateObjectNode(node, YorosisContext.get().getTenantId(), "tenant_id");
		argumentValuesList.add((YorosisContext.get().getUserName()));
		updateObjectNode(node, YorosisContext.get().getUserName(), "created_by");
		argumentValuesList.add((timestamp));
		updateObjectNode(node, timestamp, "created_on");
		argumentValuesList.add((YorosisContext.get().getUserName()));
		updateObjectNode(node, (YorosisContext.get().getUserName()), "modified_by");
		argumentValuesList.add((timestamp));
		updateObjectNode(node, timestamp, "tenant_id");
		argumentValuesList.add((YorosisConstants.YES));
		updateObjectNode(node, YorosisConstants.YES, "active_flag");
		if (insertClauseBuilder.length() > 0 && !argumentValuesList.isEmpty()) {
			StringBuilder bindingClause = new StringBuilder();
			for (int i = 0; i < argumentValuesList.size(); i++) {
				if (i > 0) {
					bindingClause.append(", ");
				}
				bindingClause.append("?");
			}

			StringBuilder finalBuilder = new StringBuilder();
			finalBuilder.append("insert into ").append(tableObject.getTableIdentifier()).append(" (")
					.append(insertClauseBuilder).append(") values (").append(bindingClause).append(")");

			executeAndUpdate(finalBuilder.toString(), argumentValuesList);
		}
	}

	private Map<String, TableObjectsColumnsVO> getTableColumnMap(TableObjectsVO tableObject) {
		if (tableObject != null && tableObject.getTableObjectsColumns() != null) {
			Map<String, TableObjectsColumnsVO> columnMap = new HashMap<>();
			for (TableObjectsColumnsVO column : tableObject.getTableObjectsColumns()) {
				columnMap.put(column.getColumnIdentifier(), column);
			}

			return columnMap;
		}

		return Collections.emptyMap();
	}

	private List<ObjectNode> handleUpdateQuery(JsonNode propertyValue, UUID processInstanceId)
			throws YoroFlowException {
		TableObjectsVO tableObject = getTableObject(propertyValue.get(TABLE_ID).asText());
		ArrayNode fieldValuesNode = getArrayField(FIELD_VALUES, propertyValue);
		if (tableObject == null || fieldValuesNode == null || fieldValuesNode.isEmpty()) {
			return Collections.emptyList();
		}

		Map<String, TableObjectsColumnsVO> tableColumnMap = getTableColumnMap(tableObject);

		StringBuilder updateClauseBuilder = new StringBuilder();
		List<Object> argumentValuesList = new ArrayList<>();
		List<ObjectNode> responseList = new ArrayList<>();

		ObjectNode node = mapper.createObjectNode();
		responseList.add(node);

		for (JsonNode jsonNode : fieldValuesNode) {

			JsonNode fieldNameNode = getNode(FIELD_NAME, jsonNode);
			JsonNode updateValueNode = getNode(INSERT_VALUE, jsonNode);

			String insertFieldType = getNode(INSERT_FIELD_VARIABLE_TYPE, jsonNode) != null
					? getNode(INSERT_FIELD_VARIABLE_TYPE, jsonNode).asText()
					: "";

			if (fieldNameNode != null && StringUtils.isNotBlank(fieldNameNode.asText())) {
				if (updateClauseBuilder.length() > 0) {
					updateClauseBuilder.append(", ");
				}

				TableObjectsColumnsVO columnsVo = tableColumnMap.get(fieldNameNode.asText());

				updateClauseBuilder.append(fieldNameNode.asText()).append(" = ?");
				if (StringUtils.equalsIgnoreCase(insertFieldType, PAGE_FIELDS)) {
					ValueType fieldValue = workflowService.getFieldValue(processInstanceId, updateValueNode.asText(),
							VariableType.PAGEFIELD);
					JsonNode jsonFieldValue = mapper.convertValue(fieldValue.getValue(), JsonNode.class);
					argumentValuesList.add(getValues(columnsVo.getDataType(), jsonFieldValue));
					updateObjectNode(node, getValues(columnsVo.getDataType(), jsonFieldValue), fieldNameNode.asText());
				} else {
					argumentValuesList.add(getValues(columnsVo.getDataType(), updateValueNode));
					updateObjectNode(node, getValues(columnsVo.getDataType(), updateValueNode), fieldNameNode.asText());
				}
			}
		}

		ArrayNode whereClauseNode = getArrayField("whereClause", propertyValue);
		StringBuilder whereClauseBuilder = getWhereClause(whereClauseNode, processInstanceId, argumentValuesList);

		if (updateClauseBuilder.length() > 0 && !argumentValuesList.isEmpty()) {
			StringBuilder finalBuilder = new StringBuilder();
			finalBuilder.append("update ").append(tableObject.getTableIdentifier()).append(" set ")
					.append(updateClauseBuilder).append(whereClauseBuilder);

			executeAndUpdate(finalBuilder.toString(), argumentValuesList);
		}

		return responseList;
	}

	private ArrayNode getArrayField(String fieldName, JsonNode propertyValue) {
		if (propertyValue != null) {
			return (ArrayNode) propertyValue.get(fieldName);
		}

		return null;
	}

	private List<ObjectNode> handleDeleteQuery(JsonNode propertyValue, UUID processInstanceId)
			throws YoroFlowException {
		List<ObjectNode> responseList = new ArrayList<>();
		TableObjectsVO tableObject = getTableObject(propertyValue.get(TABLE_ID).asText());
		StringBuilder deleteClauseBuilder = new StringBuilder();
		ArrayNode whereClauseNode = getArrayField("whereClause", propertyValue);
		List<Object> argumentValuesList = new ArrayList<>();
		StringBuilder whereClauseBuilder = getWhereClause(whereClauseNode, processInstanceId, argumentValuesList);
		deleteClauseBuilder.append("delete from ").append(YorosisContext.get().getTenantId()).append(".")
				.append(tableObject.getTableIdentifier()).append(" ").append(whereClauseBuilder);
		executeAndUpdate(deleteClauseBuilder.toString(), argumentValuesList);
		return responseList;
	}

	private List<ObjectNode> handleSelectQuery(JsonNode propertyValue, UUID processInstanceId)
			throws YoroFlowException {
		TableObjectsVO tableObject = getTableObject(propertyValue.get(TABLE_ID).asText());

		ArrayNode fieldValuesNode = getArrayField(FIELD_VALUES, propertyValue);
		ArrayNode whereClauseNode = getArrayField("whereClause", propertyValue);
		ArrayNode sortByNode = getArrayField("sortBy", propertyValue);
		JsonNode limitNode = propertyValue.get("limit");

		if (tableObject != null) {
			List<String> aliasList = new ArrayList<>();
			StringBuilder selectClauseBuilder = getSelectClause(fieldValuesNode, tableObject, aliasList);
			List<Object> argumentValuesList = new ArrayList<>();
			StringBuilder whereClauseBuilder = getWhereClause(whereClauseNode, processInstanceId, argumentValuesList);
			StringBuilder sortByBuilder = getSortByClause(sortByNode);

			int limit = 100;
			if (limitNode != null && limitNode.asInt() > 0) {
				limit = limitNode.asInt();
			}
			argumentValuesList.add(limit);

			selectClauseBuilder.append(whereClauseBuilder).append(sortByBuilder).append(" limit ?");
			return executeAndGetResults(selectClauseBuilder.toString(), argumentValuesList, aliasList);
		}

		return Collections.emptyList();
	}

	private StringBuilder getSelectClause(ArrayNode fieldValuesNode, TableObjectsVO tableObjects,
			List<String> aliasList) {
		StringBuilder selectClauseBuilder = new StringBuilder();
		selectClauseBuilder.append("select ");

		if (fieldValuesNode == null || fieldValuesNode.isEmpty()) {
			if (!CollectionUtils.isEmpty(tableObjects.getTableObjectsColumns())) {
				for (TableObjectsColumnsVO column : tableObjects.getTableObjectsColumns()) {
					aliasList.add(column.getColumnIdentifier());
					if (selectClauseBuilder.length() > 8) {
						selectClauseBuilder.append(" , ").append(column.getColumnIdentifier());
					} else {
						selectClauseBuilder.append(column.getColumnIdentifier());
					}
				}
			} else {
				selectClauseBuilder.append(" * ");
			}
		} else {
			for (JsonNode jsonNode : fieldValuesNode) {
				JsonNode fieldNameNode = jsonNode.get(FIELD_NAME);
				JsonNode aliasNameNode = jsonNode.get(ALIAS_NAME);

				if (fieldNameNode != null && StringUtils.isNotBlank(fieldNameNode.asText())) {
					if (selectClauseBuilder.length() > 8) {
						selectClauseBuilder.append(" , ").append(fieldNameNode.asText());
					} else {
						selectClauseBuilder.append(fieldNameNode.asText());
					}
					if (aliasNameNode != null && StringUtils.isNotBlank(aliasNameNode.asText())) {
						String aliasName = aliasNameNode.asText().replaceAll("\\s", "");
						selectClauseBuilder.append(" as ").append(aliasName);
						aliasList.add(aliasNameNode.asText());
					} else {
						aliasList.add(fieldNameNode.asText());
					}
				}
			}
		}

		selectClauseBuilder.append(" from ").append(tableObjects.getTableIdentifier()).append(" ");
		return selectClauseBuilder;
	}

	private StringBuilder getWhereClause(ArrayNode whereClauseNode, UUID processInstanceId,
			List<Object> argumentValuesList) throws YoroFlowException {
		StringBuilder whereClauseBuilder = new StringBuilder();
		if (whereClauseNode == null || whereClauseNode.isEmpty()) {
			return whereClauseBuilder;
		}

		JsonNode filterConditionNode = whereClauseNode.get("filterCondition");
		String conditionType = filterConditionNode == null || StringUtils.isBlank(filterConditionNode.asText()) ? "AND"
				: filterConditionNode.asText();
		ArrayNode filtersInsideConditionNode = (ArrayNode) whereClauseNode.get(0).get("filtersInsideCondition");

		if (filtersInsideConditionNode == null || filtersInsideConditionNode.isEmpty()) {
			return whereClauseBuilder;
		}

		for (JsonNode filterNode : filtersInsideConditionNode) {
			String filterName = filterNode.get("filterName").asText();
			String filterOperator = filterNode.get("filterOperator").asText();
			String filterValue = filterNode.get("filterValue").asText();
			String filterField = filterNode.get("filterFieldVariableType").asText();

			if (StringUtils.isAnyBlank(filterName, filterOperator, filterValue, filterField)) {
				throw new YoroFlowException("Invalid where clause filters");
			}

			if (StringUtils.equalsIgnoreCase(filterField, PAGE_FIELDS)) {
				ValueType fieldValue = workflowService.getFieldValue(processInstanceId, filterValue,
						VariableType.PAGEFIELD);
//				argumentValuesList.add(fieldValue.getValue());
				filterValue = fieldValue.getValue().toString();
			}
//			else {
//				argumentValuesList.add(filterValue);
//			}

			if (whereClauseBuilder.length() > 0) {
				whereClauseBuilder.append(" ").append(conditionType).append(" ");
			}
			whereClauseBuilder.append(filterName).append(" ").append(filterOperator).append(" '").append(filterValue)
					.append("' ");
		}

		if (whereClauseBuilder.length() > 0) {
			whereClauseBuilder.insert(0, " where ");
		}

		return whereClauseBuilder;
	}

	private StringBuilder getSortByClause(ArrayNode sortByNode) {
		StringBuilder sortByClauseBuilder = new StringBuilder();
		if (sortByNode != null && !sortByNode.isEmpty()) {
			for (JsonNode jsonNode : sortByNode) {
				String orderFieldName = jsonNode.get("orderFieldName").asText();
				if (StringUtils.isBlank(orderFieldName)) {
					continue;
				}

				JsonNode sortTypeNode = jsonNode.get("orderCondition");
				String sortDirection = sortTypeNode == null || StringUtils.isBlank(sortTypeNode.asText()) ? " asc "
						: sortTypeNode.asText();

				if (sortByClauseBuilder.length() > 0) {
					sortByClauseBuilder.append(", ");
				}
				sortByClauseBuilder.append(" ").append(orderFieldName).append(" ").append(sortDirection);
			}

			if (StringUtils.isNotBlank(sortByClauseBuilder)) {
				sortByClauseBuilder.insert(0, " order by ");

			}
		}

		return sortByClauseBuilder;
	}

	private List<ObjectNode> executeAndGetResults(String sql, List<Object> argumentList, List<String> aliasList) {
		Query nativeQuery = getNativeQuery(sql, argumentList);

		List<ObjectNode> responseList = new ArrayList<>();

		List<?> resultList = nativeQuery.getResultList();
		for (Object rows : resultList) {
			Object[] arrObject = null;
			if (aliasList.size() == 1) {
				arrObject = new Object[] { rows };
			} else {
				arrObject = (Object[]) rows;
			}

			int index = 0;
			ObjectNode node = mapper.createObjectNode();
			for (Object col : arrObject) {
				updateObjectNode(node, col, aliasList.get(index));
				index++;
			}

			responseList.add(node);
		}

		return responseList;
	}

	private void executeAndUpdate(String sql, List<Object> argumentList) {
		Query nativeQuery = getNativeQuery(sql, argumentList);
		nativeQuery.executeUpdate();
	}

	private Query getNativeQuery(String sql, List<Object> argumentList) {
		Query nativeQuery = entityManager.createNativeQuery(sql);
		int index = 1;
		for (Object object : argumentList) {
			nativeQuery.setParameter(index++, object);
		}

		return nativeQuery;
	}

	private void updateObjectNode(ObjectNode node, Object object, String alias) {
		if (object instanceof String) {
			node.put(alias, (String) object);
		} else if (object instanceof Float) {
			node.put(alias, (Float) object);
		} else if (object instanceof Double) {
			node.put(alias, (Double) object);
		} else if (object instanceof Integer) {
			node.put(alias, (Integer) object);
		} else if (object instanceof Long) {
			node.put(alias, (Long) object);
		} else if (object instanceof BigDecimal) {
			node.put(alias, (BigDecimal) object);
		} else if (object instanceof Date) {
			node.put(alias, ((Date) object).getTime());
		} else if (object instanceof Timestamp) {
			node.put(alias, ((Timestamp) object).getTime());
		} else if (object instanceof Short) {
			node.put(alias, (Short) object);
		} else if (object != null) {
			node.put(alias, object.toString());
		} else {
			node.put(alias, "");
		}
	}

	private Object getValues(String dataType, JsonNode insertValue) {
		if (StringUtils.equalsIgnoreCase(dataType, "int")) {
			return insertValue.asInt();
		} else if (StringUtils.equalsIgnoreCase(dataType, "long")) {
			return insertValue.asLong();
		} else if (StringUtils.equalsAnyIgnoreCase(dataType, "float", "double")) {
			return insertValue.asDouble();
		} else if (StringUtils.equalsIgnoreCase(dataType, "date")) {
			return new Date(insertValue.asLong());
		} else {
			return insertValue.asText();
		}
	}

	private TableObjectsVO getTableObject(String id) throws YoroFlowException {
		return webserviceClient.getTableObjectsById(YorosisContext.get().getToken(), id);
	}
}
