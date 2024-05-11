#!/bin/bash

# Read and load env from .dev.vars file

. ./.dev.vars

curl https://api.telegram.org/bot$BOT_TOKEN/setWebhook?url=$WEBHOOK_URL

# echo a new line
echo ""

curl https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo