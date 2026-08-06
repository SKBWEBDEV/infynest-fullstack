import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  // লোড করবে translation ফাইলগুলো (আমরা পাবলিক ফোল্ডারে রাখব)
  .use(Backend)
  // ব্রাউজারের ভাষা ডিটেক্ট করবে
  .use(LanguageDetector)
  // react-i18next-এ পাস করবে
  .use(initReactI18next)
  .init({
    fallbackLng: 'en', // যদি ডিফল্ট ভাষা না পাওয়া যায়, EN লোড হবে
    debug: true, // ডেভেলপমেন্টের সময় কনসোলে দেখার জন্য

    interpolation: {
      escapeValue: false, // react অলরেডি XSS প্রটেক্ট করে
    }
  });

export default i18n;