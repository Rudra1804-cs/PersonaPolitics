# Persona Politics – Local Edition

A presidential simulation game where you make policy decisions, complete precision challenges, and manage your approval, power, and standing stats. Powered entirely by local Ollama AI (Mistral) with no cloud dependencies.

## Features

- **Presidential Stats Management**: Track Approval, Power, and Standing (0-100)
- **Policy Decisions**: Choose from Infrastructure, Military, and Justice policies
- **Precision Slider Mini-Game**: 4-round challenge with increasing difficulty
- **Local AI Integration**: Uses Ollama (Mistral) for dynamic policy outcomes
- **Win/Lose Conditions**: Reach 70+ in all stats to win, or hit 0 to lose

## Prerequisites

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **Ollama** - [Install Ollama](https://ollama.ai/)
3. **Mistral Model** - Pull the model:
   \`\`\`bash
   ollama pull mistral
   \`\`\`

## Verify Ollama Installation

Check that Ollama is running and the model is available:

\`\`\`bash
curl http://127.0.0.1:11434/api/tags
\`\`\`

You should see `mistral` in the list of models.

## Installation

1. **Clone or download this project**

2. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

3. **Create environment file**:
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`

4. **Configure environment variables** (optional):
   
   The defaults work for standard Ollama installations:
   \`\`\`env
   OLLAMA_URL=http://127.0.0.1:11434/api/generate
   OLLAMA_MODEL=mistral
   \`\`\`

## Running the Game

1. **Start Ollama** (if not already running):
   \`\`\`bash
   ollama serve
   \`\`\`

2. **Start the development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Open your browser**:
   \`\`\`
   http://localhost:3000
   \`\`\`

## How to Play

1. **View Your Stats**: Monitor Approval, Power, and Standing at the top-left
2. **Choose a Policy**: Click "Approve" or "Reject" on any policy card
3. **Win the Challenge**: Complete the 4-round precision slider mini-game
   - Stop the moving marker inside the green target
   - You can miss up to 2 times
   - Difficulty increases each round
4. **See the Results**: Stats update based on AI-generated outcomes
5. **Win or Lose**:
   - **Win**: Get all stats to 70+ (Re-elected!)
   - **Lose**: Any stat hits 0 (One-Term Wonder)

## Game Mechanics

### Precision Slider
- **4 Rounds** with increasing difficulty
- **Target shrinks** each round
- **Speed increases** each round
- **Jitter effect** on HARD difficulty
- **2 misses allowed** before failure

### AI Integration
- Server-side Ollama calls (no browser exposure)
- JSON schema enforcement with few-shot examples
- Fallback responses if AI is unavailable
- Witty advisor comments for each decision

## Troubleshooting

### Ollama Not Running
If you see neutral stat changes (0/0/0), Ollama might not be running:
\`\`\`bash
ollama serve
\`\`\`

### Model Not Found
Pull the Mistral model:
\`\`\`bash
ollama pull mistral
\`\`\`

### Port Conflicts
If port 3000 is in use, specify a different port:
\`\`\`bash
npm run dev -- -p 3001
\`\`\`

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Zustand** (state management)
- **Zod** (schema validation)
- **Ollama** (local LLM)

## Privacy & Security

- ✅ **100% Local**: No external API calls except to your local Ollama
- ✅ **No Cloud LLMs**: No OpenAI, Anthropic, or other cloud services
- ✅ **Server-Side AI**: Browser never directly calls Ollama
- ✅ **Open Source**: Mistral model is open source

## License

MIT

## Credits

Built with v0 by Vercel
