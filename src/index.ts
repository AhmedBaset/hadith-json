require("dotenv").config();

import { books } from "./books";
import { scrapeData } from "./helpers/scrapeData";
import createDirs from "./helpers/createDirs";
import createFile from "./helpers/createFile";
import { formatFile } from "./helpers/formatFile";
import { SingleBar, Presets } from "cli-progress";
import { readdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { consoleColor } from "./helpers/consoleColor";


try {
	main();
} catch (error) {
	console.trace(error);
}

async function main() {
	const START_TIME = Date.now();

	consoleColor("fg.white", "--------------------------------");
	consoleColor("bg.cyan", "Welcome in the Hadith-DB-Scraper");
	consoleColor("fg.blue", "--------------------------------");
	consoleColor("fg.green", "By default, You have to choose what functions to run");
	consoleColor("fg.magenta", "Go to src/index.ts and uncomment the functions you want to run");
	consoleColor("fg.yellow", "You can find it in the main() function");
	consoleColor("fg.white", "--------------------------------");

	// console.log("Working on [db/by_chapter] folder...");
	// await handleByChapterFolder();
	// console.log(
	// 	`Done with [db/by_chapter] folder in ${
	// 		(Date.now() - START_TIME) / 1000
	// 	}s\n`
	// );

	// console.log("Working on [db/by_book] folder...");
	// await handleByBookFolder();
	// console.log(
	// 	`Done with [db/by_book] folder in ${(Date.now() - START_TIME) / 1000}s`
	// );

	// console.log("Deploying to MongoDB");
	// await deployToMongoDB();
	// console.log(`Done MongoDB in ${(Date.now() - START_TIME) / 1000}s`);
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

			if (
				existsSync(
					path.join(
						process.cwd(),
						"db",
						"by_chapter",
						...book.path,
						`${index + 1}.json`
					)
				)
			)
				continue;

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
	let GENERAL_ID = 1;

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

		let idInBook = 1;
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
					id: GENERAL_ID++,
					idInBook: idInBook++,
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

async function deployToMongoDB() {
	const { MongoClient } = await import("mongodb");

	const uri = process.env.MONGODB_URI;
	if (!uri) throw new Error("No MongoDB URI provided");

	const client = new MongoClient(uri);

	const db = client.db("hadiths");

	const hadiths = db.collection("hadiths");

	const folders = await readdir(path.join(process.cwd(), "db", "by_book"));

	const bar = new SingleBar(
		{
			format: `{value}/{total} | {bar} {percentage}% | {book}`,
			hideCursor: true,
			stopOnComplete: true,
		},
		Presets.shades_classic
	);

	for (const folder of folders) {
		const books = await readdir(
			path.join(process.cwd(), "db", "by_book", folder)
		);

		bar.start(books.length, 0, { book: `${folder}` });

		for (const [index, book] of books.entries()) {
			const bookData: Prettify<BookFile> = require(path.join(
				process.cwd(),
				"db",
				"by_book",
				folder,
				book
			));

			await hadiths.insertMany(bookData.hadiths);

			bar.update(index + 1, {
				book: `${bookData.metadata.english.title}`,
			});
		}
	}
	return client.close();
}
