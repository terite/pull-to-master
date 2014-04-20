var http = require('http'),
    async = require('async'),
    GitHubApi = require('github'),

    ip = '0.0.0.0',
    port = process.env.PORT || 3000,
    endpoint = '/webhook';

// github client
var github = new GitHubApi({
     // required
    version: "3.0.0",
});
github.authenticate({
    type: "basic",
    username: process.env.GH_USER,
    password: process.env.GH_PASS
});

http.createServer(function (req, res) {

    var cb = function (err) {
        if (err) {
            res.writeHeader(err[0]);
            res.end(err[1]);
        };
    };

    // Only allow post to endpoint
    if (req.url != endpoint)
        return cb([404, 'Not listening on endpoint ' + req.url]);

    if (req.method != 'POST')
        return cb([400, 'HTTP method must be post']);

    collectJson(req, function (err, json) {
        if (err)
            return cb([400, err]);

        if (json.ref != 'refs/heads/master')
            return cb([200, 'Skipping, not master']);

        if (!json.commits)
            return cb([400, 'No commits pushed, what?']);

        checkIsPullRequest(json, function (err, isPullRequest) {
            if (err)
                return cb([500, err]);

            if (isPullRequest)
                return cb([200, 'Good looking pull request you have there!']);

            var repoOwner = json.repository.owner.name,
                repoName = json.repository.name,
                shortRef = json.ref.substr('refs/'.length),
                branchName = 'protected-' + Date.now();

            async.waterfall([
                // create a branch
                function (cb) {
                    console.log('Creating branch', branchName);
                    github.gitdata.createReference({
                        user: repoOwner,
                        repo: repoName,
                        ref: "refs/heads/" + branchName,
                        sha: json.after
                    }, cb);
                },

                // revert master
                function (ghRes, cb) {
                    console.log('Rewinding '+shortRef+' to', json.before);
                    github.gitdata.updateReference({
                        user: repoOwner,
                        repo: repoName,
                        ref: shortRef,
                        sha: json.before,
                        force: true // must force because this will be a rewind
                    }, cb);
                },

                // create PR
                function (ghRes, cb) {
                    console.log('Creating Pr from', branchName, 'to master');
                    github.pullRequests.create({
                        user: repoOwner,
                        repo: repoName,
                        base: json.ref,
                        head: branchName,
                        title: 'Attempted push to master by ' + json.pusher.name,
                        body: "This repository only allows additions to master by pull"
                            + " requests. Your push to master has automatically been rolled"
                            + " back and put into this branch."
                    }, cb);
                }
            ], function (err, done) {
                if (err) {
                    res.writeHeader(500);
                    res.end(JSON.stringify(err));
                } else {
                    res.end('Okay!');
                }
            });
        });
    });
}).listen(port, ip, function () {
    console.log('Listening on', ip, 'port', port);
});

function collectJson (req, cb) {
    if (req.headers['content-type'] != 'application/json') {
        cb('Content-type expected to be application/json', null);
        return;
    };

    var payload = '';
    req.on('data', function (buffer) {
        payload += buffer;
    });

    req.on('end', function () {
        try {
            var json = JSON.parse(payload);
        } catch (e) {
            cb('Invalid JSON provided', null);
            return;
        }
        cb(null, json);
    });
};

function checkIsPullRequest (json, cb) {
    var lastCommit = json.commits[json.commits.length - 1],
        regex = /^Merge pull request #\d+ from (.*)+/;

    cb(null, regex.test(lastCommit.message));
};
