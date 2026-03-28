# hadith-json

A comprehensive JSON database of **50,884 hadiths** — the sayings and actions of Prophet Muhammad ﷺ — in both Arabic and English, scraped from [Sunnah.com](https://sunnah.com/) and covering 17 canonical books.

## Books

| # | English | Arabic |
|---|---------|--------|
| 1 | Sahih al-Bukhari | صحيح البخاري |
| 2 | Sahih Muslim | صحيح مسلم |
| 3 | Sunan Abi Dawud | سنن أبي داود |
| 4 | Jami` at-Tirmidhi | جامع الترمذي |
| 5 | Sunan an-Nasa'i | سنن النسائي |
| 6 | Sunan Ibn Majah | سنن ابن ماجه |
| 7 | Muwatta Malik | موطأ مالك |
| 8 | Musnad Ahmad | مسند أحمد |
| 9 | Sunan ad-Darimi | سنن الدارمي |
| 10 | Riyad as-Salihin | رياض الصالحين |
| 11 | Shamail al-Muhammadiyah | الشمائل المحمدية |
| 12 | Bulugh al-Maram | بلوغ المرام |
| 13 | Al-Adab Al-Mufrad | الأدب المفرد |
| 14 | Mishkat al-Masabih | مشكاة المصابيح |
| 15 | The Forty Hadith of al-Nawawi | الأربعون النووية |
| 16 | The Forty Hadith Qudsi | الأربعون القدسية |
| 17 | The Forty Hadith of Shah Waliullah | أربعون الشاه ولي الله |

## Data Format

Each hadith follows this TypeScript interface:

```typescript
interface Hadith {
  id: number;
  chapterId: number;
  bookId: number;
  arabic: string;
  english: {
    narrator: string;
    text: string;
  };
}
```

The database is available in two layouts under the `db/` folder:

- **`db/by_book/`** — one JSON file per book
- **`db/by_chapter/`** — one JSON file per chapter within each book

See [`types/index.d.ts`](./types/index.d.ts) for all type definitions.

> [!WARNING]
> Pin to a specific tag when fetching files directly from GitHub — the data format may change on `main`.
>
> ✅ `https://github.com/AhmedBaset/hadith-json/blob/v1.2.0/db/by_chapter/the_9_books/bukhari/1.json`  
> ❌ `https://github.com/AhmedBaset/hadith-json/blob/main/db/by_chapter/the_9_books/bukhari/1.json`

## Projects Using This Data

<!-- - [App Name](https://github.com/username/app-name) — description of app. [GitHub](https://github.com/username/app-name) | [Website](https://app-name.com) | [App Store](https://apps.apple.com/app-name) -->

> Using this dataset in your project? [Open a pull request](https://github.com/AhmedBaset/hadith-json/edit/main/README.md) to add it to the list!

## Project Structure

```
.
├── db/
│   ├── by_book/
│   │   ├── the_9_books/        # bukhari.json, muslim.json, ...
│   │   ├── forties/            # nawawi40.json, ...
│   │   └── other_books/
│   └── by_chapter/
│       ├── the_9_books/        # bukhari/1.json, muslim/1.json, ...
│       ├── forties/            # nawawi40/1.json, ...
│       └── other_books/        # RyadSalihin/1.json, ...
├── src/
│   ├── index.ts
│   ├── types/
│   └── helpers/
└── types/
    └── index.d.ts
```

## Known Limitations

- **Musnad Ahmad**: Chapters 8–30 are missing from the source data on Sunnah.com. If you know of a better source, please open an issue.
- The scraping code in `src/` was written as a learning exercise and could use some refactoring — though it works fine as-is.

## Contributing

Contributions are welcome! Feel free to open an issue or pull request for data corrections, new formats, or code improvements.

---

*May Allah accept this work and make it beneficial. Ameen.*
