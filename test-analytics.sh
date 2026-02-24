#!/bin/bash
# test-analytics.sh — Invoke each AskAneeq tool via MCP and fire analytics events.
#
# PROMPTS TO PASTE IN CHATGPT (to invoke each tool):
#   ask_about_aneeq:  "What's Aneeq's overview?" / "What's his experience?" / "His projects?" / "His skills?" / "His education?" / "How do I contact him?" / "What does he do for fun?" / "What's his current role?"
#   get_resume:       "Can I see Aneeq's resume?" / "I need Aneeq's full resume."
#   search_projects:  "Does Aneeq have any projects using React?" / "Projects related to APIs?"
#   ask_anything:     "What does Aneeq think about remote work?" / "Anything about accessibility?"
#   get_availability: "How can I book time with Aneeq?" / "Link to schedule a call with Aneeq."
#   compare_skills:   "Compare Aneeq's level in Python, Go, and TypeScript." / "React vs Vue?"
#   get_recommendations: "What do people say about working with Aneeq?" / "Any testimonials?"

BASE="${BASE_URL:-http://localhost:8000/mcp}"
HEADERS=(-H "Content-Type: application/json" -H "Accept: application/json, text/event-stream")

call() {
  curl -s -X POST "${HEADERS[@]}" --data-raw "$1" "$BASE" | jq -r '.result.content[0].text // .error // .'
}

echo "--- Invoking each tool (MCP) ---"

echo -n "ask_about_aneeq (overview) ... "
call '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"ask_about_aneeq","arguments":{"category":"overview"}},"id":1}'
echo ""

echo -n "ask_about_aneeq (skills) ... "
call '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"ask_about_aneeq","arguments":{"category":"skills"}},"id":2}'
echo ""

echo -n "get_resume (summary) ... "
call '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"get_resume","arguments":{"format":"summary"}},"id":3}'
echo ""

echo -n "get_resume (full) ... "
call '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"get_resume","arguments":{"format":"full"}},"id":4}'
echo ""

echo -n "search_projects ... "
call '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"search_projects","arguments":{"technology":"React"}},"id":5}'
echo ""

echo -n "ask_anything ... "
call '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"ask_anything","arguments":{"query":"remote work"}},"id":6}'
echo ""

echo -n "get_availability ... "
call '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"get_availability","arguments":{}},"id":7}'
echo ""

echo -n "compare_skills ... "
call '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"compare_skills","arguments":{"skills":["Python","TypeScript","React"]}},"id":8}'
echo ""

echo -n "get_recommendations ... "
call '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"get_recommendations","arguments":{}},"id":9}'
echo ""

echo "--- Firing analytics events ---"

call '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"track_analytics","arguments":{"tool":"ask_about_aneeq","category":"skills","query":"What are his skills?"}},"id":10}'
call '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"track_analytics","arguments":{"tool":"ask_about_aneeq","category":"experience","query":"Work history"}},"id":11}'
call '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"track_analytics","arguments":{"tool":"search_projects","category":"projects","query":"React projects"}},"id":12}'
call '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"track_analytics","arguments":{"tool":"get_resume","query":"Full resume"}},"id":13}'
call '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"track_analytics","arguments":{"tool":"ask_about_aneeq","category":"skills","query":"TypeScript experience"}},"id":14}'
call '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"track_analytics","arguments":{"tool":"compare_skills","query":"React developer comparison"}},"id":15}'
call '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"track_analytics","arguments":{"tool":"get_availability","query":"Book a call"}},"id":16}'

echo ""
echo "--- Done. Check http://localhost:8000/admin for analytics ---"
