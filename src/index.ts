import { books } from "./books";
import { scrapeData } from "./helpers/scrapeData";
import createDirs from "./helpers/createDirs";
import createFile from "./helpers/createFile";
import { formatFile } from "./helpers/formatFile";
import { SingleBar, Presets } from "cli-progress";

async function handleByChapterFolder() {
	//* For Each Book (Bukhari, Muslim, etc.)
	for (const book of books) {
		//* Create Progress Bar
		const bar = new SingleBar(
			{
				format: `{value}/{total} | {bar} {percentage}% | {book}`,
				hideCursor: true,
				stopOnComplete: true,
			},
			Presets.shades_classic
		);
		bar.start(book.route.chapters.length, 0, { book: book.english.title });

		//* Create Directories ./data/${book}/
		await createDirs(["db", "by_chapter"], ...book.path);

		//* For Each Chapter in Book (1st, 2nd, etc.)
		for (const [index, chapter] of book.route.chapters.entries()) {
			//* Get Data From `${URL}/${book}/${chapter}`
			const data = await scrapeData(`${book.route.base}/${chapter}`);
			if (!data)
				return console.log(
					"Error getting data",
					`${book.route.base}/${chapter}`
				);

			//* Format Data to be like {BookData} interface
			const formattedData = formatFile(book, data);

			//* Create File {book}/${chapter}.json
			await createFile(
				["db", "by_chapter"],
				book.path,
				`${index + 1}`,
				formattedData
			);

			//* Update Progress Bar
			bar.update(index + 1, {
				book: `${book.english.title} | ${data.chapter?.english}`,
			});
		}
	}
}

async function main() {
	await handleByChapterFolder();
}

main();
