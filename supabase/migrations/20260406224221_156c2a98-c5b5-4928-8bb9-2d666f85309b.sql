
UPDATE vehicles 
SET img = 'https://rbkqgzairobefrmfdkei.supabase.co/storage/v1/object/public/vehicle-images/hyundai-tucson-glc-premium-2023/front.jpg',
    images = ARRAY[
      'https://rbkqgzairobefrmfdkei.supabase.co/storage/v1/object/public/vehicle-images/hyundai-tucson-glc-premium-2023/front.jpg',
      'https://rbkqgzairobefrmfdkei.supabase.co/storage/v1/object/public/vehicle-images/hyundai-tucson-glc-premium-2023/side.jpg',
      'https://rbkqgzairobefrmfdkei.supabase.co/storage/v1/object/public/vehicle-images/hyundai-tucson-glc-premium-2023/rear.jpg'
    ]
WHERE id = 'dddd373a-528f-4ed3-9005-b37c4756edfb';
