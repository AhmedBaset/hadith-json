const colors = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	dim: "\x1b[2m",
	underscore: "\x1b[4m",
	blink: "\x1b[5m",
	reverse: "\x1b[7m",
	hidden: "\x1b[8m",

	fg: {
		black: "\x1b[30m",
		red: "\x1b[31m",
		green: "\x1b[32m",
		yellow: "\x1b[33m",
		blue: "\x1b[34m",
		magenta: "\x1b[35m",
		cyan: "\x1b[36m",
		white: "\x1b[37m",
		gray: "\x1b[90m",
		crimson: "\x1b[38m", // Scarlet
	},
	bg: {
		black: "\x1b[40m",
		red: "\x1b[41m",
		green: "\x1b[42m",
		yellow: "\x1b[43m",
		blue: "\x1b[44m",
		magenta: "\x1b[45m",
		cyan: "\x1b[46m",
		white: "\x1b[47m",
		gray: "\x1b[100m",
		crimson: "\x1b[48m",
	},
};
type Prev = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
type Join<K, P> = K extends string | number
	? P extends string | number
		? `${K}${"" extends P ? "" : "."}${P}`
		: never
	: never;

type Leaves<T, D extends number = 10> = [D] extends [never]
	? never
	: T extends object
		? { [K in keyof T]-?: Join<K, Leaves<T[K], Prev[D]>> }[keyof T]
		: "";

/**
 * Custom console.log() with colors
 *
 * @param color Color to be used from `colors` object
 * @param text Text to be logged
 * @returns Text with color
 */
export function consoleColor(color: Leaves<typeof colors>, text: string) {
	if (!color) return text;
	const [colorType, colorName] = color.split(".");

	// @ts-ignore
	return console.log(colors[colorType][colorName], text, colors.reset);
}

export function style(color: Leaves<typeof colors>, text: string) {
	if (!color) return text;
	const [colorType, colorName] = color.split(".") as [
		keyof typeof colors,
		keyof (typeof colors)[keyof typeof colors],
	];

	return `${colors[colorType][colorName]}${text}${colors.reset}`;
}
