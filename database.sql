CREATE TABLE user (
        id INTEGER NOT NULL, 
        name VARCHAR(240), 
        username VARCHAR(64), 
        email VARCHAR(120), 
        register VARCHAR(10), 
        password_hash VARCHAR(128),
        role TEXT CHECK(role IN ('USER','ADMIN')) NOT NULL DEFAULT 'USER', 
        PRIMARY KEY (id)
);
CREATE INDEX ix_user_name ON user (name);
CREATE UNIQUE INDEX ix_user_email ON user (email);
CREATE INDEX ix_user_register ON user (register);
CREATE UNIQUE INDEX ix_user_username ON user (username);