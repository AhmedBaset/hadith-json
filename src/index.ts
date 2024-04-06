import "dotenv/config";

import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { Presets, SingleBar } from "cli-progress";
import { books } from "./books";
import { style } from "./helpers/consoleColor";
import createDirs from "./helpers/createDirs";
import createFile from "./helpers/createFile";
import { formatFile } from "./helpers/formatFile";
import { scrapeData } from "./helpers/scrapeData";

main()
	.catch((err) => {
		console.error("\n", style("fg.red", err));
	})
	.finally(() => {
		process.exit(0);
	});

async function main() {
	const START_TIME = Date.now();

	console.log(
		"\n",
		"\t",
		style(
			"fg.cyan",
			"In the name of Allah, the Most Gracious, the Most Merciful",
		),
	);
	console.log();

	console.log("Working on [db/by_chapter] folder...");
	await createChaptersFiles();
	console.log(
		`Done with [db/by_chapter] folder in ${
			(Date.now() - START_TIME) / 1000
		}s\n`,
	);

	console.log("Working on [db/by_book] folder...");
	await createBooksFromChapters();
	console.log(
		`Done with [db/by_book] folder in ${(Date.now() - START_TIME) / 1000}s`,
	);

	// console.log("Deploying to MongoDB");
	// await deployToMongoDB();
	// console.log(`Done MongoDB in ${(Date.now() - START_TIME) / 1000}s`);
}

async function createChaptersFiles() {
	//* For Each Book (Bukhari, Muslim, etc.)
	for (const book of books) {
		//* Create Progress Bar
		const bar = new SingleBar(
			{
				format: "{value}/{total} | {bar} {percentage}% | {book}",
				hideCursor: true,
				stopOnComplete: true,
			},
			Presets.shades_classic,
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
						`${index + 1}.json`,
					),
				)
			) {
				continue;
			}

			//* Get Data From `${URL}/${book}/${chapter}`
			const data = await scrapeData(`${book.route.base}/${chapter}`, book.id);
			if (!data) {
				return console.log(
					"Error getting data",
					`${book.route.base}/${chapter}`,
				);
			}

			//* Format Data to be like {ChapterFile} interface
			const formattedData = formatFile(book, data);

			//* Create File {book}/${chapter}.json
			await createFile(["db", "by_chapter"], book.path, chapter || "all", formattedData);
		}
	}
}

async function createBooksFromChapters() {
	let GENERAL_ID = 1;

	for (const book of books) {
		let idInBook = 1;
		//* Create Progress Bar
		const bar = new SingleBar(
			{
				format: "{value}/{total} | {bar} {percentage}% | {book}",
				hideCursor: true,
				stopOnComplete: true,
			},
			Presets.shades_classic,
		);
		bar.start(book.route.chapters.length, 0, { book: book.english.title });

		const bookDir: string = path.join(
			process.cwd(),
			"db",
			"by_chapter",
			...book.path,
		);
		const bookDirFiles: string[] = await readdir(bookDir);

		const bookData: Prettify<BookFile> = {
			id: book.id,
			metadata: {
				id: book.id,
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

		for (const chapterFileName of bookDirFiles.sort((a, b) => {
			const aNum = Number.parseInt(a.split(".")[0]);
			const bNum = Number.parseInt(b.split(".")[0]);
			return aNum - bNum;
		
		})) {
			const chapterData: ChapterFile = require(
				path.join(bookDir, chapterFileName),
			);

			const chapterId = chapterData.chapter?.id;
			if (typeof chapterId === "undefined") {
				console.log(chapterData.chapter);

				throw new Error(
					`Chapter ID not found for chapter in ${book.path.join(
						"/",
					)}/${chapterFileName} file`,
				);
			}

			const { arabic, english } = chapterData.chapter!;
			if ([arabic, english].some((val) => typeof val === "undefined")) {
				throw new Error("Missing some data in chapter file");
			}

			bookData.chapters.push({
				id: chapterId,
				bookId: book.id,
				arabic,
				english,
			});

			bookData.metadata.length += chapterData.metadata.length;

			bookData.hadiths.push(
				...chapterData.hadiths.map((hadith: Prettify<Hadith>) => ({
					...hadith,
					id: GENERAL_ID++,
					idInBook: idInBook++,
					bookId: book.id,
					chapterId: chapterId,
				})),
			);

			//* Update Progress Bar
			bar.update(chapterId, {
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
			bookData,
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
	const booksMetadata = db.collection("booksMetadata");
	const chapters = db.collection("chapters");

	const folders = await readdir(path.join(process.cwd(), "db", "by_book"));

	const bar = new SingleBar(
		{
			format: "{value}/{total} | {bar} {percentage}% | {book}",
			hideCursor: true,
			stopOnComplete: true,
		},
		Presets.shades_classic,
	);

	for (const folder of folders) {
		const books = await readdir(
			path.join(process.cwd(), "db", "by_book", folder),
		);

		bar.start(books.length, 0, { book: `${folder}` });

		for (const [index, book] of books.entries()) {
			const bookData: Prettify<BookFile> = require(
				path.join(process.cwd(), "db", "by_book", folder, book),
			);

			await booksMetadata.insertOne(bookData.metadata);
			// await hadiths.insertMany(bookData.hadiths);
			await chapters.insertMany(bookData.chapters);

			bar.update(index + 1, {
				book: `${bookData.metadata.english.title}`,
			});
		}
	}
	return client.close();
}
