import gensim
from .methods import get_reading_time


def seperate_content(data):
    """
    :param data: chunk
    :return: dict of entity, content
    """
    p = data.split(':', 1)  # only select 2 terms in split
    if len(p) > 1:
        entity = p[0]
        content = p[1]
    else:
        entity = 'NA'
        content = " ".join([e.strip() for e in p[0].split('.')])
    return {'entity': entity, 'content': content}

def summarize_reply(text):
    isHalf = False

    if not isHalf:
        word_count, read_time = get_reading_time(text)
        if word_count>265 and read_time > 1:
            calc_ratio = 0.1
            print(f"Calculated Ratio : {calc_ratio}")
            summary = gensim.summarization.summarizer.summarize(text, ratio= \
                calc_ratio, word_count=None, split=False)
            return summary
        else:
            return gensim.summarization.summarizer.summarize(text, split=False)


    else:
        return gensim.summarization.summarizer.summarize(text, ratio=0.5, word_count=None, split=False)


def summarize_all(text, isHalf=False):
    if not isHalf:
        word_count, read_time = get_reading_time(text)
        if word_count > 265:
            # print(f"Calculated Ratio : {calc_ratio}")
            summary = gensim.summarization.summarizer.summarize(text, ratio= \
                None, word_count=265, split=False)
            return summary
        elif word_count < 265 and word_count > 50:
            summary = gensim.summarization.summarizer.summarize(text, ratio= \
                None, word_count=60, split=False)
            return summary
        else:
            return text


    else:
        return gensim.summarization.summarizer.summarize(text, ratio=0.5, word_count=None, split=False)


def summaryv2(text):
    # split text into sentences

    sentences = []
    for sentence in text:
        print(sentence)
        sentences.append(sentence.replace("[^a-zA-Z]", " ").split(" "))
        sentences.pop()




def summarize_speaker(list_chunks):
    chunk_info = {chunk_id: seperate_content(content) for chunk_id, content in enumerate(list_chunks)}
    converted_text = []
    entity_summary = {}
    for seq, chunk in chunk_info.items():
        if len(chunk['content'].split('.')) > 10:
            summary = gensim.summarization.summarizer.summarize(chunk['content'], ratio=0.2,
                                                                word_count=None, split=False).replace("\n", "")
            entity_summary[seq] = {
                'entity' : chunk['entity'],
                'summary' : summary
            }
        elif chunk['entity'] == 'NA':
            entity_summary[seq] = {
                'entity' : chunk['entity'],
                'summary' : chunk['content']
            }
        else:
            entity_summary[seq] = {
                'entity': chunk['entity'],
                'summary': chunk['content']
            }

    return entity_summary


def party_summarizer(content):
    """

    :param content:
    :return:
    """
    filter_content = [k for k in content if 'party' in list(k.keys())]
    parties = list(set([val['party'] for val in filter_content if val['party']]))
    response = {party: "" for party in parties}
    response['question'] = ""
    # print(filter_content)
    for item in filter_content:
        if item['type'] != 'question':
            if item['party'] in parties:
                response[item['party']] += "".join(item['content'])
        elif item['type'] == 'question':
            if item['party'] in parties:
                response['question'] += "".join(item['content'])
    # print(response)
    for key, val in response.items():
        if len(val.split('.')) > 2:
            min_sent_lengths = sum(sorted([len(k) for k in val.split(".") if len(k) > 5], reverse=False)[:2])

            response[key] = gensim.summarization.summarizer.summarize(val,
                                                                      word_count=min_sent_lengths, split=False)
        else:
            response[key] = val

    return response
