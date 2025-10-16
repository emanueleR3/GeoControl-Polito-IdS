#!/bin/bash

# Flag file to track if initialization has already been executed
INIT_FLAG="/app/.initialized"

# If this is the first execution, initialize
if [ ! -f "$INIT_FLAG" ]; then
    echo "First container execution - Initializing..."
    npm run create-root
    touch "$INIT_FLAG"
    echo "Initialization completed"
else
    echo "Container already initialized - Starting directly"
fi

# Start the application
exec npm start