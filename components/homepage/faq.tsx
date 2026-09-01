import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Что включено в подписку?",
    answer:
      "Подписка дает полный доступ ко всем курсам, тестам, PDF материалам, экзаменационным заданиям и инструментам отслеживания прогресса. Вы получаете доступ к персональному кабинету и постоянную поддержку.",
  },
  {
    question: "Как часто обновляются материалы?",
    answer:
      "Мы регулярно обновляем контент, добавляем новые курсы и тесты. Все обновления автоматически становятся доступными подписчикам без дополнительной оплаты.",
  },
  {
    question: "Можно ли отменить подписку?",
    answer:
      "Да, вы можете отменить подписку в любое время. После отмены вы сохраните доступ до конца оплаченного периода.",
  },
  {
    question: "Подходят ли курсы для подготовки к экзаменам?",
    answer:
      "Да, наши курсы разработаны специально для подготовки к вступительным экзаменам. Материалы включают теоретические знания, практические задания и тесты по реальным экзаменационным темам.",
  },
  {
    question: "Есть ли пробный период?",
    answer:
      "В данный момент мы не предлагаем пробный период, но у нас доступная цена подписки - всего 20₼ в месяц за полный доступ ко всем материалам.",
  },
  {
    question: "Как оплатить подписку?",
    answer:
      "Оплата производится через безопасную платежную систему. После нажатия кнопки 'Подписаться' вы будете перенаправлены на страницу оплаты, где сможете выбрать удобный способ оплаты.",
  },
];

const FAQ = () => {
  return (
    <section className="py-4 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#F8FAFC" }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-3xl sm:text-4xl font-bold mb-3"
            style={{ color: "#1E3A5F" }}
          >
            Часто задаваемые вопросы
          </h2>
          <p className="text-base" style={{ color: "#64748B" }}>
            Ответы на популярные вопросы о нашей платформе
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="rounded-lg border border-gray-200 bg-white px-4"
            >
              <AccordionTrigger className="text-base font-medium hover:no-underline py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base pb-4" style={{ color: "#64748B" }}>
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
