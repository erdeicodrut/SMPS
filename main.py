import hashlib
import json
import sqlite3
import time

from flask import (Flask, jsonify, request)
from flask_cors import CORS

from structs import *

app = Flask(__name__)

CORS(app)

conn = sqlite3.connect('database.db')
c = conn.cursor()

imgur = "http://i.imgur.com/"


@app.route("/")
def root():
    lib = open("templates/lib.js")
    style = open("templates/style.css")
    js = open("templates/index.js")

    index = open("templates/index.html")

    return (index.read().__str__() 
        .replace("{{l}}", lib.read().__str__()) 
        .replace("{{s}}", style.read().__str__())
        .replace("{{i}}", js.read().__str__()))


@app.route('/getUser/<user>', methods=["GET"])
def get_user(user):
    lib = open("templates/lib.js")
    style = open("templates/style.css")
    user_details = open("templates/userDetails")

    index = open("templates/indexUser.html")

    c.execute('SELECT profilepic FROM User WHERE username="{}"'.format(user))

    profile_pic = c.fetchone()[0]

    c.execute('SELECT COUNT(id) FROM Post WHERE user="{}"'.format(user))

    count = c.fetchone()[0]

    user_details = (user_details.read().__str__() 
        .replace("{{profilePic}}", imgur + profile_pic) 
        .replace("{{username}}", user) 
        .replace("{{numOfPosts}}", str(count) + " Posts") 
        .replace("{{numOfFollowers}}", str(10) + " Followers")) # TODO PLACE HOLER

    return (index.read().__str__() 
        .replace("{{l}}", lib.read().__str__()) 
        .replace("{{s}}", style.read().__str__()) 
        .replace("{{userdetails}}", user_details) 
        .replace("{{u}}", user))


@app.route('/comment', methods=['POST'])
def comment():
    # TODO verify if the post exists and if the user exists
    print(request.data)

    data = json.loads(request.data)

    c.execute('SELECT COUNT(id) FROM Post WHERE id="{}"'.format(data['post_id']))

    if c.fetchone()[0] == 0:
        return 'No such post exists'

    c.execute('INSERT INTO Comment VALUES(NULL, ?, ?, ?, ?) ',
              (data['text'], data['post_id'], time.time(), data['user']))
    conn.commit()

    return 'Success'


@app.route('/like/<what_id>/<user>')
def like(what_id, user):
    c.execute('SELECT COUNT(id) FROM Like WHERE to_post={} AND user="{}"'.format(what_id, user))

    if c.fetchone()[0] > 0:
        return 'Like already exists'

    c.execute('SELECT COUNT(username) FROM User where username="{}"'.format(user))

    if c.fetchone()[0] == 0:
        return 'Who are you?'

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
    #
    # # Doesn't work, see why

    c.execute('SELECT * FROM Post WHERE user="{}"'.format(user))

    p = conn.cursor()

    posts = [Key(key)]

    for row in c.fetchall():
        post = Post(*row)

        p.execute('SELECT user FROM Like WHERE to_post={}'.format(post.id))
        post.get_likes(p.fetchall())

        p.execute('SELECT * FROM Comment WHERE to_post={}'.format(post.id))
        post.get_comments(p.fetchall())

        p.execute('SELECT profilepic FROM User WHERE username="{}"'.format(user))
        post.profile_pic = p.fetchone()[0]

        posts.append(post)

    return jsonify([x.json() for x in posts])


@app.route("/getPosts/<key>", methods=["POST", "GET"])
def get_posts(key):
    # TODO thingy about followers and following

    print(key)

    c.execute('SELECT * FROM Post')

    p = conn.cursor()

    posts = []

    for row in c.fetchall():
        post = Post(*row)

        p.execute('SELECT user FROM Like WHERE to_post={}'.format(post.id))
        post.get_likes(p.fetchall())

        p.execute('SELECT * FROM Comment WHERE to_post={}'.format(post.id))
        post.get_comments(p.fetchall())

        p.execute('SELECT profilepic FROM User WHERE username="{}"'.format(post.user))
        post.profile_pic = p.fetchone()[0]

        posts.append(post)

    return jsonify([x.json() for x in posts])


