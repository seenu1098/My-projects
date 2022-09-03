package com.yorosis.yoroflow.request.filter.context;

import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class YorosisContext {
	private static final ThreadLocal<YorosisContext> context = new ThreadLocal<>();

	private String userName;
	private String tenantId;
	private String token;
	private String requestId;
	private Set<String> rolesList;

	private String firstName;
	private String lastName;

	public static YorosisContext get() {
		return context.get();
	}

	public static void set(YorosisContext context) {
		YorosisContext.context.set(context);
	}

	public static void clear() {
		context.remove();
	}
}
