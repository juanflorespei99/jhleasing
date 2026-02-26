
-- Fix Chevrolet Aveo 2024 - correct hash path: 4/40 not a/a0
UPDATE public.vehicles 
SET img = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/2024_Chevrolet_Aveo_Sed%C3%A1n_LT_%28Mexico%29_front_view.png/960px-2024_Chevrolet_Aveo_Sed%C3%A1n_LT_%28Mexico%29_front_view.png',
    images = ARRAY[
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/2024_Chevrolet_Aveo_Sed%C3%A1n_LT_%28Mexico%29_front_view.png/960px-2024_Chevrolet_Aveo_Sed%C3%A1n_LT_%28Mexico%29_front_view.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/2024_Chevrolet_Aveo_Sed%C3%A1n_LT_%28Mexico%29_rear_view.png/960px-2024_Chevrolet_Aveo_Sed%C3%A1n_LT_%28Mexico%29_rear_view.png'
    ]
WHERE id = 'e527ff2b-c237-4580-94e2-5d576307fc12';

-- Fix Hyundai Grand i10 Sedan - correct hash path: b/bd not 4/4a
UPDATE public.vehicles 
SET img = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Hyundai_Grand_i10_Sedan_2022_%2853703857804%29_%28cropped%29.jpg/960px-Hyundai_Grand_i10_Sedan_2022_%2853703857804%29_%28cropped%29.jpg',
    images = ARRAY[
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Hyundai_Grand_i10_Sedan_2022_%2853703857804%29_%28cropped%29.jpg/960px-Hyundai_Grand_i10_Sedan_2022_%2853703857804%29_%28cropped%29.jpg'
    ]
WHERE id = 'eddaa38e-cb4e-4096-93e6-42ee02face64';

-- Fix Nissan Versa - correct hash path: 3/3e not e/e3
UPDATE public.vehicles 
SET img = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/2020_Nissan_Versa_SR_front_NYIAS_2019.jpg/960px-2020_Nissan_Versa_SR_front_NYIAS_2019.jpg',
    images = ARRAY[
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/2020_Nissan_Versa_SR_front_NYIAS_2019.jpg/960px-2020_Nissan_Versa_SR_front_NYIAS_2019.jpg'
    ]
WHERE id = '72e5bc73-144a-4207-87a8-9ae94117821d';

-- Fix GMC Yukon XL - correct hash path: 6/6c not 0/0a
UPDATE public.vehicles 
SET img = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/2025_GMC_Yukon_AT4_Facelift.jpg/960px-2025_GMC_Yukon_AT4_Facelift.jpg',
    images = ARRAY[
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/2025_GMC_Yukon_AT4_Facelift.jpg/960px-2025_GMC_Yukon_AT4_Facelift.jpg'
    ]
WHERE id = '9d67b2f8-2183-499f-8be9-c7a8141aa2ea';

-- Fix Suburban - correct hash path: 0/08 not 3/3a
UPDATE public.vehicles 
SET img = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/2015_Chevrolet_Suburban_LT_in_black%2C_front_left_side_view.jpg/960px-2015_Chevrolet_Suburban_LT_in_black%2C_front_left_side_view.jpg',
    images = ARRAY[
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/2015_Chevrolet_Suburban_LT_in_black%2C_front_left_side_view.jpg/960px-2015_Chevrolet_Suburban_LT_in_black%2C_front_left_side_view.jpg'
    ]
WHERE id = 'ca71877c-2dcb-4588-8561-30bd62f7ee80';

-- Fix Tahoe High Country - correct hash path: 7/75 not a/a1
UPDATE public.vehicles 
SET img = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/2021_Chevrolet_Tahoe_High_Country%2C_front_12.24.20.jpg/960px-2021_Chevrolet_Tahoe_High_Country%2C_front_12.24.20.jpg',
    images = ARRAY[
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/2021_Chevrolet_Tahoe_High_Country%2C_front_12.24.20.jpg/960px-2021_Chevrolet_Tahoe_High_Country%2C_front_12.24.20.jpg'
    ]
WHERE id = '7c0fa3d2-f510-4cfd-8fc1-170a59ee2e1e';

-- Fix MG HS - correct hash path: 0/08 not 5/5a
UPDATE public.vehicles 
SET img = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/MG_HS_%28second_generation%29_DSC_7234.jpg/960px-MG_HS_%28second_generation%29_DSC_7234.jpg',
    images = ARRAY[
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/MG_HS_%28second_generation%29_DSC_7234.jpg/960px-MG_HS_%28second_generation%29_DSC_7234.jpg'
    ]
WHERE id = 'd214c90a-2c86-4cd3-b0bf-bbb750ff5761';

-- Fix Dodge Durango - correct hash path: 1/1e not 6/6d
UPDATE public.vehicles 
SET img = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2018_Dodge_Durango_RT_5.7L_Hemi_front_4.20.19.jpg/960px-2018_Dodge_Durango_RT_5.7L_Hemi_front_4.20.19.jpg',
    images = ARRAY[
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/2018_Dodge_Durango_RT_5.7L_Hemi_front_4.20.19.jpg/960px-2018_Dodge_Durango_RT_5.7L_Hemi_front_4.20.19.jpg'
    ]
WHERE id = 'b1f5724f-951b-4eb3-8c9f-bdea53da90f7';

-- Fix MG RX8 - correct hash path: 7/77 not 6/6c
UPDATE public.vehicles 
SET img = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Roewe_RX8_001.jpg/960px-Roewe_RX8_001.jpg',
    images = ARRAY[
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Roewe_RX8_001.jpg/960px-Roewe_RX8_001.jpg'
    ]
WHERE id = 'd75baaf0-0b4e-48ca-8151-6c3875e27c68';
