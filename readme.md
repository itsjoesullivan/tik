# github issue utility.

##Install

Two steps: 
  1. Install via npm: `npm install -g tik-cli`
  2. ensure you've got a GITHUB_TOKEN in your path. See [Personal Access Tokens](https://github.com/settings/applications), then do something like `export GITHUB_TOKEN="{token}"` in your bash profile.


##Usage

###Summarize

`tik 1` Summarize ticket #1

###List

`tik ls` list open tickets, using format: `#{index}: {title} - {author} label1 label2...`


###Labels

`tik 1 -l bug` Toggle 'bug' label for ticket #1

`tik 1 --add-label bug` Add 'bug' label for ticket #1

`tik 1 --remove-label bug` Remove 'bug' label for ticket #1
