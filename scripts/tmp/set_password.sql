UPDATE "Artisan" SET "passwordHash" = '$2b$10$Rz9YhRd3tom6P67rvDrq1Oc4u8eDiOsDzbxvMpyHA/0WYEEzOvzX2' WHERE email = 'b.gauthier@maconnerie44.fr';
SELECT id, email, "passwordHash" IS NOT NULL as has_password FROM "Artisan" WHERE email = 'b.gauthier@maconnerie44.fr';
