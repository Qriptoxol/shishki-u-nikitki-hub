-- Update product images to real cone images
UPDATE products 
SET image_url = '/src/assets/pine-cones.jpg'
WHERE name = 'Еловые шишки';

UPDATE products 
SET image_url = '/src/assets/cedar-cones.jpg'
WHERE name = 'Кедровые шишки';