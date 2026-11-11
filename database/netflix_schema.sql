create database netflix_db;
use netflix_db;


CREATE TABLE tbl_subscription (
    subscription_id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK(price > 0),
    resolution VARCHAR(20) NOT NULL,
    max_screens INT CHECK(max_screens > 0)
);

CREATE TABLE tbl_accounts (
    account_id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    country VARCHAR(50) NOT NULL,
    date_created DATE NOT NULL DEFAULT (CURRENT_DATE),
    subscription_id INT NOT NULL,
    CONSTRAINT fk_accounts_subscription FOREIGN KEY (subscription_id) REFERENCES tbl_subscription(subscription_id)
);

CREATE TABLE tbl_payment (
    payment_id INT PRIMARY KEY,
    amount DECIMAL(10,2) NOT NULL CHECK(amount > 0),
    type VARCHAR(50) NOT NULL CHECK(type IN ('Credit Card','Debit Card','UPI')),
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK(status IN ('Completed','Pending','Failed')),
    payment_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    account_id INT NOT NULL,
    CONSTRAINT fk_payment_account FOREIGN KEY (account_id) REFERENCES tbl_accounts(account_id)
);

CREATE TABLE tbl_profiles (
    profile_id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    language VARCHAR(50) NOT NULL,
    age_category VARCHAR(20) NOT NULL
        CHECK(age_category IN ('Kids','Teen','Adult')),
    account_id INT NOT NULL,
    CONSTRAINT fk_profiles_account FOREIGN KEY (account_id) REFERENCES tbl_accounts(account_id)
);

CREATE TABLE tbl_content (
    content_id INT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK(type IN ('Movie','TV Show')),
    release_year INT NOT NULL,
    description VARCHAR(1000) NOT NULL
);

CREATE TABLE tbl_episode (
    episode_id INT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    duration INT NOT NULL CHECK(duration > 0),
    season_number INT NOT NULL CHECK(season_number > 0),
    episode_number INT NOT NULL CHECK(episode_number > 0),
    content_id INT NOT NULL,
    CONSTRAINT fk_episode_content FOREIGN KEY (content_id) REFERENCES tbl_content(content_id)
);

