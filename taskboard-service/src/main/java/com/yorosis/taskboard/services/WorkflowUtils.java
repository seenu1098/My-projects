package com.yorosis.taskboard.services;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;

import org.apache.commons.lang3.StringUtils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.yorosis.taskboard.models.FieldVO;
import com.yorosis.taskboard.models.YoroDataType;

public class WorkflowUtils {

	public static List<FieldVO> getValueFromData(JsonNode jsonNode) {
		List<FieldVO> listFieldVO = new ArrayList<>();
		if (jsonNode.has("jsonText")) {
			JsonNode jsonText = jsonNode.get("jsonText");
			Iterator<String> fieldNames = jsonText.fieldNames();
			while (fieldNames.hasNext()) {
				String fieldName = fieldNames.next();
				JsonNode field = jsonText.get(fieldName);
				listFieldVO.add(FieldVO.builder().fieldName(fieldName).fieldId(fieldName).datatype(WorkflowUtils.getFieldDataType(field)).taskType("startTask")
						.build());
			}
		}
		return listFieldVO;
	}

	public static List<FieldVO> getValueFromDataForDBTask(JsonNode jsonNode) {
		List<FieldVO> listFieldVO = new ArrayList<>();
		if (jsonNode.has("fieldValues")) {
			JsonNode jsonText = jsonNode.get("fieldValues");
			Iterator<JsonNode> fieldNames = jsonText.iterator();
			while (fieldNames.hasNext()) {
				JsonNode jsonField = fieldNames.next();
				if (jsonField.has("aliasName")) {
					String aliasName = jsonField.get("aliasName").asText();
					listFieldVO.add(FieldVO.builder().fieldName(aliasName).fieldId(aliasName).datatype(YoroDataType.STRING.toString()).build());
				}
			}
		}
		return listFieldVO;
	}

	public static String getFieldDataType(JsonNode dataType) {
		if (StringUtils.equals(dataType.getNodeType().toString().toLowerCase(), "string")) {
			return YoroDataType.STRING.toString().toLowerCase();
		} else {
			return dataType.getNodeType().toString().toLowerCase();
		}
	}

	public static List<FieldVO> getValueFromDataForComputeTask(JsonNode jsonNode) {
		List<FieldVO> listFieldVO = new ArrayList<>();
		if (jsonNode.has("leftAssignment") && jsonNode.has("dataType")) {
			String leftAssignment = jsonNode.get("leftAssignment").asText();
			String dataType = jsonNode.get("dataType").asText();
			if (StringUtils.equals(dataType, "date")) {
				if (jsonNode.has("operator")) {
					String operator = jsonNode.get("operator").asText();
					if (StringUtils.equals(operator, "between")) {
						dataType = "float";
					}
				}

			}
			listFieldVO.add(FieldVO.builder().fieldName(leftAssignment).fieldId(leftAssignment).datatype(dataType).build());

		}
		return listFieldVO;
	}

	public static List<FieldVO> getValueFromDataForCounterTask(JsonNode jsonNode) {
		List<FieldVO> listFieldVO = new ArrayList<>();
		if (jsonNode.has("name")) {
			String counterLabel = jsonNode.get("name").asText();

			listFieldVO.add(FieldVO.builder().fieldName(counterLabel).fieldId(counterLabel).datatype("string").build());
		}
		return listFieldVO;
	}

	public static List<FieldVO> getValueFromDataForExcelReportTask(JsonNode jsonNode) {
		List<FieldVO> listFieldVO = new ArrayList<>();
		if (jsonNode.has("generatedExcelName")) {
			String leftAssignment = jsonNode.get("generatedExcelName").asText();

			listFieldVO.add(FieldVO.builder().fieldName(leftAssignment).fieldId(leftAssignment).datatype("file").build());
		}
		return listFieldVO;
	}

	public static List<FieldVO> getValueFromDataForDesicisionTableTask(JsonNode jsonNode) {
		List<FieldVO> listFieldVO = new ArrayList<>();
		if (jsonNode.has("assignToVariable")) {
			JsonNode assignToVariable = jsonNode.get("assignToVariable");
			if (assignToVariable.has("name") && assignToVariable.has("dataType")) {
				listFieldVO.add(FieldVO.builder().fieldName(assignToVariable.get("name").asText()).fieldId(assignToVariable.get("name").asText())
						.datatype(assignToVariable.get("dataType").asText()).build());
			}

		}
		return listFieldVO;
	}

	public static JsonNode getNodeValue(ValueType valueType, String fieldName) {
		ObjectNode node = JsonNodeFactory.instance.objectNode();

		if (valueType.getClazz() == YoroDataType.FLOAT) {
			node.put(fieldName, Float.valueOf(valueType.getValue().toString()));
		} else if (valueType.getClazz() == YoroDataType.NUMBER) {
			node.put(fieldName, Integer.valueOf(valueType.getValue().toString()));
		} else if (valueType.getClazz() == YoroDataType.DATE) {
			node.put(fieldName, (valueType.getValue().toString()));
		} else {
			node.put(fieldName, (valueType.getValue().toString()));
		}
		return node;
	}

	public static boolean checkFileType(String fileName) {
		List<String> splitList = new ArrayList<>();
		String[] splitArray = StringUtils.split(fileName, ".");
		splitList = Arrays.asList(splitArray);
		if (splitList != null && !splitList.isEmpty()) {
			String fileType = splitList.get(splitList.size() - 1);
			if (StringUtils.isNotEmpty(fileType) && !StringUtils.equalsAnyIgnoreCase(fileType, "exe", "jar", "msi", "zip", "js", "apk", "bin", "iso")) {
				return true;
			}
		}
		return false;
	}

	public static boolean checkFileTypes(String fileName) {
		List<String> splitList = new ArrayList<>();
		String[] splitArray = StringUtils.split(fileName, ".");
		splitList = Arrays.asList(splitArray);
		if (splitList != null && !splitList.isEmpty()) {
			String fileType = splitList.get(splitList.size() - 1);
			if (StringUtils.isNotEmpty(fileType) && StringUtils.equalsAnyIgnoreCase(fileType, "doc", "docx", "xls", "xlsx", "pdf", "txt", "ppt", "pptx", "png",
					"jpg", "jpeg", "bmp", "tiff", "gif", "svg")) {
				return true;
			}
		}
		return false;
	}

	private WorkflowUtils() {

	}

}
