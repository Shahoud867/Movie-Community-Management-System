-- ========================================
-- MOVIE COMMUNITY MANAGEMENT SYSTEM
-- ========================================

-- DROP/CREATE DB and USE
DROP DATABASE IF EXISTS movie_community;
CREATE DATABASE movie_community;
USE movie_community;

-- ========================================
-- 1. USER MANAGEMENT MODULE
-- ========================================

CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fav_genre VARCHAR(50),
    profile_picture VARCHAR(255),
    bio TEXT,
    joined_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT chk_email_format CHECK (email LIKE '%@%.%')
);

-- Admin Table: Administrative users with elevated privileges
CREATE TABLE Admin (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'moderator',
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_super_admin BOOLEAN DEFAULT FALSE,
    CONSTRAINT chk_admin_email CHECK (email LIKE '%@%.%')
);

-- Friendship Table: Manages social connections between users
CREATE TABLE Friendship (
    friendship_id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    status ENUM('pending','accepted','declined') DEFAULT 'pending',
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_date TIMESTAMP NULL,
    FOREIGN KEY (sender_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_no_self_request CHECK (sender_id != receiver_id),
    -- enforce canonical ordering at insert time: sender_id < receiver_id
    CONSTRAINT chk_sender_less_receiver CHECK (sender_id < receiver_id),
    CONSTRAINT unique_friend_pair_ordered UNIQUE (sender_id, receiver_id),
    INDEX idx_friendship_sender (sender_id),
    INDEX idx_friendship_receiver (receiver_id)
);

-- ========================================
-- 2. MOVIES MODULE
-- ========================================

-- Genre Table: Movie genres/categories
CREATE TABLE Genre (
    genre_id INT PRIMARY KEY AUTO_INCREMENT,
    genre_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Movie Table: Core movie catalog information
CREATE TABLE Movie (
    movie_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    synopsis TEXT,
    release_year INT,
    poster VARCHAR(255),
    duration_minutes INT,
    language VARCHAR(50),
    director VARCHAR(100),
    trailer_url VARCHAR(255),
    added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    added_by_admin INT,
    average_rating DECIMAL(3,1) DEFAULT 0.0,
    total_reviews INT DEFAULT 0,
    view_count INT DEFAULT 0,
    FOREIGN KEY (added_by_admin) REFERENCES Admin(admin_id) ON DELETE SET NULL,
    CONSTRAINT chk_release_year CHECK (release_year >= 1888 AND release_year <= 2030),
    CONSTRAINT chk_duration CHECK (duration_minutes > 0),
    CONSTRAINT chk_rating_range CHECK (average_rating >= 0 AND average_rating <= 10),
    INDEX idx_movie_added_by (added_by_admin)
);

-- Movie_Genre Junction Table: Many-to-many relationship between movies and genres
CREATE TABLE Movie_Genre (
    movie_id INT NOT NULL,
    genre_id INT NOT NULL,
    PRIMARY KEY (movie_id, genre_id),
    FOREIGN KEY (movie_id) REFERENCES Movie(movie_id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES Genre(genre_id) ON DELETE CASCADE,
    INDEX idx_mg_movie (movie_id),
    INDEX idx_mg_genre (genre_id)
);

-- ========================================
-- 3. WATCHLIST, HISTORY, REVIEWS & RATINGS
-- ========================================

-- Watchlist Table: User's personal movie tracking
CREATE TABLE Watchlist (
    watchlist_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    status ENUM('to-watch', 'watching', 'completed') DEFAULT 'to-watch',
    added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    progress_percent INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES Movie(movie_id) ON DELETE CASCADE,
    CONSTRAINT unique_user_movie_watchlist UNIQUE (user_id, movie_id),
    CONSTRAINT chk_progress CHECK (progress_percent >= 0 AND progress_percent <= 100),
    INDEX idx_watchlist_user (user_id),
    INDEX idx_watchlist_movie (movie_id)
);

-- Watch_History Table: Tracks completed movie viewings
CREATE TABLE Watch_History (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    watched_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_source ENUM('watchlist', 'event', 'direct') DEFAULT 'watchlist',
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES Movie(movie_id) ON DELETE CASCADE,
    INDEX idx_history_user (user_id),
    INDEX idx_history_movie (movie_id)
);

-- Review Table: User reviews for movies
CREATE TABLE Review (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    review_text TEXT NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_edited TIMESTAMP NULL,
    is_spoiler BOOLEAN DEFAULT FALSE,
    helpful_count INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES Movie(movie_id) ON DELETE CASCADE,
    CONSTRAINT unique_user_movie_review UNIQUE (user_id, movie_id),
    CONSTRAINT chk_review_nonempty CHECK (CHAR_LENGTH(review_text) > 0),
    CONSTRAINT chk_helpful_nonneg CHECK (helpful_count >= 0),
    INDEX idx_review_user (user_id),
    INDEX idx_review_movie (movie_id)
);

-- Rating Table: Numeric ratings for movies
CREATE TABLE Rating (
    rating_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    score DECIMAL(3,1) NOT NULL,
    rated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES Movie(movie_id) ON DELETE CASCADE,
    CONSTRAINT unique_user_movie_rating UNIQUE (user_id, movie_id),
    CONSTRAINT chk_score_range CHECK (score >= 1.0 AND score <= 10.0),
    INDEX idx_rating_user (user_id),
    INDEX idx_rating_movie (movie_id)
);

-- ========================================
-- 4. DISCUSSIONS, POSTS & LIKES
-- ========================================

-- Post Table: User posts in movie discussion forums
CREATE TABLE Post (
    post_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    content TEXT NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_date TIMESTAMP NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES Movie(movie_id) ON DELETE CASCADE,
    CONSTRAINT chk_post_nonempty CHECK (CHAR_LENGTH(content) > 0),
    CONSTRAINT chk_post_counters_nonneg CHECK (like_count >= 0 AND comment_count >= 0),
    INDEX idx_post_user (user_id),
    INDEX idx_post_movie (movie_id)
);

-- Comment Table: Comments on posts or reviews
CREATE TABLE Comment (
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NULL,
    user_id INT NOT NULL,
    review_id INT NULL,
    content TEXT NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_date TIMESTAMP NULL,
    FOREIGN KEY (post_id) REFERENCES Post(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (review_id) REFERENCES Review(review_id) ON DELETE CASCADE,
    CONSTRAINT chk_comment_nonempty CHECK (CHAR_LENGTH(content) > 0),
    CONSTRAINT chk_comment_target CHECK (post_id IS NOT NULL OR review_id IS NOT NULL),
    INDEX idx_comment_post (post_id),
    INDEX idx_comment_review (review_id),
    INDEX idx_comment_user (user_id)
);

-- Like_Post Table: User likes on posts
CREATE TABLE Like_Post (
    like_id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    liked_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES Post(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    CONSTRAINT unique_user_post_like UNIQUE (user_id, post_id),
    INDEX idx_likepost_post (post_id),
    INDEX idx_likepost_user (user_id)
);

-- Notification Table: User notifications for various interactions
CREATE TABLE Notification (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    recipient_id INT NOT NULL,
    sender_id INT,
    notification_type ENUM('like', 'comment', 'friend_request', 'friend_accept', 'event_invite', 'review_reply') NOT NULL,
    reference_id INT,
    message TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_seen BOOLEAN DEFAULT FALSE,
    seen_date TIMESTAMP NULL,
    FOREIGN KEY (recipient_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    INDEX idx_notification_recipient (recipient_id),
    INDEX idx_notification_sender (sender_id)
);

-- Message Table: Direct messages between users
CREATE TABLE Message (
    message_id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    content TEXT NOT NULL,
    sent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_status BOOLEAN DEFAULT FALSE,
    read_date TIMESTAMP NULL,
    FOREIGN KEY (sender_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_message_nonempty CHECK (CHAR_LENGTH(content) > 0),
    CONSTRAINT chk_no_self_message CHECK (sender_id != receiver_id),
    INDEX idx_message_sender (sender_id),
    INDEX idx_message_receiver (receiver_id),
    INDEX idx_message_conversation (sender_id, receiver_id, sent_date)
);

-- Password_Reset_Token Table: Manages password reset tokens
CREATE TABLE Password_Reset_Token (
    token_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    INDEX idx_reset_token (token),
    INDEX idx_reset_user (user_id),
    INDEX idx_reset_expiry (expires_at)
);

-- ========================================
-- 5. EVENTS & WATCH PARTIES
-- ========================================

-- Event Table: Watch party events
CREATE TABLE Event (
    event_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    host_id INT NOT NULL,
    movie_id INT NOT NULL,
    event_datetime DATETIME NOT NULL,
    capacity INT DEFAULT 50,
    current_participants INT DEFAULT 0,
    status ENUM('scheduled', 'ongoing', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (host_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES Movie(movie_id) ON DELETE CASCADE,
    CONSTRAINT chk_capacity CHECK (capacity > 0),
    CONSTRAINT chk_event_future CHECK (event_datetime > created_date),
    CONSTRAINT chk_participants_capacity CHECK (current_participants >= 0 AND current_participants <= capacity),
    -- prevent same host scheduling two events at the exact same datetime
    UNIQUE KEY unique_host_datetime (host_id, event_datetime),
    -- provide composite index to allow Participation to reference both event_id and event_datetime
    UNIQUE KEY event_id_datetime_unique (event_id, event_datetime),
    INDEX idx_event_host (host_id)
);

-- Participation Table: Event participation tracking
CREATE TABLE Participation (
    participation_id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    joined_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attendance_status ENUM('confirmed', 'pending', 'cancelled') DEFAULT 'pending',
    FOREIGN KEY (event_id) REFERENCES Event(event_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    CONSTRAINT unique_event_user UNIQUE (event_id, user_id),
    INDEX idx_participation_event (event_id),
    INDEX idx_participation_user (user_id)
);

-- Restricted_Word Table: Words flagged for content moderation
CREATE TABLE Restricted_Word (
    word_id INT PRIMARY KEY AUTO_INCREMENT,
    word VARCHAR(100) UNIQUE NOT NULL,
    severity ENUM('low', 'medium', 'high') DEFAULT 'medium',
    added_by_admin INT,
    added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (added_by_admin) REFERENCES Admin(admin_id) ON DELETE SET NULL,
    INDEX idx_restricted_added_by (added_by_admin)
);

-- Moderation Table: Content moderation actions
CREATE TABLE Moderation (
    moderation_id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT NOT NULL,
    content_type ENUM('post', 'comment', 'review', 'message') NOT NULL,
    content_id INT NOT NULL,
    action ENUM('flagged', 'approved', 'deleted', 'edited') NOT NULL,
    reason TEXT,
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES Admin(admin_id) ON DELETE CASCADE,
    INDEX idx_moderation_admin (admin_id)
);

-- Report Table: System-generated analytical reports
CREATE TABLE Report (
    report_id INT PRIMARY KEY AUTO_INCREMENT,
    report_type ENUM('most_watched', 'highest_rated', 'most_active_users', 'popular_forums', 
                     'weekly_engagement', 'monthly_growth', 'popular_genres', 'event_participation',
                     'moderation_summary', 'user_retention', 'content_quality', 'friendship_network',
                     'trending_movies', 'watchlist_analysis', 'message_activity', 'review_sentiment') NOT NULL,
    generated_by_admin INT NOT NULL,
    report_data JSON,
    generated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_range_start DATE,
    date_range_end DATE,
    FOREIGN KEY (generated_by_admin) REFERENCES Admin(admin_id) ON DELETE CASCADE,
    INDEX idx_report_admin (generated_by_admin)
);

-- Audit_Trail Table: Logs all administrative actions
CREATE TABLE Audit_Trail (
    audit_id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT NOT NULL,
    operation VARCHAR(100) NOT NULL,
    target_table VARCHAR(50),
    target_id INT,
    old_value TEXT,
    new_value TEXT,
    operation_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    FOREIGN KEY (admin_id) REFERENCES Admin(admin_id) ON DELETE CASCADE,
    INDEX idx_audit_admin (admin_id)
);

-- ========================================
-- DATABASE SCHEMA CREATION COMPLETE
-- ========================================


-- ========================================
-- SAMPLE DATA INSERTS FOR MOVIE COMMUNITY DB
-- ========================================

-- 1. Admins
INSERT INTO Admin (name, email, password, role, is_super_admin) VALUES
('Sarah Khan', 'sarah.admin@moviehub.com', '$2a$10$Dq6oVj0mBpbuUHY5WK6Ok.OagEHLBjoYnZa6YmPtMHH7gN/O7XMPW', 'superadmin', TRUE),
('John Carter', 'john.carter@moviehub.com', '$2a$10$hKS.v56vcCktzFe6sMDO2./esxIWteC15C6my0CpYEEf9wUh7Ms56', 'moderator', FALSE),
('Maria Rodriguez', 'maria.rod@moviehub.com', '$2a$10$6FUc1CrO5WE9ur7c8Xzkw.jCWCcdtdN97YKoOLKPaxr8RfY7DZiae', 'moderator', FALSE),
('Ali Reza', 'ali.reza@moviehub.com', '$2a$10$OJq2h.w6uJL930i1FCaXCOn56KD9GMLba6Arqa3vyx5DX8wl5jNHW', 'moderator', FALSE),
('Jennifer Lee', 'jennifer.lee@moviehub.com', '$2a$10$pyS7uoW6t4r/o/C0ubqJoOwe9sqAHpFVWGyRdJFpIU2odfTNaTdly', 'moderator', FALSE),
('Carlos Silva', 'carlos.silva@moviehub.com', '$2a$10$fjGbW3aJWUZhohHWaomoYu44Pmou0Mo0BDJIjaNXisdi64y0sCIAW', 'content_manager', FALSE),
('Fatima Ahmed', 'fatima.ahmed@moviehub.com', '$2a$10$dlBIMnoqOl0iqMf0Gzj.CukCEUbSzbbs4zmCV3iixPWw4qL3DWmaS', 'support', FALSE);

-- 2. Users
INSERT INTO Users (name, email, password, fav_genre, bio, profile_picture) VALUES
('Ahmed Malik', 'ahmed.malik@gmail.com', '$2a$10$pyS7uoW6t4r/o/C0ubqJoOwe9sqAHpFVWGyRdJFpIU2odfTNaTdly', 'Action', 'Movie lover from Lahore.', 'ahmed.jpg'),
('Laura Smith', 'laura.smith@gmail.com', '$2a$10$fjGbW3aJWUZhohHWaomoYu44Pmou0Mo0BDJIjaNXisdi64y0sCIAW', 'Romance', 'Netflix binge watcher.', 'laura.jpg'),
('Javier Torres', 'javier.torres@cine.es', '$2a$10$dlBIMnoqOl0iqMf0Gzj.CukCEUbSzbbs4zmCV3iixPWw4qL3DWmaS', 'Drama', 'Spanish film critic.', 'javier.jpg'),
('Zahra Hosseini', 'zahra.hoss@iran.ir', '$2a$10$pyS7uoW6t4r/o/C0ubqJoOwe9sqAHpFVWGyRdJFpIU2odfTNaTdly', 'Thriller', 'Iranian cinema enthusiast.', 'zahra.jpg'),
('Emily Brown', 'emily.brown@yahoo.com', '$2a$10$MJX4C7nbOiHLeNlA/u6go.VOM80xki8/9tlnzsbmrBtkDAEH7a7JO', 'Comedy', 'Loves light-hearted films.', 'emily.jpg'),
('Bilal Ahmed', 'bilal.ahmed@pakmail.com', '$2a$10$.5GYHxznXAp8sYWZEcJttOM6T1LMfcYWulfawMG5k64sjV9vbGWae', 'Horror', 'Horror genre expert.', 'bilal.jpg'),
('Omar Farooq', 'omar.farooq@gmail.com', '$2a$10$3zA04UpEf6k826cYmZG8o.W66ViEXnrfH2dDeDptvV2EDUK275/62', 'Sci-Fi', 'Fascinated by futuristic films.', 'omar.jpg'),
('Isabella Cruz', 'isabella.cruz@cine.es', '$2a$10$qO2Lzxbs.a6T1PfqBFmjoeZFxgT5ldSGC.WUsfCxTanvs9gpK0nB.', 'Romance', 'Love is the theme of every movie.', 'isabella.jpg'),
('Hassan Raza', 'hassan.raza@yahoo.com', '$2a$10$hulqNPqOPYN3IOyi4rxpsuvYo5mnt1xlxyQfr7QUwIfK3m0GJK2s6', 'Action', 'Adrenaline junkie.', 'hassan.jpg'),
('Natalie Green', 'natalie.green@gmail.com', '$2a$10$o8SfrF2e.y/UvAK.2gLzxe15zIJQWrlq8WG16sr0BjULqin3inPBa', 'Drama', 'Love film discussions.', 'natalie.jpg'),
('Fatima Noor', 'fatima.noor@pakmail.com', '$2a$10$63K9STQSkao6T25rcYqS.ukGWEteVhv6EyoBuAYpYEhSkD8Kz2Lg.', 'Comedy', 'Pakistani film fan.', 'fatima.jpg'),
('Pedro Sanchez', 'pedro.san@cine.es', '$2a$10$a12fWQDZzgRejquZKQnXeutbGovugk7PaGfMdueI87csHIgxefEn.', 'Thriller', 'Spanish indie director.', 'pedro.jpg'),
('Mina Tavakoli', 'mina.tav@iran.ir', '$2a$10$k/jfvZGGfAtXa0IX2Ndlb.lzA4m/ycjTF3J4tq/dsizHQLNBjsNni', 'Drama', 'Appreciates artistic cinema.', 'mina.jpg'),
('Robert Miller', 'robert.miller@gmail.com', '$2a$10$Y3/qBFOamG10Utge./hHIuXuXEWECmbTttqQxNW1Euy88hkKyfvva', 'Adventure', 'Travel and movie buff.', 'robert.jpg'),
('Ayesha Karim', 'ayesha.karim@pakmail.com', '$2a$10$dN0vIGxFPQ1swowZ2CVKgOA7ozU/Jz8pLu0LEjQKz3nelnylXeHqi', 'Romance', 'Bollywood and Lollywood lover.', 'ayesha.jpg'),
('Marcus Chen', 'marcus.chen@gmail.com', '$2a$10$pyS7uoW6t4r/o/C0ubqJoOwe9sqAHpFVWGyRdJFpIU2odfTNaTdly', 'Sci-Fi', 'Tech enthusiast and film geek.', 'marcus.jpg'),
('Sofia Martinez', 'sofia.martinez@cine.es', '$2a$10$fjGbW3aJWUZhohHWaomoYu44Pmou0Mo0BDJIjaNXisdi64y0sCIAW', 'Drama', 'Film student from Madrid.', 'sofia.jpg'),
('Ali Hassan', 'ali.hassan@pakmail.com', '$2a$10$dlBIMnoqOl0iqMf0Gzj.CukCEUbSzbbs4zmCV3iixPWw4qL3DWmaS', 'Action', 'Pakistani action movie fanatic.', 'ali.jpg'),
('Emma Thompson', 'emma.thompson@yahoo.com', '$2a$10$MJX4C7nbOiHLeNlA/u6go.VOM80xki8/9tlnzsbmrBtkDAEH7a7JO', 'Thriller', 'Mystery and suspense lover.', 'emma.jpg'),
('Reza Abbasi', 'reza.abbasi@iran.ir', '$2a$10$.5GYHxznXAp8sYWZEcJttOM6T1LMfcYWulfawMG5k64sjV9vbGWae', 'Drama', 'Iranian film historian.', 'reza.jpg');

-- 3. Genres (Expanded descriptions)
INSERT INTO Genre (genre_name, description) VALUES
('Action', 'Fast-paced films with stunts, chases, explosions, and physical conflict. Includes superhero films, martial arts, and adventure thrillers.'),
('Drama', 'Emotionally intense and realistic storytelling that explores complex human relationships, moral dilemmas, and character development.'),
('Comedy', 'Humorous and entertaining plots designed to make audiences laugh through witty dialogue, situational humor, or slapstick.'),
('Thriller', 'Suspenseful and mysterious movies that keep viewers on edge with plot twists, tension, and psychological elements.'),
('Romance', 'Love and relationships as the central theme, exploring emotional connections, heartbreak, and romantic journeys.'),
('Sci-Fi', 'Futuristic and science-based themes featuring advanced technology, space exploration, alternate realities, and speculative concepts.'),
('Horror', 'Scary and supernatural stories designed to frighten and thrill audiences with monsters, ghosts, or psychological terror.'),
('Adventure', 'Exciting journeys and discoveries featuring quests, exploration, and characters facing challenges in exotic locations.'),
('Mystery', 'Detective or crime-solving focus with puzzles, clues, and investigations leading to revelations and solutions.'),
('Fantasy', 'Magical and mythical worlds featuring supernatural elements, mythical creatures, and imaginative settings beyond reality.'),
('Crime', 'Stories centered around criminal activities, law enforcement, heists, and the criminal underworld.'),
('Biography', 'Films based on real people\'s lives, documenting their achievements, struggles, and impact on history or society.');

-- 4. Movies (Hollywood, Spanish, Iranian, Pakistani)
INSERT INTO Movie (title, synopsis, release_year, poster, duration_minutes, language, director, trailer_url, added_by_admin, average_rating) VALUES
('Inception', 'A thief who steals corporate secrets through dream-sharing technology.', 2010, 'images/posters/inception.jpg', 148, 'English', 'Christopher Nolan', 'YoHD9XEInc0', 1, 9.0),
('The Dark Knight', 'Batman faces the Joker in Gotham City.', 2008, 'images/posters/darkknight.jpg', 152, 'English', 'Christopher Nolan', 'EXeTwQWrcwY', 1, 9.1),
('La La Land', 'A love story between a jazz musician and an actress.', 2016, 'images/posters/lalaland.jpg', 128, 'English', 'Damien Chazelle', '0pdqf4P9MB8', 2, 8.5),
('Parasite', 'A poor family infiltrates a wealthy household.', 2019, 'images/posters/parasite.jpg', 132, 'Korean', 'Bong Joon-ho', '5xH0HfJHsaY', 3, 9.0),
('El Secreto de Sus Ojos', 'A retired legal counselor writes a novel to find closure.', 2009, 'images/posters/El_Screto_De_Tus_Ojos..webp', 129, 'Spanish', 'Juan JosÃ© Campanella', 'OB1JrYCVJTg', 3, 8.8),
('Baran', 'An Iranian refugee romance story.', 2001, 'images/posters/baran.jpg', 94, 'Persian', 'Majid Majidi', 'T5UGItdsqUI', 4, 8.2),
('Khuda Kay Liye', 'A Pakistani musicianâ€™s spiritual journey.', 2007, 'images/posters/khuda_k_liye.webp', 135, 'Urdu', 'Shoaib Mansoor', 'EX65wpFll9o', 4, 8.0),
('Waar', 'A war on terror movie from Pakistan.', 2013, 'images/posters/waar.jpg', 130, 'Urdu', 'Bilal Lashari', '6Gc45eyvSL4', 2, 8.3),
('A Separation', 'An Iranian family in moral and legal conflict.', 2011, 'images/posters/seperation.webp', 123, 'Persian', 'Asghar Farhadi', 'VgPG6FdlKcA', 3, 9.0),
('Panâ€™s Labyrinth', 'A dark fantasy in postâ€"Civil War Spain.', 2006, 'images/posters/pan''s_labyrinth.webp', 118, 'Spanish', 'Guillermo del Toro', 'jVZRnnVSQ8k', 3, 8.7),
('Jawani Phir Nahi Ani', 'Comedy about friends reuniting.', 2015, 'images/posters/jawani_phir_nahi_ani.webp', 150, 'Urdu', 'Nadeem Baig', 'tYZAG0FMmKY', 2, 7.8),
('The Revenant', 'A frontiersman fights for survival.', 2015, 'images/posters/the_revenant.webp', 156, 'English', 'Alejandro G. IÃ±Ã¡rritu', 'LoebZZ8K5N0', 3, 8.5),
('About Elly', 'Iranian drama of a trip gone wrong.', 2009, 'images/posters/about_elly.webp', 119, 'Persian', 'Asghar Farhadi', 'MdqMICWhxuA', 4, 8.1);

-- 5. Movie Genres
-- 5. Movie Genres (Expanded to show multiple genre classifications)
INSERT INTO Movie_Genre VALUES
-- Inception: Action, Sci-Fi, Thriller, Mystery
(1,1),(1,6),(1,4),(1,9),
-- The Dark Knight: Action, Crime, Drama, Thriller
(2,1),(2,11),(2,2),(2,4),
-- La La Land: Romance, Drama, Comedy
(3,5),(3,2),(3,3),
-- Parasite: Thriller, Drama, Mystery, Comedy
(4,4),(4,2),(4,9),(4,3),
-- El Secreto de Sus Ojos: Thriller, Drama, Romance, Mystery
(5,4),(5,2),(5,5),(5,9),
-- Baran: Romance, Drama
(6,5),(6,2),
-- Khuda Kay Liye: Drama, Thriller
(7,2),(7,4),
-- Waar: Action, Thriller, Crime
(8,1),(8,4),(8,11),
-- A Separation: Drama, Thriller, Mystery
(9,2),(9,4),(9,9),
-- Pan's Labyrinth: Fantasy, Drama, Adventure, Thriller
(10,10),(10,2),(10,8),(10,4),
-- Jawani Phir Nahi Ani: Comedy, Romance, Adventure
(11,3),(11,5),(11,8),
-- The Revenant: Adventure, Drama, Action, Biography
(12,8),(12,2),(12,1),(12,12),
-- About Elly: Drama, Mystery, Thriller
(13,2),(13,9),(13,4);

-- 6. Friendships (Expanded network with pending and declined requests)
INSERT INTO Friendship (sender_id, receiver_id, status) VALUES
-- Accepted friendships
(1,2,'accepted'),(1,3,'accepted'),(1,9,'accepted'),(1,16,'accepted'),
(2,5,'accepted'),(2,10,'accepted'),(2,14,'accepted'),
(3,4,'accepted'),(3,12,'accepted'),(3,17,'accepted'),
(4,13,'accepted'),(4,20,'accepted'),
(5,6,'accepted'),(5,11,'accepted'),(5,15,'accepted'),
(6,7,'accepted'),(6,18,'accepted'),
(7,9,'accepted'),(7,16,'accepted'),
(8,10,'accepted'),(8,17,'accepted'),
(9,14,'accepted'),(9,18,'accepted'),
(10,11,'accepted'),(10,19,'accepted'),
(11,15,'accepted'),(11,20,'accepted'),
(12,14,'accepted'),(12,16,'accepted'),
(13,15,'accepted'),(13,18,'accepted'),
(14,17,'accepted'),(14,20,'accepted'),
(15,19,'accepted'),(16,19,'accepted'),
-- Pending friendship requests
(1,5,'pending'),(2,8,'pending'),(3,7,'pending'),
(4,6,'pending'),(5,9,'pending'),(6,12,'pending'),
(7,11,'pending'),(8,13,'pending'),(9,15,'pending'),
(10,16,'pending'),(11,17,'pending'),(12,18,'pending'),
-- Declined friendship requests
(1,8,'declined'),(3,6,'declined'),(5,10,'declined'),
(7,14,'declined'),(9,12,'declined');

-- 7. Watchlist (Expanded with dates spanning 2025 for analytics)
INSERT INTO Watchlist (user_id, movie_id, status, progress_percent, added_date) VALUES
-- January 2025
(1,1,'completed',100,'2025-01-05 14:30:00'),(1,2,'completed',100,'2025-01-12 18:00:00'),(1,8,'completed',100,'2025-01-20 20:15:00'),
(2,3,'completed',100,'2025-01-08 16:45:00'),(2,4,'completed',100,'2025-01-18 19:30:00'),
(3,5,'completed',100,'2025-01-10 21:00:00'),(3,9,'completed',100,'2025-01-25 17:20:00'),
(4,6,'completed',100,'2025-01-15 15:10:00'),(4,7,'completed',100,'2025-01-28 19:45:00'),
-- February 2025
(1,10,'completed',100,'2025-02-14 20:00:00'),
(2,1,'completed',100,'2025-02-07 17:15:00'),(2,12,'completed',100,'2025-02-22 21:30:00'),
(3,2,'completed',100,'2025-02-10 16:00:00'),(3,8,'completed',100,'2025-02-28 19:00:00'),
(5,1,'completed',100,'2025-02-12 20:45:00'),(5,11,'completed',100,'2025-02-25 18:20:00'),
-- March 2025
(1,12,'completed',100,'2025-03-05 19:30:00'),(1,6,'completed',100,'2025-03-18 21:00:00'),
(2,9,'completed',100,'2025-03-08 17:45:00'),(2,13,'completed',100,'2025-03-22 20:15:00'),
(3,1,'completed',100,'2025-03-12 18:30:00'),(3,11,'completed',100,'2025-03-28 19:45:00'),
(4,2,'completed',100,'2025-03-15 16:20:00'),(4,10,'completed',100,'2025-03-30 21:10:00'),
(6,1,'completed',100,'2025-03-10 17:00:00'),(6,8,'completed',100,'2025-03-25 20:30:00'),
-- April 2025
(1,9,'completed',100,'2025-04-06 18:15:00'),(1,13,'completed',100,'2025-04-20 19:45:00'),
(2,2,'completed',100,'2025-04-10 16:30:00'),(2,10,'completed',100,'2025-04-28 21:00:00'),
(3,4,'completed',100,'2025-04-14 17:20:00'),(3,12,'completed',100,'2025-04-25 20:15:00'),
(5,2,'completed',100,'2025-04-08 19:00:00'),(5,8,'completed',100,'2025-04-22 18:45:00'),
(7,1,'completed',100,'2025-04-12 20:30:00'),(7,2,'completed',100,'2025-04-26 17:15:00'),
-- May 2025
(1,5,'completed',100,'2025-05-05 18:00:00'),(1,11,'completed',100,'2025-05-18 20:45:00'),
(2,5,'completed',100,'2025-05-10 19:30:00'),(2,8,'completed',100,'2025-05-24 17:00:00'),
(3,3,'completed',100,'2025-05-12 16:45:00'),(3,13,'completed',100,'2025-05-28 21:15:00'),
(4,1,'completed',100,'2025-05-08 20:00:00'),(4,12,'completed',100,'2025-05-22 18:30:00'),
(6,4,'completed',100,'2025-05-15 19:15:00'),(6,9,'completed',100,'2025-05-30 20:45:00'),
-- June 2025
(1,7,'completed',100,'2025-06-04 17:30:00'),(1,3,'completed',100,'2025-06-18 19:00:00'),
(2,6,'completed',100,'2025-06-08 20:15:00'),(2,11,'completed',100,'2025-06-25 18:45:00'),
(3,7,'completed',100,'2025-06-12 17:00:00'),(3,10,'completed',100,'2025-06-28 21:30:00'),
(5,4,'completed',100,'2025-06-10 19:45:00'),(5,9,'completed',100,'2025-06-22 16:20:00'),
(8,1,'completed',100,'2025-06-15 20:00:00'),(8,10,'completed',100,'2025-06-29 18:15:00'),
-- July 2025
(1,4,'watching',70,'2025-07-05 16:00:00'),(2,7,'to-watch',0,'2025-07-10 14:30:00'),
(3,6,'watching',85,'2025-07-15 17:45:00'),(4,4,'to-watch',0,'2025-07-20 15:20:00'),
(5,3,'completed',100,'2025-07-08 19:30:00'),(5,13,'completed',100,'2025-07-25 21:00:00'),
(6,2,'completed',100,'2025-07-12 18:00:00'),(6,12,'completed',100,'2025-07-28 20:45:00'),
(7,4,'completed',100,'2025-07-18 17:30:00'),(7,9,'completed',100,'2025-07-30 19:15:00'),
-- August 2025
(8,2,'completed',100,'2025-08-05 18:30:00'),(8,9,'completed',100,'2025-08-20 20:00:00'),
(9,1,'completed',100,'2025-08-10 17:00:00'),(9,12,'completed',100,'2025-08-25 19:45:00'),
(10,3,'completed',100,'2025-08-12 16:30:00'),(10,13,'completed',100,'2025-08-28 21:15:00'),
(11,1,'completed',100,'2025-08-08 20:30:00'),(11,8,'completed',100,'2025-08-22 18:00:00'),
-- September 2025
(7,5,'completed',100,'2025-09-06 19:00:00'),(7,10,'completed',100,'2025-09-20 17:45:00'),
(8,4,'completed',100,'2025-09-10 18:15:00'),(8,12,'completed',100,'2025-09-25 20:30:00'),
(9,2,'completed',100,'2025-09-14 16:45:00'),(9,8,'completed',100,'2025-09-28 19:15:00'),
(10,1,'completed',100,'2025-09-08 20:00:00'),(10,9,'completed',100,'2025-09-22 18:45:00'),
-- October 2025
(11,2,'completed',100,'2025-10-05 17:30:00'),(11,9,'completed',100,'2025-10-18 19:00:00'),
(12,1,'completed',100,'2025-10-10 20:15:00'),(12,4,'completed',100,'2025-10-24 18:30:00'),
(13,3,'completed',100,'2025-10-12 16:00:00'),(13,10,'completed',100,'2025-10-28 21:00:00'),
(14,1,'completed',100,'2025-10-15 19:45:00'),(14,8,'completed',100,'2025-10-30 17:20:00'),
-- November 2025
(11,4,'completed',100,'2025-11-06 18:00:00'),(11,12,'completed',100,'2025-11-20 20:30:00'),
(12,2,'completed',100,'2025-11-10 17:15:00'),(12,9,'completed',100,'2025-11-25 19:45:00'),
(13,1,'completed',100,'2025-11-14 16:30:00'),(13,8,'completed',100,'2025-11-28 21:15:00'),
(15,1,'completed',100,'2025-11-08 20:00:00'),(15,4,'completed',100,'2025-11-22 18:45:00'),
-- December 2025 (Recent)
(16,1,'completed',100,'2025-12-01 19:30:00'),(16,2,'watching',60,'2025-12-02 17:00:00'),
(17,3,'completed',100,'2025-12-03 15:30:00'),(17,4,'to-watch',0,'2025-12-04 16:45:00'),
(18,1,'completed',100,'2025-12-05 18:20:00'),(18,5,'watching',45,'2025-12-06 19:00:00'),
(5,6,'completed',100,'2025-12-01 19:30:00'),(5,12,'completed',100,'2025-12-06 20:15:00'),
(9,10,'to-watch',0,'2025-12-07 16:00:00'),(10,8,'watching',75,'2025-12-06 17:30:00'),
(19,1,'completed',100,'2025-12-02 20:00:00'),(19,9,'completed',100,'2025-12-05 18:30:00'),
(20,2,'completed',100,'2025-12-03 19:15:00'),(20,4,'watching',50,'2025-12-07 17:00:00');

-- 8. Watch History
INSERT INTO Watch_History (user_id, movie_id, completion_source) VALUES
(1,1,'watchlist'),(3,5,'event'),(4,9,'watchlist'),(6,8,'direct'),
(10,13,'watchlist'),(7,2,'watchlist');

-- 9. Reviews (Expanded with more reviews and dates)
INSERT INTO Review (user_id, movie_id, review_text, is_spoiler, helpful_count, created_date) VALUES
(1,1,'Mind-bending and visually stunning. Nolan at his finest!',FALSE,25,'2025-01-05 15:30:00'),
(1,2,'The best superhero movie ever made. Ledger\'s performance is legendary.',FALSE,30,'2025-01-12 19:00:00'),
(1,8,'A patriotic masterpiece that showcases Pakistani cinema at its peak.',FALSE,18,'2025-01-20 21:30:00'),
(2,3,'Emotional and beautiful musical that captures the magic of LA.',FALSE,22,'2025-01-08 17:45:00'),
(2,4,'Brilliant social commentary wrapped in a thriller. Masterful direction.',FALSE,28,'2025-01-18 20:30:00'),
(2,1,'Inception keeps you guessing until the very end. A must-watch!',FALSE,20,'2025-02-07 18:15:00'),
(3,5,'Excellent storytelling and suspense. Spanish cinema at its best.',FALSE,15,'2025-01-10 22:00:00'),
(3,9,'Realistic and powerful acting. Farhadi is a genius storyteller.',FALSE,24,'2025-01-25 18:20:00'),
(3,2,'Dark, gritty, and absolutely brilliant. The Joker steals every scene.',FALSE,26,'2025-02-10 17:00:00'),
(4,6,'Beautiful Iranian love story. Majidi\'s direction is poetic.',FALSE,12,'2025-01-15 16:10:00'),
(4,7,'Groundbreaking Pakistani film that started important conversations.',FALSE,16,'2025-01-28 20:45:00'),
(4,2,'The Dark Knight sets the bar for all comic book movies.',FALSE,23,'2025-03-15 17:20:00'),
(5,1,'Inception is a cinematic achievement. Mind-blowing visuals and story.',FALSE,19,'2025-02-12 21:45:00'),
(5,11,'Hilarious and entertaining. Pakistani comedy at its finest!',FALSE,14,'2025-02-25 19:20:00'),
(6,1,'One of the greatest sci-fi films ever made. Rewatchable masterpiece.',FALSE,21,'2025-03-10 18:00:00'),
(6,8,'Waar is thrilling and action-packed. Proud of Pakistani cinema!',FALSE,17,'2025-03-25 21:30:00'),
(6,4,'Parasite deserves every award. A perfect blend of genres.',FALSE,27,'2025-05-15 20:15:00'),
(7,1,'Inception changed how we think about movies. Absolute genius.',FALSE,22,'2025-04-12 21:15:00'),
(7,2,'The Dark Knight is not just a superhero film, it\'s a crime epic.',FALSE,29,'2025-04-26 18:15:00'),
(8,1,'Mind-bending brilliance. Nolan\'s best work in my opinion.',FALSE,20,'2025-06-15 21:00:00'),
(8,10,'Pan\'s Labyrinth is hauntingly beautiful. Del Toro\'s masterpiece.',FALSE,18,'2025-06-29 19:15:00'),
(8,2,'The best Batman film ever. Ledger\'s Joker is unforgettable.',FALSE,25,'2025-08-05 19:30:00'),
(9,1,'Inception keeps me thinking days after watching. Phenomenal!',FALSE,17,'2025-08-10 18:00:00'),
(9,12,'The Revenant is brutal and beautiful. DiCaprio at his best.',FALSE,15,'2025-08-25 20:45:00'),
(10,13,'About Elly is sad yet thought-provoking. Iranian cinema excellence.',FALSE,13,'2025-08-28 22:15:00'),
(10,1,'Inception is a work of art. Complex but incredibly rewarding.',FALSE,19,'2025-09-08 21:00:00'),
(11,2,'The Dark Knight transcends the superhero genre entirely.',FALSE,24,'2025-10-05 18:30:00'),
(12,1,'Inception is the kind of movie that gets better with each viewing.',FALSE,21,'2025-10-10 21:15:00'),
(13,3,'La La Land is pure magic. A love letter to dreamers everywhere.',FALSE,16,'2025-10-12 17:00:00'),
(14,1,'Inception is visually stunning with a mind-bending plot. Love it!',FALSE,18,'2025-10-15 20:45:00'),
(15,1,'One of my all-time favorites. Nolan is a master filmmaker.',FALSE,20,'2025-11-08 21:00:00'),
(5,3,'Beautiful musical that stays with you long after it ends.',FALSE,14,'2025-07-08 20:30:00'),
(7,5,'Gripping thriller with phenomenal performances. Highly recommend!',FALSE,15,'2025-09-06 20:00:00'),
(11,4,'Parasite is a genre-defying masterpiece. Absolutely brilliant.',FALSE,26,'2025-11-06 19:00:00'),
(12,4,'Best Picture winner that truly deserves all the praise.',FALSE,22,'2025-10-24 19:30:00');

-- 10. Ratings (Expanded with dates throughout 2025)
INSERT INTO Rating (user_id, movie_id, score, rated_date) VALUES
-- January-March 2025
(1,1,9.5,'2025-01-05 15:00:00'),(1,2,9.0,'2025-01-12 18:30:00'),(1,8,8.5,'2025-01-20 21:00:00'),
(2,3,9.0,'2025-01-08 17:15:00'),(2,4,8.8,'2025-01-18 20:00:00'),(2,1,9.2,'2025-02-07 17:45:00'),
(3,5,9.2,'2025-01-10 21:30:00'),(3,9,8.7,'2025-01-25 17:50:00'),(3,2,8.9,'2025-02-10 16:30:00'),
(4,6,8.0,'2025-01-15 15:40:00'),(4,7,7.8,'2025-01-28 20:15:00'),(4,2,9.1,'2025-03-15 16:50:00'),
(5,1,9.3,'2025-02-12 21:15:00'),(5,11,7.8,'2025-02-25 18:50:00'),(5,2,8.8,'2025-04-08 19:30:00'),
(6,1,9.4,'2025-03-10 17:30:00'),(6,8,8.5,'2025-03-25 21:00:00'),(6,4,8.6,'2025-05-15 19:45:00'),
(7,1,9.2,'2025-04-12 20:45:00'),(7,2,9.1,'2025-04-26 17:45:00'),(7,4,8.7,'2025-07-18 18:00:00'),
(8,1,9.5,'2025-06-15 20:30:00'),(8,10,8.9,'2025-06-29 18:45:00'),(8,2,9.0,'2025-08-05 19:00:00'),
-- April-June 2025
(1,4,8.8,'2025-02-03 19:00:00'),(1,10,8.6,'2025-02-14 20:30:00'),(1,12,8.4,'2025-03-05 20:00:00'),
(2,12,8.3,'2025-02-22 22:00:00'),(2,9,8.5,'2025-03-08 18:15:00'),(2,13,8.0,'2025-03-22 20:45:00'),
(3,8,8.7,'2025-02-28 19:30:00'),(3,1,9.6,'2025-03-12 19:00:00'),(3,11,7.9,'2025-03-28 20:15:00'),
(4,10,8.8,'2025-03-30 21:40:00'),(4,1,9.3,'2025-05-08 20:30:00'),(4,12,8.2,'2025-05-22 19:00:00'),
(5,8,8.4,'2025-04-22 19:15:00'),(5,4,8.7,'2025-06-10 20:15:00'),(5,9,8.6,'2025-06-22 16:50:00'),
(6,9,8.5,'2025-05-30 21:15:00'),(6,2,9.0,'2025-07-12 18:30:00'),(6,12,8.1,'2025-07-28 21:15:00'),
(7,5,8.9,'2025-09-06 19:30:00'),(7,9,8.6,'2025-07-30 19:45:00'),(7,10,8.8,'2025-09-20 18:15:00'),
-- July-September 2025
(1,9,8.7,'2025-04-06 18:45:00'),(1,13,8.3,'2025-04-20 20:15:00'),(1,5,8.9,'2025-05-05 18:30:00'),
(2,2,9.1,'2025-04-10 17:00:00'),(2,10,8.8,'2025-04-28 21:30:00'),(2,5,8.7,'2025-05-10 20:00:00'),
(3,4,8.6,'2025-04-14 17:50:00'),(3,12,8.2,'2025-04-25 20:45:00'),(3,3,9.0,'2025-05-12 17:15:00'),
(8,4,8.5,'2025-09-10 18:45:00'),(8,9,8.7,'2025-08-20 20:30:00'),(8,12,8.3,'2025-09-25 21:00:00'),
(9,1,9.4,'2025-08-10 17:30:00'),(9,12,8.4,'2025-08-25 20:15:00'),(9,2,9.0,'2025-09-14 17:15:00'),
(10,3,8.8,'2025-08-12 17:00:00'),(10,13,8.0,'2025-08-28 21:45:00'),(10,1,9.3,'2025-09-08 20:30:00'),
-- October-December 2025
(1,6,8.2,'2025-03-18 21:30:00'),(1,7,8.0,'2025-06-04 18:00:00'),(1,3,9.1,'2025-06-18 19:30:00'),
(2,6,8.1,'2025-06-08 20:45:00'),(2,11,7.9,'2025-06-25 19:15:00'),(2,8,8.6,'2025-05-24 17:30:00'),
(3,7,8.3,'2025-06-12 17:30:00'),(3,10,8.9,'2025-06-28 22:00:00'),(3,13,8.1,'2025-05-28 21:45:00'),
(5,3,8.8,'2025-07-08 20:00:00'),(5,13,8.2,'2025-07-25 21:30:00'),
(9,8,8.6,'2025-09-28 19:45:00'),(9,4,8.8,'2025-12-02 18:30:00'),(10,9,8.5,'2025-09-22 19:15:00'),
(10,4,8.7,'2025-12-03 20:15:00'),(11,1,9.2,'2025-08-08 21:00:00'),(11,8,8.4,'2025-08-22 18:30:00'),
(11,2,9.0,'2025-10-05 18:00:00'),(11,9,8.6,'2025-10-18 19:30:00'),(11,4,8.5,'2025-11-06 18:30:00'),
(12,1,9.5,'2025-10-10 20:45:00'),(12,4,8.9,'2025-10-24 19:00:00'),(12,2,9.1,'2025-11-10 17:45:00'),
(13,3,8.7,'2025-10-12 16:30:00'),(13,10,8.8,'2025-10-28 21:30:00'),(13,1,9.3,'2025-11-14 17:00:00'),
(14,1,9.4,'2025-10-15 20:15:00'),(14,8,8.5,'2025-10-30 17:50:00'),(15,1,9.6,'2025-11-08 20:30:00'),
(15,4,8.8,'2025-11-22 19:15:00'),(5,6,8.3,'2025-12-01 20:00:00'),(5,12,8.1,'2025-12-06 20:45:00'),
(11,12,8.2,'2025-11-20 21:00:00'),(12,9,8.6,'2025-11-25 20:15:00'),(13,8,8.4,'2025-11-28 21:45:00');

-- 11. Posts
INSERT INTO Post (user_id, movie_id, content, like_count, comment_count) VALUES
(1,1,'Just rewatched Inception, still mind-blowing!',10,8),
(3,5,'Spanish thrillers are underrated gems.',8,3),
(4,9,'A Separation deserves every award it got.',9,4),
(6,8,'Waar is the best action film from Pakistan.',7,5),
(8,10,'Panâ€™s Labyrinth broke my heart.',11,5),
(2,2,'The Dark Knight is the greatest superhero movie ever made!',15,4),
(5,4,'Parasite\'s social commentary is brilliant and timely.',12,3),
(7,11,'Jawani Phir Nahi Ani had me laughing throughout!',8,2),
(9,6,'Baran is such a beautiful and touching love story.',6,3),
(10,3,'La La Land - a modern musical masterpiece!',10,2),
(11,12,'The Revenant\'s cinematography is breathtaking!',9,3),
(12,13,'About Elly keeps you guessing till the end.',7,2),
(13,7,'Khuda Ke Liye addresses important social issues.',8,3),
(14,1,'Inception\'s soundtrack by Hans Zimmer is iconic!',11,2),
(15,9,'Iranian cinema is unparalleled in emotional depth.',9,4),
(16,2,'Heath Ledger\'s Joker will never be topped.',13,3),
(17,4,'Bong Joon-ho is a genius filmmaker!',10,2),
(18,8,'Pakistani cinema is finally getting the recognition it deserves.',7,3),
(19,10,'Pan\'s Labyrinth is dark fantasy at its finest.',12,2),
(20,5,'El Secreto de Sus Ojos has the best ending twist!',8,3);

-- 12. Comments (Expanded)
INSERT INTO Comment (post_id, user_id, review_id, content) VALUES
(1,2,1,'Totally agree, Nolan is a genius!'),
(2,3,3,'Yes! The direction was incredible.'),
(3,4,4,'Very true, Farhadiâ€™s realism is unmatched.'),
(4,6,5,'Proud moment for Pakistan cinema!'),
(5,8,6,'So emotional and dark.'),
(1,3,NULL,'The dream sequences were beautifully shot!'),
(1,5,NULL,'I still don''t understand the ending though.'),
(2,5,NULL,'Heath Ledger''s performance was legendary!'),
(2,8,NULL,'This movie redefined superhero films.'),
(3,9,NULL,'Every scene was emotionally charged.'),
(4,10,NULL,'Pakistani cinema is rising!'),
(4,11,NULL,'The soundtrack was epic!'),
(5,12,NULL,'Guillermo del Toro is a master storyteller.'),
(5,14,NULL,'The visuals were stunning and haunting.'),
(1,9,NULL,'Watched it 5 times, still finding new details!'),
(2,12,NULL,'The interrogation scene gives me chills.'),
(3,15,NULL,'Farhadi captures human complexity perfectly.'),
(4,16,NULL,'We need more films like this from Pakistan.'),
(5,17,NULL,'The parallel between fantasy and reality was brilliant.');

-- 13. Likes on Posts (Expanded to show variety of engagement)
INSERT INTO Like_Post (post_id, user_id) VALUES
(1,2),(1,3),(1,5),(1,7),(1,9),(1,10),(1,12),(1,14),(1,16),(1,18),
(2,4),(2,5),(2,8),(2,11),(2,13),(2,15),(2,17),(2,19),
(3,6),(3,7),(3,8),(3,10),(3,12),(3,14),(3,16),(3,18),(3,20),
(4,7),(4,9),(4,10),(4,11),(4,13),(4,15),(4,17),
(5,9),(5,10),(5,11),(5,12),(5,13),(5,14),(5,15),(5,16),(5,18),(5,19),(5,20);

-- 14. Messages (between friends)
INSERT INTO Message (sender_id, receiver_id, content, read_status) VALUES
-- Conversation between Ahmed (1) and Laura (2)
(1, 2, 'Hey Laura! Have you seen Inception?', TRUE),
(2, 1, 'Yes! It was amazing, Nolan is a genius!', TRUE),
(1, 2, 'Right? The ending still blows my mind.', TRUE),
(2, 1, 'Do you think the totem fell at the end?', TRUE),
(1, 2, 'I believe it did! He finally found peace.', TRUE),
(2, 1, 'We should watch it together at the movie night!', FALSE),

-- Conversation between Ahmed (1) and Javier (3)
(1, 3, 'Javier, any Spanish movie recommendations?', TRUE),
(3, 1, 'Try El Secreto de Sus Ojos, it is a masterpiece!', TRUE),
(1, 3, 'Just watched it. The twist at the end was incredible!', TRUE),
(3, 1, 'Told you! Ricardo Darín is phenomenal in it.', TRUE),
(1, 3, 'Any more recommendations like this?', FALSE),

-- Conversation between Javier (3) and Zahra (4)
(3, 4, 'Zahra, have you watched A Separation?', TRUE),
(4, 3, 'Of course! Farhadi is my favorite director.', TRUE),
(3, 4, 'The way he builds tension is incredible.', TRUE),
(4, 3, 'You should watch About Elly too!', TRUE),
(3, 4, 'Adding it to my watchlist right now!', TRUE),
(4, 3, 'Let me know what you think after watching!', FALSE),

-- Conversation between Chen (5) and Bilal (6)
(5, 6, 'Bilal, recommend me a good horror movie!', TRUE),
(6, 5, 'You should watch The Conjuring series.', TRUE),
(5, 6, 'Is it really that scary?', TRUE),
(6, 5, 'Trust me, don''t watch it alone at night!', TRUE),
(5, 6, 'Now I''m both scared and excited haha', FALSE),

-- Conversation between Fatima (7) and Hassan (9)
(7, 9, 'Hassan, what do you think about Waar?', TRUE),
(9, 7, 'Best Pakistani action film ever made!', TRUE),
(7, 9, 'The action sequences were top-notch!', TRUE),
(9, 7, 'Shaan Shahid was incredible in it.', TRUE),
(7, 9, 'Should we organize a Pakistani film marathon?', TRUE),
(9, 7, 'Great idea! Let''s include Khuda Ke Liye too.', FALSE),

-- Conversation between Maria (8) and Natalie (10)
(8, 10, 'Natalie, Pan''s Labyrinth made me cry.', TRUE),
(10, 8, 'Same here! Such an emotional film.', TRUE),
(8, 10, 'The faun was both creepy and fascinating.', TRUE),
(10, 8, 'Del Toro is a master of dark fantasy!', TRUE),
(8, 10, 'Have you seen Shape of Water?', TRUE),
(10, 8, 'Yes! Another del Toro masterpiece.', FALSE),

-- Conversation between Ahmed (1) and Zahra (4)
(1, 4, 'Zahra, heard you''re an Iranian cinema expert!', TRUE),
(4, 1, 'Haha, I try! What would you like to know?', TRUE),
(1, 4, 'Best Iranian film to start with?', TRUE),
(4, 1, 'Definitely A Separation. It won the Oscar!', TRUE),

-- Conversation between Laura (2) and Maria (8)
(2, 8, 'Maria! Did you enjoy La La Land?', TRUE),
(8, 2, 'OMG yes! I cried at the ending.', TRUE),
(2, 8, 'The Planetarium scene was magical!', TRUE),
(8, 2, 'We should do a musical movie marathon!', FALSE),

-- Conversation between Bilal (6) and Fatima (7)
(6, 7, 'Are you joining the Pakistani Film Festival event?', TRUE),
(7, 6, 'Definitely! I''m so excited for Waar screening.', TRUE),
(6, 7, 'Let''s sit together and discuss after!', TRUE),
(7, 6, 'Sounds like a plan!', FALSE);

-- 15. Events (Watch Parties)
INSERT INTO Event (title, description, host_id, movie_id, event_datetime, capacity, current_participants, status) VALUES
('Inception Movie Night', 'Join us for a mind-bending journey through dreams! We''ll discuss the plot twists after.', 1, 1, '2025-12-15 20:00:00', 30, 5, 'scheduled'),
('The Dark Knight Marathon', 'Experience the greatest superhero film of all time together!', 7, 2, '2025-12-20 19:00:00', 50, 12, 'scheduled'),
('La La Land Sing-Along', 'Romantic musical evening with optional sing-along. Bring tissues!', 2, 3, '2025-12-22 18:30:00', 25, 8, 'scheduled'),
('Parasite Watch Party', 'Oscar-winning thriller that will keep you on edge. No spoilers!', 3, 4, '2025-12-18 21:00:00', 40, 15, 'scheduled'),
('Spanish Cinema Night', 'El Secreto de Sus Ojos - A masterpiece of Spanish thriller cinema.', 3, 5, '2025-12-25 20:00:00', 20, 3, 'scheduled'),
('Pakistani Film Festival', 'Waar screening followed by discussion on Pakistani cinema.', 6, 8, '2025-12-28 19:30:00', 35, 10, 'scheduled'),
('Iranian Drama Evening', 'A Separation - Powerful storytelling from Asghar Farhadi.', 4, 9, '2025-12-30 20:00:00', 25, 7, 'scheduled'),
('New Year Film Celebration', 'Ring in 2026 with Pan''s Labyrinth - a dark fantasy masterpiece!', 8, 10, '2025-12-31 22:00:00', 45, 20, 'scheduled'),
('Comedy Night: JPNA', 'Start the new year with laughter! Jawani Phir Nahi Ani screening.', 11, 11, '2026-01-02 19:00:00', 50, 0, 'scheduled'),
('Survival Cinema: The Revenant', 'Experience the brutal beauty of nature and survival.', 14, 12, '2026-01-05 20:30:00', 30, 0, 'scheduled');

-- 16. Participation (Event attendees - Expanded)
INSERT INTO Participation (event_id, user_id, attendance_status) VALUES
-- Inception Movie Night (Event 1)
(1, 2, 'confirmed'),
(1, 3, 'confirmed'),
(1, 5, 'confirmed'),
(1, 7, 'confirmed'),
(1, 9, 'pending'),
-- The Dark Knight Marathon (Event 2)
(2, 1, 'confirmed'),
(2, 4, 'confirmed'),
(2, 6, 'confirmed'),
(2, 8, 'confirmed'),
(2, 10, 'confirmed'),
(2, 11, 'confirmed'),
(2, 12, 'confirmed'),
(2, 13, 'confirmed'),
(2, 14, 'pending'),
(2, 15, 'pending'),
(2, 16, 'pending'),
(2, 17, 'confirmed'),
-- La La Land Sing-Along (Event 3)
(3, 1, 'confirmed'),
(3, 2, 'confirmed'),
(3, 8, 'confirmed'),
(3, 10, 'confirmed'),
(3, 12, 'confirmed'),
(3, 15, 'confirmed'),
(3, 18, 'pending'),
(3, 19, 'pending'),
-- Parasite Watch Party (Event 4)
(4, 3, 'confirmed'),
(4, 5, 'confirmed'),
(4, 7, 'confirmed'),
(4, 9, 'confirmed'),
(4, 11, 'confirmed'),
(4, 13, 'confirmed'),
(4, 14, 'confirmed'),
(4, 16, 'confirmed'),
(4, 17, 'confirmed'),
(4, 18, 'confirmed'),
(4, 19, 'confirmed'),
(4, 20, 'confirmed'),
(4, 1, 'pending'),
(4, 2, 'pending'),
(4, 4, 'pending'),
-- Spanish Cinema Night (Event 5)
(5, 3, 'confirmed'),
(5, 8, 'confirmed'),
(5, 12, 'pending'),
-- Pakistani Film Festival (Event 6)
(6, 1, 'confirmed'),
(6, 6, 'confirmed'),
(6, 7, 'confirmed'),
(6, 9, 'confirmed'),
(6, 11, 'confirmed'),
(6, 15, 'confirmed'),
(6, 18, 'confirmed'),
(6, 19, 'pending'),
(6, 20, 'pending'),
(6, 2, 'pending'),
-- Iranian Drama Evening (Event 7)
(7, 4, 'confirmed'),
(7, 13, 'confirmed'),
(7, 20, 'confirmed'),
(7, 3, 'confirmed'),
(7, 8, 'confirmed'),
(7, 14, 'pending'),
(7, 17, 'pending'),
-- New Year Film Celebration (Event 8)
(8, 1, 'confirmed'),
(8, 2, 'confirmed'),
(8, 3, 'confirmed'),
(8, 5, 'confirmed'),
(8, 7, 'confirmed'),
(8, 8, 'confirmed'),
(8, 10, 'confirmed'),
(8, 11, 'confirmed'),
(8, 12, 'confirmed'),
(8, 13, 'confirmed'),
(8, 14, 'confirmed'),
(8, 15, 'confirmed'),
(8, 16, 'confirmed'),
(8, 17, 'confirmed'),
(8, 18, 'confirmed'),
(8, 19, 'confirmed'),
(8, 20, 'confirmed'),
(8, 4, 'pending'),
(8, 6, 'pending'),
(8, 9, 'pending');

-- 17. Restricted Words (for content moderation - Expanded)
INSERT INTO Restricted_Word (word, severity, added_by_admin) VALUES
('spam', 'low', 1),
('inappropriate', 'medium', 1),
('offensive', 'high', 1),
('hate', 'high', 2),
('scam', 'medium', 2),
('fake', 'low', 3),
('abuse', 'high', 1),
('harassment', 'high', 2),
('violence', 'high', 1),
('explicit', 'medium', 3),
('profanity', 'medium', 2),
('misleading', 'low', 3),
('clickbait', 'low', 1),
('plagiarism', 'medium', 2),
('piracy', 'high', 1),
('copyright', 'medium', 3),
('illegal', 'high', 2),
('threat', 'high', 1),
('spoiler', 'low', 3),
('toxic', 'medium', 2);

-- 19. Moderation Actions (Expanded to show various content moderation)
INSERT INTO Moderation (admin_id, content_type, content_id, action, reason) VALUES
(2, 'post',5,'approved','Clean and relevant post'),
(3, 'comment',2,'approved','No violations'),
(1, 'review',1,'flagged','Possible spoiler detected'),
(1, 'post',1,'approved','Engaging discussion about the movie'),
(2, 'post',2,'approved','Valid critique and opinion'),
(3, 'comment',5,'approved','Constructive feedback'),
(1, 'comment',7,'flagged','Contains minor spoiler warning needed'),
(2, 'review',3,'approved','Well-written review'),
(3, 'post',6,'approved','Encourages community discussion'),
(1, 'comment',10,'approved','Positive community engagement'),
(2, 'post',8,'approved','Promotes Pakistani cinema'),
(1, 'review',5,'approved','Detailed and thoughtful analysis'),
(3, 'comment',12,'approved','Respectful disagreement'),
(2, 'post',11,'approved','Shares personal movie experience'),
(1, 'comment',15,'flagged','Check for excessive caps usage'),
(3, 'review',8,'approved','Balanced critique'),
(2, 'post',14,'approved','Celebrates film achievement'),
(1, 'comment',18,'approved','Adds value to discussion');

-- 20. Reports (Expanded with various analytics reports)
INSERT INTO Report (report_type, generated_by_admin, report_data, date_range_start, date_range_end) VALUES
('most_watched',1,'{"movie":"Inception","views":1200}','2025-01-01','2025-11-01'),
('highest_rated',3,'{"movie":"A Separation","rating":9.0}','2025-01-01','2025-11-01'),
('most_active_users',2,'{"user":"Ahmed Malik","posts":5}','2025-01-01','2025-11-01'),
('weekly_engagement',1,'{"total_posts":45,"total_comments":123,"total_likes":567}','2025-11-25','2025-12-01'),
('monthly_growth',2,'{"new_users":8,"new_reviews":35,"new_ratings":80}','2025-11-01','2025-12-01'),
('popular_genres',3,'{"top_genre":"Drama","count":45}','2025-01-01','2025-12-01'),
('event_participation',1,'{"total_events":10,"total_attendees":87}','2025-12-01','2025-12-31'),
('moderation_summary',2,'{"approved":85,"flagged":5,"removed":2}','2025-11-01','2025-12-01'),
('user_retention',3,'{"active_users":18,"returning_users":15}','2025-11-01','2025-12-01'),
('content_quality',1,'{"avg_review_length":250,"avg_rating":8.2}','2025-01-01','2025-12-01'),
('friendship_network',2,'{"total_friendships":28,"avg_friends_per_user":2.8}','2025-01-01','2025-12-01'),
('trending_movies',3,'{"movie":"The Dark Knight","recent_activity":45}','2025-11-20','2025-12-05'),
('watchlist_analysis',1,'{"avg_watchlist_size":7,"most_added":"Inception"}','2025-01-01','2025-12-01'),
('message_activity',2,'{"total_messages":58,"active_conversations":12}','2025-11-01','2025-12-01'),
('review_sentiment',3,'{"positive":75,"neutral":20,"negative":5}','2025-01-01','2025-12-01');

-- 21. Audit Trail
INSERT INTO Audit_Trail (admin_id, operation, target_table, target_id, old_value, new_value, ip_address) VALUES
(1,'UPDATE','Movie',1,'rating=8.9','rating=9.0','192.168.1.10'),
(2,'DELETE','Comment',4,'content="spam"','NULL','192.168.1.15'),
(3,'INSERT','Genre',9,'NULL','Mystery genre added','192.168.1.18');

-- ========================================
-- DATA INSERTION COMPLETE ✅
-- ========================================


-- =====================================================
-- PART 7: USEFUL QUERIES WITH JOINS, AGGREGATES, GROUPING
-- =====================================================

-- Query 1: Get all movies with their genres (JOIN)
SELECT m.movie_id, m.title, m.release_year, m.average_rating,
       GROUP_CONCAT(g.genre_name SEPARATOR ', ') AS genres
FROM Movie m
LEFT JOIN Movie_Genre mg ON m.movie_id = mg.movie_id
LEFT JOIN Genre g ON mg.genre_id = g.genre_id
GROUP BY m.movie_id, m.title, m.release_year, m.average_rating
ORDER BY m.average_rating DESC;

-- Query 2: Get top rated movies with rating stats (AGGREGATE + GROUP BY)
SELECT m.movie_id, m.title, m.release_year,
       COUNT(r.rating_id) AS rating_count,
       AVG(r.score) AS avg_rating,
       MAX(r.score) AS max_rating,
       MIN(r.score) AS min_rating
FROM Movie m
LEFT JOIN Rating r ON m.movie_id = r.movie_id
GROUP BY m.movie_id, m.title, m.release_year
HAVING COUNT(r.rating_id) > 0
ORDER BY avg_rating DESC, rating_count DESC;

-- Query 3: Get user activity summary (Multiple JOINs + Aggregates)
SELECT u.user_id, u.name, u.email,
       COUNT(DISTINCT w.watchlist_id) AS watchlist_count,
       COUNT(DISTINCT r.review_id) AS review_count,
       COUNT(DISTINCT p.post_id) AS post_count,
       COUNT(DISTINCT e.event_id) AS events_hosted
FROM Users u
LEFT JOIN Watchlist w ON u.user_id = w.user_id
LEFT JOIN Review r ON u.user_id = r.user_id
LEFT JOIN Post p ON u.user_id = p.user_id
LEFT JOIN Event e ON u.user_id = e.host_id
GROUP BY u.user_id, u.name, u.email
ORDER BY review_count DESC;

-- Query 4: Get movies watched by friends (Complex JOIN)
SELECT DISTINCT m.movie_id, m.title, m.poster, m.average_rating,
       COUNT(DISTINCT w.user_id) AS friends_watching
FROM Movie m
JOIN Watchlist w ON m.movie_id = w.movie_id
JOIN Friendship f ON (w.user_id = f.sender_id OR w.user_id = f.receiver_id)
WHERE f.status = 'accepted'
  AND (f.sender_id = 1 OR f.receiver_id = 1)
  AND w.user_id != 1
GROUP BY m.movie_id, m.title, m.poster, m.average_rating
ORDER BY friends_watching DESC;

-- Query 5: Get monthly user signups (DATE functions + GROUP BY)
SELECT YEAR(joined_date) AS year,
       MONTH(joined_date) AS month,
       COUNT(*) AS signups
FROM Users
GROUP BY YEAR(joined_date), MONTH(joined_date)
ORDER BY year DESC, month DESC;

-- Query 6: Get event participation stats (JOIN + Subquery)
SELECT e.event_id, e.title, e.event_datetime,
       u.name AS host_name,
       m.title AS movie_title,
       e.capacity,
       (SELECT COUNT(*) FROM Participation p WHERE p.event_id = e.event_id) AS participants
FROM Event e
JOIN Users u ON e.host_id = u.user_id
JOIN Movie m ON e.movie_id = m.movie_id
ORDER BY e.event_datetime DESC;

-- Query 7: Get genre popularity (Aggregate + JOIN)
SELECT g.genre_id, g.genre_name,
       COUNT(DISTINCT mg.movie_id) AS movie_count,
       AVG(m.average_rating) AS avg_genre_rating,
       SUM(m.view_count) AS total_views
FROM Genre g
LEFT JOIN Movie_Genre mg ON g.genre_id = mg.genre_id
LEFT JOIN Movie m ON mg.movie_id = m.movie_id
GROUP BY g.genre_id, g.genre_name
ORDER BY movie_count DESC;

-- Query 8: Get users with most friends (Subquery + Aggregate)
SELECT u.user_id, u.name,
       (SELECT COUNT(*) FROM Friendship f 
        WHERE (f.sender_id = u.user_id OR f.receiver_id = u.user_id) 
        AND f.status = 'accepted') AS friend_count
FROM Users u
ORDER BY friend_count DESC
LIMIT 10;


-- =====================================================
-- PART 8: VIEWS FOR REPORT GENERATION
-- =====================================================

-- View 1: Movie Statistics Report
DROP VIEW IF EXISTS vw_movie_statistics;
CREATE VIEW vw_movie_statistics AS
SELECT 
    m.movie_id,
    m.title,
    m.release_year,
    m.average_rating,
    m.view_count,
    COUNT(DISTINCT r.review_id) AS total_reviews,
    COUNT(DISTINCT rt.rating_id) AS total_ratings,
    COUNT(DISTINCT w.watchlist_id) AS watchlist_adds,
    GROUP_CONCAT(DISTINCT g.genre_name SEPARATOR ', ') AS genres
FROM Movie m
LEFT JOIN Review r ON m.movie_id = r.movie_id
LEFT JOIN Rating rt ON m.movie_id = rt.movie_id
LEFT JOIN Watchlist w ON m.movie_id = w.movie_id
LEFT JOIN Movie_Genre mg ON m.movie_id = mg.movie_id
LEFT JOIN Genre g ON mg.genre_id = g.genre_id
GROUP BY m.movie_id, m.title, m.release_year, m.average_rating, m.view_count;

-- View 2: User Activity Report
DROP VIEW IF EXISTS vw_user_activity_report;
CREATE VIEW vw_user_activity_report AS
SELECT 
    u.user_id,
    u.name,
    u.email,
    u.joined_date,
    u.last_login,
    u.is_active,
    COUNT(DISTINCT r.review_id) AS reviews_written,
    COUNT(DISTINCT p.post_id) AS posts_created,
    COUNT(DISTINCT c.comment_id) AS comments_made,
    COUNT(DISTINCT w.watchlist_id) AS movies_in_watchlist,
    COUNT(DISTINCT e.event_id) AS events_hosted,
    (SELECT COUNT(*) FROM Friendship f 
     WHERE (f.sender_id = u.user_id OR f.receiver_id = u.user_id) 
     AND f.status = 'accepted') AS friends_count
FROM Users u
LEFT JOIN Review r ON u.user_id = r.user_id
LEFT JOIN Post p ON u.user_id = p.user_id
LEFT JOIN Comment c ON u.user_id = c.user_id
LEFT JOIN Watchlist w ON u.user_id = w.user_id
LEFT JOIN Event e ON u.user_id = e.host_id
GROUP BY u.user_id, u.name, u.email, u.joined_date, u.last_login, u.is_active;

-- View 3: Admin Dashboard Stats
DROP VIEW IF EXISTS vw_admin_dashboard;
CREATE VIEW vw_admin_dashboard AS
SELECT 
    (SELECT COUNT(*) FROM Users WHERE is_active = TRUE) AS active_users,
    (SELECT COUNT(*) FROM Users) AS total_users,
    (SELECT COUNT(*) FROM Movie) AS total_movies,
    (SELECT COUNT(*) FROM Review) AS total_reviews,
    (SELECT COUNT(*) FROM Post) AS total_posts,
    (SELECT COUNT(*) FROM Event WHERE status = 'scheduled') AS upcoming_events,
    (SELECT COUNT(*) FROM Moderation WHERE action = 'flagged') AS flagged_content,
    (SELECT COUNT(*) FROM Report) AS total_reports,
    (SELECT COUNT(*) FROM Users WHERE joined_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)) AS new_users_week;

-- View 4: Event Participation Report
DROP VIEW IF EXISTS vw_event_report;
CREATE VIEW vw_event_report AS
SELECT 
    e.event_id,
    e.title AS event_title,
    e.event_datetime,
    e.status,
    e.capacity,
    u.name AS host_name,
    m.title AS movie_title,
    COUNT(p.user_id) AS current_participants,
    (e.capacity - COUNT(p.user_id)) AS spots_available
FROM Event e
JOIN Users u ON e.host_id = u.user_id
JOIN Movie m ON e.movie_id = m.movie_id
LEFT JOIN Participation p ON e.event_id = p.event_id
GROUP BY e.event_id, e.title, e.event_datetime, e.status, e.capacity, u.name, m.title;

-- View 5: Content Moderation Report
DROP VIEW IF EXISTS vw_moderation_report;
CREATE VIEW vw_moderation_report AS
SELECT 
    md.moderation_id,
    md.content_type,
    md.content_id,
    md.action,
    md.reason,
    md.action_date,
    a.name AS admin_name,
    CASE 
        WHEN md.content_type = 'review' THEN (SELECT review_text FROM Review WHERE review_id = md.content_id)
        WHEN md.content_type = 'post' THEN (SELECT content FROM Post WHERE post_id = md.content_id)
        WHEN md.content_type = 'comment' THEN (SELECT content FROM Comment WHERE comment_id = md.content_id)
    END AS content_preview
FROM Moderation md
JOIN Admin a ON md.admin_id = a.admin_id
ORDER BY md.action_date DESC;


-- =====================================================
-- PART 9: STORED PROCEDURES
-- =====================================================

-- Procedure 1: Update Movie Average Rating from Rating table
DROP PROCEDURE IF EXISTS sp_update_movie_rating;
DELIMITER //
CREATE PROCEDURE sp_update_movie_rating(IN p_movie_id INT)
BEGIN
    DECLARE new_avg DECIMAL(3,1);
    DECLARE rating_count INT;
    
    -- Calculate average from Rating table
    SELECT AVG(score), COUNT(*) INTO new_avg, rating_count
    FROM Rating
    WHERE movie_id = p_movie_id;
    
    -- Update movie average rating
    UPDATE Movie
    SET average_rating = COALESCE(new_avg, 0),
        total_reviews = rating_count
    WHERE movie_id = p_movie_id;
    
    SELECT new_avg AS updated_rating, p_movie_id AS movie_id;
END //
DELIMITER ;

-- Procedure 2: Add Review with Rating (Transaction)
DROP PROCEDURE IF EXISTS sp_add_review_with_rating;
DELIMITER //
CREATE PROCEDURE sp_add_review_with_rating(
    IN p_user_id INT,
    IN p_movie_id INT,
    IN p_review_text TEXT,
    IN p_score DECIMAL(3,1)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error adding review';
    END;
    
    START TRANSACTION;
    
    -- Insert review (without rating - separate table)
    INSERT INTO Review (user_id, movie_id, review_text, created_date)
    VALUES (p_user_id, p_movie_id, p_review_text, NOW());
    
    -- Insert rating in Rating table
    INSERT INTO Rating (user_id, movie_id, score, rated_date)
    VALUES (p_user_id, p_movie_id, p_score, NOW())
    ON DUPLICATE KEY UPDATE score = p_score, rated_date = NOW();
    
    -- Update movie average rating
    CALL sp_update_movie_rating(p_movie_id);
    
    COMMIT;
    
    SELECT 'Review and rating added successfully' AS message;
END //
DELIMITER ;

-- Procedure 3: Get User Dashboard Data
DROP PROCEDURE IF EXISTS sp_get_user_dashboard;
DELIMITER //
CREATE PROCEDURE sp_get_user_dashboard(IN p_user_id INT)
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM Watchlist WHERE user_id = p_user_id AND status != 'completed') AS watchlist_count,
        (SELECT COUNT(*) FROM Watchlist WHERE user_id = p_user_id AND status = 'completed') AS watched_count,
        (SELECT COUNT(*) FROM Friendship WHERE (sender_id = p_user_id OR receiver_id = p_user_id) AND status = 'accepted') AS friends_count,
        (SELECT COUNT(*) FROM Review WHERE user_id = p_user_id) AS reviews_count;
    
    SELECT m.movie_id, m.title, m.poster, m.average_rating
    FROM Movie m
    JOIN Movie_Genre mg ON m.movie_id = mg.movie_id
    JOIN Genre g ON mg.genre_id = g.genre_id
    WHERE g.genre_name = (SELECT fav_genre FROM Users WHERE user_id = p_user_id)
    AND m.movie_id NOT IN (SELECT movie_id FROM Watchlist WHERE user_id = p_user_id)
    ORDER BY m.average_rating DESC
    LIMIT 10;
    
    SELECT e.event_id, e.title, e.event_datetime, e.capacity, e.current_participants, m.title AS movie_title
    FROM Event e
    JOIN Movie m ON e.movie_id = m.movie_id
    WHERE e.event_datetime > NOW() AND e.status = 'scheduled'
    ORDER BY e.event_datetime
    LIMIT 5;
END //
DELIMITER ;

-- Procedure 4: Process Friend Request
DROP PROCEDURE IF EXISTS sp_process_friend_request;
DELIMITER //
CREATE PROCEDURE sp_process_friend_request(
    IN p_friendship_id INT,
    IN p_action VARCHAR(10)
)
BEGIN
    DECLARE v_sender_id INT;
    DECLARE v_receiver_id INT;
    
    SELECT sender_id, receiver_id INTO v_sender_id, v_receiver_id
    FROM Friendship WHERE friendship_id = p_friendship_id;
    
    IF p_action = 'accept' THEN
        UPDATE Friendship SET status = 'accepted', response_date = NOW() 
        WHERE friendship_id = p_friendship_id;
        
        -- Create notification using correct column names
        INSERT INTO Notification (recipient_id, sender_id, notification_type, reference_id, message)
        VALUES (v_sender_id, v_receiver_id, 'friend_accept', v_receiver_id, 'Your friend request was accepted!');
    ELSE
        UPDATE Friendship SET status = 'declined', response_date = NOW() 
        WHERE friendship_id = p_friendship_id;
    END IF;
    
    SELECT p_action AS result;
END //
DELIMITER ;

-- Procedure 5: Clean up old notifications
DROP PROCEDURE IF EXISTS sp_cleanup_old_notifications;
DELIMITER //
CREATE PROCEDURE sp_cleanup_old_notifications(IN days_old INT)
BEGIN
    DELETE FROM Notification 
    WHERE is_seen = TRUE 
    AND created_date < DATE_SUB(NOW(), INTERVAL days_old DAY);
    
    SELECT ROW_COUNT() AS deleted_count;
END //
DELIMITER ;


-- =====================================================
-- PART 10: FUNCTIONS FOR RECOMMENDATIONS
-- =====================================================

-- Function 1: Get Friend-Based Movie Recommendations
DROP FUNCTION IF EXISTS fn_get_friend_recommendation_score;
DELIMITER //
CREATE FUNCTION fn_get_friend_recommendation_score(p_user_id INT, p_movie_id INT)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE score INT DEFAULT 0;
    
    SELECT COUNT(*) INTO score
    FROM Watchlist w
    WHERE w.movie_id = p_movie_id
    AND w.user_id IN (
        SELECT CASE 
            WHEN f.sender_id = p_user_id THEN f.receiver_id 
            ELSE f.sender_id 
        END
        FROM Friendship f
        WHERE (f.sender_id = p_user_id OR f.receiver_id = p_user_id)
        AND f.status = 'accepted'
    );
    
    RETURN score;
END //
DELIMITER ;

-- Function 2: Calculate User Engagement Score
DROP FUNCTION IF EXISTS fn_user_engagement_score;
DELIMITER //
CREATE FUNCTION fn_user_engagement_score(p_user_id INT)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE score INT DEFAULT 0;
    DECLARE review_count INT;
    DECLARE post_count INT;
    DECLARE friend_count INT;
    DECLARE event_count INT;
    
    SELECT COUNT(*) INTO review_count FROM Review WHERE user_id = p_user_id;
    SELECT COUNT(*) INTO post_count FROM Post WHERE user_id = p_user_id;
    SELECT COUNT(*) INTO friend_count FROM Friendship 
        WHERE (sender_id = p_user_id OR receiver_id = p_user_id) AND status = 'accepted';
    SELECT COUNT(*) INTO event_count FROM Event WHERE host_id = p_user_id;
    
    SET score = (review_count * 5) + (post_count * 3) + (friend_count * 2) + (event_count * 10);
    
    RETURN score;
END //
DELIMITER ;

-- Function 3: Check if movies match user preference
DROP FUNCTION IF EXISTS fn_matches_user_preference;
DELIMITER //
CREATE FUNCTION fn_matches_user_preference(p_user_id INT, p_movie_id INT)
RETURNS BOOLEAN
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE user_fav_genre VARCHAR(100);
    DECLARE match_found BOOLEAN DEFAULT FALSE;
    
    SELECT fav_genre INTO user_fav_genre FROM Users WHERE user_id = p_user_id;
    
    SELECT EXISTS(
        SELECT 1 FROM Movie_Genre mg
        JOIN Genre g ON mg.genre_id = g.genre_id
        WHERE mg.movie_id = p_movie_id AND g.genre_name = user_fav_genre
    ) INTO match_found;
    
    RETURN match_found;
END //
DELIMITER ;


-- =====================================================
-- PART 11: TRIGGERS FOR AUDIT TRAIL
-- =====================================================

-- Trigger 1: Log admin actions on users
DROP TRIGGER IF EXISTS trg_user_status_change;
DELIMITER //
CREATE TRIGGER trg_user_status_change
AFTER UPDATE ON Users
FOR EACH ROW
BEGIN
    IF OLD.is_active != NEW.is_active THEN
        INSERT INTO Audit_Trail (admin_id, operation, target_table, target_id, old_value, new_value)
        VALUES (
            1,
            CASE WHEN NEW.is_active = TRUE THEN 'ACTIVATE_USER' ELSE 'DEACTIVATE_USER' END,
            'Users',
            NEW.user_id,
            CONCAT('is_active=', OLD.is_active),
            CONCAT('is_active=', NEW.is_active)
        );
    END IF;
END //
DELIMITER ;

-- Trigger 2: Log new movie additions
DROP TRIGGER IF EXISTS trg_movie_added;
DELIMITER //
CREATE TRIGGER trg_movie_added
AFTER INSERT ON Movie
FOR EACH ROW
BEGIN
    INSERT INTO Audit_Trail (admin_id, operation, target_table, target_id, old_value, new_value)
    VALUES (
        COALESCE(NEW.added_by_admin, 1),
        'INSERT',
        'Movie',
        NEW.movie_id,
        NULL,
        CONCAT('title=', NEW.title, ', year=', NEW.release_year)
    );
END //
DELIMITER ;

-- Trigger 3: Log movie deletions
DROP TRIGGER IF EXISTS trg_movie_deleted;
DELIMITER //
CREATE TRIGGER trg_movie_deleted
BEFORE DELETE ON Movie
FOR EACH ROW
BEGIN
    INSERT INTO Audit_Trail (admin_id, operation, target_table, target_id, old_value, new_value)
    VALUES (
        COALESCE(OLD.added_by_admin, 1),
        'DELETE',
        'Movie',
        OLD.movie_id,
        CONCAT('title=', OLD.title, ', year=', OLD.release_year),
        NULL
    );
END //
DELIMITER ;

-- Trigger 4: Auto-update movie rating after rating insert
DROP TRIGGER IF EXISTS trg_rating_insert;
DELIMITER //
CREATE TRIGGER trg_rating_insert
AFTER INSERT ON Rating
FOR EACH ROW
BEGIN
    UPDATE Movie
    SET average_rating = (
        SELECT AVG(score) FROM Rating WHERE movie_id = NEW.movie_id
    ),
    total_reviews = (
        SELECT COUNT(*) FROM Rating WHERE movie_id = NEW.movie_id
    )
    WHERE movie_id = NEW.movie_id;
END //
DELIMITER ;

-- Trigger 5: Auto-update movie rating after rating update
DROP TRIGGER IF EXISTS trg_rating_update;
DELIMITER //
CREATE TRIGGER trg_rating_update
AFTER UPDATE ON Rating
FOR EACH ROW
BEGIN
    UPDATE Movie
    SET average_rating = (
        SELECT AVG(score) FROM Rating WHERE movie_id = NEW.movie_id
    )
    WHERE movie_id = NEW.movie_id;
END //
DELIMITER ;

-- Trigger 6: Auto-update movie rating after rating delete
DROP TRIGGER IF EXISTS trg_rating_delete;
DELIMITER //
CREATE TRIGGER trg_rating_delete
AFTER DELETE ON Rating
FOR EACH ROW
BEGIN
    UPDATE Movie
    SET average_rating = COALESCE((
        SELECT AVG(score) FROM Rating WHERE movie_id = OLD.movie_id
    ), 0),
    total_reviews = (
        SELECT COUNT(*) FROM Rating WHERE movie_id = OLD.movie_id
    )
    WHERE movie_id = OLD.movie_id;
END //
DELIMITER ;

-- Trigger 7: Log moderation actions
DROP TRIGGER IF EXISTS trg_moderation_log;
DELIMITER //
CREATE TRIGGER trg_moderation_log
AFTER INSERT ON Moderation
FOR EACH ROW
BEGIN
    INSERT INTO Audit_Trail (admin_id, operation, target_table, target_id, old_value, new_value)
    VALUES (
        NEW.admin_id,
        CONCAT('MODERATE_', UPPER(NEW.action)),
        NEW.content_type,
        NEW.content_id,
        NULL,
        CONCAT('action=', NEW.action, ', reason=', COALESCE(NEW.reason, 'No reason'))
    );
END //
DELIMITER ;

-- Trigger 8: Create notification on friend request
DROP TRIGGER IF EXISTS trg_friend_request_notification;
DELIMITER //
CREATE TRIGGER trg_friend_request_notification
AFTER INSERT ON Friendship
FOR EACH ROW
BEGIN
    DECLARE sender_name VARCHAR(100);
    SELECT name INTO sender_name FROM Users WHERE user_id = NEW.sender_id;
    
    INSERT INTO Notification (recipient_id, sender_id, notification_type, reference_id, message, is_seen, created_date)
    VALUES (
        NEW.receiver_id,
        NEW.sender_id,
        'friend_request',
        NEW.friendship_id,
        CONCAT(sender_name, ' sent you a friend request'),
        FALSE,
        NOW()
    );
END //
DELIMITER ;

-- Trigger 4: Auto-increment participant count when someone joins an event
DROP TRIGGER IF EXISTS trg_participation_insert;
DELIMITER //
CREATE TRIGGER trg_participation_insert
AFTER INSERT ON Participation
FOR EACH ROW
BEGIN
    UPDATE Event 
    SET current_participants = current_participants + 1
    WHERE event_id = NEW.event_id;
END //
DELIMITER ;

-- Trigger 5: Auto-decrement participant count when someone leaves an event
DROP TRIGGER IF EXISTS trg_participation_delete;
DELIMITER //
CREATE TRIGGER trg_participation_delete
AFTER DELETE ON Participation
FOR EACH ROW
BEGIN
    UPDATE Event 
    SET current_participants = GREATEST(0, current_participants - 1)
    WHERE event_id = OLD.event_id;
END //
DELIMITER ;

-- Trigger 9: Auto-flag posts with restricted words
DROP TRIGGER IF EXISTS trg_check_post_restricted_words;
DELIMITER //
CREATE TRIGGER trg_check_post_restricted_words
AFTER INSERT ON Post
FOR EACH ROW
BEGIN
    DECLARE restricted_found BOOLEAN DEFAULT FALSE;
    DECLARE found_word VARCHAR(100);
    
    -- Check if content contains any restricted words
    SELECT EXISTS(
        SELECT 1 FROM Restricted_Word 
        WHERE LOWER(NEW.content) LIKE CONCAT('%', LOWER(word), '%')
        LIMIT 1
    ) INTO restricted_found;
    
    IF restricted_found THEN
        -- Get the first restricted word found
        SELECT word INTO found_word
        FROM Restricted_Word
        WHERE LOWER(NEW.content) LIKE CONCAT('%', LOWER(word), '%')
        LIMIT 1;
        
        -- Auto-flag the post (use system admin_id = 1)
        INSERT INTO Moderation (admin_id, content_type, content_id, action, reason)
        VALUES (1, 'post', NEW.post_id, 'flagged', 
                CONCAT('Automatic: Contains restricted word "', found_word, '"'));
    END IF;
END //
DELIMITER ;

-- Trigger 10: Auto-flag reviews with restricted words
DROP TRIGGER IF EXISTS trg_check_review_restricted_words;
DELIMITER //
CREATE TRIGGER trg_check_review_restricted_words
AFTER INSERT ON Review
FOR EACH ROW
BEGIN
    DECLARE restricted_found BOOLEAN DEFAULT FALSE;
    DECLARE found_word VARCHAR(100);
    
    SELECT EXISTS(
        SELECT 1 FROM Restricted_Word 
        WHERE LOWER(NEW.review_text) LIKE CONCAT('%', LOWER(word), '%')
        LIMIT 1
    ) INTO restricted_found;
    
    IF restricted_found THEN
        SELECT word INTO found_word
        FROM Restricted_Word
        WHERE LOWER(NEW.review_text) LIKE CONCAT('%', LOWER(word), '%')
        LIMIT 1;
        
        INSERT INTO Moderation (admin_id, content_type, content_id, action, reason)
        VALUES (1, 'review', NEW.review_id, 'flagged', 
                CONCAT('Automatic: Contains restricted word "', found_word, '"'));
    END IF;
END //
DELIMITER ;

-- Trigger 11: Auto-flag comments with restricted words
DROP TRIGGER IF EXISTS trg_check_comment_restricted_words;
DELIMITER //
CREATE TRIGGER trg_check_comment_restricted_words
AFTER INSERT ON Comment
FOR EACH ROW
BEGIN
    DECLARE restricted_found BOOLEAN DEFAULT FALSE;
    DECLARE found_word VARCHAR(100);
    
    SELECT EXISTS(
        SELECT 1 FROM Restricted_Word 
        WHERE LOWER(NEW.content) LIKE CONCAT('%', LOWER(word), '%')
        LIMIT 1
    ) INTO restricted_found;
    
    IF restricted_found THEN
        SELECT word INTO found_word
        FROM Restricted_Word
        WHERE LOWER(NEW.content) LIKE CONCAT('%', LOWER(word), '%')
        LIMIT 1;
        
        INSERT INTO Moderation (admin_id, content_type, content_id, action, reason)
        VALUES (1, 'comment', NEW.comment_id, 'flagged', 
                CONCAT('Automatic: Contains restricted word "', found_word, '"'));
    END IF;
END //
DELIMITER ;


-- =====================================================
-- PART 12: SAMPLE QUERY USAGE EXAMPLES
-- =====================================================

-- Get friend-based recommendations for a user
-- SELECT m.movie_id, m.title, m.poster, m.average_rating,
--        fn_get_friend_recommendation_score(1, m.movie_id) AS friend_score,
--        fn_matches_user_preference(1, m.movie_id) AS matches_preference
-- FROM Movie m
-- WHERE m.movie_id NOT IN (SELECT movie_id FROM Watchlist WHERE user_id = 1)
-- ORDER BY friend_score DESC, m.average_rating DESC
-- LIMIT 10;

-- Get top engaged users
-- SELECT u.user_id, u.name, fn_user_engagement_score(u.user_id) AS engagement_score
-- FROM Users u
-- WHERE u.is_active = TRUE
-- ORDER BY engagement_score DESC
-- LIMIT 10;

-- Use the views
-- SELECT * FROM vw_movie_statistics ORDER BY total_reviews DESC LIMIT 10;
-- SELECT * FROM vw_user_activity_report ORDER BY reviews_written DESC;
-- SELECT * FROM vw_admin_dashboard;
-- SELECT * FROM vw_event_report WHERE status = 'scheduled';


-- =====================================================
-- PART 13: SCHEDULED EVENTS FOR AUTOMATED TASKS
-- =====================================================

-- Enable event scheduler (required for MySQL events to run)
SET GLOBAL event_scheduler = ON;

-- Event 1: Auto-cleanup old read notifications (runs daily at 2 AM)
DROP EVENT IF EXISTS evt_cleanup_old_notifications;
DELIMITER //
CREATE EVENT evt_cleanup_old_notifications
ON SCHEDULE EVERY 1 DAY
STARTS TIMESTAMP(CURRENT_DATE) + INTERVAL 1 DAY + INTERVAL 2 HOUR
DO
BEGIN
    -- Clean up notifications older than 30 days that have been read
    CALL sp_cleanup_old_notifications(30);
END //
DELIMITER ;

-- Event 2: Auto-update event status (runs every hour)
DROP EVENT IF EXISTS evt_update_event_status;
DELIMITER //
CREATE EVENT evt_update_event_status
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
    -- Mark past events as completed
    UPDATE Event 
    SET status = 'completed'
    WHERE event_datetime < NOW() 
    AND status = 'scheduled';
    
    -- Mark events as cancelled if datetime passed and no participants
    UPDATE Event
    SET status = 'cancelled'
    WHERE event_datetime < NOW()
    AND current_participants = 0
    AND status = 'scheduled';
END //
DELIMITER ;

-- Event 3: Generate weekly engagement report (runs every Monday at 9 AM)
DROP EVENT IF EXISTS evt_weekly_engagement_report;
DELIMITER //
CREATE EVENT evt_weekly_engagement_report
ON SCHEDULE EVERY 1 WEEK
STARTS (TIMESTAMP(CURRENT_DATE) + INTERVAL (1 - WEEKDAY(CURRENT_DATE)) DAY + INTERVAL 9 HOUR)
DO
BEGIN
    -- Insert weekly report into Report table
    INSERT INTO Report (report_type, report_data, generated_by_admin, generated_date)
    SELECT 
        'Weekly Engagement',
        JSON_OBJECT(
            'total_users', (SELECT COUNT(*) FROM Users WHERE is_active = TRUE),
            'new_users_this_week', (SELECT COUNT(*) FROM Users WHERE joined_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)),
            'total_reviews', (SELECT COUNT(*) FROM Review WHERE created_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)),
            'total_posts', (SELECT COUNT(*) FROM Post WHERE created_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)),
            'total_events', (SELECT COUNT(*) FROM Event WHERE created_date >= DATE_SUB(NOW(), INTERVAL 7 DAY))
        ),
        1,
        NOW();
END //
DELIMITER ;

-- ========================================
-- DATABASE SETUP COMPLETE ✅
-- ========================================

select * from users;
select * from admin;
select * from movie;


ALTER TABLE Moderation MODIFY COLUMN admin_id INT NULL;

