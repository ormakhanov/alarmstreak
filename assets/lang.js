/*
  Выбор языка страницы: ru или en.

  Порядок: параметр ?lang= (его передаёт приложение — язык приложения на iOS
  может не совпадать с языком Safari) → выбор, сделанный переключателем →
  язык браузера → английский.

  Скрипт подключается в <head> без defer: язык выставляется до первой
  отрисовки, и страница не мигает вторым языком.
*/
(function () {
  var root = document.documentElement;
  var supported = { ru: true, en: true };
  var storageKey = "alarmstreak.lang";

  function fromQuery() {
    var match = /[?&]lang=([a-z]{2})/i.exec(window.location.search);
    var lang = match && match[1].toLowerCase();
    return lang && supported[lang] ? lang : null;
  }

  // Хранилище может быть недоступно (приватный режим, запрет сайтам),
  // поэтому каждое обращение — в try/catch.
  function fromStorage() {
    try {
      var lang = window.localStorage.getItem(storageKey);
      return lang && supported[lang] ? lang : null;
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
      var lang = String(list[i]).slice(0, 2).toLowerCase();
      if (supported[lang]) return lang;
    }
    return null;
  }

  function apply(lang) {
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang);

    var title = root.getAttribute("data-title-" + lang);
    if (title) document.title = title;

    var buttons = document.querySelectorAll("[data-set-lang]");
    for (var i = 0; i < buttons.length; i++) {
      var pressed = buttons[i].getAttribute("data-set-lang") === lang;
      buttons[i].setAttribute("aria-pressed", pressed ? "true" : "false");
    }
  }

  var current = fromQuery() || fromStorage() || fromBrowser() || "en";
  apply(current);

  document.addEventListener("DOMContentLoaded", function () {
    apply(current);

    var buttons = document.querySelectorAll("[data-set-lang]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function (event) {
        current = event.currentTarget.getAttribute("data-set-lang");
        remember(current);
        apply(current);

        // Параметр из адреса иначе вернул бы прежний язык при обновлении.
        if (fromQuery() && window.history.replaceState) {
          var url = new URL(window.location.href);
          url.searchParams.set("lang", current);
          window.history.replaceState(null, "", url);
        }
      });
    }
  });
})();
