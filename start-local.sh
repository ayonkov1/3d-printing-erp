#!/bin/bash

# Local development script to start DB in Docker, and backend/frontend locally

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting 3D Printing ERP locally...${NC}"

# Function to cleanup background processes on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down services...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${YELLOW}💾 Stopping Docker database...${NC}"
    docker compose stop db 2>/dev/null
    exit 0
}

# Set trap to cleanup on CTRL+C or script exit
trap cleanup SIGINT SIGTERM

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Start PostgreSQL in Docker
echo -e "${YELLOW}🐘 Starting PostgreSQL database in Docker...${NC}"
docker compose up -d db
sleep 2  # Give DB time to start
echo -e "${GREEN}✅ Database started${NC}"

# Start backend
echo -e "${YELLOW}📦 Starting backend server...${NC}"
(cd "$SCRIPT_DIR/backend" && source .venv/bin/activate && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000) &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"

# Start frontend
echo -e "${YELLOW}🎨 Starting frontend dev server...${NC}"
(cd "$SCRIPT_DIR/frontend" && npm run dev) &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Services are running!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "  Database: ${YELLOW}localhost:5432${NC} (Docker)"
echo -e "  Backend:  ${YELLOW}http://localhost:8000${NC}"
echo -e "  API Docs: ${YELLOW}http://localhost:8000/docs${NC}"
echo -e "  Frontend: ${YELLOW}http://localhost:5173${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Wait for both processes
wait
