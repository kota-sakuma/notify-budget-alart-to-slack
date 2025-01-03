#!/bin/bash

# Default values
readonly DEFAULT_FUNCTION_NAME="notify-budget-alert-to-slack"

# Read environment variables
readonly FUNCTION_NAME="${FUNCTION_NAME:-$DEFAULT_FUNCTION_NAME}"
readonly FIRESTORE_DATABASE_ID="${FIRESTORE_DATABASE_ID}"
readonly FIRESTORE_PROJECT_ID="${FIRESTORE_PROJECT_ID}"
readonly SLACK_CHANNEL="${SLACK_CHANNEL}"

# Usage function
usage() {
  echo "Usage: Set the following environment variables and run the script:"
  echo ""
  echo "  FUNCTION_NAME           The name of the Cloud Run Function (default: notify-budget-alert-to-slack)"
  echo "  FIRESTORE_DATABASE_ID   The Firestore database ID (required)"
  echo "  FIRESTORE_PROJECT_ID    The Firestore project ID (required)"
  echo "  SLACK_CHANNEL           The Slack channel name (required)"
  echo ""
  echo "Example:"
  echo "  FUNCTION_NAME=notify-budget-alert-to-slack \\"
  echo "  FIRESTORE_DATABASE_ID=budget-alert \\"
  echo "  FIRESTORE_PROJECT_ID=biz-toshiba-tec-dev \\"
  echo "  SLACK_CHANNEL=slack-app-test \\"
  echo "  ./deploy.sh"
  exit 1
}

# Validate required environment variables
if [[ -z "$FIRESTORE_DATABASE_ID" || -z "$FIRESTORE_PROJECT_ID" || -z "$SLACK_CHANNEL" ]]; then
  echo "Error: Missing required environment variables."
  usage
fi

# Deploy function
echo "Deploying Cloud Run Function: $FUNCTION_NAME"
gcloud functions deploy "$FUNCTION_NAME" \
  --gen2 \
  --runtime nodejs20 \
  --entry-point notifySlack \
  --trigger-topic budget-alert \
  --region asia-northeast1 \
  --set-env-vars LOG_EXECUTION_ID=true,SLACK_CHANNEL="$SLACK_CHANNEL",FIRESTORE_PROJECT_ID="$FIRESTORE_PROJECT_ID",FIRESTORE_DATABASE_ID="$FIRESTORE_DATABASE_ID" \
  --ingress-settings=internal-only \
  --memory 256MB \
  --max-instances 100 \
  --timeout 60s \
  --service-account budget-alert-to-slack@biz-toshiba-tec-dev.iam.gserviceaccount.com \
  --set-secrets BOT_ACCESS_TOKEN=projects/biz-toshiba-tec-dev/secrets/budget-alert-slack-bot-user-oauth-token:1 \
  --source=./

# Check the result
if [[ $? -ne 0 ]]; then
  echo "Error: Failed to deploy Cloud Run Function $FUNCTION_NAME"
  exit 1
else
  echo "Cloud Run Function $FUNCTION_NAME deployed successfully."
fi
