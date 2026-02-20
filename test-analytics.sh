#!/bin/bash
BASE="http://localhost:8000/mcp"
HEADERS=(-H "Content-Type: application/json" -H "Accept: application/json, text/event-stream")

call() {
  curl -s -X POST "${HEADERS[@]}" --data-raw "$1" "$BASE" | jq -r '.result.content[0].text // .error'
}

echo "--- Firing analytics events ---"

call '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"track_analytics","arguments":{"tool":"ask_about_aneeq","category":"skills","query":"What are his skills?"}},"id":1}'
call '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"track_analytics","arguments":{"tool":"ask_about_aneeq","category":"experience","query":"Work history"}},"id":2}'
call '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"track_analytics","arguments":{"tool":"search_projects","category":"projects","query":"React projects"}},"id":3}'
call '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"track_analytics","arguments":{"tool":"get_resume","query":"Full resume"}},"id":4}'
call '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"track_analytics","arguments":{"tool":"ask_about_aneeq","category":"skills","query":"TypeScript experience"}},"id":5}'
call '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"track_analytics","arguments":{"tool":"compare_skills","query":"React developer comparison"}},"id":6}'
call '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"track_analytics","arguments":{"tool":"get_availability","query":"Book a call"}},"id":7}'

echo ""
echo "--- Done. Now visit http://localhost:8000/admin ---"
