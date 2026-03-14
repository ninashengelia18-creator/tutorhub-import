import { useState } from "react";
import { HelpCircle, Globe } from "lucide-react";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type Language = "en" | "ka" | "ru";

const langLabels: Record<Language, string> = { en: "English", ka: "ქართული", ru: "Русский" };

const faqData: Record<Language, { category: string; questions: { q: string; a: string }[] }[]> = {
  en: [
    {
      category: "Booking & Lessons",
      questions: [
        { q: "How do I find and book a tutor?", a: "Use the search page to browse tutors by subject, price, availability, and rating. Click on a tutor's profile, pick a time slot, and complete the booking." },
        { q: "Can I try a lesson before committing?", a: "Yes! Most tutors offer a free trial lesson so you can see if they're the right fit." },
        { q: "Can I reschedule a lesson?", a: "You can reschedule up to 4 hours before the lesson starts without any penalty." },
      ],
    },
    {
      category: "Payments",
      questions: [
        { q: "What payment methods are accepted?", a: "We accept TBC PayGe and Bank of Georgia (BOG) Pay. All prices are in Georgian Lari (₾)." },
        { q: "Can I get a refund?", a: "If you're not satisfied, request a refund within 24 hours. Our support team will review your request." },
        { q: "How does billing work?", a: "You pay per lesson in ₾. Payment is processed at booking and held securely until the lesson is completed." },
      ],
    },
    {
      category: "Tutors",
      questions: [
        { q: "How do I become a tutor?", a: "Click 'Become a Tutor' in the footer, fill out your qualifications and experience, and our team reviews within 48 hours." },
        { q: "Are tutors verified?", a: "Yes, all tutors go through a verification process including identity check, qualification review, and a trial teaching session." },
        { q: "Can I choose a native speaker?", a: "Yes! Use the 'Native Speaker' filter on the search page to find tutors who are native speakers of the language you're learning." },
      ],
    },
    {
      category: "AI Features",
      questions: [
        { q: "What is the AI-powered classroom?", a: "Our classroom includes video chat, shared whiteboard, AI-assisted note-taking, and smart lesson insights generated after each session." },
        { q: "How does AI Practice work?", a: "AI Practice provides daily exercises tailored to your goals plus scenario-based conversations for job interviews, travel, and business situations." },
        { q: "What are Lesson Insights?", a: "After each lesson, AI generates a summary with key topics covered, areas for improvement, and recommended exercises." },
      ],
    },
    {
      category: "Technical & Support",
      questions: [
        { q: "What devices are supported?", a: "LearnEazy works on any modern browser — Chrome, Firefox, Safari, Edge — on desktop, tablet, and mobile." },
        { q: "In what languages is support available?", a: "Support is available in English, Georgian (ქართული), and Russian (Русский). Use the chat widget or email support@learneazy.ge." },
        { q: "How do I delete my account?", a: "Go to Settings > Account > Delete Account. This action is permanent and cannot be undone." },
      ],
    },
  ],
  ka: [
    {
      category: "დაჯავშნა და გაკვეთილები",
      questions: [
        { q: "როგორ ვიპოვო და დავჯავშნო რეპეტიტორი?", a: "გამოიყენეთ ძიების გვერდი რეპეტიტორების სანახავად საგნის, ფასის, ხელმისაწვდომობისა და რეიტინგის მიხედვით. დააჭირეთ პროფილს, აირჩიეთ დრო და დაასრულეთ დაჯავშნა." },
        { q: "შემიძლია საცდელი გაკვეთილი?", a: "დიახ! უმეტეს რეპეტიტორებს აქვთ უფასო საცდელი გაკვეთილი." },
        { q: "შემიძლია გაკვეთილის გადატანა?", a: "შეგიძლიათ გაკვეთილის გადატანა 4 საათით ადრე ჯარიმის გარეშე." },
      ],
    },
    {
      category: "გადახდები",
      questions: [
        { q: "რა გადახდის მეთოდებია?", a: "ვიღებთ TBC PayGe და საქართველოს ბანკის (BOG) Pay გადახდებს. ყველა ფასი ქართულ ლარშია (₾)." },
        { q: "შემიძლია თანხის დაბრუნება?", a: "თუ კმაყოფილი არ ხართ, მოითხოვეთ თანხის დაბრუნება 24 საათის განმავლობაში." },
        { q: "როგორ მუშაობს ანგარიშსწორება?", a: "იხდით გაკვეთილის მიხედვით ლარში (₾). გადახდა მუშავდება დაჯავშნისას." },
      ],
    },
    {
      category: "რეპეტიტორები",
      questions: [
        { q: "როგორ გავხდე რეპეტიტორი?", a: "დააჭირეთ 'გახდი რეპეტიტორი' ღილაკს, შეავსეთ კვალიფიკაცია და ჩვენი გუნდი განიხილავს 48 საათში." },
        { q: "რეპეტიტორები ვერიფიცირებულია?", a: "დიახ, ყველა რეპეტიტორი გადის ვერიფიკაციის პროცესს." },
        { q: "შემიძლია მშობლიურენოვანი მასწავლებლის არჩევა?", a: "დიახ! გამოიყენეთ 'მშობლიურენოვანი' ფილტრი ძიების გვერდზე." },
      ],
    },
    {
      category: "AI ფუნქციები",
      questions: [
        { q: "რა არის AI საკლასო ოთახი?", a: "ჩვენი საკლასო ოთახი მოიცავს ვიდეო ჩატს, საერთო დაფას, AI ჩანაწერებს და გაკვეთილის ანალიზს." },
        { q: "როგორ მუშაობს AI პრაქტიკა?", a: "AI პრაქტიკა გთავაზობთ ყოველდღიურ სავარჯიშოებს და სცენარზე დაფუძნებულ საუბრებს." },
        { q: "რა არის გაკვეთილის ანალიზი?", a: "გაკვეთილის შემდეგ AI ქმნის შეჯამებას განხილული თემებით და რეკომენდაციებით." },
      ],
    },
    {
      category: "ტექნიკური და მხარდაჭერა",
      questions: [
        { q: "რა მოწყობილობებია მხარდაჭერილი?", a: "LearnEazy მუშაობს ნებისმიერ თანამედროვე ბრაუზერზე — Chrome, Firefox, Safari, Edge." },
        { q: "რა ენებზეა მხარდაჭერა?", a: "მხარდაჭერა ხელმისაწვდომია ინგლისურ, ქართულ და რუსულ ენებზე. მოგვწერეთ support@learneazy.ge." },
        { q: "როგორ წავშალო ანგარიში?", a: "გადადით პარამეტრები > ანგარიში > ანგარიშის წაშლა." },
      ],
    },
  ],
  ru: [
    {
      category: "Бронирование и уроки",
      questions: [
        { q: "Как найти и забронировать репетитора?", a: "Используйте страницу поиска для просмотра репетиторов по предмету, цене, доступности и рейтингу. Нажмите на профиль, выберите время и завершите бронирование." },
        { q: "Можно ли попробовать пробный урок?", a: "Да! Большинство репетиторов предлагают бесплатный пробный урок." },
        { q: "Можно ли перенести урок?", a: "Вы можете перенести урок за 4 часа до начала без штрафа." },
      ],
    },
    {
      category: "Оплата",
      questions: [
        { q: "Какие способы оплаты принимаются?", a: "Мы принимаем TBC PayGe и Bank of Georgia (BOG) Pay. Все цены указаны в грузинских лари (₾)." },
        { q: "Могу ли я вернуть деньги?", a: "Если вы недовольны, запросите возврат в течение 24 часов после урока." },
        { q: "Как работает оплата?", a: "Вы платите за каждый урок в ₾. Оплата обрабатывается при бронировании." },
      ],
    },
    {
      category: "Репетиторы",
      questions: [
        { q: "Как стать репетитором?", a: "Нажмите 'Стать репетитором', заполните квалификацию, и наша команда рассмотрит за 48 часов." },
        { q: "Репетиторы проверены?", a: "Да, все репетиторы проходят процесс верификации." },
        { q: "Могу ли я выбрать носителя языка?", a: "Да! Используйте фильтр 'Носитель языка' на странице поиска." },
      ],
    },
    {
      category: "AI функции",
      questions: [
        { q: "Что такое AI-класс?", a: "Наш класс включает видеочат, общую доску, AI-заметки и аналитику урока." },
        { q: "Как работает AI практика?", a: "AI практика предлагает ежедневные упражнения и сценарные разговоры для реальной практики." },
        { q: "Что такое аналитика урока?", a: "После урока AI создаёт сводку с пройденными темами и рекомендациями." },
      ],
    },
    {
      category: "Техническая поддержка",
      questions: [
        { q: "Какие устройства поддерживаются?", a: "LearnEazy работает в любом современном браузере — Chrome, Firefox, Safari, Edge." },
        { q: "На каких языках доступна поддержка?", a: "Поддержка доступна на английском, грузинском и русском. Пишите на support@learneazy.ge." },
        { q: "Как удалить аккаунт?", a: "Перейдите в Настройки > Аккаунт > Удалить аккаунт." },
      ],
    },
  ],
};

export default function FAQ() {
  const [lang, setLang] = useState<Language>("en");
  const data = faqData[lang];

  return (
    <Layout>
      <div className="container max-w-3xl py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="mx-auto h-12 w-12 rounded-xl hero-gradient flex items-center justify-center mb-4">
            <HelpCircle className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">FAQ</h1>
          <p className="text-muted-foreground mb-4">LearnEazy — Frequently Asked Questions</p>

          {/* Language switcher */}
          <div className="inline-flex items-center gap-1 bg-muted rounded-lg p-1">
            {(Object.keys(langLabels) as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  lang === l ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Globe className="h-3.5 w-3.5" />
                {langLabels[l]}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="space-y-8">
          {data.map((section, i) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <h2 className="font-semibold text-lg mb-3">{section.category}</h2>
              <Accordion type="multiple" className="space-y-2">
                {section.questions.map((item, j) => (
                  <AccordionItem
                    key={j}
                    value={`${i}-${j}`}
                    className="rounded-lg border bg-card px-4 card-shadow hover:border-primary/30 transition-all"
                  >
                    <AccordionTrigger className="text-sm font-medium text-left hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
