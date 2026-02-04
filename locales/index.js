import en from "./en.json";
import me from "./me.json";
import ru from "./ru.json";

export const supportedLanguages = [
  { code: "me", label: "Crnogorski", flag: "🇲🇪" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "en", label: "English", flag: "🇬🇧" }
];

const translations = {
  en,
  me,
  ru
};

export default translations;
