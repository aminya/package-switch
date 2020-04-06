#!/usr/bin/env

echo "$OSTYPE"
if [[ "$OSTYPE" == 'msys' ]]; then
	echo 'OS is Windows. Setting npm script-shell to bash'
	if test -f 'C:/Program Files/git/bin/bash.exe'; then
		npm config set script-shell 'C:/Program Files/git/bin/bash.exe'
		echo 'script-shell set to C:/Program Files/git/bin/bash.exe'
	elif test -f 'C:/Program Files (x86)/git/bin/bash.exe'; then
		npm config set script-shell 'C:/Program Files (x86)/git/bin/bash.exe'
		echo 'script-shell set to C:/Program Files (x86)/git/bin/bash.exe'
	else
		error_exit 'git is not installed!'
	fi
fi


if test -f '.gitignore'; then
  git mv .gitignore .gitignore.back
	npm run build
	git add -- ./lib
	git commit -m 'Add built files' -- ./lib
	git mv .gitignore.back .gitignore
else
	error_exit '.gitignore does not exist!'
fi
