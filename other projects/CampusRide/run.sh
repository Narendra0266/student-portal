#!/bin/bash
echo "Starting backend..."
cd server
npm run dev &
SERVER_PID=$!

echo "Starting frontend..."
cd ../client
npm run dev &
CLIENT_PID=$!

wait $SERVER_PID $CLIENT_PID
