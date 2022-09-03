package com.yorosis.livetester.security;

import java.io.IOException;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import com.yorosis.livetester.service.LicenseValidationService;
import com.yorosis.livetester.service.TokenProviderService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.SignatureException;
import lombok.extern.slf4j.Slf4j;

@Slf4j

public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private static final String TOKEN_PREFIX = "Bearer ";
	private static final String HEADER_STRING = "Authorization";

	@Autowired
	private UserDetailsService userDetailsService;

	@Autowired
	private TokenProviderService tokenProviderService;

	@Autowired
	private LicenseValidationService licenseValidationService;

	@Override
	protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) throws IOException, ServletException {
		String header = req.getHeader(HEADER_STRING);
		res.addHeader("Access-Control-Expose-Headers", "Content-Disposition");

		String username = null;
		String authToken = null;

		if (header != null && header.startsWith(TOKEN_PREFIX)) {
			authToken = header.replace(TOKEN_PREFIX, "");
			try {
				username = tokenProviderService.getUsernameFromToken(authToken);
			} catch (IllegalArgumentException e) {
				log.error("an error occured during getting username from token", e);
			} catch (ExpiredJwtException e) {
				log.warn("the token is expired and not valid anymore", e);
			} catch (SignatureException e) {
				log.error("Authentication Failed. Username or Password not valid.");
			}
		} else {
			log.warn("couldn't find bearer string, will ignore the header");
		}

		if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
			UserDetails userDetails = userDetailsService.loadUserByUsername(username);

			if (tokenProviderService.validateToken(authToken, userDetails)) {
				UsernamePasswordAuthenticationToken authentication = tokenProviderService.getAuthentication(authToken, userDetails);

				authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
				log.debug("authenticated user " + username + ", setting security context");

				SecurityContextHolder.getContext().setAuthentication(authentication);
			}
		}

		try {
			if (StringUtils.isNotBlank(username) && SecurityContextHolder.getContext().getAuthentication() != null) {
				Claims allClaimsFromToken = tokenProviderService.getAllClaimsFromToken(authToken);
				YorosisContext.set(YorosisContext.builder().userName(username).globalAccess((Boolean) allClaimsFromToken.get("global-access")).build());
			}

			licenseValidationService.validateLicense();

			chain.doFilter(req, res);
		} finally {
			YorosisContext.clear();
		}

	}

}
