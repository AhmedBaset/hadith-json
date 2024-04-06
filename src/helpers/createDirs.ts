import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";

/**
 * Create directories (e.g. db/the_9_books/bukhari)
 *
 * @param dirs The directories to create
 */
const createDirs = async (mainDir: string[] = ["db"], ...dirs: string[]) => {
	// Resolve the path
	const resolvedPath = path.join(process.cwd(), ...mainDir, ...dirs);

	// Exit if the path already exists
	if (existsSync(resolvedPath)) return;

	// Create the directories
	await mkdir(resolvedPath, { recursive: true });

	// Feedback
	// console.info(`Folder "${dirs.join("/")}" created!`);
};

export default createDirs;
