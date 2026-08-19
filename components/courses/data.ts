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
    title: "Информатика и информационная безопасность",
    description:
      "Раздел объединяет основы информатики, свойства информации, информационные процессы, безопасность и методы защиты информации.",
    status: "completed",
    progress: 100,
    tags: ["Основы", "Безопасность"],
    materials: [
      {
        id: "1-1",
        title: "Лекция: Информатика и информация",
        type: "pdf",
        completed: true,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "1-2",
        title: "Самостоятельные задания: Информатика и информация",
        type: "pdf",
        completed: true,
        description: "Задачи для закрепления темы",
      },
      {
        id: "1-3",
        title: "Лекция: Свойства информации",
        type: "pdf",
        completed: true,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "1-4",
        title: "Самостоятельные задания: Свойства информации",
        type: "pdf",
        completed: true,
        description: "Задачи для закрепления темы",
      },
      {
        id: "1-5",
        title: "Лекция: Формы представления информации",
        type: "pdf",
        completed: true,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "1-6",
        title: "Самостоятельные задания: Формы представления информации",
        type: "pdf",
        completed: true,
        description: "Задачи для закрепления темы",
      },
      {
        id: "1-7",
        title: "Лекция: Информационные процессы",
        type: "pdf",
        completed: true,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "1-8",
        title: "Самостоятельные задания: Информационные процессы",
        type: "pdf",
        completed: true,
        description: "Задачи для закрепления темы",
      },
      {
        id: "1-9",
        title: "Обобщающие задания: Информатика",
        type: "pdf",
        completed: true,
        description: "Контрольные задания",
      },
      {
        id: "1-10",
        title: "Лекция: Защита информации. Вредоносные программы",
        type: "pdf",
        completed: true,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "1-11",
        title: "Самостоятельные задания: Защита информации",
        type: "pdf",
        completed: true,
        description: "Задачи для закрепления темы",
      },
      {
        id: "1-12",
        title: "Лекция: Компьютерная безопасность. Криптография",
        type: "pdf",
        completed: true,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "1-13",
        title: "Самостоятельные задания: Компьютерная безопасность",
        type: "pdf",
        completed: true,
        description: "Задачи для закрепления темы",
      },
      {
        id: "1-14",
        title: "Обобщающие задания: Информационная безопасность",
        type: "pdf",
        completed: true,
        description: "Контрольные задания",
      },
    ],
  },
  {
    id: 2,
    lessonNumber: 2,
    title: "Системы счисления",
    description:
      "Изучение позиционных и непозиционных систем счисления, принципов перевода целых чисел и выполнения расчетов.",
    status: "completed",
    progress: 100,
    tags: ["Математика", "Теория"],
    materials: [
      {
        id: "2-1",
        title: "Лекция: Позиционные системы счисления",
        type: "pdf",
        completed: true,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "2-2",
        title: "Самостоятельные задания: Позиционные системы счисления",
        type: "pdf",
        completed: true,
        description: "Задачи для закрепления темы",
      },
      {
        id: "2-3",
        title: "Лекция: Непозиционные системы счисления",
        type: "pdf",
        completed: true,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "2-4",
        title: "Самостоятельные задания: Непозиционные системы счисления",
        type: "pdf",
        completed: true,
        description: "Задачи для закрепления темы",
      },
      {
        id: "2-5",
        title: "Лекция: Двоичная система счисления",
        type: "pdf",
        completed: true,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "2-6",
        title: "Самостоятельные задания: Двоичная система счисления",
        type: "pdf",
        completed: true,
        description: "Задачи для закрепления темы",
      },
      {
        id: "2-7",
        title: "Лекция: Восьмеричная система счисления",
        type: "pdf",
        completed: true,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "2-8",
        title: "Самостоятельные задания: Восьмеричная система счисления",
        type: "pdf",
        completed: true,
        description: "Задачи для закрепления темы",
      },
      {
        id: "2-9",
        title: "Лекция: Шестнадцатеричная система счисления",
        type: "pdf",
        completed: true,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "2-10",
        title: "Самостоятельные задания: Шестнадцатеричная система счисления",
        type: "pdf",
        completed: true,
        description: "Задачи для закрепления темы",
      },
      {
        id: "2-11",
        title: "Лекция: Переход из одной системы счисления в другую",
        type: "pdf",
        completed: true,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "2-12",
        title:
          "Самостоятельные задания: Переход из одной системы счисления в другую",
        type: "pdf",
        completed: true,
        description: "Задачи для закрепления темы",
      },
      {
        id: "2-13",
        title: "Обобщающие задания: Системы счисления",
        type: "pdf",
        completed: true,
        description: "Контрольные задания",
      },
    ],
  },
  {
    id: 3,
    lessonNumber: 3,
    title: "Кодирование информации и измерение её количества",
    description:
      "Принципы двоичного кодирования, таблицы символов, расчет информационного объема графики, звука и видео.",
    status: "in-progress",
    progress: 50,
    tags: ["Кодирование", "Мультимедиа"],
    materials: [
      {
        id: "3-1",
        title: "Лекция: Кодирование информации",
        type: "pdf",
        completed: true,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "3-2",
        title: "Самостоятельные задания: Кодирование информации",
        type: "pdf",
        completed: true,
        description: "Задачи для закрепления темы",
      },
      {
        id: "3-3",
        title: "Лекция: Двоичное кодирование текстовой информации",
        type: "pdf",
        completed: true,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "3-4",
        title:
          "Самостоятельные задания: Двоичное кодирование текстовой информации",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "3-5",
        title: "Лекция: Количество информации",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "3-6",
        title: "Самостоятельные задания: Количество информации",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "3-7",
        title: "Лекция: Кодирование компьютерной графики и её виды",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "3-8",
        title: "Самостоятельные задания: Кодирование компьютерной графики",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "3-9",
        title: "Лекция: Кодирование графической, звуковой и видеоинформации",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "3-10",
        title: "Самостоятельные задания: Кодирование мультимедиа",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "3-11",
        title: "Обобщающие задания: Кодирование информации",
        type: "pdf",
        completed: false,
        description: "Контрольные задания",
      },
    ],
  },
  {
    id: 4,
    lessonNumber: 4,
    title: "Моделирование",
    description:
      "Разбор материальных и информационных моделей, включая табличные, графовые, иерархические и компьютерные модели.",
    status: "not-started",
    progress: 0,
    tags: ["Модели", "Логика"],
    materials: [
      {
        id: "4-1",
        title: "Лекция: Модели и их классификация. Информационные модели",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "4-2",
        title: "Самостоятельные задания: Модели и их классификация",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "4-3",
        title: "Лекция: Табличная информационная модель",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "4-4",
        title: "Самостоятельные задания: Табличная информационная модель",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "4-5",
        title: "Лекция: Графовая информационная модель",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "4-6",
        title: "Самостоятельные задания: Графовая информационная модель",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "4-7",
        title: "Лекция: Древовидная информационная модель",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "4-8",
        title: "Самостоятельные задания: Древовидная информационная модель",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "4-9",
        title: "Лекция: Компьютерное моделирование",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "4-10",
        title: "Самостоятельные задания: Компьютерное моделирование",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "4-11",
        title: "Обобщающие задания: Моделирование",
        type: "pdf",
        completed: false,
        description: "Контрольные задания",
      },
    ],
  },
  {
    id: 5,
    lessonNumber: 5,
    title: "Аппаратное обеспечение компьютера",
    description:
      "Разбор архитектуры ПК, логической структуры компьютера, принципов работы процессора, памяти и периферийных устройств.",
    status: "not-started",
    progress: 0,
    tags: ["Железо", "Архитектура"],
    materials: [
      {
        id: "5-1",
        title: "Лекция: Виды персональных компьютеров",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "5-2",
        title: "Самостоятельные задания: Виды персональных компьютеров",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "5-3",
        title: "Лекция: Логическая структура компьютера",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "5-4",
        title: "Самостоятельные задания: Логическая структура компьютера",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "5-5",
        title: "Лекция: Основные устройства компьютера",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "5-6",
        title: "Самостоятельные задания: Основные устройства компьютера",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "5-7",
        title: "Обобщающие задания: Аппаратное обеспечение",
        type: "pdf",
        completed: false,
        description: "Контрольные задания",
      },
    ],
  },
  {
    id: 6,
    lessonNumber: 6,
    title: "Программное обеспечение компьютера",
    description:
      "Классификация ПО: системное, прикладное и инструментальное. Среды программирования и трансляторы.",
    status: "not-started",
    progress: 0,
    tags: ["Софт", "Теория"],
    materials: [
      {
        id: "6-1",
        title: "Лекция: Системное программное обеспечение",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "6-2",
        title: "Самостоятельные задания: Системное программное обеспечение",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "6-3",
        title: "Лекция: Прикладное программное обеспечение",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "6-4",
        title: "Самостоятельные задания: Прикладное программное обеспечение",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "6-5",
        title: "Лекция: Средства программирования",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "6-6",
        title: "Самостоятельные задания: Средства программирования",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "6-7",
        title: "Обобщающие задания: Программное обеспечение",
        type: "pdf",
        completed: false,
        description: "Контрольные задания",
      },
    ],
  },
  {
    id: 7,
    lessonNumber: 7,
    title: "Операционная система",
    description:
      "Принципы организации файловых систем, управление файлами и папками, операции настройки через Панель управления.",
    status: "not-started",
    progress: 0,
    tags: ["ОС", "Администрирование"],
    materials: [
      {
        id: "7-1",
        title: "Лекция: Файлы и папки. Окна",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "7-2",
        title: "Самостоятельные задания: Файлы и папки",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "7-3",
        title:
          "Лекция: Рабочий стол, его элементы. Операции с файлами и папками",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "7-4",
        title: "Самостоятельные задания: Рабочий стол и операции с файлами",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "7-5",
        title: "Лекция: Файловые системы и панель управления",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "7-6",
        title: "Самостоятельные задания: Файловые системы",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "7-7",
        title: "Обобщающие задания: Операционные системы",
        type: "pdf",
        completed: false,
        description: "Контрольные задания",
      },
    ],
  },
  {
    id: 8,
    lessonNumber: 8,
    title: "Обработка текстов",
    description:
      "Форматирование документов, структуры списков и таблиц, добавление внешних графических объектов и формул.",
    status: "not-started",
    progress: 0,
    tags: ["Текст", "Офис"],
    materials: [
      {
        id: "8-1",
        title:
          "Лекция: Создание, редактирование и форматирование текстового документа. Поиск и замена",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "8-2",
        title: "Самостоятельные задания: Обработка текстов",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "8-3",
        title:
          "Лекция: Таблицы в текстовом редакторе. Добавление различных объектов",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "8-4",
        title: "Самостоятельные задания: Таблицы и объекты в текстах",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "8-5",
        title: "Обобщающие задания: Обработка текстов",
        type: "pdf",
        completed: false,
        description: "Контрольные задания",
      },
    ],
  },
  {
    id: 9,
    lessonNumber: 9,
    title: "Электронные таблицы",
    description:
      "Адресация ячеек, расчетные формулы и функции, методы статистического моделирования и построение диаграмм.",
    status: "not-started",
    progress: 0,
    tags: ["Таблицы", "Анализ"],
    materials: [
      {
        id: "9-1",
        title:
          "Лекция: Электронная таблица и её компоненты. Формулы и функции. Ссылки",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "9-2",
        title: "Самостоятельные задания: Электронные таблицы",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "9-3",
        title:
          "Лекция: Диаграммы и их элементы. Моделирование статистических данных",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "9-4",
        title: "Самостоятельные задания: Диаграммы и статистика",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "9-5",
        title: "Обобщающие задания: Электронные таблицы",
        type: "pdf",
        completed: false,
        description: "Контрольные задания",
      },
    ],
  },
  {
    id: 10,
    lessonNumber: 10,
    title: "Базы данных",
    description:
      "Реляционные структуры данных, первичные ключи, создание запросов, форм, отчетов и фильтрации записей.",
    status: "not-started",
    progress: 0,
    tags: ["БД", "SQL"],
    materials: [
      {
        id: "10-1",
        title: "Лекция: Анализ баз данных. Модель данных. Таблицы и операции",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "10-2",
        title: "Самостоятельные задания: Базы данных",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "10-3",
        title: "Лекция: Запросы, формы. Поиск, сортировка, фильтрация. Отчёты",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "10-4",
        title: "Самостоятельные задания: Запросы и фильтрация",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "10-5",
        title: "Обобщающие задания: Базы данных",
        type: "pdf",
        completed: false,
        description: "Контрольные задания",
      },
    ],
  },
  {
    id: 11,
    lessonNumber: 11,
    title: "Алгоритмы",
    description:
      "Свойства алгоритмов, блок-схемы и способы реализации линейных, разветвляющихся и циклических конструкций.",
    status: "not-started",
    progress: 0,
    tags: ["Алгоритмы", "Логика"],
    materials: [
      {
        id: "11-1",
        title: "Лекция: Анализ алгоритмов. Свойства алгоритмов",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "11-2",
        title: "Самостоятельные задания: Анализ алгоритмов",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "11-3",
        title: "Лекция: Способы представления алгоритмов",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "11-4",
        title: "Самостоятельные задания: Способы представления",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "11-5",
        title:
          "Лекция: Виды алгоритмов (линейные, разветвляющиеся, циклические)",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "11-6",
        title: "Самостоятельные задания: Виды алгоритмов",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "11-7",
        title: "Обобщающие задания: Алгоритмы",
        type: "pdf",
        completed: false,
        description: "Контрольные задания",
      },
    ],
  },
  {
    id: 12,
    lessonNumber: 12,
    title: "Программирование",
    description:
      "Разбор основ разработки на Python: переменные, ветвления, циклы, обработка строк, массивов (списков) и создание функций.",
    status: "not-started",
    progress: 0,
    tags: ["Python", "Код"],
    materials: [
      {
        id: "12-1",
        title:
          "Лекция: Язык программирования Python. Константы и переменные. Ввод и вывод данных",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "12-2",
        title: "Самостоятельные задания: Python основы",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "12-3",
        title:
          "Лекция: Условный оператор и оператор цикла. Операции над числами",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "12-4",
        title: "Самостоятельные задания: Ветвления и циклы",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "12-5",
        title: "Лекция: Строки и списки. Операции над ними",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "12-6",
        title: "Самостоятельные задания: Строки и списки",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "12-7",
        title: "Лекция: Подпрограммы (функции и процедуры)",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "12-8",
        title: "Самостоятельные задания: Функции и процедуры",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "12-9",
        title: "Обобщающие задания: Программирование",
        type: "pdf",
        completed: false,
        description: "Контрольные задания",
      },
    ],
  },
  {
    id: 13,
    lessonNumber: 13,
    title: "Компьютерные сети",
    description:
      "Классификация сетей, физические и логические топологии, сетевые коммутаторы и модель OSI/TCP-IP.",
    status: "not-started",
    progress: 0,
    tags: ["Сети", "Теория"],
    materials: [
      {
        id: "13-1",
        title: "Лекция: Компьютерные сети и их классификация",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "13-2",
        title: "Самостоятельные задания: Компьютерные сети",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "13-3",
        title: "Лекция: Топологии сетей. Сетевое оборудование",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "13-4",
        title: "Самостоятельные задания: Топологии и оборудование",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "13-5",
        title: "Лекция: Архитектура сети. Технологии беспроводной связи",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "13-6",
        title: "Самостоятельные задания: Архитектура сети",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "13-7",
        title: "Обобщающие задания: Компьютерные сети",
        type: "pdf",
        completed: false,
        description: "Контрольные задания",
      },
    ],
  },
  {
    id: 14,
    lessonNumber: 14,
    title: "Интернет",
    description:
      "Принципы адресации IP, протоколы передачи, службы WWW, структуры URL-адресов и почтовые сервисы.",
    status: "not-started",
    progress: 0,
    tags: ["Сеть", "Интернет"],
    materials: [
      {
        id: "14-1",
        title:
          "Лекция: Подключение к Интернету. Устройства Интернета. Адресация в Интернете и протоколы. Интернет-службы. Всемирная паутина. Поисковые системы. Электронная почта",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "14-2",
        title: "Самостоятельные задания: Интернет технологии",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "14-3",
        title: "Обобщающие задания: Интернет",
        type: "pdf",
        completed: false,
        description: "Контрольные задания",
      },
    ],
  },
  {
    id: 15,
    lessonNumber: 15,
    title: "Веб-программирование",
    description:
      "Основы верстки сайтов: структура веб-страниц, теги разметки HTML, оформление таблиц, списков, ссылок и изображений.",
    status: "not-started",
    progress: 0,
    tags: ["Веб", "HTML"],
    materials: [
      {
        id: "15-1",
        title: "Лекция: Веб-программирование и этапы разработки веб-страницы",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "15-2",
        title: "Самостоятельные задания: Этапы веб-разработки",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "15-3",
        title: "Лекция: Язык разметки HTML",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "15-4",
        title: "Самостоятельные задания: Язык HTML",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "15-5",
        title: "Лекция: Создание списков и таблиц",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "15-6",
        title: "Самостоятельные задания: Списки и таблицы в HTML",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "15-7",
        title:
          "Лекция: Структура веб-страницы. Размещение графических файлов. Использование ссылок",
        type: "pdf",
        completed: false,
        description: "Теоретические материалы к уроку",
      },
      {
        id: "15-8",
        title: "Самостоятельные задания: Структура страницы",
        type: "pdf",
        completed: false,
        description: "Задачи для закрепления темы",
      },
      {
        id: "15-9",
        title: "Обобщающие задания: Веб-программирование",
        type: "pdf",
        completed: false,
        description: "Контрольные задания",
      },
    ],
  },
];

