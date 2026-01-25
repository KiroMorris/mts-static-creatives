# MTS Static Creative Studio

**AI-Powered Apparel Creative Generator** by [Kiro Morris](https://myturtle.store)

Generate stunning social media ad creatives for apparel brands using AI. Upload a product image and get professional 9:16 ad creatives with AI-generated lifestyle imagery.

![Version](https://img.shields.io/badge/Version-1.18-violet)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **AI-Powered Hero Images** - Generate lifestyle shots of models wearing your product
- **Automatic Callout Generation** - Create detail/feature close-up shots
- **Drag & Drop Interface** - Easy product image upload
- **Multiple Style Presets** - Choose from various aesthetic styles
- **Custom Font System** - 9 font options for text overlays
- **Export Ready** - Download creatives in 9:16 format for social media

## Demo

Upload a flat product image (hoodie, sweatshirt, etc.) and the app will:
1. Generate a hero lifestyle image with a model wearing the product
2. Create 3 callout images (texture, fit, alternative angles)
3. Compose everything into a ready-to-post ad creative

---

## Quick Start (No Coding Required!)

### Step 1: Install Node.js (one-time setup)

Download and install Node.js from: https://nodejs.org/
- Click the big green **"LTS"** button
- Run the installer, click Next through everything

### Step 2: Get a Google Gemini API Key

Google gives you **free credits** to generate images, but you need to add a payment card first (you won't be charged for the free tier).

---

#### Part A: Get a Payment Card

You need a credit or debit card to create a Google Cloud account.

**Don't have a card?** Get a virtual Mastercard instantly:

👉 **[Get a Virtual Mastercard Here](https://app.card-y.com/register?code=JAGB-JSUL-VAMP)**

- Works online just like a real card
- Instant delivery
- Use it for Google and other services

---

#### Part B: Set Up Google Cloud Billing

1. Go to **Google Cloud Console**: https://console.cloud.google.com/
2. Sign in with your Google account
3. If prompted, accept the terms of service
4. Click the **navigation menu** (☰) top-left → **Billing**
5. Click **"Link a billing account"** or **"Create account"**
6. Enter your card details (the virtual card works here!)
7. Complete the setup

---

#### Part C: Get Your API Key

1. Go to **Google AI Studio**: https://aistudio.google.com/apikey
2. Sign in with the **same Google account**
3. Click **"Create API Key"**
4. Select **"Create API key in new project"**
5. Copy the key (starts with `AIza...`)
6. **Save it somewhere safe!** You'll need it in the next step.

---

#### Pricing Info:
- **Free tier**: ~500 image generations per day (plenty for most users!)
- **Paid tier**: ~$0.04 per image if you exceed free limits
- Google only charges if you go over the free limit

### Step 3: Run the App

**Windows:** Double-click `START-WINDOWS.bat`

**Mac:** Double-click `START-MAC.command`
- If Mac says "unidentified developer": Right-click → Open → Click "Open"

The script will:
- Ask for your API key (first time only)
- Install everything automatically
- Start the app

### Step 4: Use the App

Open your browser to: **http://localhost:3000**

---

## For Developers

### Prerequisites

- Node.js 18+
- Google Gemini API key

### Manual Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/apparel-creative-generator.git
cd apparel-creative-generator
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with your API key:
```bash
GOOGLE_AI_API_KEY=your_gemini_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Framework:** Next.js 16
- **UI:** React 19, Tailwind CSS 4
- **State Management:** Zustand
- **Image Processing:** Sharp
- **AI:** Google Gemini API

## Project Structure

```
src/
├── app/           # Next.js app router pages
├── components/    # React components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
├── store/         # Zustand state management
└── types/         # TypeScript types
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

**Kiro Morris**

- Instagram: [@kiro.morris](https://www.instagram.com/kiro.morris)
- Store: [myturtle.store](https://myturtle.store)
- Instagram: [@myturtle.store](https://www.instagram.com/myturtle.store)

---

Built with love for the apparel community
