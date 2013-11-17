### NejBlog

NejBlog is a simple personal blog system which powered by node.js, express framework and jade template engine. The name "Nej" comes from the first letter of each main basic technical parts.

#### Directories and files

| Name           | Description                                                                    |
|------------    | ------------------------------------------------------------------------------ | 
| /config.js     | the default site global config file for running                                |
| /controllers   | the C part of MVC, all logic code suppose to be here                           |
| /data          | the static data folder for blog data                                           |
| /models        | the M part of MVC, for saving json data to file system                         |
| /node_modules  | npm modules                                                                    |
| /public        | public website resources such as css, images, static html files                |
| /views         | the V part of MVC, jade template file folder                                   |
| /README.md     | this file                                                                      |
| /controller.js | the gate of all controllers                                                    |
| /global.js     | global environment functions of this project                                   |
| /package.json  | npm packages configuration file                                                |
| /routes.js     | site request routes                                                            |
| /server.js     | server script, include basic configuration                                     |

#### Install

Simply clone this repo to your webroot and start the node server:

    $ git clone git@github.com:samoay/NejBlog.git
    $ cd NejBlog  #change folder name if you want
    $ npm install #install dependent npm modules
    $ node server.js &

As the default configuration, you can visit your blog via http://127.0.0.1:3000 now !!! 
    
#### Config your blog

The default site configuration is in the file called **config.js** under the project root directory. You can personalize your own blog via Admin-->Setting after you logged in(You also can try to update **config.js** file to personalize your site if you prefer to do so, while you need to restart the node process and make sure there is no syntax error after you updated). 

The default admin account is:

    # You will find out the "Admin login" link at the nav bar
    Username: admin
    Password: 123456

**Please remember to change the default password under Admin-->Password after you logged in.**

#### Project dependencies

- express >= 3.4.4  The main project framework
- jade >= 0.35.0  The template enging
- marked >= 0.2.10  The markdown text parser
- crypto >= 0.0.3  For hashing admin account password

#### Development plan

1. Update markdown editor, for making a better image upload UI
2. Staticize the post page, support permalink of each post
3. More site theme for the site, multi themes config support