CREATE TABLE tbl_actors (
    actor_id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE tbl_directors (
    director_id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE tbl_genre (
    genre_id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE tbl_watch_history (
    profile_id INT,
    content_id INT,
    watched_date DATE NOT NULL,
    progress DECIMAL(5,2) NOT NULL CHECK(progress BETWEEN 0 AND 100),
    PRIMARY KEY(profile_id, content_id),
    CONSTRAINT fk_watchhistory_profile FOREIGN KEY(profile_id) REFERENCES tbl_profiles(profile_id),
    CONSTRAINT fk_watchhistory_content FOREIGN KEY(content_id) REFERENCES tbl_content(content_id)
);

CREATE TABLE tbl_acts_in (
    actor_id INT,
    content_id INT,
    PRIMARY KEY(actor_id, content_id),
    CONSTRAINT fk_actsin_actor FOREIGN KEY(actor_id) REFERENCES tbl_actors(actor_id),
    CONSTRAINT fk_actsin_content FOREIGN KEY(content_id) REFERENCES tbl_content(content_id)
);

CREATE TABLE tbl_directs (
    director_id INT,
    content_id INT,
    PRIMARY KEY(director_id, content_id),
    CONSTRAINT fk_directs_director FOREIGN KEY(director_id) REFERENCES tbl_directors(director_id),
    CONSTRAINT fk_directs_content FOREIGN KEY(content_id) REFERENCES tbl_content(content_id)
);

CREATE TABLE tbl_has_genre (
    genre_id INT,
    content_id INT,
    PRIMARY KEY (genre_id , content_id),
    CONSTRAINT fk_hasgenre_genre FOREIGN KEY (genre_id) REFERENCES tbl_genre (genre_id),
    CONSTRAINT fk_hasgenre_content FOREIGN KEY (content_id) REFERENCES tbl_content (content_id)
);
-- sample data for subscription 
insert into tlb_subscription values(1, 'Mobile', 149.00, '480p', 1);
insert into tlb_subscription values(2, 'Basic', 199.00, '720p', 1);
insert into tlb_subscription values (3, 'Standard', 499.00, '1080p', 2);
insert into tlb_subscription values (4, 'Premium', 649.00, '4K', 4);

-- sample data for accounts
insert into accounts values(1,'John Smith','john1@gmail.com','RESET_REQUIRED','USA','2024-01-15',4);
insert into accounts values(2,'Emma Johnson','emma2@gmail.com','RESET_REQUIRED','Canada','2024-01-18',3);
insert into accounts values(3,'Liam Brown','liam3@gmail.com','RESET_REQUIRED','UK','2024-01-20',2);
insert into accounts values(4,'Olivia Davis','olivia4@gmail.com','RESET_REQUIRED','India','2024-01-25',4);
insert into accounts values(5,'Noah Wilson','noah5@gmail.com','RESET_REQUIRED','Australia','2024-02-01',1);
insert into accounts values(6,'Sophia Moore','sophia6@gmail.com','RESET_REQUIRED','India','2024-02-03',3);
insert into accounts values(7,'James Taylor','james7@gmail.com','RESET_REQUIRED','USA','2024-02-05',2);
insert into accounts values(8,'Isabella Anderson','isabella8@gmail.com','RESET_REQUIRED','Germany','2024-02-07',4);
insert into accounts values(9,'Benjamin Thomas','ben9@gmail.com','RESET_REQUIRED','France','2024-02-10',1);
insert into accounts values(10,'Mia Jackson','mia10@gmail.com','RESET_REQUIRED','India','2024-02-12',3);
insert into accounts values(11,'Lucas White','lucas11@gmail.com','RESET_REQUIRED','USA','2024-02-15',4);
insert into accounts values(12,'Charlotte Harris','charlotte12@gmail.com','RESET_REQUIRED','Canada','2024-02-18',2);
insert into accounts values(13,'Henry Martin','henry13@gmail.com','RESET_REQUIRED','India','2024-02-20',3);
insert into accounts values(14,'Amelia Thompson','amelia14@gmail.com','RESET_REQUIRED','UK','2024-02-22',1);
insert into accounts values(15,'Ethan Garcia','ethan15@gmail.com','RESET_REQUIRED','Australia','2024-02-25',4);
insert into accounts values(16,'Ava Lewis','ava16@gmail.com','RESET_REQUIRED','India','2024-03-01',2);
insert into accounts values(17,'Michael Walker','michael17@gmail.com','RESET_REQUIRED','USA','2024-03-03',3);
insert into accounts values(18,'Harper Hall','harper18@gmail.com','RESET_REQUIRED','Canada','2024-03-05',4);
insert into accounts values(19,'Daniel Allen','daniel19@gmail.com','RESET_REQUIRED','India','2024-03-07',1);
insert into accounts values(20,'Evelyn Young','evelyn20@gmail.com','RESET_REQUIRED','Germany','2024-03-10',3);
insert into accounts values(21,'Matthew King','matthew21@gmail.com','RESET_REQUIRED','USA','2024-03-12',4);
insert into accounts values(22,'Abigail Wright','abigail22@gmail.com','RESET_REQUIRED','France','2024-03-15',2);
insert into accounts values(23,'Joseph Scott','joseph23@gmail.com','RESET_REQUIRED','India','2024-03-18',3);
insert into accounts values(24,'Emily Green','emily24@gmail.com','RESET_REQUIRED','Australia','2024-03-20',1);
insert into accounts values(25,'David Baker','david25@gmail.com','RESET_REQUIRED','USA','2024-03-22',4);
insert into accounts values(26,'Ella Adams','ella26@gmail.com','RESET_REQUIRED','Canada','2024-03-25',2);
insert into accounts values(27,'Andrew Nelson','andrew27@gmail.com','RESET_REQUIRED','India','2024-03-28',3);
insert into accounts values(28,'Scarlett Carter','scarlett28@gmail.com','RESET_REQUIRED','UK','2024-04-01',4);
insert into accounts values(29,'Joshua Mitchell','josh29@gmail.com','RESET_REQUIRED','USA','2024-04-03',1);
insert into accounts values(30,'Grace Perez','grace30@gmail.com','RESET_REQUIRED','Germany','2024-04-05',3);
insert into accounts values(31,'Christopher Roberts','chris31@gmail.com','RESET_REQUIRED','USA','2024-04-08',4);
insert into accounts values(32,'Chloe Turner','chloe32@gmail.com','RESET_REQUIRED','India','2024-04-10',2);
insert into accounts values(33,'Ryan Phillips','ryan33@gmail.com','RESET_REQUIRED','Canada','2024-04-12',3);
insert into accounts values(34,'Victoria Campbell','victoria34@gmail.com','RESET_REQUIRED','Australia','2024-04-15',4);
insert into accounts values(35,'Nathan Parker','nathan35@gmail.com','RESET_REQUIRED','India','2024-04-18',1);
insert into accounts values(36,'Lily Evans','lily36@gmail.com','RESET_REQUIRED','UK','2024-04-20',3);
insert into accounts values(37,'Samuel Edwards','sam37@gmail.com','RESET_REQUIRED','USA','2024-04-22',4);
insert into accounts values(38,'Hannah Collins','hannah38@gmail.com','RESET_REQUIRED','Canada','2024-04-25',2);
insert into accounts values(39,'Gabriel Stewart','gabriel39@gmail.com','RESET_REQUIRED','India','2024-04-28',3);
insert into accounts values(40,'Zoe Sanchez','zoe40@gmail.com','RESET_REQUIRED','Germany','2024-05-01',4);
insert into accounts values(41,'Jack Morris','jack41@gmail.com','RESET_REQUIRED','USA','2024-05-04',1);
insert into accounts values(42,'Aria Rogers','aria42@gmail.com','RESET_REQUIRED','Australia','2024-05-06',3);
insert into accounts values(43,'Owen Reed','owen43@gmail.com','RESET_REQUIRED','India','2024-05-08',4);
insert into accounts values(44,'Layla Cook','layla44@gmail.com','RESET_REQUIRED','Canada','2024-05-10',2);
insert into accounts values(45,'Wyatt Morgan','wyatt45@gmail.com','RESET_REQUIRED','USA','2024-05-12',3);
insert into accounts values(46,'Nora Bell','nora46@gmail.com','RESET_REQUIRED','UK','2024-05-15',4);
insert into accounts values(47,'Julian Murphy','julian47@gmail.com','RESET_REQUIRED','India','2024-05-18',1);
insert into accounts values(48,'Penelope Bailey','penelope48@gmail.com','RESET_REQUIRED','Australia','2024-05-20',3);
insert into accounts values(49,'Levi Rivera','levi49@gmail.com','RESET_REQUIRED','Germany','2024-05-22',2);
insert into accounts values(50,'Aurora Cooper','aurora50@gmail.com','RESET_REQUIRED','USA','2024-05-25',4);

-- sample data for profiles
insert into profiles values(1,'John','English','Adult',1);
insert into profiles values(2,'Sarah','English','Kids',1);
insert into profiles values(3,'Emma','English','Adult',2);
insert into profiles values(4,'Liam','English','Adult',3);
insert into profiles values(5,'Olivia','English','Adult',4);
insert into profiles values(6,'Kids','English','Kids',4);
insert into profiles values(7,'Noah','English','Adult',5);
insert into profiles values(8,'Sophia','English','Adult',6);
insert into profiles values(9,'James','English','Teen',7);
insert into profiles values(10,'Isabella','German','Adult',8);
insert into profiles values(11,'Family','German','Kids',8);
insert into profiles values(12,'Benjamin','French','Adult',9);
insert into profiles values(13,'Mia','English','Adult',10);
insert into profiles values(14,'Lucas','English','Adult',11);
insert into profiles values(15,'Sports','English','Teen',11);
insert into profiles values(16,'Charlotte','English','Adult',12);
insert into profiles values(17,'Henry','Hindi','Adult',13);
insert into profiles values(18,'Amelia','English','Adult',14);
insert into profiles values(19,'Ethan','English','Adult',15);
insert into profiles values(20,'Kids','English','Kids',15);
insert into profiles values(21,'Ava','English','Adult',16);
insert into profiles values(22,'Michael','English','Adult',17);
insert into profiles values(23,'Harper','English','Adult',18);
insert into profiles values(24,'Kids','English','Kids',18);
insert into profiles values(25,'Daniel','Hindi','Adult',19);
insert into profiles values(26,'Evelyn','German','Adult',20);
insert into profiles values(27,'Matthew','English','Adult',21);
insert into profiles values(28,'Movies','English','Teen',21);
insert into profiles values(29,'Abigail','French','Adult',22);
insert into profiles values(30,'Joseph','Hindi','Adult',23);
insert into profiles values(31,'Emily','English','Adult',24);
insert into profiles values(32,'David','English','Adult',25);
insert into profiles values(33,'Family','English','Kids',25);
insert into profiles values(34,'Ella','English','Adult',26);
insert into profiles values(35,'Andrew','Hindi','Adult',27);
insert into profiles values(36,'Scarlett','English','Adult',28);
insert into profiles values(37,'Kids','English','Kids',28);
insert into profiles values(38,'Joshua','English','Adult',29);
insert into profiles values(39,'Grace','German','Adult',30);
insert into profiles values(40,'Christopher','English','Adult',31);
insert into profiles values(41,'Chloe','English','Adult',32);
insert into profiles values(42,'Ryan','English','Adult',33);
insert into profiles values(43,'Victoria','English','Adult',34);
insert into profiles values(44,'Family','English','Kids',34);
insert into profiles values(45,'Nathan','Hindi','Adult',35);
insert into profiles values(46,'Lily','English','Adult',36);
insert into profiles values(47,'Samuel','English','Adult',37);
insert into profiles values(48,'Series','English','Teen',37);
insert into profiles values(49,'Hannah','English','Adult',38);
insert into profiles values(50,'Gabriel','Hindi','Adult',39);
insert into profiles values(51,'Zoe','German','Adult',40);
insert into profiles values(52,'Jack','English','Adult',41);
insert into profiles values(53,'Aria','English','Adult',42);
insert into profiles values(54,'Owen','Hindi','Adult',43);
insert into profiles values(55,'Layla','English','Adult',44);
insert into profiles values(56,'Wyatt','English','Adult',45);
insert into profiles values(57,'Nora','English','Adult',46);
insert into profiles values(58,'Julian','Hindi','Adult',47);
insert into profiles values(59,'Penelope','English','Adult',48);
insert into profiles values(60,'Levi','German','Adult',49);

-- sample data for payment 
insert into payment values(1,649.00,'Credit Card','Completed','2024-06-01',1);
insert into payment values(2,499.00,'UPI','Completed','2024-06-02',2);
insert into payment values(3,199.00,'Debit Card','Completed','2024-06-03',3);
insert into payment values(4,649.00,'Credit Card','Completed','2024-06-04',4);
insert into payment values(5,149.00,'UPI','Completed','2024-06-05',5);
insert into payment values(6,499.00,'Debit Card','Completed','2024-06-06',6);
insert into payment values(7,199.00,'Credit Card','Completed','2024-06-07',7);
insert into payment values(8,649.00,'UPI','Completed','2024-06-08',8);
insert into payment values(9,149.00,'Debit Card','Completed','2024-06-09',9);
insert into payment values(10,499.00,'Credit Card','Completed','2024-06-10',10);
insert into payment values(11,649.00,'UPI','Completed','2024-06-11',11);
insert into payment values(12,199.00,'Debit Card','Completed','2024-06-12',12);
insert into payment values(13,499.00,'Credit Card','Completed','2024-06-13',13);
insert into payment values(14,149.00,'UPI','Completed','2024-06-14',14);
insert into payment values(15,649.00,'Debit Card','Completed','2024-06-15',15);
insert into payment values(16,199.00,'Credit Card','Completed','2024-06-16',16);
insert into payment values(17,499.00,'UPI','Completed','2024-06-17',17);
insert into payment values(18,649.00,'Debit Card','Completed','2024-06-18',18);
insert into payment values(19,149.00,'Credit Card','Completed','2024-06-19',19);
insert into payment values(20,499.00,'UPI','Completed','2024-06-20',20);
insert into payment values(21,649.00,'Credit Card','Completed','2024-06-21',21);
insert into payment values(22,199.00,'UPI','Completed','2024-06-22',22);
insert into payment values(23,499.00,'Debit Card','Completed','2024-06-23',23);
insert into payment values(24,149.00,'Credit Card','Completed','2024-06-24',24);
insert into payment values(25,649.00,'UPI','Completed','2024-06-25',25);
insert into payment values(26,199.00,'Debit Card','Completed','2024-06-26',26);
insert into payment values(27,499.00,'Credit Card','Completed','2024-06-27',27);
insert into payment values(28,649.00,'UPI','Completed','2024-06-28',28);
insert into payment values(29,149.00,'Debit Card','Completed','2024-06-29',29);
insert into payment values(30,499.00,'Credit Card','Completed','2024-06-30',30);
insert into payment values(31,649.00,'UPI','Completed','2024-07-01',31);
insert into payment values(32,199.00,'Debit Card','Completed','2024-07-02',32);
insert into payment values(33,499.00,'Credit Card','Completed','2024-07-03',33);
insert into payment values(34,649.00,'UPI','Completed','2024-07-04',34);
insert into payment values(35,149.00,'Debit Card','Completed','2024-07-05',35);
insert into payment values(36,499.00,'Credit Card','Completed','2024-07-06',36);
insert into payment values(37,649.00,'UPI','Completed','2024-07-07',37);
insert into payment values(38,199.00,'Debit Card','Completed','2024-07-08',38);
insert into payment values(39,499.00,'Credit Card','Completed','2024-07-09',39);
insert into payment values(40,649.00,'UPI','Completed','2024-07-10',40);

-- sample data for content 
insert into content values(1,'Stranger Things','TV Show',2016,'A group of kids uncover supernatural mysteries in their town.');
insert into content values(2,'Breaking Bad','TV Show',2008,'A chemistry teacher turns to making drugs.');
insert into content values(3,'Money Heist','TV Show',2017,'A criminal mastermind plans the biggest heist in history.');
insert into content values(4,'Dark','TV Show',2017,'Time travel mysteries unfold in a small German town.');
insert into content values(5,'The Witcher','TV Show',2019,'A monster hunter navigates a dangerous world.');
insert into content values(6,'Squid Game','TV Show',2021,'Contestants compete in deadly games for money.');
insert into content values(7,'Wednesday','TV Show',2022,'Wednesday Addams investigates mysteries at school.');
insert into content values(8,'Narcos','TV Show',2015,'The rise and fall of drug kingpins.');
insert into content values(9,'Ozark','TV Show',2017,'A family becomes involved in money laundering.');
insert into content values(10,'The Crown','TV Show',2016,'The story of the British royal family.');
insert into content values(11,'Inception','Movie',2010,'A thief enters dreams to steal information.');
insert into content values(12,'Interstellar','Movie',2014,'Astronauts search for a new home for humanity.');
insert into content values(13,'The Dark Knight','Movie',2008,'Batman faces the Joker.');
insert into content values(14,'Avengers Endgame','Movie',2019,'Heroes unite to save the universe.');
insert into content values(15,'The Shawshank Redemption','Movie',1994,'A banker forms friendships in prison.');
insert into content values(16,'Parasite','Movie',2019,'A poor family infiltrates a wealthy household.');
insert into content values(17,'Joker','Movie',2019,'The origin story of Gotham''s infamous villain.');
insert into content values(18,'Top Gun Maverick','Movie',2022,'A veteran pilot returns to train recruits.');
insert into content values(19,'Dune','Movie',2021,'A young nobleman embraces his destiny.');
insert into content values(20,'Spider Man No Way Home','Movie',2021,'Multiple universes collide around Spider Man.');
insert into content values(21,'Peaky Blinders','TV Show',2013,'A gang rises to power in Birmingham.');
insert into content values(22,'The Boys','TV Show',2019,'Corrupt superheroes are challenged by vigilantes.');
insert into content values(23,'Arcane','TV Show',2021,'Two sisters find themselves on opposite sides of conflict.');
insert into content values(24,'Attack on Titan','TV Show',2013,'Humanity fights giant humanoid creatures.');
insert into content values(25,'Demon Slayer','TV Show',2019,'A boy seeks a cure for his sister.');
insert into content values(26,'Your Name','Movie',2016,'Two teenagers mysteriously swap bodies.');
insert into content values(27,'A Silent Voice','Movie',2016,'A former bully seeks redemption.');
insert into content values(28,'Oppenheimer','Movie',2023,'The story of the atomic bomb project.');
insert into content values(29,'The Matrix','Movie',1999,'A hacker discovers reality is a simulation.');
insert into content values(30,'Fight Club','Movie',1999,'An office worker forms an underground club.');
insert into content values(31,'The Prestige','Movie',2006,'Two magicians become bitter rivals.');
insert into content values(32,'Shutter Island','Movie',2010,'A detective investigates a disappearance.');
insert into content values(33,'John Wick','Movie',2014,'A retired assassin seeks revenge.');
insert into content values(34,'The Last of Us','TV Show',2023,'Survivors navigate a post-apocalyptic world.');
insert into content values(35,'Black Mirror','TV Show',2011,'Stories exploring technology and society.');

-- sample data for actors
insert into actors values(1,'Millie Bobby Brown');
insert into actors values(2,'Bryan Cranston');
insert into actors values(3,'Aaron Paul');
insert into actors values(4,'Pedro Pascal');
insert into actors values(5,'Henry Cavill');
insert into actors values(6,'Jenna Ortega');
insert into actors values(7,'Cillian Murphy');
insert into actors values(8,'Leonardo DiCaprio');
insert into actors values(9,'Christian Bale');
insert into actors values(10,'Robert Downey Jr.');
insert into actors values(11,'Tom Holland');
insert into actors values(12,'Zendaya');
insert into actors values(13,'Keanu Reeves');
insert into actors values(14,'Joaquin Phoenix');
insert into actors values(15,'Song Kang-ho');
insert into actors values(16,'Timothee Chalamet');
insert into actors values(17,'Anya Taylor-Joy');
insert into actors values(18,'Finn Wolfhard');
insert into actors values(19,'David Harbour');
insert into actors values(20,'Emma Stone');
insert into actors values(21,'Ryan Gosling');
insert into actors values(22,'Chris Evans');
insert into actors values(23,'Scarlett Johansson');
insert into actors values(24,'Benedict Cumberbatch');
insert into actors values(25,'Hugh Jackman');

-- sample data for directors
insert into directors values(1,'Christopher Nolan');
insert into directors values(2,'Steven Spielberg');
insert into directors values(3,'Martin Scorsese');
insert into directors values(4,'Quentin Tarantino');
insert into directors values(5,'Denis Villeneuve');
insert into directors values(6,'Matt Duffer');
insert into directors values(7,'Ross Duffer');
insert into directors values(8,'Bong Joon-ho');
insert into directors values(9,'Todd Phillips');
insert into directors values(10,'Chad Stahelski');
insert into directors values(11,'Vince Gilligan');
insert into directors values(12,'Hwang Dong-hyuk');
insert into directors values(13,'Tim Burton');
insert into directors values(14,'Craig Mazin');
insert into directors values(15,'David Fincher');

-- sample data for genre 
insert into genre values(1,'Drama');
insert into genre values(2,'Action');
insert into genre values(3,'Comedy');
insert into genre values(4,'Thriller');
insert into genre values(5,'Science Fiction');
insert into genre values(6,'Fantasy');
insert into genre values(7,'Crime');
insert into genre values(8,'Horror');
insert into genre values(9,'Adventure');
insert into genre values(10,'Animation');

-- sample data for episodes
insert into episode values(1,'Chapter One',50,1,1,1);
insert into episode values(2,'Chapter Two',48,1,2,1);
insert into episode values(3,'Chapter Three',52,1,3,1);
insert into episode values(4,'Pilot',58,1,1,2);
insert into episode values(5,'Cats in the Bag',48,1,2,2);
insert into episode values(6,'And the Bags in the River',47,1,3,2);
insert into episode values(7,'Episode 1',45,1,1,3);
insert into episode values(8,'Episode 2',43,1,2,3);
insert into episode values(9,'Episode 3',46,1,3,3);
insert into episode values(10,'Secrets',52,1,1,4);
insert into episode values(11,'Lies',50,1,2,4);
insert into episode values(12,'Truth',55,1,3,4);
insert into episode values(13,'The Ends Beginning',60,1,1,5);
insert into episode values(14,'Four Marks',58,1,2,5);
insert into episode values(15,'Betrayer Moon',61,1,3,5);
insert into episode values(16,'Red Light Green Light',62,1,1,6);
insert into episode values(17,'Hell',59,1,2,6);
insert into episode values(18,'The Man with Umbrella',63,1,3,6);
insert into episode values(19,'Wednesdays Child',49,1,1,7);
insert into episode values(20,'Woe Is the Loneliest Number',52,1,2,7);
insert into episode values(21,'Friends or Foes',54,1,3,7);
insert into episode values(22,'Descenso',50,1,1,8);
insert into episode values(23,'The Sword of Simon Bolivar',48,1,2,8);
insert into episode values(24,'The Men of Always',51,1,3,8);
insert into episode values(25,'Sugarwood',58,1,1,9);
insert into episode values(26,'Blue Cat',56,1,2,9);
insert into episode values(27,'My Dripping Sleep',57,1,3,9);
insert into episode values(28,'Wolferton Splash',58,1,1,10);
insert into episode values(29,'Hyde Park Corner',60,1,2,10);
insert into episode values(30,'Windsor',59,1,3,10);
insert into episode values(31,'Episode 1',42,1,1,21);
insert into episode values(32,'Episode 2',44,1,2,21);
insert into episode values(33,'Episode 3',43,1,3,21);
insert into episode values(34,'The Name of the Game',55,1,1,22);
insert into episode values(35,'Cherry',54,1,2,22);
insert into episode values(36,'Get Some',57,1,3,22);
insert into episode values(37,'Welcome to the Playground',40,1,1,23);
insert into episode values(38,'Some Mysteries Are Better Left Unsolved',42,1,2,23);
insert into episode values(39,'The Base Violence Necessary',41,1,3,23);
insert into episode values(40,'To You, in 2000 Years',25,1,1,24);
insert into episode values(41,'That Day',24,1,2,24);
insert into episode values(42,'A Dim Light Amid Despair',24,1,3,24);
insert into episode values(43,'Cruelty',26,1,4,24);
insert into episode values(44,'New Flame',24,1,5,24);
insert into episode values(45,'Cruelty',24,1,1,25);
insert into episode values(46,'Trainer Sakonji',24,1,2,25);
insert into episode values(47,'Sabito and Makomo',24,1,3,25);
insert into episode values(48,'Final Selection',24,1,4,25);
insert into episode values(49,'My Own Steel',24,1,5,25);
insert into episode values(50,'When Youre Lost',55,1,1,34);
insert into episode values(51,'Infected',58,1,2,34);
insert into episode values(52,'Long Long Time',76,1,3,34);
insert into episode values(53,'Please Hold My Hand',46,1,4,34);
insert into episode values(54,'Endure and Survive',59,1,5,34);
insert into episode values(55,'The National Anthem',44,1,1,35);
insert into episode values(56,'Fifteen Million Merits',62,1,2,35);
insert into episode values(57,'The Entire History of You',49,1,3,35);
insert into episode values(58,'Be Right Back',48,1,4,35);
insert into episode values(59,'White Bear',42,1,5,35);
insert into episode values(60,'Chapter Four',51,1,4,1);
insert into episode values(61,'Chapter Five',53,1,5,1);
insert into episode values(62,'Chapter Six',47,1,6,1);
insert into episode values(63,'Cancer Man',49,1,4,2);
insert into episode values(64,'Gray Matter',48,1,5,2);
insert into episode values(65,'Crazy Handful of Nothin',47,1,6,2);
insert into episode values(66,'Episode 4',44,1,4,3);
insert into episode values(67,'Episode 5',45,1,5,3);
insert into episode values(68,'Cycles',56,1,4,4);
insert into episode values(69,'Crossroads',54,1,5,4);
insert into episode values(70,'Rare Species',60,1,4,5);

-- sample data for acts_in
insert into acts_in values(1,1);
insert into acts_in values(18,1);
insert into acts_in values(19,1);
insert into acts_in values(2,2);
insert into acts_in values(3,2);
insert into acts_in values(4,3);
insert into acts_in values(5,5);
insert into acts_in values(6,7);
insert into acts_in values(7,28);
insert into acts_in values(8,11);
insert into acts_in values(8,12);
insert into acts_in values(9,13);
insert into acts_in values(10,14);
insert into acts_in values(11,20);
insert into acts_in values(12,20);
insert into acts_in values(13,33);
insert into acts_in values(14,17);
insert into acts_in values(15,16);
insert into acts_in values(16,19);
insert into acts_in values(17,23);
insert into acts_in values(20,26);
insert into acts_in values(21,28);
insert into acts_in values(22,14);
insert into acts_in values(23,14);
insert into acts_in values(24,14);
insert into acts_in values(24,12);
insert into acts_in values(25,31);
insert into acts_in values(1,21);
insert into acts_in values(2,22);
insert into acts_in values(3,9);
insert into acts_in values(4,34);
insert into acts_in values(5,35);
insert into acts_in values(6,23);
insert into acts_in values(7,31);
insert into acts_in values(8,32);
insert into acts_in values(9,29);
insert into acts_in values(10,30);
insert into acts_in values(11,18);
insert into acts_in values(12,26);
insert into acts_in values(13,15);
insert into acts_in values(14,27);
insert into acts_in values(15,10);
insert into acts_in values(16,24);
insert into acts_in values(17,25);
insert into acts_in values(18,6);
insert into acts_in values(19,8);
insert into acts_in values(20,4);
insert into acts_in values(21,3);
insert into acts_in values(22,2);
insert into acts_in values(23,1);
insert into acts_in values(24,5);
insert into acts_in values(25,11);
insert into acts_in values(1,12);
insert into acts_in values(2,13);
insert into acts_in values(3,14);
insert into acts_in values(4,15);
insert into acts_in values(5,16);
insert into acts_in values(6,17);
insert into acts_in values(7,18);

-- sample data for directs
insert into directs values(6,1);
insert into directs values(11,2);
insert into directs values(3,3);
insert into directs values(15,4);
insert into directs values(1,5);
insert into directs values(12,6);
insert into directs values(13,7);
insert into directs values(3,8);
insert into directs values(15,9);
insert into directs values(2,10);
insert into directs values(1,11);
insert into directs values(1,12);
insert into directs values(1,13);
insert into directs values(1,14);
insert into directs values(2,15);
insert into directs values(8,16);
insert into directs values(9,17);
insert into directs values(2,18);
insert into directs values(5,19);
insert into directs values(2,20);
insert into directs values(15,21);
insert into directs values(4,22);
insert into directs values(14,23);
insert into directs values(2,24);
insert into directs values(13,25);
insert into directs values(2,26);
insert into directs values(2,27);
insert into directs values(1,28);
insert into directs values(15,29);
insert into directs values(15,30);
insert into directs values(1,31);
insert into directs values(3,32);
insert into directs values(10,33);
insert into directs values(14,34);
insert into directs values(15,35);

-- sample data for has_genre
insert into has_genre values(5,1);
insert into has_genre values(8,1);
insert into has_genre values(7,2);
insert into has_genre values(1,2);
insert into has_genre values(7,3);
insert into has_genre values(4,3);
insert into has_genre values(5,4);
insert into has_genre values(4,4);
insert into has_genre values(6,5);
insert into has_genre values(9,5);
insert into has_genre values(4,6);
insert into has_genre values(1,6);
insert into has_genre values(8,7);
insert into has_genre values(3,7);
insert into has_genre values(7,8);
insert into has_genre values(1,8);
insert into has_genre values(7,9);
insert into has_genre values(4,9);
insert into has_genre values(1,10);
insert into has_genre values(2,11);
insert into has_genre values(5,12);
insert into has_genre values(2,13);
insert into has_genre values(2,14);
insert into has_genre values(1,15);
insert into has_genre values(4,16);
insert into has_genre values(7,16);
insert into has_genre values(1,17);
insert into has_genre values(2,18);
insert into has_genre values(5,19);
insert into has_genre values(2,20);
insert into has_genre values(7,21);
insert into has_genre values(2,22);
insert into has_genre values(10,23);
insert into has_genre values(2,24);
insert into has_genre values(10,25);
insert into has_genre values(10,26);
insert into has_genre values(1,27);
insert into has_genre values(1,28);
insert into has_genre values(5,29);
insert into has_genre values(4,30);

-- sample values for watch_history
insert into watch_history values(1,1,'2024-07-01',100.00);
insert into watch_history values(1,11,'2024-07-02',100.00);
insert into watch_history values(2,1,'2024-07-03',85.00);
insert into watch_history values(3,2,'2024-07-04',100.00);
insert into watch_history values(4,3,'2024-07-05',92.00);
insert into watch_history values(5,4,'2024-07-06',100.00);
insert into watch_history values(6,5,'2024-07-07',76.00);
insert into watch_history values(7,6,'2024-07-08',100.00);
insert into watch_history values(8,7,'2024-07-09',88.00);
insert into watch_history values(9,8,'2024-07-10',100.00);
insert into watch_history values(10,9,'2024-07-11',95.00);
insert into watch_history values(11,10,'2024-07-12',100.00);
insert into watch_history values(12,12,'2024-07-13',100.00);
insert into watch_history values(13,13,'2024-07-14',97.00);
insert into watch_history values(14,14,'2024-07-15',100.00);
insert into watch_history values(15,15,'2024-07-16',91.00);
insert into watch_history values(16,16,'2024-07-17',100.00);
insert into watch_history values(17,17,'2024-07-18',89.00);
insert into watch_history values(18,18,'2024-07-19',100.00);
insert into watch_history values(19,19,'2024-07-20',84.00);
insert into watch_history values(20,20,'2024-07-21',100.00);
insert into watch_history values(21,21,'2024-07-22',93.00);
insert into watch_history values(22,22,'2024-07-23',100.00);
insert into watch_history values(23,23,'2024-07-24',87.00);
insert into watch_history values(24,24,'2024-07-25',100.00);
insert into watch_history values(25,25,'2024-07-26',95.00);
insert into watch_history values(26,26,'2024-07-27',100.00);
insert into watch_history values(27,27,'2024-07-28',82.00);
insert into watch_history values(28,28,'2024-07-29',100.00);
insert into watch_history values(29,29,'2024-07-30',91.00);
insert into watch_history values(30,30,'2024-07-31',100.00);
insert into watch_history values(31,31,'2024-08-01',85.00);
insert into watch_history values(32,32,'2024-08-02',100.00);
insert into watch_history values(33,33,'2024-08-03',92.00);
insert into watch_history values(34,34,'2024-08-04',100.00);
insert into watch_history values(35,35,'2024-08-05',88.00);
insert into watch_history values(36,1,'2024-08-06',100.00);
insert into watch_history values(37,2,'2024-08-07',79.00);
insert into watch_history values(38,3,'2024-08-08',100.00);
insert into watch_history values(39,4,'2024-08-09',94.00);
insert into watch_history values(40,5,'2024-08-10',100.00);
insert into watch_history values(41,6,'2024-08-11',86.00);
insert into watch_history values(42,7,'2024-08-12',100.00);
insert into watch_history values(43,8,'2024-08-13',90.00);
insert into watch_history values(44,9,'2024-08-14',100.00);
insert into watch_history values(45,10,'2024-08-15',83.00);
insert into watch_history values(46,11,'2024-08-16',100.00);
insert into watch_history values(47,12,'2024-08-17',91.00);
insert into watch_history values(48,13,'2024-08-18',100.00);
insert into watch_history values(49,14,'2024-08-19',96.00);
insert into watch_history values(50,15,'2024-08-20',100.00);
insert into watch_history values(51,16,'2024-08-21',100.00);
insert into watch_history values(52,17,'2024-08-22',87.00);
insert into watch_history values(53,18,'2024-08-23',100.00);
insert into watch_history values(54,19,'2024-08-24',91.00);
insert into watch_history values(55,20,'2024-08-25',100.00);
insert into watch_history values(56,21,'2024-08-26',84.00);
insert into watch_history values(57,22,'2024-08-27',100.00);
insert into watch_history values(58,23,'2024-08-28',93.00);
insert into watch_history values(59,24,'2024-08-29',100.00);
insert into watch_history values(60,25,'2024-08-30',89.00);
insert into watch_history values(1,26,'2024-09-01',100.00);
insert into watch_history values(2,27,'2024-09-02',81.00);
insert into watch_history values(3,28,'2024-09-03',100.00);
insert into watch_history values(4,29,'2024-09-04',95.00);
insert into watch_history values(5,30,'2024-09-05',100.00);
insert into watch_history values(6,31,'2024-09-06',86.00);
insert into watch_history values(7,32,'2024-09-07',100.00);
insert into watch_history values(8,33,'2024-09-08',92.00);
insert into watch_history values(9,34,'2024-09-09',100.00);
insert into watch_history values(10,35,'2024-09-10',88.00);
insert into watch_history values(11,1,'2024-09-11',100.00);
insert into watch_history values(12,2,'2024-09-12',94.00);
insert into watch_history values(13,3,'2024-09-13',100.00);
insert into watch_history values(14,4,'2024-09-14',85.00);
insert into watch_history values(15,5,'2024-09-15',100.00);
insert into watch_history values(16,6,'2024-09-16',91.00);
insert into watch_history values(17,7,'2024-09-17',100.00);
insert into watch_history values(18,8,'2024-09-18',82.00);
insert into watch_history values(19,9,'2024-09-19',100.00);
insert into watch_history values(20,10,'2024-09-20',96.00);
insert into watch_history values(21,11,'2024-09-21',100.00);
insert into watch_history values(22,12,'2024-09-22',87.00);
insert into watch_history values(23,13,'2024-09-23',100.00);
insert into watch_history values(24,14,'2024-09-24',90.00);
insert into watch_history values(25,15,'2024-09-25',100.00);
insert into watch_history values(26,16,'2024-09-26',83.00);
insert into watch_history values(27,17,'2024-09-27',100.00);
insert into watch_history values(28,18,'2024-09-28',95.00);
insert into watch_history values(29,19,'2024-09-29',100.00);
insert into watch_history values(30,20,'2024-09-30',89.00);
insert into watch_history values(31,21,'2024-10-01',100.00);
insert into watch_history values(32,22,'2024-10-02',84.00);
insert into watch_history values(33,23,'2024-10-03',100.00);
insert into watch_history values(34,24,'2024-10-04',91.00);
insert into watch_history values(35,25,'2024-10-05',100.00);
insert into watch_history values(36,26,'2024-10-06',86.00);
insert into watch_history values(37,27,'2024-10-07',100.00);
insert into watch_history values(38,28,'2024-10-08',93.00);
insert into watch_history values(39,29,'2024-10-09',100.00);
insert into watch_history values(40,30,'2024-10-10',88.00);
insert into watch_history values(41,31,'2024-10-11',100.00);
insert into watch_history values(42,32,'2024-10-12',85.00);
insert into watch_history values(43,33,'2024-10-13',100.00);
insert into watch_history values(44,34,'2024-10-14',92.00);
insert into watch_history values(45,35,'2024-10-15',100.00);
insert into watch_history values(46,1,'2024-10-16',87.00);
insert into watch_history values(47,2,'2024-10-17',100.00);
insert into watch_history values(48,3,'2024-10-18',94.00);
insert into watch_history values(49,4,'2024-10-19',100.00);
insert into watch_history values(50,5,'2024-10-20',89.00);
insert into watch_history values(51,6,'2024-10-21',100.00);
insert into watch_history values(52,7,'2024-10-22',83.00);
insert into watch_history values(53,8,'2024-10-23',100.00);
insert into watch_history values(54,9,'2024-10-24',91.00);
insert into watch_history values(55,10,'2024-10-25',100.00);
insert into watch_history values(56,11,'2024-10-26',86.00);
insert into watch_history values(57,12,'2024-10-27',100.00);
insert into watch_history values(58,13,'2024-10-28',95.00);
insert into watch_history values(59,14,'2024-10-29',100.00);
insert into watch_history values(60,15,'2024-10-30',88.00);
insert into watch_history values(1,16,'2024-11-01',100.00);
insert into watch_history values(2,17,'2024-11-02',84.00);
insert into watch_history values(3,18,'2024-11-03',100.00);
insert into watch_history values(4,19,'2024-11-04',93.00);
insert into watch_history values(5,20,'2024-11-05',100.00);
insert into watch_history values(6,21,'2024-11-06',89.00);
insert into watch_history values(7,22,'2024-11-07',100.00);
insert into watch_history values(8,23,'2024-11-08',82.00);
insert into watch_history values(9,24,'2024-11-09',100.00);
insert into watch_history values(10,25,'2024-11-10',96.00);
insert into watch_history values(11,26,'2024-11-11',100.00);
insert into watch_history values(12,27,'2024-11-12',87.00);
insert into watch_history values(13,28,'2024-11-13',100.00);
insert into watch_history values(14,29,'2024-11-14',91.00);
insert into watch_history values(15,30,'2024-11-15',100.00);
insert into watch_history values(16,31,'2024-11-16',85.00);
insert into watch_history values(17,32,'2024-11-17',100.00);
insert into watch_history values(18,33,'2024-11-18',94.00);
insert into watch_history values(19,34,'2024-11-19',100.00);
insert into watch_history values(20,35,'2024-11-20',88.00);
insert into watch_history values(21,1,'2024-11-21',100.00);
insert into watch_history values(22,2,'2024-11-22',83.00);
insert into watch_history values(23,3,'2024-11-23',100.00);
insert into watch_history values(24,4,'2024-11-24',92.00);
insert into watch_history values(25,5,'2024-11-25',100.00);
insert into watch_history values(26,6,'2024-11-26',86.00);
insert into watch_history values(27,7,'2024-11-27',100.00);
insert into watch_history values(28,8,'2024-11-28',95.00);
insert into watch_history values(29,9,'2024-11-29',100.00);
insert into watch_history values(30,10,'2024-11-30',89.00);

use netflix_db;
-- Login and Authentication 
SELECT a.account_id, a.name, a.email, a.country,s.name AS plan, s.max_screens, s.resolution
FROM   Accounts a JOIN   Subscription s ON a.subscription_id = s.subscription_id
WHERE  a.email = 'john1@gmail.com' AND  a.password = 'RESET_REQUIRED';

-- Profiles of an account
SELECT profile_id, name, language, age_category
FROM   Profiles WHERE  account_id = 1 ORDER BY profile_id;

-- Content with genre 
SELECT c.title, c.type, c.release_year, GROUP_CONCAT(g.name ORDER BY g.name SEPARATOR ', ') AS genres
FROM   Content c JOIN   Has_Genre hg ON c.content_id = hg.content_id
JOIN   Genre g ON hg.genre_id = g.genre_id
GROUP BY c.content_id, c.title, c.type, c.release_year
ORDER BY c.release_year DESC;

-- Filter Content by Genre 
SELECT c.content_id, c.title, c.type, c.release_year
FROM   Content c JOIN   Has_Genre hg ON c.content_id = hg.content_id
JOIN   Genre g     ON hg.genre_id = g.genre_id
WHERE  g.name = 'Action'
  AND  c.type = 'Movie'
ORDER BY c.release_year DESC;

-- Search by Text
SELECT c.content_id, c.title, c.type, c.release_year, c.description
FROM   Content c
WHERE  c.title LIKE '%dark%'
ORDER BY c.release_year DESC;

-- Watch History continue watching
SELECT c.title, c.type,
       wh.watched_date, wh.progress
FROM   Watch_History wh
JOIN   Content c ON wh.content_id = c.content_id
WHERE  wh.profile_id = 60
  AND  wh.progress < 100
ORDER BY wh.watched_date DESC;

-- Most Genre watched by profile 
SELECT g.name AS genre,
       COUNT(*) AS watch_count
FROM   Watch_History wh
JOIN   Has_Genre hg ON wh.content_id = hg.content_id
JOIN   Genre g     ON hg.genre_id = g.genre_id
WHERE  wh.profile_id = 1
GROUP BY g.name
ORDER BY watch_count DESC;

-- Recommendation List
-- Based on content not yet watched by the profile 
SELECT c.content_id, c.title, c.type
FROM   Content c
WHERE  c.content_id NOT IN (
  SELECT content_id
  FROM   Watch_History
  WHERE  profile_id = 1
)
ORDER BY c.release_year DESC;

-- Based on the the most watched genre of profile
SELECT c.content_id, c.title, c.type, c.release_year
FROM   Content c
JOIN   Has_Genre hg ON c.content_id = hg.content_id
WHERE  hg.genre_id = (
  SELECT hg2.genre_id
  FROM   Watch_History wh
  JOIN   Has_Genre hg2 ON wh.content_id = hg2.content_id
  WHERE  wh.profile_id = 1
  GROUP BY hg2.genre_id
  ORDER BY COUNT(*) DESC
  LIMIT 1
)
AND    c.content_id NOT IN (
  SELECT content_id FROM Watch_History WHERE profile_id = 1
)
ORDER BY c.release_year DESC
LIMIT 10;

-- Revenue based on subscription 
SELECT s.name AS plan,
       COUNT(p.payment_id) AS payments,
       SUM(p.amount) AS total_revenue
FROM   Payment p
JOIN   Accounts a ON p.account_id = a.account_id
JOIN   Subscription s ON a.subscription_id = s.subscription_id
WHERE  p.status = 'Completed'
GROUP BY s.name
ORDER BY total_revenue DESC;

-- Max number of screens allowed in a subscription 
DELIMITER //
CREATE TRIGGER trg_check_max_screens
BEFORE INSERT ON Profiles
FOR EACH ROW
BEGIN
    DECLARE current_profiles INT;
    DECLARE max_allowed INT;

    SELECT COUNT(*) INTO current_profiles
    FROM Profiles
    WHERE account_id = NEW.account_id;

    SELECT s.max_screens INTO max_allowed
    FROM Accounts a
    JOIN Subscription s ON a.subscription_id = s.subscription_id
    WHERE a.account_id = NEW.account_id;

    IF current_profiles >= max_allowed THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Profile limit reached for this subscription plan.';
    END IF;
END
//
DELIMITER ;

SELECT *
FROM Profiles
WHERE account_id = 3;

INSERT INTO Profiles
VALUES (61,'Extra Profile','English','Adult',3);

-- Filter adult content from kids profile 
DELIMITER //
CREATE TRIGGER  trg_kids_content_guard
BEFORE INSERT ON Watch_History
FOR EACH ROW
BEGIN
    DECLARE profile_age_cat VARCHAR(20);
    DECLARE content_genre VARCHAR(50);

    SELECT age_category INTO profile_age_cat
    FROM Profiles
    WHERE profile_id = NEW.profile_id;

    IF profile_age_cat = 'Kids' THEN
        IF EXISTS (
            SELECT 1
            FROM Has_Genre hg
            JOIN Genre g ON hg.genre_id = g.genre_id
            WHERE hg.content_id = NEW.content_id
              AND g.name IN ('Crime', 'Horror', 'Thriller')
        ) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'This content is not allowed for Kids profiles.';
        END IF;
    END IF;
END
//
DELIMITER ;


SELECT *
FROM Profiles
WHERE profile_id = 2;

SELECT c.title,g.name
FROM Content c
JOIN Has_Genre hg ON c.content_id = hg.content_id
JOIN Genre g ON hg.genre_id = g.genre_id
WHERE c.content_id = 3;

INSERT INTO Watch_History
VALUES (2,3,'2025-01-01',10);

INSERT INTO Watch_History
VALUES (2,26,'2025-01-01',10);

-- Prevent Progress regression due to multiple devices 
DELIMITER //
CREATE TRIGGER trg_prevent_progress_regression
BEFORE UPDATE ON Watch_History
FOR EACH ROW
BEGIN
    IF NEW.progress < OLD.progress THEN
        SET NEW.progress = OLD.progress;
    END IF;
END
//
DELIMITER ;








