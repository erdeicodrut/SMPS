class Comment():
    def __init__(self, _id, text, to_post, date, from_user):
        self.id = _id
        self.text = text
        self.to_post = to_post
        self.date = date
        self.from_user = from_user

    def json(self):
        return self.__dict__


class Post:
    def __init__(self, _id, user, photo, date):
        self.id = _id
        self.user = user
        self.photo = photo
        self.date = date
        self.likes = []
        self.comments = []

    def get_likes(self, rows):
        [self.likes.append(x[0]) for x in rows]

    def get_comments(self, rows):
        [self.comments.append(Comment(*x).json()) for x in rows]

    def json(self):
        return self.__dict__


class User:
    def __init__(self, username, password, profile_pic):
        self.username = username
        self.password = password
        self.profile_pic = profile_pic

    def json(self):
        return self.__dict__


class Like:
    def __init__(self, _id, to_post, user):
        self.id = _id
        self.to_post = to_post
        self.user = user

    def json(self):
        return self.__dict__


class Key:
    def __init__(self, key):
        self.key = key

    def json(self):
        return self.__dict__