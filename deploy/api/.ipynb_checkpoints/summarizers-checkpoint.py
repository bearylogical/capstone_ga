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
    if not isHalf:
        word_count, read_time = get_reading_time(text)
        if word_count>265 and read_time > 1:
            calc_ratio = 1/read_time
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
            calc_ratio = 1/read_time
            print(f"Calculated Ratio : {calc_ratio}")
            summary = gensim.summarization.summarizer.summarize(text, ratio= \
                None, word_count=265, split=False)
            return summary
        else:
            return 'It\'s already pretty short...'


    else:
        return gensim.summarization.summarizer.summarize(text, ratio=0.5, word_count=None, split=False)

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

