# PoringWorldBot
 This is a snappening bot that queries the first 40 popular snaps from poring.world every ten minutes and notifies an item to any subscribed request a user makes. Disclaimer: I am not the developer of poring.world.

You can use the following link to add this bot to your server. The bot is hosted from my Raspberry Pi in my apartment so I make no guarantees on its uptime because my Spectrum internet likes to crap out.
https://discordapp.com/oauth2/authorize?client_id=597932863597576204&scope=bot&permissions=134336
# Permissions
- **View Audit Log**: This is a required permission. The bot runs on an internal permission level system.
- **Read Messages**: This is a required permission.
- **Send Messages**: This is a required permission.
- **Mention @everyone, @here, and All Roles**:
- **Add Reactions**: I dunno if this is required lol.





The following instructions are for myself and should not be relevant to you because they're TODOs zzz.

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

