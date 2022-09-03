package com.yorosis.yoroflow.general.config;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import com.yorosis.yoroflow.general.exception.YoroErrorResonse;
import com.yorosis.yoroflow.general.exception.YorosisException;

import lombok.extern.slf4j.Slf4j;

@ControllerAdvice
@Slf4j
public class YoroExceptionHandler extends ResponseEntityExceptionHandler {

	@ExceptionHandler(value = { AccessDeniedException.class })
	public ResponseEntity<YoroErrorResonse> customForbiddenRequest(HttpServletRequest request,
			HttpServletResponse response, AccessDeniedException ex) throws IOException {
		log.error("Some error occured", ex);
		return new ResponseEntity<>(new YoroErrorResonse("Access Denied", 403, "You don't have access"),
				HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<YoroErrorResonse> customHandleNotFound(Exception ex, WebRequest request) {
		log.error("Some error occured", ex);
		return new ResponseEntity<>(new YoroErrorResonse("Internal error occured", 500, ExceptionUtils.getMessage(ex)),
				HttpStatus.INTERNAL_SERVER_ERROR);

	}

	@ExceptionHandler(YorosisException.class)
	public ResponseEntity<YoroErrorResonse> customBusinessValidation(Exception ex, WebRequest request) {
		log.error("Some error occured", ex);
		return new ResponseEntity<>(
				new YoroErrorResonse("Business Validation Failure", 400, ExceptionUtils.getMessage(ex)),
				HttpStatus.BAD_REQUEST);

	}

}