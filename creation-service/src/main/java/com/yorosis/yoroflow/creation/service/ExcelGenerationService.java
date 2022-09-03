package com.yorosis.yoroflow.creation.service;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.CreationHelper;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.streaming.SXSSFSheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import com.yorosis.yoroapps.vo.ExcelGenerationVo;
import com.yorosis.yoroapps.vo.ExcelHeadersVo;
import com.yorosis.yoroflow.creation.exception.YoroappsException;

@Service
public class ExcelGenerationService {

	public void getExcel(ExcelGenerationVo reportData, HttpServletResponse response)
			throws YoroappsException, ParseException {
		if (!CollectionUtils.isEmpty(reportData.getData()) || !CollectionUtils.isEmpty(reportData.getReportHeaders())) {
			List<Map<String, String>> data = reportData.getData();
			try (SXSSFWorkbook workbook = new SXSSFWorkbook(10000);) {
				SXSSFSheet sheet = workbook.createSheet(reportData.getReportName());
				List<Integer> dateColumn = new ArrayList<>();
				int iSheet = 0;

				for (Map.Entry<String, String> entry : data.get(0).entrySet()) {
					if (StringUtils.contains(entry.getValue(), "0Z")) {
						dateColumn.add(iSheet);
					}
					sheet.setColumnWidth(iSheet++, 3500);
				}

				Row row = sheet.createRow(0);
				row.setHeightInPoints(20f);
				int irow = 0;

				for (Map.Entry<String, String> entry : data.get(0).entrySet()) {
					for (ExcelHeadersVo key : reportData.getReportHeaders()) {
						if (StringUtils.equals(key.getHeaderId(), entry.getKey()))
							row.createCell(irow++).setCellValue(key.getHeaderName());
					}
				}
				CreationHelper createHelper = workbook.getCreationHelper();

				short dateFormat = createHelper.createDataFormat().getFormat("MM/dd/yyyy");

				CellStyle cellStyle = workbook.createCellStyle();
				cellStyle.setDataFormat(dateFormat);
				Font font = workbook.createFont();
				cellStyle.setFont(font);
				cellStyle.setAlignment(HorizontalAlignment.LEFT);
				cellStyle.setWrapText(true);

				CellStyle rowCellStyle = workbook.createCellStyle();
				Font rowFont = workbook.createFont();
				rowFont.setBold(true);
				rowCellStyle.setFont(rowFont);
				rowCellStyle.setFillBackgroundColor(IndexedColors.BRIGHT_GREEN.getIndex());
				for (int i = 0; i < row.getLastCellNum(); i++) {
					row.getCell(i).setCellStyle(rowCellStyle);
				}

				int rownum = 1;
				for (int i = 0; i < data.size(); i++) {
					row = sheet.createRow(rownum++);
					int colnum = 0;
					for (Map.Entry<String, String> entry : data.get(i).entrySet()) {
						if (dateColumn.contains(colnum) && !StringUtils.isEmpty(entry.getValue())) {
							Cell dateCell = row.createCell(colnum++);
							Date parseDate = new SimpleDateFormat("yyyy-MM-dd")
									.parse(entry.getValue().substring(0, 10));
							String dateString = new SimpleDateFormat("dd MMM yyyy").format(parseDate);
							dateCell.setCellValue(dateString);
							dateCell.setCellStyle(cellStyle);
						} else {
							row.createCell(colnum++).setCellValue(entry.getValue());
						}
					}
				}
				response.setHeader("content-disposition",
						"attachment; filename=" + reportData.getReportName() + ".xlsx");

				for (int x = 0; x < sheet.getRow(0).getPhysicalNumberOfCells(); x++) {
					sheet.trackAllColumnsForAutoSizing();
					sheet.autoSizeColumn(x);
				}

				workbook.write(response.getOutputStream());
				workbook.dispose();
			} catch (IOException ie) {
				throw new YoroappsException("File is invalid");
			}

		}
	}

}
