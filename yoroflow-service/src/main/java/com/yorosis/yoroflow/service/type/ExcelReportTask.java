package com.yorosis.yoroflow.service.type;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalTime;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.apache.commons.io.output.ByteArrayOutputStream;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.ClientAnchor;
import org.apache.poi.ss.usermodel.CreationHelper;
import org.apache.poi.ss.usermodel.DataFormat;
import org.apache.poi.ss.usermodel.Drawing;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Picture;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.streaming.SXSSFSheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.yorosis.yoroflow.entities.ProcessDefTaskProperty;
import com.yorosis.yoroflow.entities.ProcessDefinitionTask;
import com.yorosis.yoroflow.entities.ProcessInstanceTask;
import com.yorosis.yoroflow.models.ExcelFileManagerVO;
import com.yorosis.yoroflow.models.FieldVO;
import com.yorosis.yoroflow.models.PageFieldVo;
import com.yorosis.yoroflow.models.TaskType;
import com.yorosis.yoroflow.models.YoroFlowException;
import com.yorosis.yoroflow.models.excel.ExcelRowsVO;
import com.yorosis.yoroflow.models.excel.ExcelTaskListVo;
import com.yorosis.yoroflow.models.excel.ExcelTaskVo;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;
import com.yorosis.yoroflow.services.ValueType;
import com.yorosis.yoroflow.services.VariableType;
import com.yorosis.yoroflow.services.WorkflowService;
import com.yorosis.yoroflow.services.WorkflowUtils;
import com.yorosis.yoroflow.services.YoroappsServiceClient;

@Component
public class ExcelReportTask extends AbstractBaseTypeService implements TaskService {

	private static final String PAGE_FIELDS = "pageFields";
	private static final String MAIN_SECTION = "mainSection";

	@Autowired
	private WorkflowService workflowService;

	@Autowired
	private YoroappsServiceClient webserviceClient;

	@Autowired
	private ObjectMapper mapper;

	@Override
	public TaskType getTaskType() {
		return TaskType.EXCEL_REPORT;
	}

	@Override
	public boolean canProceed(ProcessInstanceTask procInstanceTask) {
		return true;
	}

	@Override
	public Map<String, List<FieldVO>> getFieldList(JsonNode taskProperty) {
		Map<String, List<FieldVO>> fieldList = new LinkedHashMap<>();
		fieldList.put(MAIN_SECTION, WorkflowUtils.getValueFromDataForExcelReportTask(taskProperty));
		return fieldList;
	}

