# check build
pnpm build
if [ $? -eq 0 ]; then
    git add .
    read -p "Please input commit message: " commit_msg
    git commit -m "$commit_msg"
    git push
else
    echo "Build failed, please check the error message"
fi
