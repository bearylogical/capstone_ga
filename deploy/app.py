import flask
from api.methods import random_article, specific_article
from api.summarizers import summarize_all, summarize_speaker, party_summarizer
from api.recommender import fetch_recommended_document
import re
import pymongo
import os
import yaml
import gensim

with open(os.path.abspath(os.path.dirname(__file__)) + "/config.yaml", "r") as ymlfile:
    settings = yaml.safe_load(ymlfile)

# ----- CONFIG -----#
app = flask.Flask(__name__)  # initialise Flask app var
app.config['DEBUG'] = True

isRemote = False

#------ DB ---------#

try:
    if (isRemote):
        client = pymongo.MongoClient(host = settings['mongo-remote']['host'],
                                     port = settings['mongo-remote']['port'],
                                     username = settings['mongo-remote']['user'],
                                     password = settings['mongo-remote']['pw'],
                                     authMechanism= settings['mongo-remote']['authMechanism'])
        client.server_info()  # force connection on a request as the
        # connect=True parameter of MongoClient seems
        # to be useless here
    else:
        client = pymongo.MongoClient("mongodb://localhost:27017/")
        client.server_info()  # force connection on a request as the
    # connect=True parameter of MongoClient seems
    # to be useless here
except pymongo.errors.ServerSelectionTimeoutError as err:
    # do whatever you need
    print(err)

# -------- Recommender Engine ----------#


PATH_TO_DOCVEC = './api/assets/doc2vec'

try:
    model = gensim.models.doc2vec.Doc2Vec.load(PATH_TO_DOCVEC)
except FileNotFoundError:
    print("No Doc2Vec File found")




# ----- ROUTES -----#
@app.route("/")
def home():
    return flask.render_template('index.html')


@app.route("/graph")
def graph():
    return flask.render_template('graph.html')


@app.route("/about")
def about():
    return flask.render_template('about.html')

@app.route("/get_random_debate",methods=['GET'])
def get_article():
    return random_article(client)


@app.route("/article/<article_key>")
def get_article_id(article_key):
    return specific_article(client, article_key)

@app.route("/summarize_all", methods=['POST'])
def get_full_summary():
    if flask.request.method == 'POST':
        req_data = flask.request.get_json()
        # print(req_data)
        return {'question': req_data['parsed_convo'][0]['content'],
                'result': summarize_all(re.sub('</br>', '', req_data['parsed_convo'][-1]['content']))}

@app.route("/summarize_speaker", methods=['POST'])
def get_speaker_summary():
    if flask.request.method == 'POST':
        req_data = flask.request.get_json()
        # print(summarize_speaker(req_data['html_clean']))
        return {'result': summarize_speaker(req_data['html_clean'])}


@app.route("/summarize_party", methods=['POST'])
def get_party_summary():
    if flask.request.method == 'POST':
        req_data = flask.request.get_json()
        # print(party_summarizer(req_data['parsed_convo']))
        return {'result': party_summarizer(req_data['parsed_convo'])}


@app.route("/get_recommendations", methods=['POST'])
def get_recommendations():
    if flask.request.method == 'POST':
        req_data = flask.request.get_json()
        # print(req_data['_id'])
        return {'result': fetch_recommended_document(req_data['_id'], client, model, n_results=4)}


if __name__ == '__main__':
    app.run(port=5001)

