package com.yorosis.yoroflow.services.ws;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yorosis.yoroflow.models.YoroFlowException;
import com.yorosis.yoroflow.models.ws.CustomHeader;
import com.yorosis.yoroflow.models.ws.HeaderKeyValue;
import com.yorosis.yoroflow.models.ws.WsRequest;
import com.yorosis.yoroflow.models.ws.WsResponse;

import kong.unirest.GetRequest;
import kong.unirest.HttpRequest;
import kong.unirest.HttpRequestWithBody;
import kong.unirest.HttpResponse;
import kong.unirest.JsonNode;
import kong.unirest.Unirest;

@Service
public class WebServiceCaller {

	@Autowired
	private ObjectMapper mapper;

	private enum Method {
		GET, POST, PUT, DELETE
	};

	private enum Auth {
		NOAUTH, APIKEY, BEARERTOKEN, BASICAUTH
	};

	private static final String AUTH_USERNAME = "username";
	private static final String AUTH_PWD = "password";

	private WsResponse processRequest(JsonNode reqJson) throws JsonProcessingException, YoroFlowException {
		WsRequest req = mapper.readValue(reqJson.toString(), WsRequest.class);
		return processWsRequest(req);
	}

	private WsResponse processStringRequest(String reqJson) throws JsonProcessingException, YoroFlowException {
		WsRequest req = mapper.readValue(reqJson, WsRequest.class);
		return processWsRequest(req);
	}

	public WsResponse processWsRequest(WsRequest wsReq) throws YoroFlowException {
		HttpRequestWithBody request = null;

		Method httpMethod = Method.valueOf(wsReq.getHttpMethod().toUpperCase());
		switch (httpMethod) {
		case GET:
			return constructWSresponse(processGet(wsReq));
		case POST:
			request = Unirest.post(wsReq.getRemoteUrl());
			break;
		case PUT:
			request = Unirest.put(wsReq.getRemoteUrl());
			break;
		case DELETE:
			request = Unirest.delete(wsReq.getRemoteUrl());
			break;
		default:
			throw new YoroFlowException("Invalid HTTPMethod -" + httpMethod);
		}
		HttpResponse<JsonNode> httpResponse = processRequest(request, wsReq);
		return constructWSresponse(httpResponse);
	}

	private WsResponse constructWSresponse(HttpResponse<JsonNode> httpResponse) {
		return WsResponse.builder().statusCode(httpResponse.getStatus()).statusText(httpResponse.getStatusText()).body(httpResponse.getBody()).build();
	}

	private HttpResponse<JsonNode> processGet(WsRequest wsReq) {

		GetRequest getRequest = Unirest.get(wsReq.getRemoteUrl());
		getRequest.headers(getHeaderMap(wsReq));
		if (wsReq.getAuthorization() != null) {
			setAuthForGet(getRequest, wsReq);
		}
		if (wsReq.getQueryParams() != null) {
			getRequest.queryString(convertKeyValueToMap(wsReq.getQueryParams()));
		}
		return getRequest.asJson();
	}

	private HttpResponse<JsonNode> processRequest(HttpRequestWithBody httpRequest, WsRequest wsReq) {

		setTimeouts(httpRequest, wsReq);
		httpRequest.headers(getHeaderMap(wsReq));
		if (wsReq.getAuthorization() != null) {
			setAuth(httpRequest, wsReq);
		}
		if (wsReq.getQueryParams() != null) {
			httpRequest.queryString(convertKeyValueToMap(wsReq.getQueryParams()));
		}
		return httpRequest.body(wsReq.getPayload().toString()).asJson();
		// return httpRequest.asJson();
	}

	private void setTimeouts(HttpRequestWithBody httpRequest, WsRequest wsReq) {

		if (wsReq.getConnectionTimeout() > 0) {
			httpRequest.connectTimeout(wsReq.getConnectionTimeout());
		}
		if (wsReq.getReadTimeout() > 0) {
			httpRequest.socketTimeout(wsReq.getReadTimeout());
		}
	}

	private Map<String, String> getHeaderMap(WsRequest wsReq) {
		Map<String, String> hdrMap = new HashMap<>();
		hdrMap.put("Content-Type", wsReq.getContentType());
		hdrMap.put("Accept", wsReq.getContentType());

		if (!CollectionUtils.isEmpty(wsReq.getCustomHeaders())) {
			for (CustomHeader headerKeyValue : wsReq.getCustomHeaders()) {
				if (StringUtils.equals(headerKeyValue.getKey(), "Authorization")) {
					hdrMap.put("Authorization", headerKeyValue.getValue());
				}
			}
		}
		return hdrMap;
	}

	private void setAuthForGet(HttpRequest<GetRequest> httpRequest, WsRequest wsReq) {

		Auth auth = Auth.valueOf(wsReq.getAuthorization().toUpperCase());
		switch (auth) {
		case NOAUTH:
			break;
		case APIKEY:
			break;
		case BEARERTOKEN:
			if (StringUtils.isNotBlank(wsReq.getBearerToken().getToken())) {
				httpRequest.header("Authorization", wsReq.getBearerToken().getToken());
			}
			break;
		case BASICAUTH:
			httpRequest.basicAuth(getValueforKey(wsReq.getCustomHeaders(), AUTH_USERNAME), getValueforKey(wsReq.getCustomHeaders(), AUTH_PWD));
			break;
		}
	}

	private void setAuth(HttpRequest<HttpRequestWithBody> httpRequest, WsRequest wsReq) {

		Auth auth = Auth.valueOf(wsReq.getAuthorization().toUpperCase());
		switch (auth) {
		case NOAUTH:
			break;
		case APIKEY:
			break;
		case BEARERTOKEN:
			if (StringUtils.isNotBlank(wsReq.getBearerToken().getToken())) {
				httpRequest.header("Authorization", wsReq.getBearerToken().getToken());
			}
			break;
		case BASICAUTH:
			httpRequest.basicAuth(getValueforKey(wsReq.getCustomHeaders(), AUTH_USERNAME), getValueforKey(wsReq.getCustomHeaders(), AUTH_PWD));
			break;
		}
	}

	private String getValueforKey(List<CustomHeader> headerKeyValueLst, String key) {
		String valueForKey = null;
		for (CustomHeader kvHeader : headerKeyValueLst) {
			if (kvHeader.getKey() != null && kvHeader.getKey().equals(key)) {
				valueForKey = kvHeader.getValue();
			}
		}

		return valueForKey;
	}

	private Map<String, Object> convertKeyValueToMap(List<HeaderKeyValue> headerKeyValueLst) {
		Map<String, Object> lstToMapKeyValue = null;
		for (HeaderKeyValue kvHeader : headerKeyValueLst) {
			if (!kvHeader.getKey().isEmpty()) {
				if (lstToMapKeyValue == null)
					lstToMapKeyValue = new HashMap<>();

				lstToMapKeyValue.put(kvHeader.getKey(), kvHeader.getValue());
			}
		}
		return lstToMapKeyValue;
	}
}
