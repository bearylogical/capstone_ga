# file containing functions to generate metric

from .cleaning import seperate_content, parse_hansard_text

READING_TIME = 265  # words / min


def get_chunks_info(data, returns=True, verbose=True):
    """
    Generate metrics for speech chunk count, word count, reading time,
    number of individuals and speakers in the document
    :param data: raw text from db
    :param verbose: if true, print statements
    :param returns: if True, returns dictionary of entity:contents
    :return: list of entitiy contents
    """
    try:
        text = parse_hansard_text(data)
        chunk_info = {chunk_id: seperate_content(content) for chunk_id, content in enumerate(text)}
        word_count = sum([len(content['content'].split()) for content in chunk_info.values()])
        if (verbose):
            print(f"Number of Speech Chunks : {len(text)}")
            print(f"Word Count : {word_count} words")
            print(f"Estmated reading time : {int(word_count / 265)} minutes")
            speakers = [content['entity'] for content in chunk_info.values()]
            print(f"Number of Individuals :  {len(speakers)}")
            print(f"Speakers :  {set(speakers)}")
        if (returns):
            return chunk_info

    except TypeError:
        print('Incorrect Datatype Provided')


def get_metric(data):
    try:
        word_count = len(data.split())
        print(f"Word Count : {word_count} words")
        print(f"Estmated reading time : {int(word_count / 265)} minutes")

    except TypeError:
        print('Incorrect Datatype Provided')
