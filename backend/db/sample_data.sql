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
    plain_password VARCHAR(50) NOT NULL,
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
    plain_password VARCHAR(50) NOT NULL,
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
    report_type ENUM('most_watched', 'highest_rated', 'most_active_users', 'popular_forums') NOT NULL,
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

-- 1. Admins (each has different password - see plain_password column)
INSERT INTO Admin (name, email, password, plain_password, role, is_super_admin) VALUES
('Sarah Khan', 'sarah.admin@moviehub.com', '$2a$10$Dq6oVj0mBpbuUHY5WK6Ok.OagEHLBjoYnZa6YmPtMHH7gN/O7XMPW', 'admin123', 'superadmin', TRUE),
('John Carter', 'john.carter@moviehub.com', '$2a$10$hKS.v56vcCktzFe6sMDO2./esxIWteC15C6my0CpYEEf9wUh7Ms56', 'john456', 'moderator', FALSE),
('Maria Rodriguez', 'maria.rod@moviehub.com', '$2a$10$6FUc1CrO5WE9ur7c8Xzkw.jCWCcdtdN97YKoOLKPaxr8RfY7DZiae', 'maria789', 'moderator', FALSE),
('Ali Reza', 'ali.reza@moviehub.com', '$2a$10$OJq2h.w6uJL930i1FCaXCOn56KD9GMLba6Arqa3vyx5DX8wl5jNHW', 'ali2024', 'moderator', FALSE);

-- 2. Users (each has different password - see plain_password column)
INSERT INTO Users (name, email, password, plain_password, fav_genre, bio, profile_picture) VALUES
('Ahmed Malik', 'ahmed.malik@gmail.com', '$2a$10$sQqfDgjHW1A9eDCj7BAsj.cWVsqcq.v5DwoUtrYwzFlGjAMGq2VmK', 'ahmed111', 'Action', 'Movie lover from Lahore.', 'ahmed.jpg'),
('Laura Smith', 'laura.smith@gmail.com', '$2a$10$xU8yYxuaXTp/USwr2DRJSONwdaLltEpW245y9o6vUhSiYrXQS.fie', 'laura222', 'Romance', 'Netflix binge watcher.', 'laura.jpg'),
('Javier Torres', 'javier.torres@cine.es', '$2a$10$6B0AhwqGEspeimtJMGRXiujYNHSC/GgytAtU/evjjsHK338yZit/O', 'javier333', 'Drama', 'Spanish film critic.', 'javier.jpg'),
('Zahra Hosseini', 'zahra.hoss@iran.ir', '$2a$10$lf.BkDUpdKASoTFfEmBb1eQjCEhN83XAAJqJUK4A2jIdoVXK2JDuO', 'zahra444', 'Thriller', 'Iranian cinema enthusiast.', 'zahra.jpg'),
('Emily Brown', 'emily.brown@yahoo.com', '$2a$10$MNFdzgGFz1sMDaCrv7on/uKQCWv6B/xReiTB74C2HoaJAkEs6FihS', 'emily555', 'Comedy', 'Loves light-hearted films.', 'emily.jpg'),
('Bilal Ahmed', 'bilal.ahmed@pakmail.com', '$2a$10$uvor.i56nwk1EmQcOzuyyuvYxmJI3ZyBLqATeBapEMDAzrqXmmR2W', 'bilal666', 'Horror', 'Horror genre expert.', 'bilal.jpg'),
('Omar Farooq', 'omar.farooq@gmail.com', '$2a$10$49Cvfh8XpsTmgTaKqXh1Puu4oFXJHF2Ob0qjy0wd05MQ1WGPxPBQ.', 'omar777', 'Sci-Fi', 'Fascinated by futuristic films.', 'omar.jpg'),
('Isabella Cruz', 'isabella.cruz@cine.es', '$2a$10$iCtr4GmoMGWMQ5/Wogrp1ey7M01ClGSrDYLFROJy7C0GcIWB7X2xW', 'isabella888', 'Romance', 'Love is the theme of every movie.', 'isabella.jpg'),
('Hassan Raza', 'hassan.raza@yahoo.com', '$2a$10$tWzRs3IlU2ba9Kx9IY8mjuO9AC3x2kHiR7An4ilm0enlM/65hAfcK', 'hassan999', 'Action', 'Adrenaline junkie.', 'hassan.jpg'),
('Natalie Green', 'natalie.green@gmail.com', '$2a$10$wZVOBqcLw2oMko0G6P1yweuoFvHCDU7PIOgQwbbmGH5074gsvSPoK', 'natalie000', 'Drama', 'Love film discussions.', 'natalie.jpg'),
('Fatima Noor', 'fatima.noor@pakmail.com', '$2a$10$X0orC0utNkNRzpTuUlspLeQZgv117oFVg/t8KzJLpUoth8V50LHvi', 'fatima101', 'Comedy', 'Pakistani film fan.', 'fatima.jpg'),
('Pedro Sanchez', 'pedro.san@cine.es', '$2a$10$1Akyg9PQkyjrDVfKKDi30OykdSaW0.Rq6sSKhlaF.bDc7sIWc0ekO', 'pedro202', 'Thriller', 'Spanish indie director.', 'pedro.jpg'),
('Mina Tavakoli', 'mina.tav@iran.ir', '$2a$10$Mf9Bd/n4SZHTg/QuCEqdr.lA4aDWc7I9ScYIOm0VEGIjxeFLpW69.', 'mina303', 'Drama', 'Appreciates artistic cinema.', 'mina.jpg'),
('Robert Miller', 'robert.miller@gmail.com', '$2a$10$v8lHYRq2gvnTUe7nKd/UBOVKO0XjGnkq472Yzvahqe4kUlwy2b0VG', 'robert404', 'Adventure', 'Travel and movie buff.', 'robert.jpg'),
('Ayesha Karim', 'ayesha.karim@pakmail.com', '$2a$10$UtfpoSRN0Fj.QZfrGX/xfOrgKhShrZ4I9.IbgkFo1UUHuek41z/a2', 'ayesha505', 'Romance', 'Bollywood and Lollywood lover.', 'ayesha.jpg');

