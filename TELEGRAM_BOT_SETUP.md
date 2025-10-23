# Инструкция по развертыванию Telegram Бота "Шишки у Никитки"

## ✅ Статус развертывания

Бот **полностью готов** к работе! Edge Function уже развернута на Supabase.

## Шаг 1: Настройка Webhook

**ВАЖНО:** Замените `YOUR_BOT_TOKEN` на ваш реальный токен бота.

### Вариант 1: Через браузер (самый простой)

Откройте в браузере:
```
https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://kptoctufiwsivvegexka.supabase.co/functions/v1/telegram-bot
```

Вы должны увидеть ответ:
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

### Вариант 2: Через curl

```bash
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://kptoctufiwsivvegexka.supabase.co/functions/v1/telegram-bot",
    "allowed_updates": ["message", "callback_query"]
  }'
```

### Проверка webhook

Проверьте установку webhook:
```
https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo
```

## Шаг 2: Настройка Mini App (Web App)

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте команду `/mybots`
3. Выберите вашего бота
4. Нажмите **Bot Settings** → **Menu Button**
5. Выберите **Configure menu button**
6. Введите URL вашего приложения: `https://shishki-u-nikitki-hub.lovable.app`
7. Введите название кнопки: `🛒 Открыть магазин`

## Шаг 3: Настройка команд бота (опционально)

Улучшите UX, добавив описания команд:

1. Отправьте в [@BotFather](https://t.me/BotFather): `/mybots`
2. Выберите вашего бота
3. Нажмите **Edit Commands**
4. Отправьте следующий текст:

```
start - Начать работу с ботом
catalog - Просмотр каталога товаров
orders - Мои заказы
help - Список всех команд
```

## ✅ Готово!

Теперь проверьте работу:

1. Откройте вашего бота в Telegram
2. Отправьте `/start` - должно прийти приветственное сообщение
3. Нажмите "🛒 Открыть магазин" - откроется Mini App
4. Попробуйте команды `/catalog` и `/orders`

## 📋 Доступные команды

- `/start` - Начать работу с ботом
- `/catalog` - Просмотр каталога товаров  
- `/orders` - Просмотр своих заказов
- `/help` - Список команд

## 🔍 Устранение неполадок

### Бот не отвечает
1. Проверьте webhook: `https://api.telegram.org/botYOUR_TOKEN/getWebhookInfo`
2. Посмотрите логи Edge Function: [Открыть логи](https://supabase.com/dashboard/project/kptoctufiwsivvegexka/functions/telegram-bot/logs)
3. Убедитесь, что TELEGRAM_BOT_TOKEN добавлен в секреты

### Mini App не открывается
- URL должен быть: `https://shishki-u-nikitki-hub.lovable.app`
- Убедитесь, что приложение опубликовано

### Ошибка "Internal Server Error"
- Проверьте, что база данных настроена (таблицы `profiles`, `products`, `orders`)
- Проверьте RLS политики для публичного доступа

## 🎯 Функциональность

### В Telegram боте:
- 📦 Просмотр каталога прямо в боте
- 📋 Отслеживание заказов
- 🔔 Автоматические уведомления о заказах
- 🌐 Быстрый доступ к полному магазину

### В Mini App:
- 🛒 Полный каталог с поиском
- 🛍 Корзина покупок
- 📝 Оформление заказа
- ⭐ Отзывы клиентов
- 🌙 Образовательный режим
- 📱 Адаптивный дизайн

## 🔗 Полезные ссылки

- [Supabase Edge Functions](https://supabase.com/dashboard/project/kptoctufiwsivvegexka/functions)
- [Логи бота](https://supabase.com/dashboard/project/kptoctufiwsivvegexka/functions/telegram-bot/logs)
- [База данных](https://supabase.com/dashboard/project/kptoctufiwsivvegexka/editor)
- [BotFather](https://t.me/BotFather)
