import os.path

import yaml
from sqlalchemy import create_engine, Table, Column, DateTime, String, Float, Integer, ForeignKey, func, BigInteger, \
    Date, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker

with open(os.path.dirname(__file__) + "/../config.yaml", "r") as ymlfile:
    settings = yaml.safe_load(ymlfile)

Base = declarative_base()

mp_record = Table('mp_record', Base.metadata,
                  Column('mp_id', Integer, ForeignKey('mem_parliament.member_id')),
                  Column('article_id', Integer, ForeignKey('article.article_id'))
                  )

postgres_engine = create_engine(
    'postgresql+psycopg2://' + settings['postgres']['user'] + ':'
    + settings['postgres']['pw'] + '@localhost/' + settings['postgres']['dbname'])


# class MpRecordAssoc(Base):
#     __tablename__ = 'association'
#     mp_id = Column(Integer, ForeignKey('mem_parliament.member_id'), primary_key=True)
#     article_id = Column(Integer, ForeignKey('articles.article_id'), primary_key=True)
#     mp = relationship("MemParliament")
#     article = relationship("Article")

class Link(Base):
    __tablename__ = 'link'
    id = Column(BigInteger, primary_key=True)
    title = Column(Text)
    res_url = Column(Text)
    src_url = Column(Text)
    sitting_date = Column(DateTime)
    article_link = relationship("Article", uselist=False, back_populates="link_article")

    created_on = Column(DateTime, server_default=func.now())
    updated_on = Column(DateTime, server_onupdate=func.now())


class Article(Base):
    __tablename__ = 'article'
    article_id = Column(BigInteger, primary_key=True)
    link_id = Column(BigInteger, ForeignKey('link.id'))
    parliament_num = Column(Integer)
    volume_num = Column(Integer)
    sitting_num = Column(Integer)
    session_num = Column(Integer)
    session_type = Column(String(1000))
    article_text = Column(Text)

    created_on = Column(DateTime, server_default=func.now())
    updated_on = Column(DateTime, server_onupdate=func.now())

    # Use cascade='delete,all' to propagate the deletion of a Department onto its Employees
    link_article = relationship("Link", back_populates="article_link", cascade='delete,all')
    response_article = relationship("MpResponse", back_populates="article_response", cascade='delete,all')


class MemParliament(Base):
    __tablename__ = 'mem_parliament'
    member_id = Column(BigInteger, primary_key=True)
    name = Column(String(300))
    salutation = Column(String(300))
    designation = Column(String(300))
    constituency = Column(String(300))
    birth_year = Column(Date)
    party = Column(Text)
    # articles = relationship("Article")
    response_mem_parliament = relationship("MpResponse", back_populates="mem_parliament_response")
    constituency_record_mem_parliament = relationship("ConstituencyRecord",
                                                      back_populates="mem_parliament_constituency_record")
    appt_record_mem_parliament = relationship("ApptRecord", back_populates="mem_parliament_appt_record")
    committee_record_mem_parliament = relationship("CommitteeRecord", back_populates="mem_parliament_committee_record")
    election_record_mem_parliament = relationship("ElectionRecord", back_populates="mem_parliament_election_record")
    created_on = Column(DateTime, server_default=func.now())
    updated_on = Column(DateTime, server_onupdate=func.now())


class MpResponse(Base):
    __tablename__ = 'mp_response'
    response_id = Column(BigInteger, primary_key=True)
    article_id = Column(BigInteger, ForeignKey('article.article_id'))
    mp_id = Column(BigInteger, ForeignKey('mem_parliament.member_id'))
    response_text = Column(Text)

    created_on = Column(DateTime, server_default=func.now())
    updated_on = Column(DateTime, server_onupdate=func.now())

    mem_parliament_response = relationship("MemParliament", back_populates="response_mem_parliament")
    article_response = relationship('Article', back_populates="response_article")


class ApptRecord(Base):
    __tablename__ = 'appt_record'
    appt_id = Column(BigInteger, primary_key=True)
    member_id = Column(BigInteger, ForeignKey('mem_parliament.member_id'))
    appt_duration = Column(Text)
    appt_text = Column(Text)

    created_on = Column(DateTime, server_default=func.now())
    updated_on = Column(DateTime, server_onupdate=func.now())

    mem_parliament_appt_record = relationship("MemParliament", back_populates="appt_record_mem_parliament")


class CommitteeRecord(Base):
    __tablename__ = 'committee_record'
    appt_id = Column(BigInteger, primary_key=True)
    member_id = Column(BigInteger, ForeignKey('mem_parliament.member_id'))
    role = Column(Text)
    comm_period = Column(Text)
    comm_name = Column(Text)

    created_on = Column(DateTime, server_default=func.now())
    updated_on = Column(DateTime, server_onupdate=func.now())

    mem_parliament_committee_record = relationship("MemParliament", back_populates="committee_record_mem_parliament")


class ConstituencyRecord(Base):
    __tablename__ = 'constituency_record'
    appt_id = Column(BigInteger, primary_key=True)
    member_id = Column(BigInteger, ForeignKey('mem_parliament.member_id'))
    role = Column(Text)
    con_duration = Column(Text)
    constituency = Column(Text)

    created_on = Column(DateTime, server_default=func.now())
    updated_on = Column(DateTime, server_onupdate=func.now())

    mem_parliament_constituency_record = relationship("MemParliament",
                                                      back_populates="constituency_record_mem_parliament")


class ElectionRecord(Base):
    __tablename__ = 'election_record'
    record_id = Column(BigInteger, primary_key=True)
    name = Column(Text)
    member_id = Column(BigInteger, ForeignKey('mem_parliament.member_id'))
    constituency = Column(Text)
    margin = Column(Float)
    year = Column(DateTime)  # only store year
    party = Column(Text)

    created_on = Column(DateTime, server_default=func.now())
    updated_on = Column(DateTime, server_onupdate=func.now())

    mem_parliament_election_record = relationship("MemParliament",
                                                  back_populates="election_record_mem_parliament")


def initialise_db():
    session = sessionmaker()
    session.configure(bind=postgres_engine)
    Base.metadata.create_all(postgres_engine)


def drop_all():
    session = sessionmaker()
    session.configure(bind=postgres_engine)
    Base.metadata.drop_all(postgres_engine)


if __name__ == '__main__':
    """Create DB"""
    initialise_db()