@app.route('/post', methods=["POST"])
def post():
    # TODO verify if the user exists

    data = json.loads(request.data)

    c.execute('SELECT COUNT(username) FROM User where username="{}"'.format(data['user']))

    if c.fetchone()[0] == 0:
        return 'Who are you?'

    c.execute('INSERT INTO Post VALUES(NULL, ?, ?, ?)',
              (data['user'], data['photo'], time.time()))

    if data['description'] is not '*':
        c.execute('SELECT id FROM Post WHERE photo="' + data['photo'] + '"')
        c.execute('INSERT INTO Comment VALUES(NULL, ?, ?, ?, ?) ',
                  (data['description'], c.fetchone()[0], time.time(), data['user']))

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

    c.execute('INSERT INTO User VALUES(?, ?, ?)', 
        (data['user'], data['password'], data['profile_pic']))

    conn.commit()

    return 'Success'


@app.route('/modify/<user>/<attribute>/<to_what>')
def modify(user, attribute, to_what):
    # TODO check if the user exists
    c.execute('UPDATE User SET ?=? WHERE username=?', (attribute, to_what, user))
    conn.commit()

    return 'Success'


@app.route('/login', methods=["POST", "GET"])
def login():
    data = json.loads(request.data)

    hash_object = hashlib.md5(data['password'].encode())
    data['password'] = hash_object.hexdigest()

    c.execute('SELECT password FROM User WHERE username="{}"'.format(data['user']))

    password = c.fetchone()[0]
    print(password)
    print(data['password'])

    if password == data['password']:
        return jsonify({'password': password})
    return jsonify({'error': 'incorrect login'})



# # hacky

# @app.route('/create/<user>/<password>/<profile_pic>/')
# def Hcreate_user():
    
#     hash_object = hashlib.md5(password.encode())
#     dpassword = hash_object.hexdigest()

#     if profile_pic is '*':
#         profile_pic = DEFAULT_PROFILE_PIC

#     print(password)

#     c.execute('INSERT INTO User VALUES(?, ?, ?)', 
#         (user, password, profile_pic))

#     conn.commit()

#     return 'Success'

# @app.route('/comment/<post_id>/<user>/<text>')
# def Hcomment():
#     # TODO verify if the post exists and if the user exists
#     c.execute('SELECT COUNT(id) FROM Post WHERE id="{}"'.format(post_id))

#     if c.fetchone()[0] == 0:
#         return 'No such post exists'

#     c.execute('INSERT INTO Comment VALUES(NULL, ?, ?, ?, ?) ',
#               (text, post_id, time.time(), user))
#     conn.commit()

#     return 'Success'

# @app.route('/post/<user>/<photo>/<description>')
# def Hpost():
#     # TODO verify if the user exists

#     c.execute('SELECT COUNT(username) FROM User where username="{}"'.format(user))

#     if c.fetchone()[0] == 0:
#         return 'Who are you?'

#     c.execute('INSERT INTO Post VALUES(NULL, ?, ?, ?)',
#               (user, photo, time.time()))

#     if description is not '*':
#         c.execute('SELECT id FROM Post WHERE photo="' + photo + '"')
#         c.execute('INSERT INTO Comment VALUES(NULL, ?, ?, ?, ?) ',
#                   (description, c.fetchone()[0], time.time(), user))

#     conn.commit()

#     return 'all good'

# @app.route('/login/<user>/<password>')
# def Hlogin(user, password):

#     hash_object = hashlib.md5(password.encode())
#     password = hash_object.hexdigest()

#     print(password)

#     c.execute('SELECT password FROM User WHERE username="{}"'.format(user))

#     passw = c.fetchone()[0]

#     if passw == password:
#         return jsonify({'password': passw})
#     return jsonify({'error': 'incorrect login'})


if __name__ == '__main__':
    app.run(host='localhost', port=8080, debug=False)
