/*
  Язык сайта. У каждого языка своя папка: /ru/, /en/, /zh-hans/ …

  На страницах-переадресациях (корень, /privacy/, /terms/ — у <html> есть
  data-redirect) скрипт выбирает язык и сразу уходит на его страницу.
  Порядок: параметр ?lang= (его передают прежние сборки приложения — язык
  приложения на iOS может не совпадать с языком Safari) → выбор, сделанный
  в меню языков → язык браузера → английский.

  На страницах языков скрипт только запоминает выбор из меню. Само меню —
  ссылки, оно работает и без JavaScript.

  Страницы собирает Tools/Site/build.py; список языков здесь и там один.
*/
(function () {
  var LANGS = ["de", "en", "es", "fr", "it", "pt-br", "tr", "kk", "ru",
               "ur", "ar", "hi", "bn", "zh-hans", "zh-hant"];
  var storageKey = "alarmstreak.lang";

  function normalize(tag) {
    tag = String(tag || "").toLowerCase().replace(/_/g, "-");
    if (!tag) return null;
    if (LANGS.indexOf(tag) >= 0) return tag;
    if (tag.indexOf("zh") === 0) {
      return /hant|-tw|-hk|-mo/.test(tag) ? "zh-hant" : "zh-hans";
    }
    if (tag.indexOf("pt") === 0) return "pt-br";
    var base = tag.split("-")[0];
    return LANGS.indexOf(base) >= 0 ? base : null;
  }

  function fromQuery() {
    var match = /[?&]lang=([a-z_-]+)/i.exec(window.location.search);
    return match ? normalize(match[1]) : null;
  }

  // Хранилище может быть недоступно (приватный режим, запрет сайтам),
  // поэтому каждое обращение — в try/catch.
  function fromStorage() {
    try {
      return normalize(window.localStorage.getItem(storageKey));
    } catch (e) {
      return null;
    }
  }

  function remember(lang) {
    try {
      window.localStorage.setItem(storageKey, lang);
    } catch (e) {
      /* выбор просто не запомнится */
    }
  }

  function fromBrowser() {
    var list = navigator.languages || [navigator.language || ""];
    for (var i = 0; i < list.length; i++) {
      var lang = normalize(list[i]);
      if (lang) return lang;
    }
    return null;
  }

  var root = document.documentElement;
  var page = root.getAttribute("data-redirect");
  if (page !== null) {
    var lang = fromQuery() || fromStorage() || fromBrowser() || "en";
    window.location.replace((root.getAttribute("data-base") || "") + lang + "/" + page);
    return;
  }

  document.addEventListener("click", function (event) {
    var link = event.target.closest && event.target.closest("[data-set-lang]");
    if (link) remember(link.getAttribute("data-set-lang"));

    // <details> сам не закрывается по щелчку мимо — закрываем меню здесь.
    var menu = document.querySelector(".lang-menu[open]");
    if (menu && !menu.contains(event.target)) menu.open = false;
  });

  document.addEventListener("keydown", function (event) {
    var menu = document.querySelector(".lang-menu[open]");
    if (menu && event.key === "Escape") {
      menu.open = false;
      menu.querySelector("summary").focus();
    }
  });
})();
