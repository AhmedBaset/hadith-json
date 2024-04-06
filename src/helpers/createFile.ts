import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import nodePath from "node:path";

/**
 * Create File (e.g. db/bukhari/1.json)
 *
 * @param path Path to file (e.g. ["bukhari"])
 * @param fileName Name of file (e.g. "1")
 * @param data Data to be written to file
 */
async function createFile(
	mainDir: string[],
	path: string[],
	fileName: string,
	data: unknown,
) {
	const resolvedPath = nodePath.join(
		process.cwd(),
		...mainDir,
		...path,
		`${fileName}.json`,
	);
	const textContent = JSON.stringify(data);
	// const textContent = JSON.stringify(data, null, 2); //? For pretty JSON

	// Exit if file already exists
	// if (existsSync(resolvedPath)) return

	// Write content to file
	await writeFile(resolvedPath, textContent);
	// console.info(`File "${path.join("/")}/${fileName}.json" created!`)
}

export default createFile;