export const exams: Exam[] = [
  {
    id: 101,
    examNumber: 1,
    title: "Экзамен 1",
    description:
      "Тест по теме «Информация, информационные процессы и информационная безопасность».",
    status: "completed",
  },
  {
    id: 102,
    examNumber: 2,
    title: "Экзамен 2",
    description: "Тест по теме «Системы счисления».",
    status: "completed",
  },
  {
    id: 103,
    examNumber: 3,
    title: "Экзамен 3",
    description: "Тест по темам «Кодирование информации» и «Моделирование».",
    status: "not-started",
  },
  {
    id: 104,
    examNumber: 4,
    title: "Экзамен 4",
    description:
      "Тест по темам «Аппаратное обеспечение», «Программное обеспечение компьютера» и «Операционные системы».",
    status: "not-started",
  },
  {
    id: 105,
    examNumber: 5,
    title: "Экзамен 5",
    description:
      "Тест по темам «Обработка текстов», «Электронные таблицы» и «Базы данных».",
    status: "not-started",
  },
  {
    id: 106,
    examNumber: 6,
    title: "Экзамен 6",
    description: "Тест по теме «Алгоритмы».",
    status: "not-started",
  },
  {
    id: 107,
    examNumber: 7,
    title: "Экзамен 7",
    description: "Тест по теме «Программирование» (часть 1).",
    status: "not-started",
  },
  {
    id: 108,
    examNumber: 8,
    title: "Экзамен 8",
    description: "Тест по теме «Программирование» (часть 2).",
    status: "not-started",
  },
  {
    id: 109,
    examNumber: 9,
    title: "Экзамен 9",
    description: "Тест по теме «Программирование» (часть 3).",
    status: "not-started",
  },
  {
    id: 110,
    examNumber: 10,
    title: "Экзамен 10",
    description:
      "Тест по темам «Компьютерные сети», «Интернет» и «Веб-программирование».",
    status: "not-started",
  },
];
