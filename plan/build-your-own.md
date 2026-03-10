# План: Build Your Own — система скидок

## Контекст

На странице `/pages/personalized-skin-care-plan-acne` уже работает система bundle-скидок: пользователь выбирает 1-4 продукта, получает прогрессивную скидку (15%→30%), товары добавляются в корзину с discount code.

Нужно создать **аналогичную систему** для страницы `/pages/build-your-own`, но с учётом отличий:
- Сейчас 1 таб ("Micro-Infusion") с 4 продуктами в одной сетке
- У каждого продукта есть **quantity selector** (не просто toggle), без лимита
- Кнопка "Add" показывает quantity controls при нажатии
- Те же discount codes: BUNDLE15/20/25/30

---

## Файлы для изменения

| Файл | Действие |
|------|----------|
| `assets/build-your-own-discount.js` | **СОЗДАТЬ** — вся логика скидок |
| `assets/build-your-own-selection.css` | **СОЗДАТЬ** — стили состояний для BYO bundle selection |
| `sections/build-your-own.liquid` | **ИЗМЕНИТЬ** — добавить data-атрибуты на карточки продуктов |
| `sections/sticky-cta-build-your-own.liquid` | **ИЗМЕНИТЬ** — подключить новый JS и CSS, сделать sticky bar динамическим |
| `sections/build-your-own-container.liquid` | **ИЗМЕНИТЬ** — подключить новый JS |

---

## Шаг 1: Добавить data-атрибуты в `sections/build-your-own.liquid`

Добавить data-атрибуты на родительский `<div class="qure__product-item">` для идентификации продукта:
```html
<div class="qure__product-item silver-badge"
  data-byo-product
  data-variant-id="{{ product_variant_id }}"
  data-handle="{{ product_handle }}"
  data-title="{{ product_title | escape }}"
  data-price="{{ product_price_original }}"
  data-image="{{ product_featured_image | img_url: '250x' }}">
```

---

## Шаг 2: Создать `assets/build-your-own-discount.js`

IIFE-модуль по аналогии с `bundle-selection.js`. Ключевые отличия:

### Структура данных
```js
// Map с quantity вместо простого массива
// selectedProducts = Map<variantId, { variantId, handle, title, price, image, quantity }>
```

### Тиры скидок (по количеству УНИКАЛЬНЫХ продуктов)
```js
const DISCOUNT_TIERS = {
  1: { percent: 15, code: 'BUNDLE15' },
  2: { percent: 20, code: 'BUNDLE20' },
  3: { percent: 25, code: 'BUNDLE25' },
  4: { percent: 30, code: 'BUNDLE30' }
};
```

### Обработка событий

1. **Клик на `.add-cart-button`** — добавить продукт в selectedProducts с quantity=1, обновить sticky bar
2. **Клик на `[data-e-quantity-action="increment"]`** — увеличить quantity, пересчитать subtotal
3. **Клик на `[data-e-quantity-action="decrement"]`** — уменьшить quantity (если >1) или удалить продукт (если =1)
4. **Клик на CTA "CHECKOUT"** — POST /cart/add.js, apply discount, open cart drawer

### UI обновления sticky bar

**`updateStickyBar()`**:
- Активируем `.bundle-item` боксы последовательно (`.active` класс)
- Progress line width: `(count / 4) * 100%`
- Subtotal: `compare_price` и `discounted_price`
- Кнопка CHECKOUT:
  - `disabled` + "Add an item to unlock savings!" когда пусто
  - `enabled` + "CHECKOUT 🔒" когда есть продукты

### Переключение Add ↔ Quantity controls

Через checkbox `<input type="checkbox" name="added_in_cart">`. При restore — checked + показать quantity; при удалении — unchecked + показать Add.

### Источник данных

`window.get_products_data` (inline-скрипты, синхронно). Ключи: `build-your-own-products-<handle>`.

### Восстановление из корзины

`restoreFromCart()`: GET /cart.js → сопоставить с `window.get_products_data` → восстановить Map с quantity → retry визуального состояния.

---

## Шаг 3: Обновить `sections/sticky-cta-build-your-own.liquid`

1. Подключить CSS: `{{ 'build-your-own-selection.css' | asset_url | stylesheet_tag }}`
2. Убрать хардкод subtotal ($528.00 / $422.40)
3. Кнопка: `disabled` + "Add an item to unlock savings!" по умолчанию
4. `subtotal_cta` скрыт через CSS (`display: none !important`)

---

## Шаг 4: Обновить `sections/build-your-own-container.liquid`

Подключить скрипт (единственное место):
```liquid
loadScriptOnce('build-your-own-discount', '{{ "build-your-own-discount.js" | asset_url }}');
```

Не зависит от порядка async-загрузки благодаря `window.get_products_data` + event delegation + retry.

---

## Шаг 5: Создать `assets/build-your-own-selection.css`

- `.bundle-item .discount-box` — inactive (серый, opacity 0.4, scale 0.9)
- `.bundle-item.active .discount-box` — active (зелёный #28a745)
- `.progress-fill` — gradient animation
- `.subtotal_cta` — hidden → `.subtotal-visible` shown
- `.btn:disabled` — opacity 0.6

---

## Верификация

1. Открыть `https://qureskincare.com/pages/build-your-own` через Playwright MCP с `preview_theme_id`
2. "Add" на 1 продукте → 1 active box, 15% скидка
3. Quantity +1 → subtotal пересчитывается
4. Добавить 2/3/4 продукта → 20/25/30%
5. "-" до удаления → Add button возвращается
6. CHECKOUT → cart add + discount code + cart drawer
7. Reload → состояние восстановлено