	@Override
	public boolean processTypeSpecificService(ProcessInstanceTask procInstanceTask, ProcessDefinitionTask procDefinitionTask)
			throws YoroFlowException, ParseException {
		List<ProcessDefTaskProperty> listTaskProperties = procDefinitionTask.getTaskProperties();

		if (!CollectionUtils.isEmpty(listTaskProperties)) {
			try {
				ProcessDefTaskProperty procDefTaskProperty = listTaskProperties.get(0);
				JsonNode propertyValue = procDefTaskProperty.getPropertyValue();

				String taskKey = procDefinitionTask.getTaskStepKey();
				String workflowStructure = procDefinitionTask.getProcessDefinition().getWorkflowStructure();
				JsonNode workflowJson = mapper.readValue(workflowStructure, JsonNode.class);
				Set<PageFieldVo> pageFields = workflowService.getPageFields(taskKey, workflowJson, true);
				if (propertyValue != null) {
					mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
					ExcelTaskListVo exceltaskListVo = mapper.treeToValue(propertyValue, ExcelTaskListVo.class);
					ByteArrayOutputStream bos = new ByteArrayOutputStream();
					try (SXSSFWorkbook workbook = new SXSSFWorkbook(10000);) {
						SXSSFSheet sheet = workbook.createSheet(propertyValue.get("name").asText());
						JsonNode jsonFieldValue = null;
						String arrayFieldId = null;

						if (!StringUtils.isEmpty(arrayFieldId)) {
							ValueType fieldValue = workflowService.getFieldValue(procInstanceTask.getProcessInstance().getProcessInstanceId(), arrayFieldId,
									VariableType.PAGEFIELD);
							jsonFieldValue = mapper.convertValue(fieldValue.getValue(), JsonNode.class);
						}

						int iSheet = 0;

						if (exceltaskListVo != null) {
							for (ExcelRowsVO excelRowsVO : exceltaskListVo.getExcelColumns()) {

								for (ExcelTaskVo excelTaskVo : excelRowsVO.getExcelDetails()) {
									sheet.setColumnWidth(iSheet++, 150 * 25);
								}
								break;
							}
						}
						CreationHelper createHelper = workbook.getCreationHelper();

						short dateFormat = createHelper.createDataFormat().getFormat("MM/dd/yyyy");

						CellStyle dateCellStyle = workbook.createCellStyle();
						dateCellStyle.setDataFormat(dateFormat);
						Font font = workbook.createFont();
						dateCellStyle.setFont(font);
						dateCellStyle.setAlignment(HorizontalAlignment.LEFT);
						dateCellStyle.setWrapText(true);

						DataFormat format = workbook.createDataFormat();

						CellStyle longOrIntegerCellStyle = workbook.createCellStyle();
						longOrIntegerCellStyle.setDataFormat(format.getFormat("#"));

						CellStyle floatOrDoubleCellStyle = workbook.createCellStyle();
						floatOrDoubleCellStyle.setDataFormat(format.getFormat("#.##"));

						CellStyle stringCellStyle = workbook.createCellStyle();
						stringCellStyle.setDataFormat(format.getFormat("@"));

						CellStyle rowCellStyle = workbook.createCellStyle();
						Font rowFont = workbook.createFont();
						rowFont.setBold(true);
						rowCellStyle.setDataFormat(format.getFormat("@"));
						rowCellStyle.setFont(rowFont);
						rowCellStyle.setFillBackgroundColor(IndexedColors.BRIGHT_GREEN.getIndex());

						int rownum = 0;
						Row row = sheet.createRow(rownum);
						for (int i = 0; i < row.getLastCellNum(); i++) {
							row.getCell(i).setCellStyle(rowCellStyle);
						}
						int rowCount = 0;
						for (ExcelRowsVO excelRowsVO : exceltaskListVo.getExcelColumns()) {
							if (rowCount != 0) {
								row = sheet.createRow(rownum++);
							}
							rowCount = -1;
							int colnum = 0;
							if (StringUtils.equals(excelRowsVO.getRowType(), "header")) {
								row.setHeightInPoints(20f);
								for (ExcelTaskVo excelTaskVo : excelRowsVO.getExcelDetails()) {
									setNormalFieldsInExcel(row, excelTaskVo, procInstanceTask, colnum++, workbook, format, sheet);
								}
								for (int i = 0; i < row.getLastCellNum(); i++) {
									row.getCell(i).setCellStyle(rowCellStyle);
								}
							} else if (StringUtils.equals(excelRowsVO.getRowType(), "values")) {
								for (ExcelTaskVo excelTaskVo : excelRowsVO.getExcelDetails()) {
									setNormalFieldsInExcel(row, excelTaskVo, procInstanceTask, colnum++, workbook, format, sheet);
								}
							} else if (StringUtils.equals(excelRowsVO.getRowType(), "emptyRow")) {
								for (int i = 0; i < excelRowsVO.getExcelDetails().size(); i++) {
									row.createCell(colnum++).setCellValue("");
								}
							} else {
								ValueType fieldValue = workflowService.getFieldValue(procInstanceTask.getProcessInstance().getProcessInstanceId(),
										excelRowsVO.getRowType(), VariableType.PAGEFIELD);
								if (fieldValue.getValue() != "") {
									jsonFieldValue = mapper.convertValue(fieldValue.getValue(), JsonNode.class);
									rowCount = 1;
									boolean isFirstEntry = true;
									for (JsonNode objNode : jsonFieldValue) {

										if (BooleanUtils.isFalse(isFirstEntry)) {
											row = sheet.createRow(rownum++);
										}
										isFirstEntry = false;
										colnum = 0;
										for (ExcelTaskVo excelTaskVo : excelRowsVO.getExcelDetails()) {
											if (objNode.has(excelTaskVo.getValue()) && StringUtils.equals(excelTaskVo.getVariableType(), "pageFields")) {
												if (StringUtils.equals(excelTaskVo.getDataType(), "date")
														&& StringUtils.isNotBlank(objNode.get(excelTaskVo.getValue()).asText())) {
													String dateFormatFromPage = null;
													if (!pageFields.isEmpty()) {
														for (PageFieldVo pageFieldVo : pageFields) {
															if (!pageFieldVo.getFieldVO().isEmpty()) {
																for (FieldVO fieldVo : pageFieldVo.getFieldVO()) {
																	if (StringUtils.equals(fieldVo.getFieldId(), excelTaskVo.getValue())
																			&& StringUtils.isNotBlank(fieldVo.getDateFormat())) {
																		dateFormatFromPage = fieldVo.getDateFormat();
																	}
																}
															}

														}
													}

													String dateFormatString = "MM/dd/yyyy";
													if (dateFormatFromPage != null) {
														if (StringUtils.equals(dateFormatFromPage, "MM/DD/yyyy")) {
															dateFormatString = "MM/dd/yyyy";
														} else if (StringUtils.equals(dateFormatFromPage, "DD/MM/yyyy")) {
															dateFormatString = "dd/MM/yyyy";
														} else if (StringUtils.equals(dateFormatFromPage, "yyyy-MM-DD")) {
															dateFormatString = "yyyy-MM-dd";
														} else if (StringUtils.equals(dateFormatFromPage, "MM/DD/yyyy dddd")) {
															dateFormatString = "MM/dd/yyyy EEEE";
														}
													}

													Cell dateCell = row.createCell(colnum++);
													String dateSubstring = objNode.get(excelTaskVo.getValue()).asText().substring(0, 10);
													Date parseDate = new SimpleDateFormat("yyyy-MM-dd").parse(dateSubstring);
													String dateString = new SimpleDateFormat(dateFormatString).format(parseDate);
													dateCell.setCellValue(dateString);
													dateCell.setCellStyle(dateCellStyle);

												} else if (!StringUtils.equals(objNode.get(excelTaskVo.getValue()).asText(), "null")) {
													Cell createCell = row.createCell(colnum++);
													createCell.setCellValue(objNode.get(excelTaskVo.getValue()).asText());
													if (StringUtils.equals(excelTaskVo.getDataType(), "string")) {
														createCell.setCellStyle(stringCellStyle);
													} else if (StringUtils.equals(excelTaskVo.getDataType(), "float")) {
														createCell.setCellStyle(floatOrDoubleCellStyle);
													} else if (StringUtils.equals(excelTaskVo.getDataType(), "long")) {
														createCell.setCellStyle(longOrIntegerCellStyle);
													}
												} else {
													row.createCell(colnum++).setCellValue("");
												}
											} else {
												setNormalFieldsInExcel(row, excelTaskVo, procInstanceTask, colnum++, workbook, format, sheet);
											}
										}
									}

									ValueType columnFieldValue = workflowService.getFieldValue(procInstanceTask.getProcessInstance().getProcessInstanceId(),
											"columnComputationArray", VariableType.PAGEFIELD);
									if (columnFieldValue.getValue() != "") {

										jsonFieldValue = mapper.convertValue(columnFieldValue.getValue(), JsonNode.class);
										for (JsonNode objNode : jsonFieldValue) {
											row = sheet.createRow(rownum++);
											colnum = 0;
											for (int i = 0; i < excelRowsVO.getExcelDetails().size(); i++) {
												if (!objNode.get(excelRowsVO.getExcelDetails().get(i).getValue()).isNull()
														&& objNode.has(excelRowsVO.getExcelDetails().get(i).getValue())) {
													if (i == 0) {
														Cell createCell = row.createCell(colnum++);
														createCell.setCellValue(objNode.get("computationLabelName").asText());

														createCell.setCellStyle(stringCellStyle);
														createCell.setCellStyle(longOrIntegerCellStyle);
													} else {
														Cell createCell = row.createCell(colnum++);
														createCell.setCellValue(objNode.get(excelRowsVO.getExcelDetails().get(i).getValue()).asText());
														if (StringUtils.equals(excelRowsVO.getExcelDetails().get(i).getDataType(), "string")) {
															createCell.setCellStyle(stringCellStyle);
														} else if (StringUtils.equals(excelRowsVO.getExcelDetails().get(i).getDataType(), "float")) {
															createCell.setCellStyle(floatOrDoubleCellStyle);
														} else if (StringUtils.equals(excelRowsVO.getExcelDetails().get(i).getDataType(), "long")) {
															createCell.setCellStyle(longOrIntegerCellStyle);
														}
													}
												} else {
													setNormalFieldsInExcel(row, excelRowsVO.getExcelDetails().get(i), procInstanceTask, colnum++, workbook,
															format, sheet);
												}
											}
											for (int i = 0; i < row.getLastCellNum(); i++) {
												row.getCell(i).setCellStyle(rowCellStyle);
											}
										}
									}
								}
							}
						}

						for (int x = 0; x < sheet.getRow(0).getPhysicalNumberOfCells(); x++) {
							sheet.trackAllColumnsForAutoSizing();
							sheet.autoSizeColumn(x);
						}

						workbook.write(bos);
						workbook.dispose();
					} catch (IOException ie) {
						throw new YoroFlowException("File is invalid");
					}
					try {
						ByteArrayInputStream bi = new ByteArrayInputStream(bos.toByteArray());

						bi.read(bos.toByteArray());
						byte[] bytes = bos.toByteArray();
						bi.close();
						String excelKey = new StringBuilder(UUID.randomUUID().toString()).append(LocalTime.now()).toString();
						ExcelFileManagerVO excelFileManagerVO = ExcelFileManagerVO.builder().inputStream(bytes).key(excelKey).build();
						webserviceClient.uploadFileForExcel(YorosisContext.get().getToken(), excelFileManagerVO);
						ObjectNode node = JsonNodeFactory.instance.objectNode();
						if (propertyValue.has("generatedExcelName")) {
							node.put(propertyValue.get("generatedExcelName").asText(), excelKey);
						}
						procInstanceTask.setData(node);
						procInstanceTask.setTargetStepKey(procDefinitionTask.getTargetStepKey());
					} catch (IOException ie) {
						throw new YoroFlowException("File is invalid");
					}
				}
			} catch (JsonProcessingException e) {

				throw new YoroFlowException(ExceptionUtils.getRootCauseMessage(e));
			}
		}
		return true;
	}

