import axios from "axios";
import cheerio from "cheerio";

async function getChapters() {
	const ROUTE = "darimi";

	const data = await axios.get(`https://sunnah.com/${ROUTE}`);

	const $ = cheerio.load(data.data);

	const container = $(".book_titles");

	const output: (string | undefined)[] = [];

	const chapters = container.children(".book_title");

	chapters.each((i, el) => {
		output.push($(el).find("a").attr("href")?.split("/").at(-1));
	});

	return output;
}

(async () => {
	const chapters = await getChapters();

	console.log(chapters);
})();
