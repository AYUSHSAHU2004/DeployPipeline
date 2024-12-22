# this will be runned by the aws ecs
#first lets get the git respositry url present in the env
#and then export it so that it will be available in the entire shell session of ecs

export GIT_REPO_URL="$GIT_REPO_URL"

# now lets clone as the env is available

git clone "$GIT_REPO_URL" /home/app/output

#execute the script
exec node server.js