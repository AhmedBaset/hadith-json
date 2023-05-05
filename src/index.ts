import { books } from "./books";
import { scrapeData } from "./helpers/scrapeData";
import createDirs from "./helpers/createDirs";
import createFile from "./helpers/createFile";
import { formatFile } from "./helpers/formatFile";

async function main() {
	//* For Each Book (Bukhari, Muslim, etc.)
	books.forEach(async (book) => {
		//* Create Directories ./data/${book}/
		await createDirs(["db", "by_chapter"], ...book.path);

		//* For Each Chapter in Book (1st, 2nd, etc.)
		book.route.chapters.forEach(async (chapter, index) => {
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
		});
	});
}

main();
