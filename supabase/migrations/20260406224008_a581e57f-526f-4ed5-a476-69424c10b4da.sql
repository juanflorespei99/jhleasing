
-- Update Chevrolet Aveo
UPDATE vehicles SET year=2022, price_employee=127880, price_public=159850, vin='LSGHD52H2ND158903', color='Negro', plate_state='Jalisco', mileage='54,000 km', slug='chevrolet-aveo-2022' WHERE id='e527ff2b-c237-4580-94e2-5d576307fc12';

-- Update Hyundai Grand i10
UPDATE vehicles SET year=2024, price_employee=160880, price_public=201100, vin='MALB24AC5RM267401', color='Plata', plate_state='Sonora', mileage='22,000 km', slug='hyundai-grand-i10-2024' WHERE id='eddaa38e-cb4e-4096-93e6-42ee02face64';

-- Update Nissan Versa
UPDATE vehicles SET year=2022, price_employee=169880, price_public=212350, vin='3N1CN8AE2NL847994', color='Blanco', plate_state='Ciudad de México', mileage='40,000 km', slug='nissan-versa-2022' WHERE id='72e5bc73-144a-4207-87a8-9ae94117821d';

-- Update Suburban Blindaje (is_armored = true)
UPDATE vehicles SET price_employee=268680, price_public=335850, vin='1GNSC8KC0FR270170', color='Negro', plate_state='Morelos', mileage='90,000 km', is_armored=true WHERE id='ca71877c-2dcb-4588-8561-30bd62f7ee80';

-- Update Chevrolet Tahoe
UPDATE vehicles SET year=2021, price_employee=698000, price_public=872500, vin='1GNSK8KL3MR233114', color='Azul', plate_state='Morelos', mileage='87,312 km', slug='chevrolet-tahoe-2021' WHERE id='7c0fa3d2-f510-4cfd-8fc1-170a59ee2e1e';

-- Update MG HS Excite
UPDATE vehicles SET year=2022, price_employee=177560, price_public=221950, vin='LSJA24U6XNN115217', color='Negro', plate_state='Ciudad de México', mileage='70,000 km', slug='mg-hs-2022' WHERE id='d214c90a-2c86-4cd3-b0bf-bbb750ff5761';

-- Update Dodge Durango
UPDATE vehicles SET year=2015, price_employee=180000, price_public=225000, vin='1C4RDHDG9FCI93466', color='Gris', plate_state='Ciudad de México', mileage='170,000 km', slug='dodge-durango-2015' WHERE id='b1f5724f-951b-4eb3-8c9f-bdea53da90f7';

-- Update MG RX8
UPDATE vehicles SET year=2022, price_employee=261960, price_public=327450, vin='LSJW84W90NG035280', color='Gris plata', plate_state='Ciudad de México', mileage='0 km', slug='mg-rx8-2022' WHERE id='d75baaf0-0b4e-48ca-8151-6c3875e27c68';

-- Insert new Tucson
INSERT INTO vehicles (slug, brand, name, type, year, price_employee, price_public, vin, color, plate_state, mileage, location, description, is_public, is_active, is_armored)
VALUES ('hyundai-tucson-glc-premium-2023', 'Hyundai', 'Hyundai Tucson GLC Premium', 'SUV', 2023, 351500, 439375, 'TMCJB3UE6PJ249456', 'Gris plata', 'Ciudad de México', '0 km', '', '', true, true, false);
