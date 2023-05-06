import { books } from "./books";
import { scrapeData } from "./helpers/scrapeData";
import createDirs from "./helpers/createDirs";
import createFile from "./helpers/createFile";
import { formatFile } from "./helpers/formatFile";
import { SingleBar, Presets } from "cli-progress";
import { readdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

try {
	main();
} catch (error) {
	console.trace(error);
}
	
async function main() {
	const START_TIME = Date.now();

	console.log("Working on [db/by_chapter] folder...");
	await handleByChapterFolder();
	console.log(
		`Done with [db/by_chapter] folder in ${
			(Date.now() - START_TIME) / 1000
		}s\n`
	);

	console.log("Working on [db/by_book] folder...");
	await handleByBookFolder();
	console.log(
		`Done with [db/by_book] folder in ${(Date.now() - START_TIME) / 1000}s`
	);
}

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
			//* Update Progress Bar
			bar.update(index + 1, {
				book: `${book.english.title} | ${chapter}`,
			});

			if (existsSync(path.join(process.cwd(), "db", "by_chapter", ...book.path, `${index + 1}.json`))) continue;

			//* Get Data From `${URL}/${book}/${chapter}`
			const data = await scrapeData(
				`${book.route.base}/${chapter}`,
				book.id
			);
			if (!data)
				return console.log(
					"Error getting data",
					`${book.route.base}/${chapter}`
				);

			//* Format Data to be like {ChapterFile} interface
			const formattedData = formatFile(book, data);

			//* Create File {book}/${chapter}.json
			await createFile(
				["db", "by_chapter"],
				book.path,
				`${index + 1}`,
				formattedData
			);
		}
	}
}

async function handleByBookFolder() {
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

		const bookDir: string = path.join(
			process.cwd(),
			"db",
			"by_chapter",
			...book.path
		);
		const bookDirFiles: string[] = await readdir(bookDir);

		const bookData: Prettify<BookFile> = {
			id: book.id,
			metadata: {
				length: 0,
				arabic: {
					title: book.arabic.title,
					author: book.arabic.author,
					introduction: "",
				},
				english: {
					title: book.english.title,
					author: book.english.author,
					introduction: "",
				},
			},
			chapters: [],
			hadiths: [],
		};

		let hadithId = 1;
		for (const [index, chapterFileName] of bookDirFiles.entries()) {
			const chapterData: ChapterFile = require(path.join(
				bookDir,
				chapterFileName
			));

			bookData.chapters.push({
				id: index + 1,
				bookId: book.id,
				arabic: chapterData.chapter?.arabic || "",
				english: chapterData.chapter?.english || "",
			});

			bookData.metadata.length += chapterData.metadata.length;

			bookData.hadiths.push(
				...chapterData.hadiths.map((hadith: Prettify<Hadith>) => ({
					...hadith,
					id: hadithId++,
					bookId: book.id,
					chapterId: index + 1,
				}))
			);

			//* Update Progress Bar
			bar.update(index + 1, {
				book: `${book.english.title} | ${chapterData.chapter?.english}`,
			});
		}

		//* Create Folder {db/by_book/the_9_books}
		await createDirs(["db", "by_book"], ...book.path.slice(0, -1));

		//* Create File {db/by_book/the_9_books/bukhari.json}
		await createFile(
			["db", "by_book"],
			book.path.slice(0, -1),
			book.path.at(-1)!,
			bookData
		);
	}
}
