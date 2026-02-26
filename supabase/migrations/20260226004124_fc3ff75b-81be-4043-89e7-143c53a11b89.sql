
-- Update Chevrolet Aveo 2024 with higher-res image
UPDATE public.vehicles 
SET img = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/2024_Chevrolet_Aveo_Sed%C3%A1n_LT_%28Mexico%29_front_view.png/1280px-2024_Chevrolet_Aveo_Sed%C3%A1n_LT_%28Mexico%29_front_view.png',
    images = ARRAY[
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/2024_Chevrolet_Aveo_Sed%C3%A1n_LT_%28Mexico%29_front_view.png/1280px-2024_Chevrolet_Aveo_Sed%C3%A1n_LT_%28Mexico%29_front_view.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/2024_Chevrolet_Aveo_Sed%C3%A1n_LT_%28Mexico%29_rear_view.png/1280px-2024_Chevrolet_Aveo_Sed%C3%A1n_LT_%28Mexico%29_rear_view.png'
    ]
WHERE id = 'e527ff2b-c237-4580-94e2-5d576307fc12';

-- Update Hyundai Grand i10 Sedan with better sedan image
UPDATE public.vehicles 
SET img = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Hyundai_Grand_i10_Sedan_2022_%2853703857804%29_%28cropped%29.jpg/1280px-Hyundai_Grand_i10_Sedan_2022_%2853703857804%29_%28cropped%29.jpg',
    images = ARRAY[
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Hyundai_Grand_i10_Sedan_2022_%2853703857804%29_%28cropped%29.jpg/1280px-Hyundai_Grand_i10_Sedan_2022_%2853703857804%29_%28cropped%29.jpg'
    ]
WHERE id = 'eddaa38e-cb4e-4096-93e6-42ee02face64';

-- Update Nissan Versa with higher-res show image
UPDATE public.vehicles 
SET img = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/2020_Nissan_Versa_SR_front_NYIAS_2019.jpg/1280px-2020_Nissan_Versa_SR_front_NYIAS_2019.jpg',
    images = ARRAY[
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/2020_Nissan_Versa_SR_front_NYIAS_2019.jpg/1280px-2020_Nissan_Versa_SR_front_NYIAS_2019.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/2020_Nissan_Versa_SV_1.6L%2C_front_2.29.20.jpg/1280px-2020_Nissan_Versa_SV_1.6L%2C_front_2.29.20.jpg'
    ]
WHERE id = '72e5bc73-144a-4207-87a8-9ae94117821d';

-- Update GMC Yukon XL with higher-res image
UPDATE public.vehicles 
SET img = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/2025_GMC_Yukon_AT4_Facelift.jpg/1280px-2025_GMC_Yukon_AT4_Facelift.jpg',
    images = ARRAY[
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/2025_GMC_Yukon_AT4_Facelift.jpg/1280px-2025_GMC_Yukon_AT4_Facelift.jpg'
    ]
WHERE id = '9d67b2f8-2183-499f-8be9-c7a8141aa2ea';

-- Update GMC Suburban with higher-res image
UPDATE public.vehicles 
SET img = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/2015_Chevrolet_Suburban_LT_in_black%2C_front_left_side_view.jpg/1280px-2015_Chevrolet_Suburban_LT_in_black%2C_front_left_side_view.jpg',
    images = ARRAY[
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/2015_Chevrolet_Suburban_LT_in_black%2C_front_left_side_view.jpg/1280px-2015_Chevrolet_Suburban_LT_in_black%2C_front_left_side_view.jpg'
    ]
WHERE id = 'ca71877c-2dcb-4588-8561-30bd62f7ee80';

-- Update Chevrolet Tahoe High Country with higher-res image
UPDATE public.vehicles 
SET img = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/2021_Chevrolet_Tahoe_High_Country%2C_front_12.24.20.jpg/1280px-2021_Chevrolet_Tahoe_High_Country%2C_front_12.24.20.jpg',
    images = ARRAY[
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/2021_Chevrolet_Tahoe_High_Country%2C_front_12.24.20.jpg/1280px-2021_Chevrolet_Tahoe_High_Country%2C_front_12.24.20.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/2021_Chevrolet_Tahoe_High_Country%2C_rear_12.24.20.jpg/1280px-2021_Chevrolet_Tahoe_High_Country%2C_rear_12.24.20.jpg'
    ]
WHERE id = '7c0fa3d2-f510-4cfd-8fc1-170a59ee2e1e';

-- Update MG HS with PHEV second gen image (newer/better)
UPDATE public.vehicles 
SET img = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/MG_HS_%28second_generation%29_DSC_7234.jpg/1280px-MG_HS_%28second_generation%29_DSC_7234.jpg',
    images = ARRAY[
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/MG_HS_%28second_generation%29_DSC_7234.jpg/1280px-MG_HS_%28second_generation%29_DSC_7234.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/MG_HS_PHEV_%28second_generation%29_Auto_Zuerich_2024_DSC_6110.jpg/1280px-MG_HS_PHEV_%28second_generation%29_Auto_Zuerich_2024_DSC_6110.jpg'
    ]
WHERE id = 'd214c90a-2c86-4cd3-b0bf-bbb750ff5761';

-- Update Dodge Durango with 2018 RT image (closer to 2017 Limited)
UPDATE public.vehicles 
SET img = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2018_Dodge_Durango_RT_5.7L_Hemi_front_4.20.19.jpg/1280px-2018_Dodge_Durango_RT_5.7L_Hemi_front_4.20.19.jpg',
    images = ARRAY[
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2018_Dodge_Durango_RT_5.7L_Hemi_front_4.20.19.jpg/1280px-2018_Dodge_Durango_RT_5.7L_Hemi_front_4.20.19.jpg'
    ]
WHERE id = 'b1f5724f-951b-4eb3-8c9f-bdea53da90f7';

-- Update MG RX8 with higher-res Roewe RX8 image
UPDATE public.vehicles 
SET img = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Roewe_RX8_001.jpg/1280px-Roewe_RX8_001.jpg',
    images = ARRAY[
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Roewe_RX8_001.jpg/1280px-Roewe_RX8_001.jpg'
    ]
WHERE id = 'd75baaf0-0b4e-48ca-8151-6c3875e27c68';
