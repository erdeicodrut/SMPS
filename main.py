import hashlib, \
    json, \
    sqlite3, \
    time

from flask import Flask, jsonify, request
from flask_cors import CORS

from structs import *

app = Flask(__name__)

CORS(app)

conn = sqlite3.connect('database.db')
c = conn.cursor()


@app.route("/")
def root():
    lib = open("templates/lib.js")
    style = open("templates/style.css")
    js = open("templates/index.js")

    index = open("templates/index.html")

    return index.read().__str__() \
        .replace("{{l}}", lib.read().__str__()) \
        .replace("{{s}}", style.read().__str__()) \
        .replace("{{i}}", js.read().__str__())


@app.route('/getUser/<user>', methods=["GET"])
def get_user(user):
    lib = open("templates/lib.js")
    style = open("templates/style.css")

    index = open("templates/indexUser.html")

    return index.read().__str__() \
        .replace("{{l}}", lib.read().__str__()) \
        .replace("{{s}}", style.read().__str__()) \
        .replace("{{u}}", user)


@app.route('/comment', methods=['POST'])
def comment():
    # TODO verify if the post exists and if the user exists
    print(request.data)

    data = json.loads(request.data)

    c.execute('INSERT INTO Comment VALUES(NULL, ?, ?, ?, ?) ',
              (data['text'], data['post_id'], time.time(), data['user']))
    conn.commit()

    return 'Success'


@app.route('/like/<what_id>/<user>')
def like(what_id, user):
    # TODO verify if the user and the post exist
    # TODO verify if the like already is registerd
    c.execute('INSERT INTO Like VALUES(NULL, ?, ?) ',
              (what_id, user))
    conn.commit()

    return 'Success'


@app.route('/unlike/<what_id>/<user>')
def unlike(what_id, user):
    # TODO verify if the user and the post exist
    # TODO verify if the like already is registerd
    c.execute('DELETE FROM Like WHERE to_post=? AND user=? ',
              (what_id, user))
    conn.commit()

    return 'Success'


@app.route('/user/<user>/<key>', methods=["GET"])
def user_data(user, key):
    # TODO add profile pic
    # l = conn.cursor()
    # l.execute('SELECT username FROM User WHERE password="{}"'.format(key))
    # l = c.fetchone()
    # print(l)

    # Doesn't work, see why

    c.execute('SELECT * FROM Post WHERE user="{}"'.format(user))

    p = conn.cursor()

    posts = [Key(key)]

    for row in c.fetchall():
        post = Post(*row)

        p.execute('SELECT user FROM Like WHERE to_post=' + str(post.id))
        post.get_likes(p.fetchall())

        p.execute('SELECT * FROM Comment WHERE to_post=' + str(post.id))
        post.get_comments(p.fetchall())

        posts.append(post)

    return jsonify([x.json() for x in posts])


@app.route("/getPosts/<key>")
def get_posts(key):
    # TODO thingy about followers and following

    print(key)

    c.execute('SELECT * FROM Post')

    p = conn.cursor()

    posts = []

    for row in c.fetchall():
        post = Post(*row)

        p.execute('SELECT user FROM Like WHERE to_post=' + str(post.id))
        post.get_likes(p.fetchall())

        p.execute('SELECT * FROM Comment WHERE to_post=' + str(post.id))
        post.get_comments(p.fetchall())

        posts.append(post)

    return jsonify([x.json() for x in posts])


@app.route('/post', methods=["POST"])
def post():
    # TODO verify if the user exists

    data = json.loads(request.data)

    c.execute('INSERT INTO Post VALUES(NULL, ?, ?, ?)',
              (data['user'], data['photo'], time.time()))
    if data['description'] is not '*':
        c.execute('SELECT id FROM Post WHERE photo="' + data['photo'] + '"')
        comment(c.fetchone()[0], data['user'], data['description'])
    # to be reviewed

    conn.commit()

    return 'all good'


DEFAULT_PROFILE_PIC = 'Dow9D0J.jpg'


@app.route('/create', methods=['POST'])
def create_user():
    data = json.loads(request.data)

    hash_object = hashlib.md5(data['password'].encode())
    data['password'] = hash_object.hexdigest()

    if data['profile_pic'] is '*':
        data['profile_pic'] = DEFAULT_PROFILE_PIC

    print(data['password'])

    c.execute('INSERT INTO User VALUES(?, ?, ?)', (data['user'], data['password'], data['profile_pic']))
    conn.commit()

    return 'Success'


@app.route('/modify/<user>/<attribute>/<to_what>')
def modify(user, attribute, to_what):
    # TODO check if the user exists
    c.execute('UPDATE User SET ?=? WHERE username=?', (attribute, to_what, user))
    conn.commit()

    return 'Success'


@app.route('/login', methods=['POST'])
def login():
    data = json.loads(request.data)

    hash_object = hashlib.md5(data['password'].encode())
    data['password'] = hash_object.hexdigest()

    c.execute('SELECT password FROM User WHERE username="' + (data['user']) + '"')

    password = c.fetchone()[0]
    print(password)
    print(data['password'])
    if password == data['password']:
        return jsonify({'password': password})
    else:
        return jsonify({'error': 'incorrect login'})


if __name__ == '__main__':
    app.run(host='localhost', port=8080, debug=False)
