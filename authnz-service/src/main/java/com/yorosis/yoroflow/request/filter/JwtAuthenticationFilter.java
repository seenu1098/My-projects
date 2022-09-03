package com.yorosis.yoroflow.request.filter;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import com.yorosis.authnz.controller.UserController;
import com.yorosis.authnz.exception.YorosisException;
import com.yorosis.authnz.service.UserService;
import com.yorosis.yoroflow.request.filter.client.AuthDetailsVO;
import com.yorosis.yoroflow.request.filter.client.AuthnzServiceClient;
import com.yorosis.yoroflow.request.filter.client.UserDetailsVO;
import com.yorosis.yoroflow.request.filter.client.interceptor.FeignClientHeaderInterceptor;
import com.yorosis.yoroflow.request.filter.context.YorosisContext;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	@Autowired
	private UserController userController;

	@Override
	protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
			throws IOException, ServletException {
		String header = req.getHeader(FeignClientHeaderInterceptor.AUTHORIZATION_HEADER);

		if (StringUtils.isNotBlank(header)) {
			AuthDetailsVO authenticateDetailsVO = new AuthDetailsVO();
			try {
				authenticateDetailsVO = userController.validateToken(header, null, null);
			} catch (YorosisException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			} catch (InterruptedException e) {
				e.printStackTrace();
			} catch (ExecutionException e) {
				e.printStackTrace();
			}
			if (BooleanUtils.isTrue(authenticateDetailsVO.isAuthenticated())) {
				try {
					String requestId = req.getHeader(FeignClientHeaderInterceptor.YOROFLOW_REQUEST_ID_HEADER);
					requestId = StringUtils.isNotBlank(requestId) ? requestId : UUID.randomUUID().toString();

					YorosisContext context = YorosisContext.builder().tenantId(authenticateDetailsVO.getTenantId())
							.userName(authenticateDetailsVO.getUserName()).token(authenticateDetailsVO.getToken())
							.requestId(requestId).build();

					YorosisContext.set(context);
					MDC.put("currentLoggedInUserName", authenticateDetailsVO.getUserName());
					MDC.put(FeignClientHeaderInterceptor.YOROFLOW_REQUEST_ID_HEADER, requestId);
					MDC.put("currentTenantId", authenticateDetailsVO.getTenantId());

					if (SecurityContextHolder.getContext().getAuthentication() == null) {
						Set<SimpleGrantedAuthority> authority = getAuthority(authenticateDetailsVO.getUserDetails());
						UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
								new User(authenticateDetailsVO.getUserName(), "", authority), "", authority);
						authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
						log.trace("Authenticated user {} setting security context",
								authenticateDetailsVO.getUserName());

						SecurityContextHolder.getContext().setAuthentication(authentication);
					}

					chain.doFilter(req, res);
				} finally {
					YorosisContext.clear();
					MDC.clear();
				}
			}
		} else {
			chain.doFilter(req, res);
		}

	}

	private Set<SimpleGrantedAuthority> getAuthority(UserDetailsVO userDetailsVO) {
		Set<SimpleGrantedAuthority> authorities = new HashSet<>();
		if (userDetailsVO != null && userDetailsVO.getAuthorities() != null) {
			authorities = userDetailsVO.getAuthorities().stream()
					.filter(p -> p != null && StringUtils.isNotBlank(p.getAuthority()))
					.map(p -> new SimpleGrantedAuthority(p.getAuthority())).collect(Collectors.toSet());
		}

		return authorities;
	}
}
