_TikComplete ()
{
  local cur
  COMPREPLY=()
  cur=${COMP_WORDS[COMP_CWORD]}
  COMPREPLY=( $( tik plumbing ticket-numbers ) );
}
complete -F _TikComplete tik
