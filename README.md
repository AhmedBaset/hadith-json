# Hadith-json Database (Hadith of the Prophet Muhammad (PBUH))

An extensive JSON-formatted database is available, containing the Hadiths - Prophet Muhammed's (PBUH) sayings and actions - in both Arabic and English. The database encompasses 17 books of Hadiths.

قاعدة بيانات شاملة بصيغة JSON، تحتوي على الأحاديث النبوية الشريفة باللغتين العربية والإنجليزية. تشمل القاعدة 17 كتاباً من كتب السنة النبوية.

## Books included:

1. Sahih al-Bukhari صحيح البخاري
1. Sahih Muslim صحيح مسلم
1. Sunan Abi Dawud سنن أبي داود
1. Jami` at-Tirmidhi جامع الترمذي
1. Sunan an-Nasa'i سنن النسائي
1. Sunan Ibn Majah سنن ابن ماجه
1. Muwatta Malik موطأ مالك
1. Musnad Ahmad مسند أحمد
1. Sunan ad-Darimi سنن الدارمي
1. Riyad as-Salihin رياض الصالحين
1. Shamail al-Muhammadiyah الشمائل المحمدية
1. Bulugh al-Maram بلوغ المرام
1. Al-Adab Al-Mufrad الأدب المفرد
1. Mishkat al-Masabih مشكاة المصابيح
1. The Forty Hadith of al-Imam an-Nawawi الأربعون النووية
1. The Forty Hadith Qudsi الأربعون القدسية
1. The Forty Hadith of Shah Waliullah أربعون الشاه ولي الله

## Stack:

- Node.js
- TypeScript
- Cheerio.js

## Data Source: 

The data was scrapped from [Sunnah.com](https://sunnah.com/), and was converted to JSON format using a custom script. All scripts are available in the `src` folder.

## Data Format:

Every `*.json` file is typed as `BookData` interface, which is defined as follows:

```typescript
interface BookData {
	metadata: Prettify<Metadata>;
	hadiths: Hadith[];
	chapter: Chapter | undefined;
}

interface Hadith {
	id: number;
	arabic: string;
	english: {
		narrator: string;
		text: string;
	};
	chapterId: number;
}
```

See more information in the [`types/index.d.ts`](./types/index.d.ts) file.

## Commands: 

- `npm install` - Installs the dependencies.
- `npm run build` - Compiles the TypeScript files to JavaScript.
- `npm run start` - Starts the script that scrapes the data from Sunnah.com.
- `npm run dev:build` - Compiles the TypeScript files to JavaScript in watch mode.
- `npm run dev:start` - Starts the script that scrapes the data from Sunnah.com in watch mode.

## Project Structure:

```
.
├── db
│   ├── by_chapter
│   │   ├── the_9_books
|   |   |   ├── bukhari
|   |   |   |   ├── 1.json
|   |   |   |   ├── 2.json
|   |   |   |   ├── ...
|   |   |   ├── muslim
|   |   |   |   ├── ...
|   |   |   ├── ...
│   │   ├── forties
|   |   |   ├── nawawi40
|   |   |   |   ├── 1.json
|   |   |   |   ...
|   |   |   other_books
|   |   |   |   RyadSalihin
|   |   |   |   |   ├── 1.json
|   |   ...
|   src
|   |   ├── index.ts
|   |   ├── types
|   |   ├── helpers
|   ...
```

## Contributing:

Contributions are welcome. Please open an issue or a pull request.

## Conclusion:

May Allah accept this work and make it beneficial for all Muslims. Ameen.