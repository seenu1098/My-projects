package com.yorosis.livetester.security;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@AllArgsConstructor
public class YorosisContext {
	private static final ThreadLocal<YorosisContext> context = new ThreadLocal<>();

	@Getter
	@Setter
	private String userName;

	@Getter
	@Setter
	private boolean globalAccess;

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
