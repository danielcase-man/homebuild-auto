#!/usr/bin/env bash
set -euo pipefail
# Load previous context
CONTEXT=$(cat .cline/context.json)
# Record this command
TIMESTAMP=$(date --iso-8601=seconds)
OP="$*"
UPDATED=$(echo "$CONTEXT" | jq --arg t "$TIMESTAMP" --arg o "$OP" \
  '.history += [{"time":$t, "op":$o}] | .lastOperation=$o')
echo "$UPDATED" > .cline/context.json
# Execute the actual command
"$@"
