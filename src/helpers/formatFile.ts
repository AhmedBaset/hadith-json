export function formatFile(
	book: ScrapedBook,
	data: {
		introduction?: Introduction | undefined;
		hadiths: Hadith[];
		chapter?: Chapter;
	},
): Prettify<ChapterFile> {
	const output: Prettify<ChapterFile> = {
		metadata: {
			length: data.hadiths.length,
			arabic: {
				...book.arabic,
				introduction: data.introduction?.arabic,
			},
			english: {
				...book.english,
				introduction: data.introduction?.english,
			},
		},
		hadiths: data.hadiths,
		chapter: data.chapter,
	};

	return output;
}
