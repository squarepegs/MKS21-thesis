-- ---
-- Globals
-- ---

-- SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
-- SET FOREIGN_KEY_CHECKS=0;

-- ---
-- Table teachers
-- 
-- ---

-- should be changed to knex.

-- commands:
-- DROP TABLE games CASCADE


DROP TABLE IF EXISTS users;
    
CREATE TABLE users (
  id SERIAL,
  login VARCHAR(255) NULL,
  email VARCHAR(255) NULL,
  hashed_password VARCHAR(255) NULL,
  first_name VARCHAR(50) NULL,
  last_name VARCHAR(100) NULL,
  user_type VARCHAR(100) NULL,
  PRIMARY KEY (id)
);

-- ---
-- Table test_scores
-- ---

DROP TABLE IF EXISTS test_scores;
    
CREATE TABLE test_scores (
  id SERIAL,
  user_id INTEGER NULL,
  date DATE NULL,
  questions_correct INTEGER NULL,
  questions_possible INTEGER NULL,
  score DOUBLE PRECISION NULL,
  notes_json TEXT NULL,
  PRIMARY KEY (id)
);

-- ---
-- Table classes
-- Not the javascript kind.  School classes.
-- ---

DROP TABLE IF EXISTS classes;
    
CREATE TABLE classes (
  id SERIAL,
  user_id INTEGER NULL,
  academic_year INTEGER NULL,
  semester VARCHAR(60) NULL,
  PRIMARY KEY (id)
);

-- ---
-- Table question
-- 
-- ---

DROP TABLE IF EXISTS question;
    
CREATE TABLE questions (
  id SERIAL,
  deck_id INTEGER NULL,
  type VARCHAR(255) NULL,
  question TEXT NULL,
  points INTEGER NULL,
  metadata_json TEXT NULL,
  PRIMARY KEY (id)
);

-- ---
-- Table decks
-- 
-- ---

DROP TABLE IF EXISTS decks;
    
CREATE TABLE decks (
  id SERIAL,
  name VARCHAR(255) NULL,
  topic VARCHAR(255) NULL,
  description TEXT NULL,
  PRIMARY KEY (id)
);

-- ---
-- Table teacher_decks
-- 
-- ---

DROP TABLE IF EXISTS teacher_decks;
    
CREATE TABLE users_decks (
  id SERIAL,
  user_id INTEGER NULL,
  deck_id INTEGER NULL,
  PRIMARY KEY (id)
);

-- ---
-- Table student_classes
-- 
-- ---

DROP TABLE IF EXISTS student_classes;
    
CREATE TABLE users_classes (
  id SERIAL,
  user_id INTEGER NULL,
  class_id INTEGER NULL,
  PRIMARY KEY (id)
);

-- ---
-- Table games
-- 
-- ---

DROP TABLE IF EXISTS games;
    
CREATE TABLE games (
  id SERIAL,
  deck_id INTEGER NULL,
  class_id INTEGER NULL,
  date TIMESTAMP NULL,
  is_test CHAR(1) NULL,
  PRIMARY KEY (id)
);

-- ---
-- Table responses
-- 
-- ---

DROP TABLE IF EXISTS responses;
    
CREATE TABLE responses (
  id SERIAL,
  game_id INTEGER NULL,
  question_id INTEGER NULL,
  user_id INTEGER NULL,
  student_response TEXT NULL,
  is_correct CHAR(1) NULL,
  PRIMARY KEY (id)
);

-- ---
-- Foreign Keys 
-- ---

ALTER TABLE test_scores ADD FOREIGN KEY (user_id) REFERENCES users (id);
ALTER TABLE classes ADD FOREIGN KEY (user_id) REFERENCES users (id);
ALTER TABLE question ADD FOREIGN KEY (deck_id) REFERENCES decks (id);
ALTER TABLE teacher_decks ADD FOREIGN KEY (user_id) REFERENCES users (id);
ALTER TABLE teacher_decks ADD FOREIGN KEY (deck_id) REFERENCES decks (id);
ALTER TABLE student_classes ADD FOREIGN KEY (user_id) REFERENCES users (id);
ALTER TABLE student_classes ADD FOREIGN KEY (class_id) REFERENCES classes (id);
ALTER TABLE games ADD FOREIGN KEY (deck_id) REFERENCES decks (id);
ALTER TABLE games ADD FOREIGN KEY (class_id) REFERENCES classes (id);
ALTER TABLE responses ADD FOREIGN KEY (game_id) REFERENCES games (id);
ALTER TABLE responses ADD FOREIGN KEY (question_id) REFERENCES question (id);
ALTER TABLE responses ADD FOREIGN KEY (user_id) REFERENCES users (id);

-- ---
-- Table Properties
-- ---

-- ALTER TABLE teachers ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE students ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE test_scores ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE classes ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE question ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE decks ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE teacher_decks ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE student_classes ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE games ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE responses ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ---
-- Test Data
-- ---

-- INSERT INTO teachers (id,login,email,hashed_password,first_name,last_name) VALUES
-- (,,,,,);
-- INSERT INTO students (id,login,email,hashed_password,first_name,last_name,nickname) VALUES
-- (,,,,,,);
-- INSERT INTO test_scores (id,user_id,date,questions_correct,questions_possible,score,notes_json) VALUES
-- (,,,,,,);
-- INSERT INTO classes (id,user_id,academic_year,semester) VALUES
-- (,,,);
-- INSERT INTO question (id,deck_id,type,question,points,metadata_json) VALUES
-- (,,,,,);
-- INSERT INTO decks (id,name,topic,description) VALUES
-- (,,,);
-- INSERT INTO teacher_decks (id,user_id,deck_id) VALUES
-- (,,);
-- INSERT INTO student_classes (id,user_id,class_id) VALUES
-- (,,);
-- INSERT INTO games (id,deck_id,class_id,date,is_test) VALUES
-- (,,,,);
-- INSERT INTO responses (id,game_id,question_id,user_id,student_response,is_correct) VALUES
-- (,,,,,);