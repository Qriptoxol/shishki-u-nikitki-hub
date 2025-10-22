-- Добавляем товары (еловые и кедровые шишки)
INSERT INTO public.products (name, description, price, category, in_stock, image_url) VALUES
('Еловые шишки', 'Свежие еловые шишки высокого качества. Идеально подходят для декора и поделок.', 150, 'еловые', true, 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=400'),
('Еловые шишки (большие)', 'Крупные еловые шишки для декоративных композиций и новогоднего украшения.', 250, 'еловые', true, 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400'),
('Кедровые шишки', 'Натуральные кедровые шишки с орехами. Экологически чистый продукт из сибирской тайги.', 300, 'кедровые', true, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400'),
('Кедровые шишки (отборные)', 'Отборные крупные кедровые шишки премиум качества. Богатый урожай орехов.', 450, 'кедровые', true, 'https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?w=400'),
('Микс шишек', 'Ассорти из еловых и кедровых шишек. Отлично подходит для творчества и декора.', 200, 'микс', true, 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=400');

-- Создаем несколько профилей для отзывов
INSERT INTO public.profiles (first_name, last_name, telegram_id) VALUES
('Алексей', 'Петров', 123456789),
('Мария', 'Иванова', 987654321),
('Дмитрий', 'Сидоров', 456789123),
('Елена', 'Козлова', 789123456);

-- Добавляем отзывы от пользователей
INSERT INTO public.reviews (user_id, product_id, rating, comment) 
SELECT 
  p.id,
  prod.id,
  5,
  'Отличные шишки! Качество на высоте, доставка быстрая. Буду заказывать еще!'
FROM public.profiles p, public.products prod
WHERE p.first_name = 'Алексей' AND prod.name = 'Кедровые шишки'
LIMIT 1;

INSERT INTO public.reviews (user_id, product_id, rating, comment)
SELECT 
  p.id,
  prod.id,
  5,
  'Очень довольна покупкой! Шишки крупные, красивые. Использовала для новогоднего декора.'
FROM public.profiles p, public.products prod
WHERE p.first_name = 'Мария' AND prod.name = 'Еловые шишки (большие)'
LIMIT 1;

INSERT INTO public.reviews (user_id, product_id, rating, comment)
SELECT 
  p.id,
  prod.id,
  4,
  'Хорошие шишки за свою цену. Немного меньше ожидал размером, но в целом доволен.'
FROM public.profiles p, public.products prod
WHERE p.first_name = 'Дмитрий' AND prod.name = 'Еловые шишки'
LIMIT 1;

INSERT INTO public.reviews (user_id, product_id, rating, comment)
SELECT 
  p.id,
  prod.id,
  5,
  'Кедровые орехи свежие и вкусные! Шишки упакованы отлично, без повреждений. Рекомендую!'
FROM public.profiles p, public.products prod
WHERE p.first_name = 'Елена' AND prod.name = 'Кедровые шишки (отборные)'
LIMIT 1;

INSERT INTO public.reviews (user_id, rating, comment)
SELECT 
  p.id,
  5,
  'Прекрасный магазин! Большой выбор, приятные цены. Никитка - молодец! 🌲'
FROM public.profiles p
WHERE p.first_name = 'Алексей'
LIMIT 1;