-- 3. Genres
INSERT INTO Genre (genre_name, description) VALUES
('Action', 'Fast-paced films with stunts and excitement'),
('Drama', 'Emotionally intense and realistic storytelling'),
('Comedy', 'Humorous and entertaining plots'),
('Thriller', 'Suspenseful and mysterious movies'),
('Romance', 'Love and relationships as main theme'),
('Sci-Fi', 'Futuristic and science-based themes'),
('Horror', 'Scary and supernatural stories'),
('Adventure', 'Exciting journeys and discoveries'),
('Mystery', 'Detective or crime-solving focus');

-- 4. Movies (Hollywood, Spanish, Iranian, Pakistani)
INSERT INTO Movie (title, synopsis, release_year, poster, duration_minutes, language, director, added_by_admin, average_rating) VALUES
('Inception', 'A thief who steals corporate secrets through dream-sharing technology.', 2010, 'images/posters/inception.jpg', 148, 'English', 'Christopher Nolan', 1, 9.0),
('The Dark Knight', 'Batman faces the Joker in Gotham City.', 2008, 'images/posters/darkknight.jpg', 152, 'English', 'Christopher Nolan', 1, 9.1),
('La La Land', 'A love story between a jazz musician and an actress.', 2016, 'images/posters/lalaland.jpg', 128, 'English', 'Damien Chazelle', 2, 8.5),
('Parasite', 'A poor family infiltrates a wealthy household.', 2019, 'images/posters/parasite.jpg', 132, 'Korean', 'Bong Joon-ho', 3, 9.0),
('El Secreto de Sus Ojos', 'A retired legal counselor writes a novel to find closure.', 2009, 'images/posters/El_Screto_De_Tus_Ojos..webp', 129, 'Spanish', 'Juan JosÃ© Campanella', 3, 8.8),
('Baran', 'An Iranian refugee romance story.', 2001, 'images/posters/baran.jpg', 94, 'Persian', 'Majid Majidi', 4, 8.2),
('Khuda Kay Liye', 'A Pakistani musicianâ€™s spiritual journey.', 2007, 'images/posters/khuda_k_liye.webp', 135, 'Urdu', 'Shoaib Mansoor', 4, 8.0),
('Waar', 'A war on terror movie from Pakistan.', 2013, 'images/posters/waar.jpg', 130, 'Urdu', 'Bilal Lashari', 2, 8.3),
('A Separation', 'An Iranian family in moral and legal conflict.', 2011, 'images/posters/seperation.webp', 123, 'Persian', 'Asghar Farhadi', 3, 9.0),
('Panâ€™s Labyrinth', 'A dark fantasy in postâ€"Civil War Spain.', 2006, 'images/posters/pan''s_labyrinth.webp', 118, 'Spanish', 'Guillermo del Toro', 3, 8.7),
('Jawani Phir Nahi Ani', 'Comedy about friends reuniting.', 2015, 'images/posters/jawani_phir_nahi_ani.webp', 150, 'Urdu', 'Nadeem Baig', 2, 7.8),
('The Revenant', 'A frontiersman fights for survival.', 2015, 'images/posters/the_revenant.webp', 156, 'English', 'Alejandro G. IÃ±Ã¡rritu', 3, 8.5),
('About Elly', 'Iranian drama of a trip gone wrong.', 2009, 'images/posters/about_elly.webp', 119, 'Persian', 'Asghar Farhadi', 4, 8.1);

