import en from "./en.json";
import me from "./me.json";
import ru from "./ru.json";

export const supportedLanguages = [
  { code: "me", label: "Crnogorski" },
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" }
];

const translations = {
  en,
  me,
  ru
};

export default translations;
