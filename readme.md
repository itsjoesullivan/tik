# github issue utility.

##Install

Two steps: install via npm, then ensure you've got a GITHUB_TOKEN in your path

`npm install -g tik-cli`


##Usage

###Summary

`tik 1` Summarize ticket #1

###List

`tik ls` list open tickets


###Labels

`tik 1 -l bug` Toggle 'bug' label for ticket #1

`tik 1 --add-label bug` Add 'bug' label for ticket #1

`tik 1 --remove-label bug` Add 'bug' label for ticket #1
