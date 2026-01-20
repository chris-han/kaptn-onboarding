# KAPTN Onboarding - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
cd kaptn-onboarding
pnpm install
```

### Step 2: Run Development Server
```bash
pnpm run dev
```

### Step 3: Open Browser
Navigate to: http://localhost:3000

---

## 🎮 What You'll Experience

### Phase 1: Entrance (10 seconds)
- Bridge calibration prompt
- Sets ceremonial tone

### Phase 2: Brief (15 seconds)
- Game philosophy
- Pattern recognition framing

### Phase 3: Five Scenarios (3-5 minutes)
Each scenario tests a different protocol:
- **K** - How you approach unknown signals
- **T** - How you resolve conflicting data
- **P** - How you prioritize multiple paths
- **A** - How you handle execution moments
- **N** - How you respond to course deviation

### Phase 4: Captain's Oath (45 seconds)
- Ceremonial commitment
- Core philosophy statement

### Phase 5: Processing (5 seconds)
- Protocol activation sequence
- KAPTN logo animation

### Phase 6: Your Profile (1-2 minutes)
- Decision style results
- No judgment, only patterns
- Five dimensional profile

### Phase 7: Sisko Quote (30 seconds)
- Philosophical anchor
- Mission context

### Phase 8: Welcome (30 seconds)
- Final activation
- Command assumption

**Total Time: 8-12 minutes**

---

## 🎨 Key Features

✅ **Fully Responsive** - Works on desktop, tablet, mobile
✅ **Smooth Animations** - Framer Motion powered
✅ **TypeScript** - Full type safety
✅ **Bridge Theme** - Consistent aesthetic
✅ **No Judgments** - Pattern recognition only
✅ **Data Ready** - Structured output for backend

---

## 📊 Technical Details

### Built With
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance
- First Contentful Paint: <1s
- Largest Contentful Paint: <2s
- Time to Interactive: <3s

---

## 🔧 Customization Points

### Easy Customizations (No coding required)
Edit `lib/gameData.ts`:
- Scenario text
- Option descriptions
- Profile descriptions
- Oath text

### Moderate Customizations (Some coding)
Edit component files:
- Animation timings
- Transition speeds
- Layout adjustments

### Advanced Customizations (Full control)
Edit configuration files:
- Color schemes (`tailwind.config.ts`)
- Typography (`globals.css`)
- Game flow logic (`app/page.tsx`)

---

## 💾 Data Output

After completion, the game generates:

```json
{
  "profile": {
    "K": "ACTIVE_EXPLORER",
    "T": "RAPID_UPDATER",
    "P": "FOCUSED_NAVIGATOR",
    "A": "MOMENTUM_DRIVER",
    "N": "QUICK_RECALIBRATOR"
  },
  "responses": [
    {
      "protocol": "K",
      "selectedOption": "SCAN",
      "timestamp": 1705680000000
    }
    // ... 4 more
  ],
  "timestamp": 1705680500000
}
```

This data should be sent to your backend API to:
1. Initialize user's OAS (Ontological Alignment Score)
2. Configure CFR (Counterfactual Reasoning) system
3. Set initial strategy recommendation weights
4. Store decision pattern history

---

## 🚨 Troubleshooting

### Port 3000 already in use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or run on different port
npm run dev -- -p 3001
```

### Animations not smooth
- Ensure hardware acceleration is enabled in browser
- Check if running on lower-end device
- Consider reducing animation complexity in production

### TypeScript errors
```bash
# Regenerate type definitions
npm run build
```

---

## 📈 Production Deployment

### Build for Production
```bash
npm run build
npm start
```

### Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Other Platforms
The app is a standard Next.js app and can be deployed to:
- Vercel
- Netlify
- AWS Amplify
- Digital Ocean
- Any Node.js hosting

---

## 🎯 Next Steps

After successful testing:

1. **Backend Integration**
   - Create API endpoint to receive profile data
   - Store in user database
   - Link to main KAPTN system

2. **Analytics**
   - Track completion rate
   - Monitor average session time
   - Analyze pattern distributions

3. **A/B Testing**
   - Test different scenario phrasings
   - Optimize animation timings
   - Refine profile descriptions

4. **User Feedback**
   - Add optional feedback form
   - Track user sentiment
   - Iterate based on responses

---

## 📞 Support

For issues or questions:
- Check the main README.md
- Review component documentation
- Inspect browser console for errors

---

**Welcome aboard, Captain. The unknown awaits.**
