# github issue utility.

##Install

Two steps: 
  1. Install via npm: `npm install -g tik-cli`
  2. ensure you've got a GITHUB_TOKEN in your path. See [Personal Access Tokens](https://github.com/settings/applications), then do something like `export GITHUB_TOKEN="{token}"` in your bash profile.


##Usage

Use from inside a git repo.

###Summarize

`tik 1` Summarize ticket #1

###Open / close tickets

Note: you can only open existing tickets.

`tik close 1` Close ticket #1

`tik open 1` Open ticket #1

###List

`tik ls` list open tickets, using format: `#{index}: {title} - {author} label1 label2...`

`tik ls -a` list all tickets

###Labels

`tik 1 -l bug` Toggle 'bug' label for ticket #1

`tik 1 --add-label bug` Add 'bug' label for ticket #1

`tik 1 --remove-label bug` Remove 'bug' label for ticket #1

###Comments

`tik 1 comment "Comment text"` Add a new comment to ticket #1
