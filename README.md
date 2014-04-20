## What it is

This is a webhook for GitHub that only allows pull requests into master. Pushes
to master are moved to a branch, then a pull request is automatically created.

## How to use it

This is the easy way (that gives me access to anything).

1. Add `pull-to-master-bot` as a collaborator to your repo.
2. Add a webhook with the url `https://pull-to-master.herokuapp.com/webhook` and payload version of json

## How to set it up for yourself.

### Requirements

* Recent version of node.js.
* GitHub user with access to your repositories
* Some Node.js host. I use Heroku, others work too.

### Setup

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
