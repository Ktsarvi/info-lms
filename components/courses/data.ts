// Shared types and mock data for the courses feature

export type LessonStatus = "completed" | "in-progress" | "not-started";
export type ExamStatus = "completed" | "not-started";

export interface Lesson {
  id: number;
  title: string;
  description: string;
  status: LessonStatus;
  progress: number;
  tags: string[];
  lessonNumber: number;
}

export interface Exam {
  id: number;
  title: string;
  description: string;
  status: ExamStatus;
  examNumber: number;
}

export type FilterType = "all" | LessonStatus;

export const FILTER_LABELS: Record<FilterType, string> = {
  all: "Все уроки",
  completed: "Завершённые",
  "in-progress": "В процессе",
  "not-started": "Не начатые",
};

export const lessons: Lesson[] = [
  {
    id: 1,
    lessonNumber: 1,
    title: "Введение в информатику",
    description:
      "Основные понятия, история развития ЭВМ и роль информатики в современном мире.",
    status: "completed",
    progress: 100,
    tags: ["Основы", "Теория"],
  },
  {
    id: 2,
    lessonNumber: 2,
    title: "Системы счисления",
    description:
      "Двоичная, восьмеричная и шестнадцатеричная системы. Перевод чисел.",
    status: "completed",
    progress: 100,
    tags: ["Математика", "Двоичная"],
  },
  {
    id: 3,
    lessonNumber: 3,
    title: "Кодирование информации",
    description:
      "Способы представления текстовой, числовой и графической информации в ЭВМ.",
    status: "completed",
    progress: 100,
    tags: ["Кодирование", "ASCII"],
  },
  {
    id: 4,
    lessonNumber: 4,
    title: "Алгоритмы и блок-схемы",
    description:
      "Понятие алгоритма, его свойства. Графическое представление алгоритмов.",
    status: "completed",
    progress: 100,
    tags: ["Алгоритмы", "Блок-схемы"],
  },
  {
    id: 5,
    lessonNumber: 5,
    title: "Основы программирования",
    description:
      "Языки программирования, трансляторы, компиляторы и интерпретаторы.",
    status: "in-progress",
    progress: 65,
    tags: ["Программирование", "Языки"],
  },
  {
    id: 6,
    lessonNumber: 6,
    title: "Ветвления и циклы",
    description:
      "Условные операторы if/else, циклы for и while. Практические задачи.",
    status: "in-progress",
    progress: 30,
    tags: ["Программирование", "Логика"],
  },
  {
    id: 7,
    lessonNumber: 7,
    title: "Массивы и строки",
    description: "Одномерные и двумерные массивы. Операции со строками.",
    status: "not-started",
    progress: 0,
    tags: ["Данные", "Массивы"],
  },
  {
    id: 8,
    lessonNumber: 8,
    title: "Процедуры и функции",
    description:
      "Модульное программирование, подпрограммы, параметры и возвращаемые значения.",
    status: "not-started",
    progress: 0,
    tags: ["Функции", "Модули"],
  },
  {
    id: 9,
    lessonNumber: 9,
    title: "Файловый ввод-вывод",
    description: "Работа с файлами: чтение, запись, форматы данных.",
    status: "not-started",
    progress: 0,
    tags: ["Файлы", "I/O"],
  },
  {
    id: 10,
    lessonNumber: 10,
    title: "Компьютерные сети",
    description:
      "Топологии сетей, протоколы TCP/IP, модель OSI и основы интернета.",
    status: "not-started",
    progress: 0,
    tags: ["Сети", "Интернет"],
  },
  {
    id: 11,
    lessonNumber: 11,
    title: "Основы баз данных",
    description: "Реляционные СУБД, SQL-запросы, создание таблиц и связей.",
    status: "not-started",
    progress: 0,
    tags: ["БД", "SQL"],
  },
  {
    id: 12,
    lessonNumber: 12,
    title: "Операционные системы",
    description:
      "Функции ОС, управление процессами, файловые системы, интерфейс пользователя.",
    status: "not-started",
    progress: 0,
    tags: ["ОС", "Системы"],
  },
  {
    id: 13,
    lessonNumber: 13,
    title: "Информационная безопасность",
    description:
      "Угрозы и методы защиты. Шифрование, антивирусы, безопасный интернет.",
    status: "not-started",
    progress: 0,
    tags: ["Безопасность", "Защита"],
  },
  {
    id: 14,
    lessonNumber: 14,
    title: "Мультимедиа технологии",
    description:
      "Обработка изображений, звука и видео. Форматы файлов и сжатие данных.",
    status: "not-started",
    progress: 0,
    tags: ["Медиа", "Форматы"],
  },
  {
    id: 15,
    lessonNumber: 15,
    title: "Социальная информатика",
    description:
      "Влияние информационных технологий на общество. Правовые и этические аспекты.",
    status: "not-started",
    progress: 0,
    tags: ["Общество", "Этика"],
  },
];

export const exams: Exam[] = [
  {
    id: 101,
    examNumber: 1,
    title: "Экзамен: Основы информатики",
    description:
      "Проверка знаний по системам счисления, кодированию информации и базовым понятиям.",
    status: "completed",
  },
  {
    id: 102,
    examNumber: 2,
    title: "Экзамен: Алгоритмы и программирование",
    description: "Тест по алгоритмам, блок-схемам и основам программирования.",
    status: "completed",
  },
  {
    id: 103,
    examNumber: 3,
    title: "Экзамен: Структуры данных",
    description:
      "Проверка знаний по массивам, строкам и базовым структурам данных.",
    status: "not-started",
  },
  {
    id: 104,
    examNumber: 4,
    title: "Экзамен: Функции и модули",
    description:
      "Тест по процедурному программированию, функциям и модульной структуре.",
    status: "not-started",
  },
  {
    id: 105,
    examNumber: 5,
    title: "Экзамен: Работа с файлами",
    description: "Проверка навыков файлового ввода-вывода и обработки данных.",
    status: "not-started",
  },
  {
    id: 106,
    examNumber: 6,
    title: "Экзамен: Компьютерные сети",
    description: "Тест по сетевым технологиям, протоколам и основам интернета.",
    status: "not-started",
  },
  {
    id: 107,
    examNumber: 7,
    title: "Экзамен: Базы данных",
    description:
      "Проверка знаний по SQL, реляционным СУБД и проектированию баз данных.",
    status: "not-started",
  },
  {
    id: 108,
    examNumber: 8,
    title: "Экзамен: Операционные системы",
    description:
      "Тест по функциям ОС, управлению процессами и файловым системам.",
    status: "not-started",
  },
  {
    id: 109,
    examNumber: 9,
    title: "Экзамен: Информационная безопасность",
    description:
      "Проверка знаний по методам защиты, шифрованию и безопасному интернету.",
    status: "not-started",
  },
  {
    id: 110,
    examNumber: 10,
    title: "Экзамен: Итоговый тест",
    description:
      "Комплексный экзамен по всем темам курса для итоговой аттестации.",
    status: "not-started",
  },
];
