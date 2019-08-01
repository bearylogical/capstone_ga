import os.path
import yaml
from sqlalchemy import create_engine
from sqlalchemy.inspection import inspect
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm.exc import NoResultFound
import logging as log

from .models import links, articles, mp_record, mp_responses, \
    mem_parliament, appt_record, committee_record, \
    constituency_record, postgres_engine

with open(os.path.dirname(__file__) + "/../config.yaml", "r") as ymlfile:
    settings = yaml.safe_load(ymlfile)

Session = sessionmaker(bind=postgres_engine)
sess = Session()


def insert_url(title, url):
    new_url = get_or_create(sess, links, title=title)


def get_or_create(model, **kwargs):
    """
    Usage:
    class Employee(Base):
        __tablename__ = 'employee'
        id = Column(Integer, primary_key=True)
        name = Column(String, unique=True)

    get_or_create(Employee, name='bob')
    """
    instance = get_instance(model, **kwargs)
    if instance is None:
        instance = create_instance(model, **kwargs)
    return instance


def create_instance(model, **kwargs):
    """create instance"""
    try:
        instance = model(**kwargs)
        sess.add(instance)
        sess.commit()
    except Exception as msg:
        mtext = 'model:{}, args:{} => msg:{}'
        log.error(mtext.format(model, kwargs, msg))
        sess.rollback()
        raise (msg)
    return instance


def get_instance(model, **kwargs):
    """Return first instance found."""
    try:
        return sess.query(model).filter_by(**kwargs).first()
    except NoResultFound:
        return
