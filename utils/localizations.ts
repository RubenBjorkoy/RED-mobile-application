import i18next from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
    en: {
        translation: {
            appName: "My App",
            welcome: "Welcome to my app",
            settings: "Settings",
            profilePicture: "Profile Picture",
            username: "Username",
            group: "Group",
            role: "Role",
            theme: "Theme",
            dark: "Dark",
            light: "Light",
            language: "Language",
            english: "English",
            norwegian: "Norwegian",
            cancel: "Cancel",
            apply: "Apply",
        }
    },
    no: {
        translation: {
            appName: "Min app",
            welcome: "Velkommen til min app",
            settings: "Innstillinger",
            profilePicture: "Profilbilde",
            username: "Brukernavn",
            group: "Gruppe",
            role: "Rolle",
            theme: "Tema",
            dark: "Mørk",
            light: "Lys",
            language: "Språk",
            english: "Engelsk",
            norwegian: "Norsk",
            cancel: "Avbryt",
            apply: "Bruk",
        }
    }
}

i18next
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    lng: 'en',
    fallbackLng: 'en',
    resources,
    interpolation: {
      escapeValue: false, 
    },
    react: {
      useSuspense: false,
    },
  });

console.log(i18next.t('welcome'));

export default i18next;