	private void setNormalFieldsInExcel(Row row, ExcelTaskVo excelTaskVo, ProcessInstanceTask procInstanceTask, int colnum, SXSSFWorkbook workbook,
			DataFormat format, SXSSFSheet sheet) throws IOException {
		if (excelTaskVo != null && !StringUtils.equals(excelTaskVo.getValue(), "null")) {
			CellStyle longOrIntegerCellStyle = workbook.createCellStyle();
			longOrIntegerCellStyle.setDataFormat(format.getFormat("#"));

			CellStyle floatOrDoubleCellStyle = workbook.createCellStyle();
			floatOrDoubleCellStyle.setDataFormat(format.getFormat("#.##"));

			CellStyle stringCellStyle = workbook.createCellStyle();
			stringCellStyle.setDataFormat(format.getFormat("@"));

			if (StringUtils.equalsIgnoreCase(excelTaskVo.getVariableType(), PAGE_FIELDS)) {
				ValueType fieldValue = workflowService.getFieldValue(procInstanceTask.getProcessInstance().getProcessInstanceId(), excelTaskVo.getValue(),
						VariableType.PAGEFIELD);
				if (fieldValue.getValue().toString().contains("data:image/png;")) {
					String base64Image = fieldValue.getValue().toString().split(",")[1];
					byte[] imageBytes = javax.xml.bind.DatatypeConverter.parseBase64Binary(base64Image);
					int pictureIdx = workbook.addPicture(imageBytes, Workbook.PICTURE_TYPE_PNG);
					CreationHelper helper = workbook.getCreationHelper();

					Drawing<?> drawing = sheet.createDrawingPatriarch();

					ClientAnchor anchor = helper.createClientAnchor();
					anchor.setCol1(0);
					anchor.setRow1(sheet.getLastRowNum());
					Picture picture = drawing.createPicture(anchor, pictureIdx);

					double height = picture.getImageDimension().getHeight();
					sheet.getRow(sheet.getLastRowNum()).setHeightInPoints((float) height);

					picture.resize();
				} else {
					if (!StringUtils.equals(fieldValue.getValue().toString(), "null")) {
						Cell createCell = row.createCell(colnum);
						createCell.setCellValue(fieldValue.getValue().toString() == null ? "" : fieldValue.getValue().toString());
						if (StringUtils.equals(excelTaskVo.getDataType(), "string")) {
							createCell.setCellStyle(stringCellStyle);
						} else if (StringUtils.equals(excelTaskVo.getDataType(), "float")) {
							createCell.setCellStyle(floatOrDoubleCellStyle);
						} else if (StringUtils.equals(excelTaskVo.getDataType(), "long")) {
							createCell.setCellStyle(longOrIntegerCellStyle);
						}
					} else {
						row.createCell(colnum).setCellValue("");
					}
				}

			} else {
				Cell createCell = row.createCell(colnum);
				createCell.setCellValue(excelTaskVo.getValue() == null ? "" : excelTaskVo.getValue());
				createCell.setCellStyle(stringCellStyle);
			}
		} else {
			row.createCell(colnum).setCellValue("");
		}
	}
}