-- 5. Movie Genres
INSERT INTO Movie_Genre VALUES
(1,1),(1,6),(2,1),(2,9),(3,5),(3,2),
(4,4),(4,2),(5,4),(5,2),(6,5),(6,2),
(7,2),(7,5),(8,1),(8,4),(9,2),(9,4),
(10,4),(10,8),(11,3),(11,5),(12,8),(12,1),(13,2),(13,4);

-- 6. Friendships
INSERT INTO Friendship (sender_id, receiver_id, status) VALUES
(1,2,'accepted'),
(1,3,'accepted'),
(2,5,'pending'),
(3,4,'accepted'),
(5,6,'accepted'),
(7,9,'accepted'),
(8,10,'accepted'),
(11,15,'accepted');

-- 7. Watchlist
INSERT INTO Watchlist (user_id, movie_id, status, progress_percent) VALUES
(1,1,'completed',100),(1,4,'watching',70),(2,3,'to-watch',0),
(3,5,'completed',100),(4,9,'watching',60),(5,11,'to-watch',0),
(6,8,'completed',100),(7,2,'completed',100),(8,10,'to-watch',0),
(9,12,'to-watch',0),(10,13,'completed',100);

-- 8. Watch History
INSERT INTO Watch_History (user_id, movie_id, completion_source) VALUES
(1,1,'watchlist'),(3,5,'event'),(4,9,'watchlist'),(6,8,'direct'),
(10,13,'watchlist'),(7,2,'watchlist');

-- 9. Reviews
INSERT INTO Review (user_id, movie_id, review_text, is_spoiler, helpful_count) VALUES
(1,1,'Mind-bending and visually stunning.',FALSE,15),
(2,3,'Emotional and beautiful musical.',FALSE,10),
(3,5,'Excellent storytelling and suspense.',FALSE,8),
(4,9,'Realistic and powerful acting.',FALSE,12),
(6,8,'Patriotic and thrilling.',FALSE,9),
(10,13,'Sad yet thought-provoking.',FALSE,7);

-- 10. Ratings
INSERT INTO Rating (user_id, movie_id, score) VALUES
(1,1,9.5),(1,4,8.8),(2,3,9.0),(3,5,9.2),
(4,9,8.7),(5,11,7.8),(6,8,8.5),(7,2,9.1),
(8,10,8.9),(10,13,8.0),(9,12,9.0);

