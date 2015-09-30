-- ---
-- Globals
-- ---

-- SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
-- SET FOREIGN_KEY_CHECKS=0;

-- ---
-- Table teachers
-- 
-- ---

DROP TABLE IF EXISTS teachers;
    
CREATE TABLE teachers (
  id SERIAL,
  login VARCHAR(255) NULL DEFAULT NULL,
  email VARCHAR(255) NULL DEFAULT NULL,
  hashed_password VARCHAR(255) NULL DEFAULT NULL,
  first_name VARCHAR(50) NULL DEFAULT NULL,
  last_name VARCHAR(100) NULL DEFAULT NULL,
  PRIMARY KEY (id)
);

-- ---
-- Table students
-- 
-- ---

DROP TABLE IF EXISTS students;
    
CREATE TABLE students (
  id SERIAL,
  login VARCHAR(100) NULL DEFAULT NULL,
  email VARCHAR(100) NULL DEFAULT NULL,
  hashed_password VARCHAR(255) NULL DEFAULT NULL,
  first_name VARCHAR(100) NULL DEFAULT NULL,
  last_name VARCHAR(100) NULL DEFAULT NULL,
  nickname VARCHAR(100) NULL DEFAULT NULL,
  PRIMARY KEY (id)
);

-- ---
-- Table test_scores
-- 
-- ---

DROP TABLE IF EXISTS test_scores;
    
CREATE TABLE test_scores (
  id SERIAL,
  student_id INTEGER NULL DEFAULT NULL,
  date DATE NULL DEFAULT NULL,
  questions_correct INTEGER NULL DEFAULT NULL,
  questions_possible INTEGER NULL DEFAULT NULL,
  score DOUBLE PRECISION NULL DEFAULT NULL,
  notes_json TEXT NULL DEFAULT NULL,
  PRIMARY KEY (id)
);

-- ---
-- Table classes
-- Not the javascript kind.  School classes.
-- ---

DROP TABLE IF EXISTS classes;
    
CREATE TABLE classes (
  id SERIAL,
  teacher_id INTEGER NULL DEFAULT NULL,
  academic_year INTEGER NULL DEFAULT NULL,
  semester VARCHAR(60) NULL DEFAULT NULL,
  PRIMARY KEY (id)
);

-- ---
-- Table question
-- 
-- ---

DROP TABLE IF EXISTS question;
    
CREATE TABLE question (
  id SERIAL,
  deck_id INTEGER NULL DEFAULT NULL,
  type VARCHAR(255) NULL DEFAULT NULL,
  question TEXT NULL DEFAULT NULL,
  points INTEGER NULL DEFAULT NULL,
  metadata_json TEXT NULL DEFAULT NULL,
  PRIMARY KEY (id)
);

-- ---
-- Table decks
-- 
-- ---

DROP TABLE IF EXISTS decks;
    
CREATE TABLE decks (
  id SERIAL,
  name VARCHAR(255) NULL DEFAULT NULL,
  topic VARCHAR(255) NULL DEFAULT NULL,
  description TEXT NULL DEFAULT NULL,
  PRIMARY KEY (id)
);

-- ---
-- Table teacher_decks
-- 
-- ---

DROP TABLE IF EXISTS teacher_decks;
    
CREATE TABLE teacher_decks (
  id SERIAL,
  teacher_id INTEGER NULL DEFAULT NULL,
  deck_id INTEGER NULL DEFAULT NULL,
  PRIMARY KEY (id)
);

-- ---
-- Table student_classes
-- 
-- ---

DROP TABLE IF EXISTS student_classes;
    
CREATE TABLE student_classes (
  id SERIAL,
  student_id INTEGER NULL DEFAULT NULL,
  class_id INTEGER NULL DEFAULT NULL,
  PRIMARY KEY (id)
);

-- ---
-- Table games
-- 
-- ---

DROP TABLE IF EXISTS games;
    
CREATE TABLE games (
  id SERIAL,
  deck_id INTEGER NULL DEFAULT NULL,
  class_id INTEGER NULL DEFAULT NULL,
  date TIMESTAMP NULL DEFAULT NULL,
  is_test CHAR(1) NULL DEFAULT NULL,
  PRIMARY KEY (id)
);

-- ---
-- Table responses
-- 
-- ---

DROP TABLE IF EXISTS responses;
    
CREATE TABLE responses (
  id SERIAL,
  game_id INTEGER NULL DEFAULT NULL,
  question_id INTEGER NULL DEFAULT NULL,
  student_id INTEGER NULL DEFAULT NULL,
  student_response TEXT NULL DEFAULT NULL,
  is_correct CHAR(1) NULL DEFAULT NULL,
  PRIMARY KEY (id)
);

-- ---
-- Foreign Keys 
-- ---

ALTER TABLE test_scores ADD FOREIGN KEY (student_id) REFERENCES students (id);
ALTER TABLE classes ADD FOREIGN KEY (teacher_id) REFERENCES teachers (id);
ALTER TABLE question ADD FOREIGN KEY (deck_id) REFERENCES decks (id);
ALTER TABLE teacher_decks ADD FOREIGN KEY (teacher_id) REFERENCES teachers (id);
ALTER TABLE teacher_decks ADD FOREIGN KEY (deck_id) REFERENCES decks (id);
ALTER TABLE student_classes ADD FOREIGN KEY (student_id) REFERENCES students (id);
ALTER TABLE student_classes ADD FOREIGN KEY (class_id) REFERENCES classes (id);
ALTER TABLE games ADD FOREIGN KEY (deck_id) REFERENCES decks (id);
ALTER TABLE games ADD FOREIGN KEY (class_id) REFERENCES classes (id);
ALTER TABLE responses ADD FOREIGN KEY (game_id) REFERENCES games (id);
ALTER TABLE responses ADD FOREIGN KEY (question_id) REFERENCES question (id);
ALTER TABLE responses ADD FOREIGN KEY (student_id) REFERENCES students (id);

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
-- INSERT INTO test_scores (id,student_id,date,questions_correct,questions_possible,score,notes_json) VALUES
-- (,,,,,,);
-- INSERT INTO classes (id,teacher_id,academic_year,semester) VALUES
-- (,,,);
-- INSERT INTO question (id,deck_id,type,question,points,metadata_json) VALUES
-- (,,,,,);
-- INSERT INTO decks (id,name,topic,description) VALUES
-- (,,,);
-- INSERT INTO teacher_decks (id,teacher_id,deck_id) VALUES
-- (,,);
-- INSERT INTO student_classes (id,student_id,class_id) VALUES
-- (,,);
-- INSERT INTO games (id,deck_id,class_id,date,is_test) VALUES
-- (,,,,);
-- INSERT INTO responses (id,game_id,question_id,student_id,student_response,is_correct) VALUES
-- (,,,,,);