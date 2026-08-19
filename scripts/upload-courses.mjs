import { config } from "dotenv";
config({ path: ".env.local" });
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const COURSES_ROOT = "D:\\inform_lectures\\courses";
const BUCKET = "courses";

// ============================================
// TITLES — pulled from data.ts
// ============================================
const TOPIC_TITLES = {
  1: "Информатика и информационная безопасность",
  2: "Системы счисления",
  3: "Кодирование информации и измерение её количества",
  4: "Моделирование",
  5: "Аппаратное обеспечение компьютера",
  6: "Программное обеспечение компьютера",
  7: "Операционная система",
  8: "Обработка текстов",
  9: "Электронные таблицы",
  10: "Базы данных",
  11: "Алгоритмы",
  12: "Программирование",
  13: "Компьютерные сети",
  14: "Интернет",
  15: "Веб-программирование",
};

const SUB_LESSON_TITLES = {
  1: {
    1: "Информатика и информация",
    2: "Свойства информации",
    3: "Формы представления информации",
    4: "Информационные процессы",
    5: "Защита информации. Вредоносные программы",
    6: "Компьютерная безопасность. Криптография",
  },
  2: {
    1: "Позиционные системы счисления",
    2: "Непозиционные системы счисления",
    3: "Двоичная система счисления",
    4: "Восьмеричная система счисления",
    5: "Шестнадцатеричная система счисления",
    6: "Переход из одной системы счисления в другую",
  },
  3: {
    1: "Кодирование информации",
    2: "Двоичное кодирование текстовой информации",
    3: "Количество информации",
    4: "Кодирование компьютерной графики и её виды",
    5: "Кодирование графической, звуковой и видеоинформации",
  },
  4: {
    1: "Модели и их классификация. Информационные модели",
    2: "Табличная информационная модель",
    3: "Графовая информационная модель",
    4: "Древовидная информационная модель",
    5: "Компьютерное моделирование",
  },
  5: {
    1: "Виды персональных компьютеров",
    2: "Логическая структура компьютера",
    3: "Основные устройства компьютера",
  },
  6: {
    1: "Системное программное обеспечение",
    2: "Прикладное программное обеспечение",
    3: "Средства программирования",
  },
  7: {
    1: "Файлы и папки. Окна",
    2: "Рабочий стол, его элементы. Операции с файлами и папками",
    3: "Файловые системы и панель управления",
  },
  8: {
    1: "Создание, редактирование и форматирование текстового документа. Поиск и замена",
    2: "Таблицы в текстовом редакторе. Добавление различных объектов",
  },
  9: {
    1: "Электронная таблица и её компоненты. Формулы и функции. Ссылки",
    2: "Диаграммы и их элементы. Моделирование статистических данных",
  },
  10: {
    1: "Анализ баз данных. Модель данных. Таблицы и операции",
    2: "Запросы, формы. Поиск, сортировка, фильтрация. Отчёты",
  },
  11: {
    1: "Анализ алгоритмов. Свойства алгоритмов",
    2: "Способы представления алгоритмов",
    3: "Виды алгоритмов (линейные, разветвляющиеся, циклические)",
  },
  12: {
    1: "Язык программирования Python. Константы и переменные. Ввод и вывод данных",
    2: "Условный оператор и оператор цикла. Операции над числами",
    3: "Строки и списки. Операции над ними",
    4: "Подпрограммы (функции и процедуры)",
  },
  13: {
    1: "Компьютерные сети и их классификация",
    2: "Топологии сетей. Сетевое оборудование",
    3: "Архитектура сети. Технологии беспроводной связи",
  },
  14: {
    1: "Подключение к Интернету. Устройства Интернета. Адресация в Интернете и протоколы. Интернет-службы. Всемирная паутина. Поисковые системы. Электронная почта",
  },
  15: {
    1: "Веб-программирование и этапы разработки веб-страницы",
    2: "Язык разметки HTML",
    3: "Создание списков и таблиц",
    4: "Структура веб-страницы. Размещение графических файлов. Использование ссылок",
  },
};