-- 11. Posts
INSERT INTO Post (user_id, movie_id, content, like_count, comment_count) VALUES
(1,1,'Just rewatched Inception, still mind-blowing!',10,3),
(3,5,'Spanish thrillers are underrated gems.',6,2),
(4,9,'A Separation deserves every award it got.',9,1),
(6,8,'Waar is the best action film from Pakistan.',7,2),
(8,10,'Panâ€™s Labyrinth broke my heart.',5,3);

-- 12. Comments
INSERT INTO Comment (post_id, user_id, review_id, content) VALUES
(1,2,1,'Totally agree, Nolan is a genius!'),
(2,3,3,'Yes! The direction was incredible.'),
(3,4,4,'Very true, Farhadiâ€™s realism is unmatched.'),
(4,6,5,'Proud moment for Pakistan cinema!'),
(5,8,6,'So emotional and dark.');

-- 13. Likes on Posts
INSERT INTO Like_Post (post_id, user_id) VALUES
(1,2),(1,3),(2,4),(2,5),(3,6),(4,7),(5,9),(5,10);

-- 14. Messages (between friends)
INSERT INTO Message (sender_id, receiver_id, content, read_status) VALUES
(1, 2, 'Hey Laura! Have you seen Inception?', TRUE),
(2, 1, 'Yes! It was amazing, Nolan is a genius!', TRUE),
(1, 2, 'Right? The ending still blows my mind.', FALSE),
(1, 3, 'Javier, any Spanish movie recommendations?', TRUE),
(3, 1, 'Try El Secreto de Sus Ojos, it is a masterpiece!', TRUE),
(3, 4, 'Zahra, have you watched A Separation?', TRUE),
(4, 3, 'Of course! Farhadi is my favorite director.', TRUE),
(5, 6, 'Bilal, recommend me a good horror movie!', TRUE),
(6, 5, 'You should watch The Conjuring series.', FALSE),
(7, 9, 'Hassan, what do you think about Waar?', TRUE),
(9, 7, 'Best Pakistani action film ever made!', TRUE),
(8, 10, 'Natalie, Pan''s Labyrinth made me cry.', TRUE),
(10, 8, 'Same here! Such an emotional film.', FALSE);

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

-- 16. Participation (Event attendees)
INSERT INTO Participation (event_id, user_id, attendance_status) VALUES
(1, 2, 'confirmed'),
(1, 3, 'confirmed'),
(1, 5, 'pending'),
(2, 1, 'confirmed'),
(2, 4, 'confirmed'),
(2, 6, 'pending'),
(3, 1, 'confirmed'),
(3, 8, 'confirmed'),
(4, 5, 'confirmed'),
(4, 7, 'pending');

-- 17. Restricted Words (for content moderation)
INSERT INTO Restricted_Word (word, severity, added_by_admin) VALUES
('spam', 'low', 1),
('inappropriate', 'medium', 1),
('offensive', 'high', 1),
('hate', 'high', 2),
('scam', 'medium', 2),
('fake', 'low', 3);

-- 19. Moderation Actions
INSERT INTO Moderation (admin_id, content_type, content_id, action, reason) VALUES
(2,'post',5,'approved','Clean and relevant post'),
(3,'comment',2,'approved','No violations'),
(1,'review',1,'flagged','Possible spoiler detected');

-- 20. Reports
INSERT INTO Report (report_type, generated_by_admin, report_data, date_range_start, date_range_end) VALUES
('most_watched',1,'{"movie":"Inception","views":1200}','2025-01-01','2025-11-01'),
('highest_rated',3,'{"movie":"A Separation","rating":9.0}','2025-01-01','2025-11-01'),
('most_active_users',2,'{"user":"Ahmed Malik","posts":5}','2025-01-01','2025-11-01');

-- 21. Audit Trail
INSERT INTO Audit_Trail (admin_id, operation, target_table, target_id, old_value, new_value, ip_address) VALUES
(1,'UPDATE','Movie',1,'rating=8.9','rating=9.0','192.168.1.10'),
(2,'DELETE','Comment',4,'content="spam"','NULL','192.168.1.15'),
(3,'INSERT','Genre',9,'NULL','Mystery genre added','192.168.1.18');

-- ========================================
-- DATA INSERTION COMPLETE âœ…
-- ========================================


