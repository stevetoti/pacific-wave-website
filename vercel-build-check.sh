#!/bin/bash
# Vercel Ignored Build Step Script
# Skips builds when only documentation or non-code files change

# Get the diff between current commit and previous
DIFF_FILES=$(git diff --name-only HEAD^ HEAD 2>/dev/null)

# If git diff fails (no previous commit), allow build
if [ $? -ne 0 ]; then
  echo "✅ No previous commit found - allowing build"
  exit 1
fi

# Check if there are any files changed
if [ -z "$DIFF_FILES" ]; then
  echo "⏭️  No files changed - skipping build"
  exit 0
fi

# Filter out documentation and non-code changes
CODE_CHANGES=$(echo "$DIFF_FILES" | grep -v -E '\.(md|txt)$|^(docs|README|LICENSE|\.github/.*\.md)')

# If only docs changed, skip build
if [ -z "$CODE_CHANGES" ]; then
  echo "⏭️  Only documentation changed - skipping build"
  exit 0
fi

# Allow build if code files changed
echo "✅ Code changes detected - proceeding with build"
exit 1