const TOPIC_FILE_TITLES = {
  1: {
    "1_test": "Обобщающие задания: Информатика",
    "16_test": "Обобщающие задания: Информационная безопасность",
  },
  2: { "2_test": "Обобщающие задания: Системы счисления" },
  3: { "3_test": "Обобщающие задания: Кодирование информации" },
  4: { "4_test": "Обобщающие задания: Моделирование" },
  5: { "5_test": "Обобщающие задания: Аппаратное обеспечение" },
  6: { "6_test": "Обобщающие задания: Программное обеспечение" },
  7: { "7_test": "Обобщающие задания: Операционные системы" },
  8: { "8_test": "Обобщающие задания: Обработка текстов" },
  9: { "9_test": "Обобщающие задания: Электронные таблицы" },
  10: { "10_test": "Обобщающие задания: Базы данных" },
  11: { "11_test": "Обобщающие задания: Алгоритмы" },
  12: { "12_test": "Обобщающие задания: Программирование" },
  13: { "13_test": "Обобщающие задания: Компьютерные сети" },
  14: { "14_test": "Обобщающие задания: Интернет" },
  15: { "15_test": "Обобщающие задания: Веб-программирование" },
};

// Exam -> topics mapping
const EXAM_TOPIC_MAP = {
  1: [1],
  2: [2],
  3: [3, 4],
  4: [5, 6, 7],
  5: [8, 9, 10],
  6: [11],
  7: [12],
  8: [12],
  9: [12],
  10: [13, 14, 15],
};

// ============================================
// Helpers
// ============================================
function normalize(name) {
  return name.toLowerCase().replace(/\.pdf$|\.png$/i, "");
}

function classifySubLessonFile(filename) {
  const n = normalize(filename);
  if (/theory|thoery/.test(n)) return "theory";
  if (/tests?$/.test(n)) return "test";
  return null;
}

async function uploadFile(localPath, storagePath) {
  const buffer = fs.readFileSync(localPath);
  const contentType = localPath.toLowerCase().endsWith(".png")
    ? "image/png"
    : "application/pdf";
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType, upsert: true });
  if (error)
    throw new Error(`Upload failed for ${storagePath}: ${error.message}`);
  return storagePath;
}

