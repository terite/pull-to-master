This script rejects pushes to master, only pull requests are allowed.

Here's how it works.

1. github webhooks lets it know about an update to master.
2. if merge && merge pull request message, allow, otherwise go to 3
3. make new branch with pushed head
4. roll back master to old head.
5. make pull request from created branch to master.
