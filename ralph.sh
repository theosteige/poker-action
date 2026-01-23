#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 <iterations>"
  exit 1
fi

for ((i=1; i<=$1; i++)); do
  echo "Iteration $i"
  echo "--------------------------------"

  result=$(claude -p "$(cat PROMPT.md)" --output-format text --dangerously-skip-permissions 2>&1) || true

  echo "$result"

  # Check if ALL tasks are complete
  if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
    echo ""
    echo "========================================"
    echo "All tasks complete after $i iterations."
    echo "========================================"
    exit 0
  fi

  # Check if this iteration completed successfully
  if [[ "$result" == *"<promise>ITERATION_DONE</promise>"* ]]; then
    echo ""
    echo "--- Iteration $i completed successfully ---"
    echo ""
    continue
  fi

  # Neither marker found - iteration may have gotten stuck
  echo ""
  echo "WARNING: Iteration $i did not produce a completion marker."
  echo "This may indicate an error or stuck state."
  echo "Continuing to next iteration..."
  echo ""
done

echo "Reached max iterations ($1)"
exit 1
