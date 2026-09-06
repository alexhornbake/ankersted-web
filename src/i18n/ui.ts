export const locales = ["da", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "da";

export function isLocale(value: string | undefined): value is Locale {
	return value === "da" || value === "en";
}

export const ui = {
	da: {
		navHome: "Hjem",
		navBackground: "Baggrund",
		navPractical: "Praktisk",
		lastUpdatedOn: "Sidst opdateret",
		langSwitchLabel: "Sprog",
	},
	en: {
		navHome: "Home",
		navBackground: "Background",
		navPractical: "Practical",
		lastUpdatedOn: "Last updated on",
		langSwitchLabel: "Language",
	},
} as const;

export type UiKey = keyof (typeof ui)["da"];

export function t(lang: Locale, key: UiKey): string {
	return ui[lang][key];
}

/** BCP 47 tags for date formatting */
export const dateLocales: Record<Locale, string> = {
	da: "da-DK",
	en: "en-GB",
};

/**
 * Swap locale for a pathname.
 * Danish is unprefixed (`/baggrund`); English is prefixed (`/en/baggrund`).
 * Non-localized paths (e.g. `/blog`) map to the target locale home.
 */
export function swapLocalePath(pathname: string, target: Locale): string {
	const segments = pathname.split("/").filter(Boolean);
	const rest = isLocale(segments[0]) ? segments.slice(1) : segments;

	if (rest[0] === "blog" || rest[0] === "keystatic") {
		return target === defaultLocale ? "/" : `/${target}/`;
	}

	if (target === defaultLocale) {
		return rest.length === 0 ? "/" : `/${rest.join("/")}/`;
	}
	return rest.length === 0 ? `/${target}/` : `/${target}/${rest.join("/")}/`;
}

export function getLangFromPath(pathname: string): Locale {
	const first = pathname.split("/").filter(Boolean)[0];
	return first === "en" ? "en" : defaultLocale;
}

/** Path without locale prefix, for hreflang / switcher helpers. */
export function pathWithoutLocale(pathname: string): string | null {
	const segments = pathname.split("/").filter(Boolean);
	if (segments[0] === "blog" || segments[0] === "keystatic") {
		return null;
	}
	if (isLocale(segments[0])) {
		return segments.slice(1).join("/");
	}
	return segments.join("/");
}
