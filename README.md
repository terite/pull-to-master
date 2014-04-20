## What does this project do?

This is a webhook that protects your master branch on GitHub from pushes. Only
pull-requests will get into your master branch.

Pushes to master are moved to a branch, then a pull request is automatically created.

## How to use it

This is the easy way (that gives me access to anything).

1. Add `pull-to-master-bot` as a collaborator to your repo.
2. Add a webhook with the url `https://pull-to-master.herokuapp.com/webhook` and payload version of json

## How to set it up for yourself.

### On Heroku
1. [Install Heroku](https://devcenter.heroku.com/articles/quickstart)
2. Clone this application. `git clone https://github.com/teirte/pull-to-master.git; cd pull-to-master`
3. [Create a Heroku app](https://devcenter.heroku.com/articles/git) `heroku create`
4. [Configure](https://devcenter.heroku.com/articles/config-vars). `heroku config:set GH_USER=... GH_PASS=...`
5. Push to Heroku `git push heroku master`

### General setup

#### Requirements

* Recent version of node.js.
* GitHub user with access to your repositories
* Some Node.js host. I use Heroku, others work too.

#### Setup

1. Set environment variables `GH_USER` and `GH_PASS` to your github user's
username and password. This user needs to have permission to all
repositories that it manages.

2. Run `node hook-listener.js` Have foreman? instead run `foreman start`.

## How it works

1. GitHub webhooks lets it know about any pushes.
2. If push is a pull request merge, allow it. Otherwise, continue to 3.
3. Make a new branch with pushed commits
4. Roll back master to previous state.
5. Make a pull request from new branch to master.
