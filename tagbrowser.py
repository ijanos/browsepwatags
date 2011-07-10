import os

import logging

import gdata.alt.appengine
import gdata.photos.service

from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext import db

from google.appengine.ext.webapp.util import run_wsgi_app

from google.appengine.dist import use_library
use_library('django', '1.2')

from django.utils import simplejson
from google.appengine.ext.webapp import template


class UserPrefs(db.Model):
    user = db.UserProperty()
    auto_rotate = db.BooleanProperty()
    picasa_token = db.StringProperty()

def get_user_prefs():
    user = users.get_current_user()
    if user:
        user_prefs = UserPrefs.get_by_key_name('key:' + user.user_id())
        return user_prefs
    else:
        return None

def get_gd_client():
    gd_client = gdata.photos.service.PhotosService()
    gdata.alt.appengine.run_on_appengine(gd_client)
    user_prefs = get_user_prefs()
    if user_prefs and user_prefs.picasa_token:
        gd_client.SetAuthSubToken(user_prefs.picasa_token)
    return gd_client    

class GetTags(webapp.RequestHandler):

    def get(self):
        user = users.get_current_user()

        if user:
            gallery_user = user.nickname()

            gd_client = get_gd_client()
            result = []
            if gd_client and gd_client.GetAuthSubToken():
                albums = gd_client.GetUserFeed(user=gallery_user).entry
                tags = gd_client.GetFeed('/data/feed/api/user/%s?kind=tag' % gallery_user).entry

                for tag in tags:
                    if not tag.weight:
                        w = "0"
                    else:
                        w = tag.weight.text
                    result.append({"name": tag.title.text, "weight":w})
            else:
                pass #TODO: give a message about not being authenticated
            self.response.headers['Content-Type'] = "application/json"
            self.response.out.write(simplejson.dumps(result))
        else:
            self.redirect(users.create_login_url(self.request.uri))


class ImageList(webapp.RequestHandler):

    def get(self, tags):
        user = users.get_current_user()

        if user:
            taglist = tags.split('/')
            result = []

            gd_client = get_gd_client()
            if gd_client and gd_client.GetAuthSubToken():
                photos = gd_client.GetTaggedPhotos(taglist[0], user=user.nickname())
                images = []
                for photo in photos.entry:
                    url  = photo.content.src
                    url_thumb = url[:url.rfind('/')] + '/s128' + url[url.rfind('/'):]
                    images.append({'original':url, 'thumbnail': url_thumb})

            self.response.headers['Content-Type'] = "application/json"
            self.response.out.write(simplejson.dumps(images))
        else:
            self.redirect(users.create_login_url(self.request.uri))


class MainPage(webapp.RequestHandler):

    def picasaTokenURL(self):
        gd_client = gdata.photos.service.PhotosService()
        gdata.alt.appengine.run_on_appengine(gd_client)
        tokenlink = gd_client.GenerateAuthSubURL(self.request.url, 'http://picasaweb.google.com/data/', False, True)
        return tokenlink


    def needPicasaToken(self, user):
        user_prefs = UserPrefs.get_by_key_name('key:' + user.user_id())
        needAuth = False

        # If no user prefs were found, create some
        if not user_prefs:
            user_prefs = UserPrefs(key_name='key:' + user.user_id(), user=user)
            user_prefs.put()
        # If a picasa token has been sent to this page, store it in the user prefs
        picasa_token = self.request.get('token')  
        if picasa_token:
            # Upgrade to a session token
            gd_client = gdata.photos.service.PhotosService()
            gdata.alt.appengine.run_on_appengine(gd_client)
            gd_client.SetAuthSubToken(picasa_token)
            gd_client.UpgradeToSessionToken()
            # Store it
            user_prefs.picasa_token = gd_client.GetAuthSubToken()
            user_prefs.put()
            self.redirect("/")
        # If no picasa token has been created, offer to create one
        elif not user_prefs.picasa_token:
            needAuth = True
        else:
            # you have picasa token in user_prefs.picasa_token
            needAuth = False
        return needAuth

    def get(self):
        user = users.get_current_user()

        if user:
            templatedata = {
                'usernick': user.nickname(),
                'signout': "",
            }
        
            if self.needPicasaToken(user):
                templatedata['needpicasaauth'] = self.picasaTokenURL()

            templatedata["signout"] = users.create_logout_url("/")

            path = os.path.join(os.path.dirname(__file__), "template", 'index.html')
            self.response.out.write(template.render(path, templatedata))
        else:
            self.redirect(users.create_login_url(self.request.uri))

def main():
    logging.getLogger().setLevel(logging.DEBUG)
    application = webapp.WSGIApplication(
                                         [('/',       MainPage)
                                         ,('/tags',   GetTags)
                                         ,('/t/(.*)', ImageList)
                                         ],
                                         debug=True)
    run_wsgi_app(application)


if __name__ == "__main__":
    main()
