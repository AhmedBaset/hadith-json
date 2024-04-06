import axios from "axios";
import cheerio from "cheerio";

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
  } catch {
    console.log("Error loading data", `${route}`);
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
    const text = {
      id: i + 1,
      idInBook: i + 1,
      chapterId: +chapterInfo.id,
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
    };

    output.hadiths.push(text);
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
    id: +chapterInfo.id,
    bookId,
    arabic: chapterInfo.arabic,
    english: chapterInfo.english,
  };

  return output;
}
