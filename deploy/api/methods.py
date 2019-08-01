
import re
import math
from bson import ObjectId


def date_parser(date):
    return date.strftime("%d %B, %Y")


def random_article(client):
    article = client.parliament.articles.aggregate([{'$match':
                                          {'session_type': {'$regex': 'ANSWERS'}}},
                                     {'$sample': {'size': 1}},
                                     ])

    content = list(article)[0]
    detail = ['parliament_num',
              'title',
              'src_url',
              'volume_num',
              'sitting_num',
              'session_num',
              'session_type',
              'sitting_date',
              'html_clean',
              'article_text',
              'cleaned_join',
              'parsed_convo',
              'dominant_topic',
              'persons_involved',
              '_id']

    filter_content = {key: content[key] for key in detail}
    filter_content['_id'] = str(filter_content['_id'])
    filter_content['article_text'] = re.sub("style=\"FONT-SIZE: 13pt; FONT-FAMILY: 'Times New Roman'\"",'',content['article_text'])
    filter_content['word_count'], filter_content['read_time'] = get_reading_time(content['cleaned_join'],verbose=False)
    filter_content['sitting_date'] = date_parser(content['sitting_date'])

    return filter_content


def specific_article(client, document_id):
    document = client.parliament.articles.find_one({'_id': ObjectId(document_id)})

    detail = ['parliament_num',
              'title',
              'src_url',
              'volume_num',
              'sitting_num',
              'session_num',
              'session_type',
              'sitting_date',
              'html_clean',
              'article_text',
              'cleaned_join',
              'parsed_convo',
              'dominant_topic',
              'persons_involved',
              '_id']

    filter_content = {key: document[key] for key in detail}
    filter_content['_id'] = str(filter_content['_id'])
    filter_content['article_text'] = re.sub("style=\"FONT-SIZE: 13pt; FONT-FAMILY: 'Times New Roman'\"", '',
                                            document['article_text'])
    filter_content['word_count'], filter_content['read_time'] = get_reading_time(document['cleaned_join'],
                                                                                 verbose=False)
    filter_content['sitting_date'] = date_parser(document['sitting_date'])

    return filter_content


def get_reading_time(data, verbose=True):
    try:
        word_count = len(data.split())
        read_time = math.ceil(int(word_count / 265))

        if verbose:
            print(f"Word Count : {word_count} words")
            print(f"Estmated reading time : {read_time} minutes")
        return word_count, read_time
    except TypeError:
        print('Incorrect Datatype Provided')

def get_topic_question(data):

    pass