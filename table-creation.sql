CREATE TABLE users(
    ID INT PRIMARY KEY,
    UserName VARCHAR(255),
    Email VARCHAR(255)
)

CREATE TABLE markets(
    Abbr VARCHAR(16) PRIMARY KEY,
    MarketName VARCHAR(255)
)

CREATE TABLE usermarkets(
    UserID int references users(ID),
    Abbr VARCHAR(16) references markets(Abbr),
    MinSell FLOAT(24),
    WasNotified BOOLEAN
)