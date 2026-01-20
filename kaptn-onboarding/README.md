# KAPTN Onboarding Game - Bridge Activation Protocol

A Next.js-based interactive onboarding experience that calibrates a user's decision-making style through the KAPTN framework (Knowledge, Action, Thesis, Prioritize, Navigation).

## 🚀 Features

- **5 Decision Scenarios** - Each mapped to one KAPTN protocol
- **Ceremonial Experience** - Bridge-themed UI with proper gravitas
- **Decision Style Profiling** - Non-judgmental pattern identification
- **Enterprise Bridge Waitlist** - Pre-launch access registration with SendGrid integration
- **5 Bridge Services** - COMPASS, GENESIS, LEDGER, SHIELD, ORACLE
- **Smooth Animations** - Using Framer Motion for polish
- **Responsive Design** - Works on all screen sizes
- **TypeScript** - Full type safety throughout

## 🛠️ Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS** - Custom bridge-themed styling
- **Framer Motion** - Smooth animations

## 📦 Installation

### Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env.local
```

2. Update `.env.local` with your credentials:
```
SENDGRID_API_KEY=your_actual_sendgrid_key
RECIPIENT_EMAIL=your-email@example.com
```

### Install and Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the game.

## 🎮 Game Flow

1. **Entrance** - Introduction and calibration prompt
2. **Brief** - Game rules and philosophy
3. **Scenarios** - 5 decision-making scenarios (K, T, P, A, N)
4. **Oath** - The Captain's Oath ceremony
5. **Waitlist** - KAPTN Enterprise Bridge pre-launch registration
6. **Processing** - Protocol activation sequence
7. **Profile** - Decision style results display
8. **Quote** - Sisko's philosophy on the unknown
9. **Welcome** - Final activation and command assumption

## 🎨 Design Principles

### Color Scheme
- **Background**: Pure black (#000000)
- **Text**: Pure white (#FFFFFF)
- **Protocol Colors**:
  - K (Knowledge): Blue (#0066FF)
  - T (Thesis): Purple (#6a0dad)
  - P (Prioritize): Gold (#FFD700)
  - A (Action): Red (#FF3333)
  - N (Navigation): Green (#00FF00)

### Typography
- **Monospace** - For system messages and labels
- **Sans-serif** - For content and descriptions

### Interaction
- Deliberate pacing with animation delays
- No pressure elements (timers, progress bars)
- Clear visual feedback without judgment
- Ceremonial transitions between phases

## 📁 Project Structure

```
kaptn-onboarding/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main game orchestrator
│   └── globals.css         # Global styles & Tailwind
├── components/
│   ├── Entrance.tsx        # Phase 0: Gate
│   ├── Brief.tsx           # Phase 1: Instructions
│   ├── ScenarioView.tsx    # Phase 2: Scenarios
│   ├── Oath.tsx            # Phase 3: Captain's Oath
│   ├── Processing.tsx      # Phase 4: Protocol activation
│   ├── Profile.tsx         # Phase 5: Results
│   ├── Quote.tsx           # Phase 6: Sisko quote
│   └── Welcome.tsx         # Phase 7: Final welcome
├── lib/
│   └── gameData.ts         # Scenarios and content
├── types/
│   └── game.ts             # TypeScript definitions
└── public/                 # Static assets

```

## 🔧 Configuration

### Tailwind Config
Custom bridge-themed colors and animations are defined in `tailwind.config.ts`.

### Game Data
All scenarios, descriptions, and content are centralized in `lib/gameData.ts` for easy editing.

## 📊 Data Collection

The game collects the following data per session:

```typescript
{
  profile: DecisionProfile,      // K-A-T-P-N pattern results
  responses: UserResponse[],     // Individual scenario choices
  timestamp: number              // Session completion time
}
```

This data can be:
- Sent to a backend API
- Stored in a database
- Used to initialize the main KAPTN system
- Used to calculate OAS (Ontological Alignment Score)

## 🎯 Integration Points

The onboarding game is designed to integrate with:

1. **CFR System** - Provides initial decision style context
2. **OAS Calculation** - Establishes baseline alignment score
3. **Strategy Recommendation** - Influences initial alternative ranking
4. **User Profile** - Stores long-term decision pattern data

## 🚢 Bridge Language

The entire experience uses consistent "bridge system" language:
- No conversational AI language
- System-level precision
- Mission-oriented framing
- Calm, authoritative tone

## 📝 Customization

### Adding New Scenarios
Edit `lib/gameData.ts` and add to the `scenarios` array:

```typescript
{
  id: "X",
  title: "Scenario Title",
  visual: "Visual description",
  context: `Context text`,
  question: "Question?",
  options: [...]
}
```

### Modifying Profile Descriptions
Update `protocolDescriptions` in `lib/gameData.ts` to customize the profile result text.

### Changing Colors
Edit `tailwind.config.ts` bridge color palette.

## 🎭 Philosophy

This is NOT:
- A personality test
- A gamified quiz
- An evaluation tool

This IS:
- A decision style mirror
- A ceremonial calibration
- A bridge qualification protocol
- A foundation for trust-building

## 📄 License

Proprietary - KAPTN System

## 🤝 Contributing

This is a proprietary project for the KAPTN system.

---

**"It is the unknown that defines our existence. We are constantly searching, not just for answers to our questions, but for new questions."**  
— Captain Benjamin Sisko
