create table city(CNAME varchar(255), STATE varchar(255), COUNTRY varchar(255),primary key (CNAME));
create table logindata(UserID varchar(255), Pass varchar(512), Type varchar(10), primary key(UserID));
insert into logindata values('admin', (select sha2("Wonder569",512)),'admin');
insert into logindata values('user', (select sha2("noob1234",512)),'user');