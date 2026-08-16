export type HrNewsCategory =
  | "Рынок труда"
  | "Подбор и найм"
  | "AI и HR Tech"
  | "Обучение и развитие";

export interface HrNewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  sourceKind: "Официальный источник" | "Отраслевая платформа" | "Профессиональная ассоциация";
  publishedAt: string;
  publishedLabel: string;
  category: HrNewsCategory;
  summary: string;
  whyItMatters: string;
  tags: string[];
  reviewedAt: string;
}

export interface HrNewsSource {
  name: string;
  url: string;
  note: string;
  status: "Источник проверен";
  updateMode: "Автоматически" | "Вручную";
}

export const HR_NEWS_REVIEW_DATE = "17 августа 2026";

export const HR_NEWS_ITEMS: HrNewsItem[] = [
  {
    id: "mintrud-career-tours-2026",
    title: "Более 8,7 тыс. компаний проводят профориентационные туры для молодёжи",
    url: "https://mintrud.gov.ru/employment/372",
    source: "Минтруд России",
    sourceKind: "Официальный источник",
    publishedAt: "2026-08-14",
    publishedLabel: "14 августа 2026",
    category: "Рынок труда",
    summary:
      "Кадровые центры «Работа России» проводят профтуры и профпробы: работодатели знакомят школьников и студентов с профессиями, практиками и возможностями целевого обучения.",
    whyItMatters:
      "Материал помогает оценить ранние каналы привлечения и партнёрства с образовательными организациями.",
    tags: ["молодые специалисты", "профориентация", "рынок труда"],
    reviewedAt: HR_NEWS_REVIEW_DATE,
  },
  {
    id: "mintrud-upskilling-programmes-2026",
    title: "Минтруд представил программы повышения квалификации специалистов",
    url: "https://mintrud.gov.ru/social/590",
    source: "Минтруд России",
    sourceKind: "Официальный источник",
    publishedAt: "2026-08-07",
    publishedLabel: "7 августа 2026",
    category: "Обучение и развитие",
    summary:
      "Опубликованы типовые программы для специалистов по ранней помощи и сопровождаемому проживанию с практическими модулями и оценкой результатов.",
    whyItMatters:
      "Полезный пример того, как связывать обучение с конкретными навыками, практикой и измеримой проверкой освоения.",
    tags: ["обучение", "квалификация", "оценка навыков"],
    reviewedAt: HR_NEWS_REVIEW_DATE,
  },
  {
    id: "hh-inclusive-vacancies-2026",
    title: "Инклюзивность в вакансиях: как корректно описывать условия работы",
    url: "https://hh.ru/blog/inklyuzivnost-v-vakansiyah-na-hh-ru",
    source: "hh.ru",
    sourceKind: "Отраслевая платформа",
    publishedAt: "2026-04-27",
    publishedLabel: "27 апреля 2026",
    category: "Подбор и найм",
    summary:
      "hh.ru добавил структурированное описание доступности вакансии и приводит примеры условий для разных потребностей кандидатов.",
    whyItMatters:
      "Можно использовать как ориентир при проверке понятности и доступности текста вакансии, не копируя формулировки без проверки.",
    tags: ["инклюзия", "вакансии", "кандидатский опыт"],
    reviewedAt: HR_NEWS_REVIEW_DATE,
  },
  {
    id: "hh-call-transcripts-2026",
    title: "В звонках hh.ru появились расшифровка и краткие итоги разговора",
    url: "https://hh.ru/blog/v-zvonki-cherez-hh-ru-dobavili-rasshifrovku-i-kratkie-itogi-razgovora-s-kandidatami",
    source: "hh.ru",
    sourceKind: "Отраслевая платформа",
    publishedAt: "2026-03-06",
    publishedLabel: "6 марта 2026",
    category: "AI и HR Tech",
    summary:
      "Платформа описывает автоматическую расшифровку звонков и краткие итоги как помощь рекрутеру при фиксации разговора.",
    whyItMatters:
      "Прямой ориентир для требований к нашему анализу интервью: источник, проверяемый черновик и подтверждение человеком.",
    tags: ["транскрипт", "интервью", "HR Tech"],
    reviewedAt: HR_NEWS_REVIEW_DATE,
  },
  {
    id: "hh-labour-market-forecast-2026",
    title: "Прогноз рынка труда: удержание, проектные роли и более точечный найм",
    url: "https://hh.ru/article/prognoz-chto-budet-proiskhodit-na-rynke-truda-v-2026-godu",
    source: "hh.ru",
    sourceKind: "Отраслевая платформа",
    publishedAt: "2025-12-22",
    publishedLabel: "22 декабря 2025",
    category: "Рынок труда",
    summary:
      "Эксперты hh.ru ожидают большего внимания к удержанию, развитию сотрудников, проектным форматам и доказательству практической ценности кандидата.",
    whyItMatters:
      "Может помочь при обсуждении приоритетов найма и аргументации требований к кейсам и результатам кандидатов.",
    tags: ["тренды", "удержание", "точечный найм"],
    reviewedAt: HR_NEWS_REVIEW_DATE,
  },
  {
    id: "cipd-ai-job-centre-2026",
    title: "CIPD о применении AI в государственных службах занятости",
    url: "https://www.cipd.org/en/about/press-releases/government-ai-job-centre/",
    source: "CIPD",
    sourceKind: "Профессиональная ассоциация",
    publishedAt: "2026-06-10",
    publishedLabel: "10 июня 2026",
    category: "AI и HR Tech",
    summary:
      "Профессиональная ассоциация комментирует внедрение AI в сервисы занятости и необходимость сохранять качество, доверие и человеческое участие.",
    whyItMatters:
      "Полезный внешний взгляд на границы автоматизации: AI помогает процессу, но не подменяет ответственное решение человека.",
    tags: ["AI", "занятость", "human-in-the-loop"],
    reviewedAt: HR_NEWS_REVIEW_DATE,
  },
];

export const HR_NEWS_SOURCES: HrNewsSource[] = [
  {
    name: "Минтруд России",
    url: "https://mintrud.gov.ru/",
    note: "Официальные новости рынка труда и занятости; материалы сайта опубликованы с указанием лицензии CC BY 3.0.",
    status: "Источник проверен",
    updateMode: "Автоматически",
  },
  {
    name: "hh.ru",
    url: "https://hh.ru/articles",
    note: "Отраслевая аналитика и обновления инструментов найма; в ленте используются только короткая редакторская выжимка и ссылка.",
    status: "Источник проверен",
    updateMode: "Вручную",
  },
  {
    name: "CIPD",
    url: "https://www.cipd.org/en/about/news/",
    note: "Публичные материалы профессиональной ассоциации о рынке труда, HR и развитии людей.",
    status: "Источник проверен",
    updateMode: "Вручную",
  },
];

export function searchHrNews(
  items: HrNewsItem[],
  query: string,
  category: "Все темы" | HrNewsCategory,
): HrNewsItem[] {
  const normalized = query.trim().toLocaleLowerCase("ru-RU");
  return items
    .filter((item) => category === "Все темы" || item.category === category)
    .filter((item) => {
      if (!normalized) return true;
      const haystack = [
        item.title,
        item.source,
        item.summary,
        item.whyItMatters,
        ...item.tags,
      ]
        .join(" ")
        .toLocaleLowerCase("ru-RU");
      return haystack.includes(normalized);
    })
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
