import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
	// Compatibility bridge for Astro 5 (@astrojs/cloudflare):
	// Astro 5 moves Cloudflare bindings to context.locals.cloudflare.env,
	// while @keystatic/astro expects context.locals.runtime.env.
	if (context.locals.cloudflare && !context.locals.runtime) {
		(context.locals as any).runtime = context.locals.cloudflare;
	}
	return next();
});
