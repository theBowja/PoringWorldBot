# PoringWorldBot
 This is a snappening bot that queries the first 40 popular snaps from poring.world every ten minutes and notifies an item to any subscribed request a user makes. Disclaimer: I am not the developer of poring.world.

You can use the following link to add this bot to your server. The bot is hosted from my Raspberry Pi in my apartment so I make no guarantees on its uptime because my Spectrum internet likes to crap out.
https://discordapp.com/oauth2/authorize?client_id=597932863597576204&scope=bot&permissions=134336
## Permissions
- **View Audit Log**: This is a required permission. The bot runs on an internal permission level system. The bot uses the audit log to find the user who added this bot and give them an internal admin permission level in order to tell the bot to listen in a channel. 
- **Read Messages**: This is a required permission.
- **Send Messages**: This is a required permission.
- **Mention @everyone, @here, and All Roles**: This isn't required. If you give this permission to the bot, then internal admins can assign requests to roles so the bot can ping roles.
- **Add Reactions**: I dunno if this is required lol.

## Quick setup
1. Use the link provided above to add the bot to your server. Be sure to include all the required permissions.
2. Create a new channel. A few requests can create a lot of spam throughout the day that you probably don't want in your main channels.
3. Say `!pwb watch` in that channel and the bot will start listening to requests in that channel.
4. Consult [this page](https://github.com/theBowja/PoringWorldBot/wiki/Parameters-for-adding-a-request) for help on constructing a request.
5. Consult [this page](https://github.com/theBowja/PoringWorldBot/wiki/Command-reference) for detailed commands and usage.


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