// ============================================
// Main
// ============================================
async function main() {
  const folders = fs
    .readdirSync(COURSES_ROOT)
    .filter((f) => fs.statSync(path.join(COURSES_ROOT, f)).isDirectory());
  folders.sort((a, b) => parseInt(a) - parseInt(b));

  const examFilesToProcess = [];

  for (const folderName of folders) {
    const match = folderName.match(/^(\d+)_(.+)$/);
    if (!match) {
      console.warn(`Skipping folder with unexpected name: ${folderName}`);
      continue;
    }
    const topicOrder = parseInt(match[1]);
    const slug = match[2];
    const folderPath = path.join(COURSES_ROOT, folderName);
    const files = fs.readdirSync(folderPath);

    console.log(`\n=== Topic ${topicOrder}: ${folderName} ===`);

    const { data: topic, error: topicErr } = await supabase
      .from("topics")
      .insert({
        order_index: topicOrder,
        slug,
        title: TOPIC_TITLES[topicOrder] || slug,
      })
      .select()
      .single();
    if (topicErr) throw topicErr;

    const subLessonGroups = {};
    const topicLevelFiles = [];
    const examFiles = [];

    for (const filename of files) {
      const n = normalize(filename);

      if (/^sinaq/i.test(filename)) {
        examFiles.push(filename);
        continue;
      }

      let effectiveMatch = n.match(/^(\d+)_(\d+)_(theory|thoery|tests?|test)$/);
      let topicLevelTestMatch = n.match(/^(\d+)_(test)$/);

      // Folder 1 special case: "16_" prefix -> remap to topic 1, sub-lessons 5/6
      if (topicOrder === 1 && /^16_/.test(n)) {
        if (n === "16_test") {
          topicLevelFiles.push(filename);
          continue;
        }
        const remapped = n.replace(/^16_1_/, "1_5_").replace(/^16_2_/, "1_6_");
        effectiveMatch = remapped.match(
          /^(\d+)_(\d+)_(theory|thoery|tests?|test)$/,
        );
      }

      if (effectiveMatch) {
        const subOrder = parseInt(effectiveMatch[2]);
        if (!subLessonGroups[subOrder]) subLessonGroups[subOrder] = [];
        subLessonGroups[subOrder].push(filename);
      } else if (topicLevelTestMatch) {
        topicLevelFiles.push(filename);
      } else {
        console.warn(
          `  Unrecognized file, treating as topic-level: ${filename}`,
        );
        topicLevelFiles.push(filename);
      }
    }

    const subOrders = Object.keys(subLessonGroups)
      .map(Number)
      .sort((a, b) => a - b);
    for (const subOrder of subOrders) {
      const subLessonTitle =
        SUB_LESSON_TITLES[topicOrder]?.[subOrder] ||
        `${TOPIC_TITLES[topicOrder] || slug} - ${subOrder}`;

      const { data: subLesson, error: subErr } = await supabase
        .from("sub_lessons")
        .insert({
          topic_id: topic.id,
          order_index: subOrder,
          title: subLessonTitle,
        })
        .select()
        .single();
      if (subErr) throw subErr;

      for (const filename of subLessonGroups[subOrder]) {
        const fileType = classifySubLessonFile(filename);
        if (!fileType) {
          console.warn(`  Could not classify ${filename}, skipping`);
          continue;
        }
        const storagePath = `${folderName}/${filename}`;
        await uploadFile(path.join(folderPath, filename), storagePath);
        const { error } = await supabase.from("sub_lesson_files").insert({
          sub_lesson_id: subLesson.id,
          file_type: fileType,
          storage_path: storagePath,
          original_filename: filename,
        });
        if (error) throw error;
        console.log(`  Uploaded sub-lesson ${subOrder} file: ${filename}`);
      }
    }

    for (const filename of topicLevelFiles) {
      const storagePath = `${folderName}/${filename}`;
      await uploadFile(path.join(folderPath, filename), storagePath);
      const key = normalize(filename);
      const title = TOPIC_FILE_TITLES[topicOrder]?.[key] || filename;
      const { error } = await supabase.from("topic_files").insert({
        topic_id: topic.id,
        storage_path: storagePath,
        original_filename: filename,
        title,
      });
      if (error) throw error;
      console.log(`  Uploaded topic-level file: ${filename} (${title})`);
    }

    for (const filename of examFiles) {
      examFilesToProcess.push({ filename, folderName, folderPath });
    }
  }

  // ---- Exams ----
  console.log(`\n=== Exams ===`);
  const examGroups = {};

  for (const { filename, folderPath } of examFilesToProcess) {
    const n = normalize(filename);
    const numMatch = n.match(/(\d+)/);
    if (!numMatch) continue;
    const examOrder = parseInt(numMatch[1]);
    if (!examGroups[examOrder]) examGroups[examOrder] = {};

    const isAnswer = /cavab|answers?/i.test(filename);
    const role = isAnswer ? "answer_key" : "exam";
    examGroups[examOrder][role] = { filename, folderPath };
  }

  for (const examOrder of Object.keys(examGroups)
    .map(Number)
    .sort((a, b) => a - b)) {
    const { data: exam, error: examErr } = await supabase
      .from("exams")
      .insert({ order_index: examOrder, title: `SINAQ ${examOrder}` })
      .select()
      .single();
    if (examErr) throw examErr;

    for (const role of ["exam", "answer_key"]) {
      const entry = examGroups[examOrder][role];
      if (!entry) {
        console.warn(`  SINAQ ${examOrder} missing ${role} file`);
        continue;
      }
      const storagePath = `_exams/${entry.filename}`;
      await uploadFile(
        path.join(entry.folderPath, entry.filename),
        storagePath,
      );
      const { error } = await supabase.from("exam_files").insert({
        exam_id: exam.id,
        file_type: role,
        storage_path: storagePath,
        original_filename: entry.filename,
      });
      if (error) throw error;
      console.log(`  SINAQ ${examOrder} ${role}: ${entry.filename}`);
    }

    const topicOrders = EXAM_TOPIC_MAP[examOrder] || [];
    for (const t of topicOrders) {
      const { data: topicRow } = await supabase
        .from("topics")
        .select("id")
        .eq("order_index", t)
        .single();
      if (topicRow) {
        await supabase.from("exam_topics").insert({
          exam_id: exam.id,
          topic_id: topicRow.id,
        });
      }
    }
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
