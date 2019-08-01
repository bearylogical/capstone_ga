import os.path

import yaml
from sqlalchemy import create_engine, Table, Column, DateTime, String, Integer, ForeignKey, func, BigInteger, Date, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker


with open(os.path.dirname(__file__) + "/../config.yaml", "r") as ymlfile:
    settings = yaml.safe_load(ymlfile)

Base = declarative_base()

mp_record = Table('mp_record', Base.metadata,
    Column('mp_id', Integer, ForeignKey('mem_parliament.member_id')),
    Column('article_id', Integer, ForeignKey('articles.article_id'))
)

postgres_engine = create_engine(
    'postgresql+psycopg2://' + settings['postgres']['user'] + ':'
    + settings['postgres']['pw'] + '@localhost/' + settings['postgres']['dbname'])

class links(Base):
    __tablename__ = 'links'
    id = Column(BigInteger, primary_key=True)
    title = Column(String(200))
    url = Column(String(200))
    sitting_date = Column(DateTime)

    created_on = Column(DateTime, server_default=func.now())
    updated_on = Column(DateTime, server_onupdate=func.now())


class articles(Base):
    __tablename__ = 'articles'
    article_id = Column(BigInteger, ForeignKey('links.id'), primary_key=True)
    parliament_num = Column(Integer)
    volume_num = Column(Integer)
    sitting_num = Column(Integer)
    session_num = Column(Integer)
    session_type = Column(String(1000))
    article_text = Column(Text)

    created_on = Column(DateTime, server_default=func.now())
    updated_on = Column(DateTime, server_onupdate=func.now())

    # Use cascade='delete,all' to propagate the deletion of a Department onto its Employees
    links = relationship("links", back_populates="articles")

class mem_parliament(Base):
    __tablename__ = 'mem_parliament'
    member_id = Column(BigInteger, primary_key=True)
    name = Column(String(300))
    salutation = Column(String(300))
    designation = Column(String(300))
    constituency = Column(String(300))
    birth_year = Column(Date)

    created_on = Column(DateTime, server_default=func.now())
    updated_on = Column(DateTime, server_onupdate=func.now())


class mp_responses(Base):
    __tablename__ = 'mp_responses'
    response_id = Column(BigInteger, primary_key=True)
    article_id = Column(BigInteger, ForeignKey('articles.article_id'))
    mp_id = Column(BigInteger, ForeignKey('mem_parliament.member_id'))
    response_text = Column(Text)

    created_on = Column(DateTime, server_default=func.now())
    updated_on = Column(DateTime, server_onupdate=func.now())

    mp = relationship('mem_parliament')
    article = relationship('articles')

class appt_record(Base):
    __tablename__ = 'appt_record'
    appt_id = Column(BigInteger, primary_key=True)
    member_id = Column(BigInteger, ForeignKey('mem_parliament.member_id'))
    appt_duration = Column(Text)
    appt_text = Column(Text)

    created_on = Column(DateTime, server_default=func.now())
    updated_on = Column(DateTime, server_onupdate=func.now())

    mp = relationship('mem_parliament')


class committee_record(Base):
    __tablename__ = 'committee_record'
    appt_id = Column(BigInteger, primary_key=True)
    member_id = Column(BigInteger, ForeignKey('mem_parliament.member_id'))
    role = Column(Text)
    comm_period = Column(Text)
    comm_name = Column(Text)

    created_on = Column(DateTime, server_default=func.now())
    updated_on = Column(DateTime, server_onupdate=func.now())

    mp = relationship('mem_parliament')


class constituency_record(Base):
    __tablename__ = 'constituency_record'
    appt_id = Column(BigInteger, primary_key=True)
    member_id = Column(BigInteger, ForeignKey('mem_parliament.member_id'))
    role = Column(Text)
    con_duration = Column(Text)
    constituency = Column(Text)

    created_on = Column(DateTime, server_default=func.now())
    updated_on = Column(DateTime, server_onupdate=func.now())

    mp = relationship('mem_parliament')


def initialise_db():
    session = sessionmaker()
    session.configure(bind=postgres_engine)
    Base.metadata.create_all(postgres_engine)

#
# if __name__ == '__main__':
#     """Create DB"""
#     initialise_db()




