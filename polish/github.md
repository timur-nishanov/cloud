# Источник проекта

repo: timur-nishanov/cloud
branch: main

Прототип «Собери свой идеальный бандл» (Yandex Cloud / Scale 2026) целиком
скопирован из репозитория и полируется здесь: `index.html`, `style.css`,
`app.js`, `fonts/`, `assets/` (icons, logo, details, pattern).
Стек как в репо — статика без зависимостей, сцена 1920×1080.

## Last sync

date: 2026-08-17T11:56:00Z

### Updated in this project

- Полиш-проход по всем пяти экранам: оптические отступы, сетка, вертикальные ритмы.
- Хиро attract собран в один узел из плит-слов + деталь-капсула, провод к CTA, лента тегов на прижимной планке.
- Композиции деталей на карточках режимов пересобраны: слева россыпь по сетке, справа стык кромка-в-кромку с терминалами на стыках.
- Ритм палитры 13 плиток, лампа соотнесена с деталями, вердикт-панель больше не перекрывает палитру и кнопки; disabled-кнопка вместо серого — пунктирная кромка.

## Screen map

| Экран в проекте | Файлы репо |
|---|---|
| Attract (`#s-attract`) | index.html, style.css, app.js (`HERO_ROWS`, `buildAttract`), assets/pattern, assets/details/capsule-3.svg, assets/icons/* |
| Выбор режима (`#s-mode`) | index.html, style.css, app.js (`buildModeArt`), assets/details/{disc-L,plate-cut-L,plate-holes-L}*.svg |
| Выбор задачи (`#s-tasks`) | index.html, style.css, app.js (`renderTasks`), assets/details/task-*.svg |
| Сборка (`#s-build`) | index.html, style.css, app.js (`renderBuild`, `place`, `runSignal`), assets/icons/* |
| Готовые бандлы (`#s-ready`) | index.html, style.css, app.js (`renderReady`, `bundleSchema`) |
| Результат (`#s-result`) + вердикт-панель | index.html, style.css, app.js (`showResult`, `showVerdict`) |
