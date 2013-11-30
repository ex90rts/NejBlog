### NejBlog

Find out more information at [NejBlog English Site](http://nejblog-en.samoay.me/)

NejBlog is a simple personal blog system which powered by node.js, express framework and jade template engine. The name "Nej" comes from the first letter of each main basic technical parts.

**Version** 0.3.0 released, all fundamental features were settled, you can build your own site via NejBlog now ;)  Please feel free to report issues or comments here !

#### Install

Simply clone this repo to your webroot and start the node server:

```
$ git clone git@github.com:samoay/NejBlog.git
$ cd NejBlog  #change folder name if you want
$ npm install #install dependent npm modules
$ node server.js &
# the default port is 3000, well you can using port from 3000 to 3009 and 80/8080 via pass the port as argument when start node
$ node server.js 3001 &
```

As the default configuration, you can visit your blog via http://127.0.0.1:3000 now !!! 
    
#### Config your blog

The default site configuration is in the file called **config.js** under the project root directory. You can personalize your own blog via Admin-->Setting after you logged in(You also can try to update **config.js** file to personalize your site if you prefer to do so, while you need to restart the node process and make sure there is no syntax error after you updated). 

The default admin account is:

    # You will find out the "Admin login" link at the nav bar
    Username: admin
    Password: 123456

- You can set **basic site** info like main page title, site keywords, site description and so on
- You can talk something about yourself by set up "**about me**" content
- You can choose a **site theme** you like (while currently there are just two themes, more themes coming soon)
- You can choose a code block **highlight theme** you like
- You can choose a faster free **CDN** host for the **static** js and css file (Google,cdnjs,Yandex,Baidu,Sina supported)

**Please remember to change the default password under Admin-->Password after you logged in.**

#### Comment Setting

Currently, Nejblog support three popular social comment services: Disqus.com, Lifefyre.com and Duoshuo.com (For users in China). You need to choose one of these services and get the unique site ID(Disqus called disqus_shortname, Lifefyre called siteId, Duoshuo called shortname), then you can set the ID as **comment service id** in Admin-->Setting page.

#### Google Analytics

The site support google analytics tracking if you have set the google analytics tracking ID under "Admin--Setting--Google Tracking ID" by default.

#### Directories and files

| Name           | Description                                                                    |
|------------    | ------------------------------------------------------------------------------ | 
| /config.js     | the default site global config file for running                                |
| /controllers   | the C part of MVC, all logic code suppose to be here                           |
| /data          | the static data folder for blog data                                           |
| /langs         | languages file for the site                                                    |
| /models        | the M part of MVC, for saving json data to file system                         |
| /node_modules  | npm modules                                                                    |
| /public        | public website resources such as css, images, static html files                |
| /views         | the V part of MVC, jade template file folder                                   |
| /README.md     | this file                                                                      |
| /controller.js | the gate of all controllers                                                    |
| /global.js     | global environment functions of this project                                   |
| /package.json  | npm packages configuration file                                                |
| /routes.js     | site request routes                                                            |
| /server.js     | server script, include basic configuration                  |  
| /temp	         | temp files folder for data backup and restore feature|


#### Project dependencies

- express >= 3.4.4  The main project framework
- jade >= 0.35.0  The template enging
- marked >= 0.2.10  The markdown text parser
- crypto >= 0.0.3  For hashing admin account password
- adm-zip >= 0.4.3 For zip and unzip

#### Development plan / TODO

1. Add pages feature(like Wordpress Pages), which you can 100% control the link and list page
1. Give an option that you can show blog content summary in blog list page, not just title currently
1. Update markdown editor, for making a better image upload UI
1. Staticize the post page, support permalink of each post


