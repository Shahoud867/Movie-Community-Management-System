-- Update existing movies with YouTube trailer video IDs
-- Extracted from YouTube URLs provided

UPDATE Movie SET trailer_url = 'YoHD9XEInc0' WHERE title = 'Inception';
UPDATE Movie SET trailer_url = 'EXeTwQWrcwY' WHERE title = 'The Dark Knight';
UPDATE Movie SET trailer_url = '0pdqf4P9MB8' WHERE title = 'La La Land';
UPDATE Movie SET trailer_url = '5xH0HfJHsaY' WHERE title = 'Parasite';
UPDATE Movie SET trailer_url = 'OB1JrYCVJTg' WHERE title = 'El Secreto de Sus Ojos';
UPDATE Movie SET trailer_url = 'T5UGItdsqUI' WHERE title = 'Baran';
UPDATE Movie SET trailer_url = 'EX65wpFll9o' WHERE title = 'Khuda Kay Liye';
UPDATE Movie SET trailer_url = '6Gc45eyvSL4' WHERE title = 'Waar';
UPDATE Movie SET trailer_url = 'VgPG6FdlKcA' WHERE title = 'A Separation';
UPDATE Movie SET trailer_url = 'jVZRnnVSQ8k' WHERE title = 'Pan\'s Labyrinth';
UPDATE Movie SET trailer_url = 'tYZAG0FMmKY' WHERE title = 'Jawani Phir Nahi Ani';
UPDATE Movie SET trailer_url = 'LoebZZ8K5N0' WHERE title = 'The Revenant';
UPDATE Movie SET trailer_url = 'MdqMICWhxuA' WHERE title = 'About Elly';

-- Verify updates
SELECT movie_id, title, trailer_url FROM Movie ORDER BY movie_id;
