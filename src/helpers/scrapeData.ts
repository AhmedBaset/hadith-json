import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeData(route: string, bookId: number) {
	//* GET HTML content
	const data = await axios
		.get(`https://sunnah.com/${route}`, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
			},
		})
		.then((res) => res.data);

	//* Load HTML content => $(selector) to select elements
	let $: cheerio.Root;
	try {
		$ = cheerio.load(data);
	} catch (err) {
		console.log("Error loading data", `${route}`, err);
		return;
	}

	//* Select all hadiths
	const allHadiths = $(".AllHadith").children(".actualHadithContainer");

	//* All returned information
	const output: {
		hadiths: Hadith[];
		introduction?: Introduction;
		chapter?: Chapter;
	} = {
		hadiths: [],
	};

	//* Scrap chapter info
	const pageInfo = $(".book_info");
	const chapterInfo = {
		id: pageInfo
			.find(".book_page_number")
			.text()
			.trim()
			.replace(/&nbsp;/g, ""),
		arabic: pageInfo.find(".book_page_arabic_name").text().trim(),
		english: pageInfo.find(".book_page_english_name").text().trim(),
	};

	//* Loop through all hadiths
	allHadiths.each((i, el) => {
		output.hadiths.push({
			id: i + 1,
			idInBook: i + 1,
			chapterId: numberify(chapterInfo.id)!,
			bookId,
			arabic: $(el)
				.find(".arabic_hadith_full")
				.text()
				.trim()
				.replace(/\[.*\]/g, ""),
			english: {
				narrator: $(el)
					.find(".englishcontainer .hadith_narrated")
					.text()
					.trim()
					.replace(/\[.*\]/g, ""),
				text: $(el)
					.find(".englishcontainer .text_details")
					.text()
					.trim()
					.replace(/\[.*\]/g, ""),
			},
		});
	});

	//* Scrap Page title
	const introduction = $(".book_info");
	const englishTitle = introduction
		.find(".book_page_english_name")
		.text()
		.trim();
	output.introduction = {
		arabic: introduction
			.find(".book_page_arabic_name.arabic")
			.text()
			.trim()
			.replace(/\[.*\]/g, ""),
		english: englishTitle.replace(/\[.*\]/g, ""),
	};

	output.chapter = {
		id: numberify(chapterInfo.id)!,
		bookId,
		arabic: chapterInfo.arabic,
		english: chapterInfo.english,
	};

	return output;
}

function numberify(str: string) {
	const num = Number(str);
	if (!Number.isNaN(num)) return num;

	const matches = /^(\d+)([b-c])$/i.exec(str);
	const resolvedNum = Number(
		`${matches?.[1]}.${{ b: 2, c: 3 }[matches?.[2]!]}`,
	);
	if (!Number.isNaN(resolvedNum)) return resolvedNum;

	return null;
}
