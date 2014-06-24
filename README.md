# squirrel-server

[![build status](https://secure.travis-ci.org/imlucas/squirrel-server.png)](http://travis-ci.org/imlucas/squirrel-server)

node.js server for handling [squirrel update](https://github.com/Squirrel)
queries.

## Install

```
npm install -g squirrel-server &&
  squirrel-server --port 8080 --releases ./releases.json
```

## Test

```
npm test
```

## Upstart Config

```
# /etc/init/squirrel-server.conf
description "run squirrel server for autoupdates"
env port=8080
env releases=/etc/squirrel/releases.json

respawn
respawn limit 10 5

start on startup
stop on shutdown

script
    exec squirrel-server 2>&1
end script
```

## License

MIT
