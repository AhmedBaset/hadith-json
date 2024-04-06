declare type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

declare interface Hadith {
	id: number;
	idInBook: number;
	arabic: string;
	english: {
		narrator: string;
		text: string;
	};
	chapterId: number;
	bookId: number;
}

interface Introduction {
	arabic: string;
	english: string;
}

interface Chapter {
	id: number;
	bookId: number;
	arabic: string;
	english: string;
}

interface BookInfo {
	title: string;
	author: string;
	introduction: string | undefined;
}

interface Metadata {
	length: number;
	arabic: Prettify<BookInfo>;
	english: Prettify<BookInfo>;
}

interface ChapterFile {
	metadata: Prettify<Metadata>;
	hadiths: Hadith[];
	chapter: Chapter | undefined;
}

interface BookMetadata extends Metadata {
	id: number;
}

interface BookFile {
	id: number;
	metadata: Prettify<BookMetadata>;
	chapters: Chapter[];
	hadiths: Hadith[];
}

interface ScrapedBook {
	id: number;
	arabic: {
		title: string;
		author: string;
	};
	english: {
		title: string;
		author: string;
	};
	length?: number;
	path: string[];
	route: {
		base: string;
		chapters: string[];
	};
}
