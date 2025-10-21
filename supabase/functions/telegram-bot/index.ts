import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')!;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TelegramUpdate {
  message?: {
    from: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    chat: {
      id: number;
    };
    text: string;
  };
  callback_query?: {
    from: {
      id: number;
    };
    data: string;
    message: {
      chat: {
        id: number;
      };
      message_id: number;
    };
  };
}

async function sendTelegramMessage(chatId: number, text: string, replyMarkup?: any) {
  const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: replyMarkup,
    }),
  });
  return response.json();
}

async function handleStart(chatId: number, userId: number, userData: any) {
  // Save or update user profile
  const { error } = await supabase.from('profiles').upsert({
    telegram_id: userId,
    username: userData.username,
    first_name: userData.first_name,
    last_name: userData.last_name,
  });

  if (error) {
    console.error('Error saving profile:', error);
  }

  const welcomeMessage = `
🌲 <b>Добро пожаловать в "Шишки у Никитки"!</b> 🌲

Мы предлагаем качественные еловые и кедровые шишки с доставкой по всей России.

🛍 <b>Что вы можете сделать:</b>
/catalog - Посмотреть каталог товаров
/orders - Мои заказы
/help - Помощь

Или откройте наш магазин через кнопку ниже! 👇
  `;

  const keyboard = {
    inline_keyboard: [
      [{ text: '🛒 Открыть магазин', web_app: { url: `${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovableproject.com')}` } }],
      [{ text: '📦 Каталог', callback_data: 'catalog' }],
      [{ text: '📋 Мои заказы', callback_data: 'orders' }],
    ],
  };

  await sendTelegramMessage(chatId, welcomeMessage, keyboard);
}

async function handleCatalog(chatId: number) {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .limit(5);

  if (error || !products || products.length === 0) {
    await sendTelegramMessage(chatId, '❌ Не удалось загрузить каталог');
    return;
  }

  let message = '🌲 <b>Наш ассортимент:</b>\n\n';
  
  products.forEach((product, index) => {
    message += `${index + 1}. <b>${product.name}</b>\n`;
    message += `   💰 ${product.price} ₽\n`;
    message += `   📦 В наличии: ${product.stock} шт.\n\n`;
  });

  message += '\n🛒 Откройте магазин для оформления заказа!';

  const keyboard = {
    inline_keyboard: [
      [{ text: '🛒 Открыть магазин', web_app: { url: `${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovableproject.com')}` } }],
    ],
  };

  await sendTelegramMessage(chatId, message, keyboard);
}

async function handleOrders(chatId: number, userId: number) {
  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('telegram_id', userId)
    .single();

  if (!profile) {
    await sendTelegramMessage(chatId, '❌ Профиль не найден');
    return;
  }

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name))')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error || !orders || orders.length === 0) {
    await sendTelegramMessage(chatId, '📦 У вас пока нет заказов');
    return;
  }

  let message = '📋 <b>Ваши заказы:</b>\n\n';

  orders.forEach((order, index) => {
    const statusEmoji = order.status === 'pending' ? '⏳' : 
                       order.status === 'confirmed' ? '✅' : 
                       order.status === 'delivered' ? '📦' : '❌';
    
    message += `${index + 1}. Заказ #${order.id.slice(0, 8)}\n`;
    message += `   ${statusEmoji} Статус: ${order.status}\n`;
    message += `   💰 Сумма: ${order.total_amount} ₽\n`;
    message += `   📅 Дата: ${new Date(order.created_at).toLocaleDateString('ru-RU')}\n\n`;
  });

  await sendTelegramMessage(chatId, message);
}

async function notifyOrder(telegramId: number, orderId: string, total: number) {
  const message = `
✅ <b>Ваш заказ принят!</b>

📦 Номер заказа: #${orderId.slice(0, 8)}
💰 Сумма: ${total} ₽

Мы свяжемся с вами в ближайшее время для подтверждения доставки.

Спасибо за покупку! 🌲
  `;

  await sendTelegramMessage(telegramId, message);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Handle webhook updates from Telegram
    if (body.update_id) {
      const update: TelegramUpdate = body;

      if (update.message) {
        const { from, chat, text } = update.message;

        if (text === '/start') {
          await handleStart(chat.id, from.id, from);
        } else if (text === '/catalog') {
          await handleCatalog(chat.id);
        } else if (text === '/orders') {
          await handleOrders(chat.id, from.id);
        } else if (text === '/help') {
          await sendTelegramMessage(
            chat.id,
            '💡 <b>Команды бота:</b>\n\n' +
            '/start - Начать работу\n' +
            '/catalog - Каталог товаров\n' +
            '/orders - Мои заказы\n' +
            '/help - Помощь'
          );
        }
      }

      if (update.callback_query) {
        const { from, data, message } = update.callback_query;

        if (data === 'catalog') {
          await handleCatalog(message.chat.id);
        } else if (data === 'orders') {
          await handleOrders(message.chat.id, from.id);
        }
      }
    }

    // Handle order notifications from web app
    if (body.action === 'notify_order') {
      await notifyOrder(body.telegram_id, body.order_id, body.total);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
