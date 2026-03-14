import { createContext, useContext, useState, ReactNode } from "react";

export type Language = "en" | "ka" | "ru";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    "nav.findTutors": "Find Tutors",
    "nav.forBusiness": "For Business",
    "nav.becomeTutor": "Become a Tutor",
    "nav.provenProgress": "Proven Progress",
    "nav.faq": "FAQ",
    "nav.login": "Log in",
    "nav.signup": "Sign up",

    // Hero
    "hero.badge": "Trusted by 50,000+ students",
    "hero.title1": "Find the perfect",
    "hero.title2": "tutor for you",
    "hero.subtitle": "Connect with expert tutors in any subject. Personalized 1-on-1 lessons that fit your schedule and learning goals.",
    "hero.searchPlaceholder": "What do you want to learn?",
    "hero.search": "Search",
    "hero.nextLesson": "Next Lesson",
    "hero.nextLessonDesc": "Mathematics with Nino B.",
    "hero.joinNow": "Join Now",

    // Stats
    "stats.tutors": "Expert Tutors",
    "stats.lessons": "Lessons Completed",
    "stats.rating": "Average Rating",
    "stats.subjects": "Subjects",

    // Featured
    "featured.title": "Featured Tutors",
    "featured.subtitle": "Top-rated educators ready to help you succeed",
    "featured.viewAll": "View all",
    "featured.bookTrial": "Book Trial",

    // How it works
    "how.title": "How TutorHub Works",
    "how.subtitle": "Start learning in 3 simple steps",
    "how.step1.title": "Find Your Tutor",
    "how.step1.desc": "Browse expert tutors by subject, price, and availability.",
    "how.step2.title": "Book a Lesson",
    "how.step2.desc": "Choose a time that works for you and book with one click.",
    "how.step3.title": "Start Learning",
    "how.step3.desc": "Join your AI-powered classroom and achieve your goals.",

    // CTA
    "cta.title": "Ready to start learning?",
    "cta.subtitle": "Join thousands of students already learning with TutorHub. Your first trial lesson is free.",
    "cta.button": "Find a Tutor",

    // Footer
    "footer.desc": "Connect with expert tutors worldwide. Learn any subject, any language, at your own pace.",
    "footer.platform": "Platform",
    "footer.support": "Support",
    "footer.company": "Company",
    "footer.findTutors": "Find Tutors",
    "footer.aiPractice": "AI Practice",
    "footer.becomeTutor": "Become a Tutor",
    "footer.faq": "FAQ",
    "footer.contact": "Contact",
    "footer.privacy": "Privacy Policy",
    "footer.about": "About",
    "footer.blog": "Blog",
    "footer.careers": "Careers",
    "footer.rights": "All rights reserved.",

    // Search
    "search.placeholder": "Search tutors by name or subject...",
    "search.filters": "Filters",
    "search.subject": "Subject",
    "search.pricePerHour": "Price per hour (₾)",
    "search.rating": "Rating",
    "search.availability": "Availability",
    "search.nativeSpeaker": "Native Speaker",
    "search.found": "found",
    "search.tutor": "tutor",
    "search.tutors": "tutors",
    "search.noResults": "No tutors found",
    "search.adjustFilters": "Try adjusting your filters",
    "search.native": "Native",

    // Tutor profile
    "profile.tutor": "Tutor",
    "profile.experience": "Experience",
    "profile.students": "Students",
    "profile.lessons": "Lessons",
    "profile.about": "About me",
    "profile.reviews": "Student Reviews",
    "profile.availableTimes": "Available Times",
    "profile.bookTrial": "Book Trial Lesson",
    "profile.sendMessage": "Send Message",
    "profile.freeTrial": "Free trial lesson",
    "profile.cancelAnytime": "Cancel anytime",
    "profile.aiClassroom": "AI-powered classroom",

    // Booking
    "booking.back": "Back to tutor profile",
    "booking.title": "Book Your Lesson",
    "booking.lessonDetails": "Lesson Details",
    "booking.date": "Date",
    "booking.time": "Time",
    "booking.paymentMethod": "Payment Method",
    "booking.orderSummary": "Order Summary",
    "booking.lesson60": "Lesson (60 min)",
    "booking.platformFee": "Platform fee",
    "booking.total": "Total",
    "booking.complete": "Complete Booking",
    "booking.secure": "Secure payment · Money-back guarantee",

    // Dashboard
    "dash.welcome": "Welcome back, Student!",
    "dash.overview": "Here's your learning overview",
    "dash.totalLessons": "Total Lessons",
    "dash.hoursLearned": "Hours Learned",
    "dash.thisWeek": "This Week",
    "dash.unread": "Unread",
    "dash.upcoming": "Upcoming Lessons",
    "dash.completed": "Completed Lessons",
    "dash.join": "Join",
    "dash.scheduled": "Scheduled",
    "dash.aiInsights": "AI Insights",
    "dash.recentActivity": "Recent Activity",
    "dash.findMore": "Find More Tutors",
    "dash.aiPractice": "AI Practice",

    // AI Practice
    "ai.title": "AI Practice",
    "ai.subtitle": "Daily exercises and scenario practice powered by AI",
    "ai.daily": "Daily Exercises",
    "ai.completed": "completed",
    "ai.startExercise": "Start Exercise with AI",
    "ai.scenario": "Scenario Practice",

    // Classroom
    "class.liveSession": "Live Session",
    "class.video": "Video",
    "class.materials": "Materials",
    "class.chat": "Chat",
    "class.notes": "Notes",
    "class.lessonNotes": "Lesson Notes",
    "class.typePlaceholder": "Type your message...",
    "class.notesPlaceholder": "Take notes here...",

    // Messages
    "msg.search": "Search messages...",
    "msg.typePlaceholder": "Type a message...",
  },
  ka: {
    // Nav
    "nav.findTutors": "რეპეტიტორები",
    "nav.forBusiness": "ბიზნესისთვის",
    "nav.becomeTutor": "გახდი რეპეტიტორი",
    "nav.provenProgress": "პროგრესი",
    "nav.faq": "FAQ",
    "nav.login": "შესვლა",
    "nav.signup": "რეგისტრაცია",

    // Hero
    "hero.badge": "50,000+ სტუდენტის ნდობით",
    "hero.title1": "იპოვეთ იდეალური",
    "hero.title2": "რეპეტიტორი",
    "hero.subtitle": "დაუკავშირდით ექსპერტ რეპეტიტორებს ნებისმიერ საგანში. პერსონალიზებული 1-on-1 გაკვეთილები.",
    "hero.searchPlaceholder": "რა გსურთ ისწავლოთ?",
    "hero.search": "ძიება",
    "hero.nextLesson": "შემდეგი გაკვეთილი",
    "hero.nextLessonDesc": "მათემატიკა ნინო ბ.-თან",
    "hero.joinNow": "შესვლა",

    // Stats
    "stats.tutors": "ექსპერტი რეპეტიტორი",
    "stats.lessons": "გაკვეთილი ჩატარებულია",
    "stats.rating": "საშუალო რეიტინგი",
    "stats.subjects": "საგანი",

    // Featured
    "featured.title": "გამორჩეული რეპეტიტორები",
    "featured.subtitle": "საუკეთესო პედაგოგები მზად არიან დაგეხმარონ",
    "featured.viewAll": "ყველას ნახვა",
    "featured.bookTrial": "საცდელი",

    // How it works
    "how.title": "როგორ მუშაობს TutorHub",
    "how.subtitle": "დაიწყეთ სწავლა 3 მარტივი ნაბიჯით",
    "how.step1.title": "იპოვეთ რეპეტიტორი",
    "how.step1.desc": "მოძებნეთ რეპეტიტორები საგნის, ფასის და ხელმისაწვდომობის მიხედვით.",
    "how.step2.title": "დაჯავშნეთ გაკვეთილი",
    "how.step2.desc": "აირჩიეთ მოსახერხებელი დრო და დაჯავშნეთ ერთი დაწკაპუნებით.",
    "how.step3.title": "დაიწყეთ სწავლა",
    "how.step3.desc": "შეუერთდით AI საკლასო ოთახს და მიაღწიეთ თქვენს მიზნებს.",

    // CTA
    "cta.title": "მზად ხართ სწავლის დასაწყებად?",
    "cta.subtitle": "შეუერთდით ათასობით სტუდენტს, რომლებიც უკვე სწავლობენ TutorHub-ით. პირველი საცდელი გაკვეთილი უფასოა.",
    "cta.button": "რეპეტიტორის პოვნა",

    // Footer
    "footer.desc": "დაუკავშირდით ექსპერტ რეპეტიტორებს მთელ მსოფლიოში. ისწავლეთ ნებისმიერი საგანი, თქვენი ტემპით.",
    "footer.platform": "პლატფორმა",
    "footer.support": "მხარდაჭერა",
    "footer.company": "კომპანია",
    "footer.findTutors": "რეპეტიტორები",
    "footer.aiPractice": "AI პრაქტიკა",
    "footer.becomeTutor": "გახდი რეპეტიტორი",
    "footer.faq": "FAQ",
    "footer.contact": "კონტაქტი",
    "footer.privacy": "კონფიდენციალურობა",
    "footer.about": "ჩვენ შესახებ",
    "footer.blog": "ბლოგი",
    "footer.careers": "კარიერა",
    "footer.rights": "ყველა უფლება დაცულია.",

    // Search
    "search.placeholder": "მოძებნეთ რეპეტიტორი სახელით ან საგნით...",
    "search.filters": "ფილტრები",
    "search.subject": "საგანი",
    "search.pricePerHour": "ფასი საათში (₾)",
    "search.rating": "რეიტინგი",
    "search.availability": "ხელმისაწვდომობა",
    "search.nativeSpeaker": "მშობლიურენოვანი",
    "search.found": "ნაპოვნია",
    "search.tutor": "რეპეტიტორი",
    "search.tutors": "რეპეტიტორი",
    "search.noResults": "რეპეტიტორები ვერ მოიძებნა",
    "search.adjustFilters": "სცადეთ ფილტრების შეცვლა",
    "search.native": "მშობლიური",

    // Tutor profile
    "profile.tutor": "რეპეტიტორი",
    "profile.experience": "გამოცდილება",
    "profile.students": "სტუდენტები",
    "profile.lessons": "გაკვეთილები",
    "profile.about": "ჩემ შესახებ",
    "profile.reviews": "სტუდენტების შეფასებები",
    "profile.availableTimes": "ხელმისაწვდომი დრო",
    "profile.bookTrial": "საცდელი გაკვეთილის დაჯავშნა",
    "profile.sendMessage": "შეტყობინების გაგზავნა",
    "profile.freeTrial": "უფასო საცდელი გაკვეთილი",
    "profile.cancelAnytime": "გაუქმება ნებისმიერ დროს",
    "profile.aiClassroom": "AI საკლასო ოთახი",

    // Booking
    "booking.back": "პროფილზე დაბრუნება",
    "booking.title": "დაჯავშნეთ გაკვეთილი",
    "booking.lessonDetails": "გაკვეთილის დეტალები",
    "booking.date": "თარიღი",
    "booking.time": "დრო",
    "booking.paymentMethod": "გადახდის მეთოდი",
    "booking.orderSummary": "შეკვეთის შეჯამება",
    "booking.lesson60": "გაკვეთილი (60 წთ)",
    "booking.platformFee": "პლატფორმის საკომისიო",
    "booking.total": "სულ",
    "booking.complete": "დაჯავშნის დასრულება",
    "booking.secure": "უსაფრთხო გადახდა · თანხის დაბრუნების გარანტია",

    // Dashboard
    "dash.welcome": "მოგესალმებით, სტუდენტო!",
    "dash.overview": "თქვენი სწავლის მიმოხილვა",
    "dash.totalLessons": "სულ გაკვეთილები",
    "dash.hoursLearned": "სწავლის საათები",
    "dash.thisWeek": "ამ კვირაში",
    "dash.unread": "წაუკითხავი",
    "dash.upcoming": "მომავალი გაკვეთილები",
    "dash.completed": "დასრულებული გაკვეთილები",
    "dash.join": "შესვლა",
    "dash.scheduled": "დაგეგმილი",
    "dash.aiInsights": "AI ანალიზი",
    "dash.recentActivity": "ბოლო აქტივობა",
    "dash.findMore": "მეტი რეპეტიტორი",
    "dash.aiPractice": "AI პრაქტიკა",

    // AI Practice
    "ai.title": "AI პრაქტიკა",
    "ai.subtitle": "ყოველდღიური სავარჯიშოები და სცენარული პრაქტიკა AI-ით",
    "ai.daily": "ყოველდღიური სავარჯიშოები",
    "ai.completed": "დასრულებულია",
    "ai.startExercise": "სავარჯიშოს დაწყება AI-ით",
    "ai.scenario": "სცენარული პრაქტიკა",

    // Classroom
    "class.liveSession": "პირდაპირი სესია",
    "class.video": "ვიდეო",
    "class.materials": "მასალები",
    "class.chat": "ჩატი",
    "class.notes": "ჩანაწერები",
    "class.lessonNotes": "გაკვეთილის ჩანაწერები",
    "class.typePlaceholder": "დაწერეთ შეტყობინება...",
    "class.notesPlaceholder": "ჩაინიშნეთ აქ...",

    // Messages
    "msg.search": "შეტყობინებების ძიება...",
    "msg.typePlaceholder": "დაწერეთ შეტყობინება...",
  },
  ru: {
    // Nav
    "nav.findTutors": "Репетиторы",
    "nav.forBusiness": "Для бизнеса",
    "nav.becomeTutor": "Стать репетитором",
    "nav.provenProgress": "Прогресс",
    "nav.faq": "FAQ",
    "nav.login": "Войти",
    "nav.signup": "Регистрация",

    // Hero
    "hero.badge": "Доверяют 50 000+ студентов",
    "hero.title1": "Найдите идеального",
    "hero.title2": "репетитора",
    "hero.subtitle": "Свяжитесь с экспертными репетиторами по любому предмету. Персонализированные уроки 1-на-1.",
    "hero.searchPlaceholder": "Что вы хотите изучить?",
    "hero.search": "Поиск",
    "hero.nextLesson": "Следующий урок",
    "hero.nextLessonDesc": "Математика с Нино Б.",
    "hero.joinNow": "Войти",

    // Stats
    "stats.tutors": "Экспертных репетиторов",
    "stats.lessons": "Проведённых уроков",
    "stats.rating": "Средний рейтинг",
    "stats.subjects": "Предметов",

    // Featured
    "featured.title": "Лучшие репетиторы",
    "featured.subtitle": "Лучшие педагоги готовы помочь вам",
    "featured.viewAll": "Показать все",
    "featured.bookTrial": "Пробный",

    // How it works
    "how.title": "Как работает TutorHub",
    "how.subtitle": "Начните обучение в 3 простых шага",
    "how.step1.title": "Найдите репетитора",
    "how.step1.desc": "Ищите репетиторов по предмету, цене и доступности.",
    "how.step2.title": "Забронируйте урок",
    "how.step2.desc": "Выберите удобное время и забронируйте в один клик.",
    "how.step3.title": "Начните учиться",
    "how.step3.desc": "Присоединяйтесь к AI-классу и достигайте своих целей.",

    // CTA
    "cta.title": "Готовы начать обучение?",
    "cta.subtitle": "Присоединяйтесь к тысячам студентов, которые уже учатся с TutorHub. Первый пробный урок бесплатный.",
    "cta.button": "Найти репетитора",

    // Footer
    "footer.desc": "Свяжитесь с экспертными репетиторами по всему миру. Учитесь в своём темпе.",
    "footer.platform": "Платформа",
    "footer.support": "Поддержка",
    "footer.company": "Компания",
    "footer.findTutors": "Репетиторы",
    "footer.aiPractice": "AI Практика",
    "footer.becomeTutor": "Стать репетитором",
    "footer.faq": "FAQ",
    "footer.contact": "Контакт",
    "footer.privacy": "Конфиденциальность",
    "footer.about": "О нас",
    "footer.blog": "Блог",
    "footer.careers": "Карьера",
    "footer.rights": "Все права защищены.",

    // Search
    "search.placeholder": "Поиск репетиторов по имени или предмету...",
    "search.filters": "Фильтры",
    "search.subject": "Предмет",
    "search.pricePerHour": "Цена в час (₾)",
    "search.rating": "Рейтинг",
    "search.availability": "Доступность",
    "search.nativeSpeaker": "Носитель языка",
    "search.found": "найдено",
    "search.tutor": "репетитор",
    "search.tutors": "репетиторов",
    "search.noResults": "Репетиторы не найдены",
    "search.adjustFilters": "Попробуйте изменить фильтры",
    "search.native": "Носитель",

    // Tutor profile
    "profile.tutor": "Репетитор",
    "profile.experience": "Опыт",
    "profile.students": "Студенты",
    "profile.lessons": "Уроки",
    "profile.about": "Обо мне",
    "profile.reviews": "Отзывы студентов",
    "profile.availableTimes": "Доступное время",
    "profile.bookTrial": "Забронировать пробный урок",
    "profile.sendMessage": "Написать сообщение",
    "profile.freeTrial": "Бесплатный пробный урок",
    "profile.cancelAnytime": "Отмена в любое время",
    "profile.aiClassroom": "AI-класс",

    // Booking
    "booking.back": "Назад к профилю",
    "booking.title": "Забронировать урок",
    "booking.lessonDetails": "Детали урока",
    "booking.date": "Дата",
    "booking.time": "Время",
    "booking.paymentMethod": "Способ оплаты",
    "booking.orderSummary": "Итог заказа",
    "booking.lesson60": "Урок (60 мин)",
    "booking.platformFee": "Комиссия платформы",
    "booking.total": "Итого",
    "booking.complete": "Завершить бронирование",
    "booking.secure": "Безопасная оплата · Гарантия возврата",

    // Dashboard
    "dash.welcome": "С возвращением, Студент!",
    "dash.overview": "Обзор вашего обучения",
    "dash.totalLessons": "Всего уроков",
    "dash.hoursLearned": "Часов обучения",
    "dash.thisWeek": "На этой неделе",
    "dash.unread": "Непрочитанные",
    "dash.upcoming": "Предстоящие уроки",
    "dash.completed": "Завершённые уроки",
    "dash.join": "Войти",
    "dash.scheduled": "Запланирован",
    "dash.aiInsights": "AI Аналитика",
    "dash.recentActivity": "Последняя активность",
    "dash.findMore": "Ещё репетиторы",
    "dash.aiPractice": "AI Практика",

    // AI Practice
    "ai.title": "AI Практика",
    "ai.subtitle": "Ежедневные упражнения и сценарная практика с AI",
    "ai.daily": "Ежедневные упражнения",
    "ai.completed": "завершено",
    "ai.startExercise": "Начать упражнение с AI",
    "ai.scenario": "Сценарная практика",

    // Classroom
    "class.liveSession": "Прямой эфир",
    "class.video": "Видео",
    "class.materials": "Материалы",
    "class.chat": "Чат",
    "class.notes": "Заметки",
    "class.lessonNotes": "Заметки к уроку",
    "class.typePlaceholder": "Введите сообщение...",
    "class.notesPlaceholder": "Записывайте здесь...",

    // Messages
    "msg.search": "Поиск сообщений...",
    "msg.typePlaceholder": "Введите сообщение...",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem("tutorhub-lang");
    return (saved as Language) || "en";
  });

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("tutorhub-lang", newLang);
  };

  const t = (key: string): string => {
    return translations[lang][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
