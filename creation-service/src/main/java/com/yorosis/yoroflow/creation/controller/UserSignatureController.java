package com.yorosis.yoroflow.creation.controller;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yorosis.yoroapps.vo.ResponseStringVO;
import com.yorosis.yoroapps.vo.UserSignatureVo;
import com.yorosis.yoroflow.creation.service.UserSignatureService;

@RestController
@RequestMapping("/user-signature/v1")
public class UserSignatureController {

	@Autowired
	private UserSignatureService userSignatureService;

	private final ObjectMapper mapper = new ObjectMapper();

	@PostMapping(path = "/upload-file")
	public UserSignatureVo attachFiles(@RequestParam("data") String data, @RequestParam(value = "files", required = false) MultipartFile file)
			throws IOException {
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		UserSignatureVo userSignatureVo = mapper.readValue(data, UserSignatureVo.class);
		return userSignatureService.saveSignature(userSignatureVo, file);
	}

	@GetMapping(value = "/download/file/{key}")
	public ResponseEntity<byte[]> showFiles(@PathVariable("key") String key) throws IOException {
		byte[] document = userSignatureService.getFile(key);
		HttpHeaders header = new HttpHeaders();
		header.setContentType(new MediaType("application", "png"));
		header.setContentLength(document.length);
		return new ResponseEntity<>(document, header, HttpStatus.OK);
	}

	@GetMapping("/get/logged-in/user-signature")
	public List<UserSignatureVo> getUserDetails() {
		return userSignatureService.getUserSignatureList();
	}

	@GetMapping("/get/user-signature/{id}")
	public ResponseStringVO deleteUserSignature(@PathVariable(name = "id") String id) {
		return userSignatureService.deleteUserSignature(UUID.fromString(id));
	}

}
