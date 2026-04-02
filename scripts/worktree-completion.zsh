# scripts/worktree-completion.zsh
#
# Autocompletion zsh pour worktree-new.sh et worktree-clean.sh.
#
# Installation — ajoute dans ~/.zshrc :
#   source /chemin/vers/roadmaps-faciles/scripts/worktree-completion.zsh

__worktree_git_branches() {
  local -a branches
  branches=(${(f)"$(git branch --format='%(refname:short)' 2>/dev/null)"})
  _describe 'branch' branches
}

_worktree_new() {
  _arguments -s \
    '1:branch:__worktree_git_branches' \
    '--port[Port custom]:port number:' \
    '--db[Crée une DB dédiée]' \
    '--from[Branche de base]:base branch:__worktree_git_branches' \
    '(--code --vscode)'{--code,--vscode}'[Ouvre VS Code]' \
    '--skip-claude[Ne pas lancer Claude]' \
    '(-h --help)'{-h,--help}'[Affiche l'\''aide]'
}

_worktree_clean() {
  _arguments -s \
    '1:branch:__worktree_git_branches' \
    '--drop-db[Supprime la DB dédiée]'
}

# Complétion pour l'appel direct (scripts/worktree-*.sh)
compdef _worktree_new worktree-new.sh
compdef _worktree_clean worktree-clean.sh

# Complétion pour les alias courants (si définis)
compdef _worktree_new worktree-new 2>/dev/null
compdef _worktree_clean worktree-clean 2>/dev/null
