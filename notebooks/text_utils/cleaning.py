from bs4 import BeautifulSoup
import re
import unicodedata


def parse_hansard_text(data):
    bs = BeautifulSoup(data, 'lxml')
    if bs.find('span', {'style': "FONT-SIZE: 13pt; FONT-FAMILY: 'Times New Roman'"}):
        # print("old API v1")
        t = [unicodedata.normalize("NFKD", re.sub('((Page|Column): \d+)' \
                                                  , ' ', BeautifulSoup(t, 'html5lib').get_text(strip=True))).replace(
            '. ', '.') \
             for t in data.split('<b>')]
        return t[1:]

    elif bs.find('div', {'class': "body hansardBaseBody hansardContenteBody"}):
        # print("old API v2")
        t = [unicodedata.normalize("NFKD", re.sub('((Page|Column): \d+)' \
                                                  , ' ',
                                                  BeautifulSoup(t, 'html5lib').get_text(strip=True).replace('\n', ' '))) \
             for t in data.split('<strong class="ph b">')]
        return t[1:]
    else:

        parsed = [unicodedata.normalize("NFKD", re.sub('((Page|Column): \d+)', \
                                                       '', BeautifulSoup(t, 'html5lib').get_text())) \
                  for t in data.replace('</strong>:<strong>', '').split('<strong>')
                  if len(BeautifulSoup(t, 'html5lib').text) > 3]
        return [re.sub('\t', '', t) for t in parsed]


def seperate_content(data):
    """
    :param data: list of chunks
    :return: dict of entity, content
    """
    p = data.split(':', 1)  # only select 2 terms in split
    if len(p) > 1:
        entity = p[0]

        content = p[1]
    else:
        entity = 'NA'
        content = p[0]
    return {'entity': entity, 'content': content}


def get_entities(data):
    """
    :param data: dict of values from fn seperate_content
    :return:
    """

    a = list(set([re.sub(r'(\(.*?\))', '', entity['entity']).strip() for entity in data.values() \
                  if entity['entity'] != 'NA']))
    return [item.strip() for item in a if len(item) < 40]


def parse_topics(data):
    """
    :param data: post parsing hansard data
    :return:
    """
    segment = []
    for key, data in data.items():
        chunk = {}
        chunk['content'] = ''
        if data['entity'] == 'NA':
            chunk['type'] = 'question'
            chunk['content'] = data['content']
            chunk['entity'] = data['content'].split('asked')[0].strip()
            segment.append(chunk)
        else:
            chunk['type'] = 'response'
            chunk['content'] = data['entity'] + ':' + data['content']
            chunk['entity'] = data['entity'].strip()
            segment.append(chunk)

    responses = ""
    for val in segment[1:]:
        responses += '\n\n' + val['content']

    compiled_responses = {
        'type': 'compiled_responses',
        'content': responses
    }

    segment.append(compiled_responses)

    return segment
