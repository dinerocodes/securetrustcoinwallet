(() => {
  const LANGUAGE_KEY = "wallet_language";
  const COUNTRY_KEY = "wallet_country";

  // Country-to-language mapping.
  const COUNTRY_LANGUAGES = {
    // French
    BJ: "fr",
    FR: "fr",
    BE: "fr",
    SN: "fr",
    CI: "fr",
    TG: "fr",
    BF: "fr",
    NE: "fr",
    ML: "fr",
    GN: "fr",
    CD: "fr",
    CG: "fr",
    CM: "fr",
    GA: "fr",
    TD: "fr",
    DJ: "fr",
    MG: "fr",
    RW: "fr",
    BI: "fr",

    // German
    DE: "de",
    AT: "de",
    CH: "de",
    LI: "de",

    // Spanish
    ES: "es",
    MX: "es",
    AR: "es",
    CO: "es",
    CL: "es",
    PE: "es",
    VE: "es",
    EC: "es",
    BO: "es",
    PY: "es",
    UY: "es",
    CR: "es",
    PA: "es",
    GT: "es",
    HN: "es",
    SV: "es",
    NI: "es",
    DO: "es",
    CU: "es",

    // English
    NG: "en",
    US: "en",
    GB: "en",
    GH: "en",
    IE: "en",
    ZA: "en",
    KE: "en",
    CA: "en",
    AU: "en",
    NZ: "en",
  };

  const translations = window.WALLET_TRANSLATIONS || {};

  const supportedLanguages = ["en", "fr", "de", "es"];

  function getLanguage() {
    return localStorage.getItem(LANGUAGE_KEY) || "en";
  }

  // Translate page elements.
  function translatePage(language) {
    const selectedLanguage = translations[language] ? language : "en";

    const dictionary = translations[selectedLanguage];

    document.documentElement.lang = selectedLanguage;

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");

      if (dictionary[key] !== undefined) {
        element.textContent = dictionary[key];
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      const key = element.getAttribute("data-i18n-placeholder");

      if (dictionary[key] !== undefined) {
        element.placeholder = dictionary[key];
      }
    });

    document.querySelectorAll("[data-i18n-title]").forEach((element) => {
      const key = element.getAttribute("data-i18n-title");

      if (dictionary[key] !== undefined) {
        element.title = dictionary[key];
      }
    });

    document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
      const key = element.getAttribute("data-i18n-aria");

      if (dictionary[key] !== undefined) {
        element.setAttribute("aria-label", dictionary[key]);
      }
    });

    const selector = document.getElementById("language-selector");

    if (selector) {
      selector.value = selectedLanguage;
    }

    document.dispatchEvent(
      new CustomEvent("wallet:languageChanged", {
        detail: { language: selectedLanguage },
      }),
    );
  }

  // Manual language selection.
  function setLanguage(language) {
    if (!supportedLanguages.includes(language)) return;

    localStorage.setItem(LANGUAGE_KEY, language);

    translatePage(language);
  }

  // Detect country through IP.
  async function detectCountry() {
    try {
      const response = await fetch("https://ipapi.co/json/");

      if (!response.ok) {
        throw new Error("Country detection failed");
      }

      const data = await response.json();

      const country = (data.country_code || "").toUpperCase();

      localStorage.setItem(COUNTRY_KEY, country);

      return COUNTRY_LANGUAGES[country] || "en";
    } catch (error) {
      console.warn("Country detection failed:", error);

      return "en";
    }
  }

  // Add language selector.
  function createLanguageSelector() {
    if (document.getElementById("language-selector")) return;

    const header =
      document.querySelector(".header-actions") ||
      document.querySelector("header");

    if (!header) return;

    const wrapper = document.createElement("div");

    wrapper.className = "wallet-language-switcher";

    wrapper.innerHTML = `
            <select id="language-selector" aria-label="Choose language">

                <option value="en">🇬🇧 English</option>

                <option value="fr">🇫🇷 Français</option>

                <option value="de">🇩🇪 Deutsch</option>

                <option value="es">🇪🇸 Español</option>

            </select>
        `;

    const selector = wrapper.querySelector("select");

    selector.value = getLanguage();

    selector.addEventListener("change", function () {
      setLanguage(this.value);
    });

    header.appendChild(wrapper);
  }

  // Initialize system.
  async function initializeLocalization() {
    let language = localStorage.getItem(LANGUAGE_KEY);

    // Detect language only on first visit.
    if (!language) {
      language = await detectCountry();

      localStorage.setItem(LANGUAGE_KEY, language);
    }

    createLanguageSelector();

    translatePage(language);
  }

  // Public API.
  window.WalletLocalization = {
    setLanguage,

    getLanguage,

    translatePage,

    getCountry() {
      return localStorage.getItem(COUNTRY_KEY);
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeLocalization);
  } else {
    initializeLocalization();
  }
})();
