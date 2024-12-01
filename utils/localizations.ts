import i18next from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
    en: {
        translation: {
            appName: "Revolve Error Database Mobile Interface",
            welcome: "Welcome to my app",
            settings: "Settings",
            username: "Username",
            user: "User",
            password: "Password",
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
            search: "Search",
            describeError: "Describe the error?",
            system: "System",
            subsystem: "Subsystem",
            selectSystem: "Select a system",
            selectSubsystem: "Select a subsystem",
            all: "All",
            addComment: "Add comment",
            writeComment: "Write a comment",
            comments: "Comments",
            signin: "Sign in",
            signup: "Sign up",
            signout: "Sign out",
            resolved: "Resolved",
            notResolved: "Not resolved",
            youhavenoerrors: "You have no errors",
            loadingImage: "Loading image...",
            delete: "Delete",
            solution: "Solution",
            addSolution: "Mark as solution",
            removeSolution: "Remove as solution",
            personalErrors: "Personal errors",
            allErrors: "All errors",
            noImage: "No image",
            viewInMap: "View in map",
            clusterDetails: "Cluster details",
            errors: "Errors",
            close: "Close",
        }
    },
    no: {
        translation: {
            appName: "Revolve Error Database Mobile Interface",
            welcome: "Velkommen til min app",
            settings: "Innstillinger",
            username: "Brukernavn",
            user: "Bruker",
            password: "Passord",
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
            search: "Søk",
            describeError: "Beskriv feilen",
            system: "System",
            subsystem: "Subsystem",
            selectSystem: "Velg et system",
            selectSubsystem: "Velg et subsystem",
            all: "Alle",
            addComment: "Legg til kommentar",
            writeComment: "Skriv en kommentar",
            comments: "Kommentarer",
            signin: "Logg inn",
            signup: "Registrer",
            signout: "Logg ut",
            resolved: "Løst",
            notResolved: "Ikke løst",
            youhavenoerrors: "Du har ingen feil",
            loadingImage: "Laster bilde...",
            delete: "Slett",
            solution: "Løsning",
            addSolution: "Marker som løsning",
            removeSolution: "Fjern som løsning",
            personalErrors: "Personlige feil",
            allErrors: "Alle feil",
            noImage: "Ingen bilde",
            viewInMap: "Se i kart",
            clusterDetails: "Klyngeinformasjon",
            errors: "feil",
            close: "Lukk",
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

export default i18next;