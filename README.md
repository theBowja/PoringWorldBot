# PoringWorldBot
 snappening bot

 read WIKI



https://discordapp.com/oauth2/authorize?client_id=597932863597576204&scope=bot&permissions=134336






# raspberry pi
updating from github
```
git fetch --all
git reset --hard origin/master
```
starting the bot
```
nohup node bot.js > poring.out &
tail -f poring.out
```
deleting the process
```
ps -ef | grep "node bot.js"
kill -9 [pid]
```
where pid is what you got from ps

