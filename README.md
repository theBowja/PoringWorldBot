# PoringWorldBot
 snappening bot

 disclaimer. I am not the one who made poring.world

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
nohup node bot.js > poring.log 2>&1 &
tail -f poring.out
```
Use the 'exit' command when exiting out of ssh. If you just close out your command line, it might kill your application.

deleting the process
```
ps -ef | grep "node bot.js"
kill -9 [pid]
```
where pid is what you got from ps

