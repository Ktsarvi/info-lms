// Shared types and mock data for the courses feature

export type LessonStatus = "completed" | "in-progress" | "not-started";
export type ExamStatus = "completed" | "not-started";
export type MaterialType = "pdf";

export interface Material {
  id: string;
  title: string;
  type: MaterialType;
  completed: boolean;
  description?: string;
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  status: LessonStatus;
  progress: number;
  tags: string[];
  lessonNumber: number;
  materials: Material[];
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
    materials: [
      {
        id: "1-1",
        title: "Лекция: Введение в информатику",
        type: "pdf",
        completed: true,
        description: "Основной теоретический материал урока",
      },
      {
        id: "1-2",
        title: "История ЭВМ",
        type: "pdf",
        completed: true,
        description: "Краткая история вычислительных машин",
      },
      {
        id: "1-3",
        title: "Проверочное упражнение",
        type: "pdf",
        completed: true,
        description: "Тест по пройденному материалу",
      },
    ],
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
    materials: [
      {
        id: "2-1",
        title: "Лекция: Системы счисления",
        type: "pdf",
        completed: true,
        description: "Теория систем счисления",
      },
      {
        id: "2-2",
        title: "Видео: Перевод чисел",
        type: "pdf",
        completed: true,
        description: "Наглядное объяснение перевода",
      },
      {
        id: "2-3",
        title: "Задачи на перевод",
        type: "pdf",
        completed: true,
        description: "Практические задачи",
      },
    ],
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
    materials: [
      {
        id: "3-1",
        title: "Лекция: Кодирование информации",
        type: "pdf",
        completed: true,
        description: "ASCII, Unicode и другие кодировки",
      },
      {
        id: "3-2",
        title: "Таблица кодировок ASCII",
        type: "pdf",
        completed: true,
        description: "Справочный материал",
      },
      {
        id: "3-3",
        title: "Практика: кодирование текста",
        type: "pdf",
        completed: true,
        description: "Упражнения по кодированию",
      },
    ],
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
    materials: [
      {
        id: "4-1",
        title: "Лекция: Алгоритмы",
        type: "pdf",
        completed: true,
        description: "Свойства и виды алгоритмов",
      },
      {
        id: "4-2",
        title: "Видео: Блок-схемы",
        type: "pdf",
        completed: true,
        description: "Построение блок-схем",
      },
      {
        id: "4-3",
        title: "Составление блок-схем",
        type: "pdf",
        completed: true,
        description: "Практическое задание",
      },
    ],
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
    materials: [
      {
        id: "5-1",
        title: "Лекция: Основы программирования",
        type: "pdf",
        completed: true,
        description: "Введение в мир программирования",
      },
      {
        id: "5-2",
        title: "Видео: Компиляторы vs Интерпретаторы",
        type: "pdf",
        completed: true,
        description: "Разница между трансляторами",
      },
      {
        id: "5-3",
        title: "Статья: Языки программирования",
        type: "pdf",
        completed: false,
        description: "Обзор популярных языков",
      },
      {
        id: "5-4",
        title: "Первая программа",
        type: "pdf",
        completed: false,
        description: "Написать Hello World",
      },
    ],
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
    materials: [
      {
        id: "6-1",
        title: "Лекция: Ветвления и циклы",
        type: "pdf",
        completed: true,
        description: "Теория условных операторов",
      },
      {
        id: "6-2",
        title: "Задачи: if/else",
        type: "pdf",
        completed: false,
        description: "Практические задачи",
      },
      {
        id: "6-3",
        title: "Задачи: циклы",
        type: "pdf",
        completed: false,
        description: "Задачи на циклы for и while",
      },
    ],
  },
  {
    id: 7,
    lessonNumber: 7,
    title: "Массивы и строки",
    description: "Одномерные и двумерные массивы. Операции со строками.",
    status: "not-started",
    progress: 0,
    tags: ["Данные", "Массивы"],
    materials: [
      {
        id: "7-1",
        title: "Лекция: Массивы и строки",
        type: "pdf",
        completed: false,
        description: "Основы работы с массивами",
      },
      {
        id: "7-2",
        title: "Видео: Операции со строками",
        type: "pdf",
        completed: false,
        description: "Разбор строковых операций",
      },
      {
        id: "7-3",
        title: "Практика: массивы",
        type: "pdf",
        completed: false,
        description: "Задачи на массивы",
      },
    ],
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
    materials: [
      {
        id: "8-1",
        title: "Лекция: Процедуры и функции",
        type: "pdf",
        completed: false,
        description: "Модульное программирование",
      },
      {
        id: "8-2",
        title: "Практика: написание функций",
        type: "pdf",
        completed: false,
        description: "Создание и вызов функций",
      },
    ],
  },
  {
    id: 9,
    lessonNumber: 9,
    title: "Файловый ввод-вывод",
    description: "Работа с файлами: чтение, запись, форматы данных.",
    status: "not-started",
    progress: 0,
    tags: ["Файлы", "I/O"],
    materials: [
      {
        id: "9-1",
        title: "Лекция: Файловый ввод-вывод",
        type: "pdf",
        completed: false,
        description: "Работа с файлами",
      },
      {
        id: "9-2",
        title: "Практика: чтение файлов",
        type: "pdf",
        completed: false,
        description: "Упражнения по I/O",
      },
    ],
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
    materials: [
      {
        id: "10-1",
        title: "Лекция: Компьютерные сети",
        type: "pdf",
        completed: false,
        description: "Основы сетевых технологий",
      },
      {
        id: "10-2",
        title: "Видео: Модель OSI",
        type: "pdf",
        completed: false,
        description: "Семиуровневая модель",
      },
      {
        id: "10-3",
        title: "Статья: TCP/IP",
        type: "pdf",
        completed: false,
        description: "Протоколы интернета",
      },
    ],
  },
  {
    id: 11,
    lessonNumber: 11,
    title: "Основы баз данных",
    description: "Реляционные СУБД, SQL-запросы, создание таблиц и связей.",
    status: "not-started",
    progress: 0,
    tags: ["БД", "SQL"],
    materials: [
      {
        id: "11-1",
        title: "Лекция: Основы баз данных",
        type: "pdf",
        completed: false,
        description: "Реляционные СУБД",
      },
      {
        id: "11-2",
        title: "Практика: SQL-запросы",
        type: "pdf",
        completed: false,
        description: "Написание SQL",
      },
    ],
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
    materials: [
      {
        id: "12-1",
        title: "Лекция: Операционные системы",
        type: "pdf",
        completed: false,
        description: "Функции и виды ОС",
      },
      {
        id: "12-2",
        title: "Видео: Управление процессами",
        type: "pdf",
        completed: false,
        description: "Планировщик задач",
      },
      {
        id: "12-3",
        title: "Практика: файловые системы",
        type: "pdf",
        completed: false,
        description: "Работа с файловой системой",
      },
    ],
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
    materials: [
      {
        id: "13-1",
        title: "Лекция: Инфобезопасность",
        type: "pdf",
        completed: false,
        description: "Методы защиты информации",
      },
      {
        id: "13-2",
        title: "Статья: Шифрование",
        type: "pdf",
        completed: false,
        description: "Симметричное и асимметричное",
      },
      {
        id: "13-3",
        title: "Тест: угрозы и защита",
        type: "pdf",
        completed: false,
        description: "Проверочный тест",
      },
    ],
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
    materials: [
      {
        id: "14-1",
        title: "Лекция: Мультимедиа",
        type: "pdf",
        completed: false,
        description: "Форматы и сжатие",
      },
      {
        id: "14-2",
        title: "Видео: Обработка изображений",
        type: "pdf",
        completed: false,
        description: "Растровая и векторная графика",
      },
    ],
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
    materials: [
      {
        id: "15-1",
        title: "Лекция: Социальная информатика",
        type: "pdf",
        completed: false,
        description: "ИТ и общество",
      },
      {
        id: "15-2",
        title: "Статья: Правовые аспекты",
        type: "pdf",
        completed: false,
        description: "Закон об ИТ",
      },
      {
        id: "15-3",
        title: "Дискуссия: этика в ИТ",
        type: "pdf",
        completed: false,
        description: "Обсуждение этических вопросов",
      },
    ],
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
