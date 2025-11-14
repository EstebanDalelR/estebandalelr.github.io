# Open PRs and Available Tools

## Summary
- **Total Open PRs**: 14
- **Main Routes**: 2
- **Creative Tools**: 5
- **Learning Tools**: 7
- **Total Routes After Merge**: 17 (2 main + 15 tools)

---

## Open Pull Requests (14 Total)

### Main Routes & Apps

#### 1. Book Feel Design 📖
- **Branch**: `claude/book-feel-design-011CUqXfmEEWET5vv51Nc5P5`
- **Route**: `/` (home page)
- **Description**: Home page redesign with leather-bound book aesthetic
- **Features**:
  - Leather-bound book design with realistic textures
  - Interactive page-turning animations (800ms transitions)
  - 3D perspective effects (2000px)
  - Radial gradient background (#3a2f2f to #1a1410)
  - Multi-page navigation system
- **Files Modified**: ❌ Deleted: `app/deep/page.tsx`, `app/tools/imageTrace/page.tsx` | ✏️ Modified: `app/page.tsx`, `next-env.d.ts`

#### 2. Money Route - Group Expense Tracker 💰
- **Branch**: `claude/create-money-route-011CUsE1o3r4PdahgFMjAXnF`
- **Route**: `/money`
- **Description**: Full-featured group expense tracking and bill splitting
- **Features**:
  - Friend management (add/remove)
  - Expense tracking with description, amount, payer, split participants
  - Smart splitting & automatic balance calculation
  - Settlement recommendations (optimized payment suggestions)
  - localStorage persistence
  - Timestamped expense history
- **UI**: Emerald/teal gradient (from-emerald-50 to-teal-50)
- **Files Added**: ➕ `app/money/page.tsx`

---

### Creative Tools

#### 3. Embroidery Trace Uploader 🧵
- **Branch**: `claude/embroidery-trace-uploader-011CUryUqPjtiA5CMGs5EVWC`
- **Route**: `/tools/embroideryTracer`
- **Description**: Convert images to SVG traces for embroidery machines
- **Features**:
  - **Three Modes**: Color trace (16 colors) | Monochrome (2 colors) | Line art (outlines)
  - Drag-and-drop upload
  - SVG downloads for each mode
  - ImageTracer.js integration
  - Scalable vector output
- **Technology**: `imagetracerjs` library
- **Files**: ❌ Deleted: `app/deep/page.tsx`, `app/tools/imageTrace/page.tsx` | ➕ Added: `app/tools/embroideryTracer/page.tsx` | ✏️ Modified: `package.json`

#### 4. Paint by Numbers Generator 🎨
- **Branch**: `claude/paint-by-numbers-upload-011CUryPYWrSAPUi2jGU57iM`
- **Route**: `/tools/paintByNumbers`
- **Description**: Convert images into paint-by-numbers artwork
- **Features**:
  - K-means color quantization (4-12 colors)
  - Adjustable color count slider
  - Region detection with flood fill algorithm
  - Numbered regions on white canvas
  - Black borders between color areas
  - Color palette display
  - PNG download
- **Algorithm**: K-means clustering, 4-connected flood fill, edge detection
- **UI**: Purple/blue gradient (from-purple-50 to-blue-50)
- **Files**: ❌ Deleted: `app/deep/page.tsx`, `app/tools/imageTrace/page.tsx` | ➕ Added: `app/tools/paintByNumbers/page.tsx`

#### 5. QR Code Generator 📱
- **Branch**: `claude/placeholder-task-011CUtnnW6bz81rNe2e6Hj59`
- **Route**: `/tools/qr`
- **Description**: Generate customizable QR codes
- **Features**:
  - Text/URL/contact/WiFi credentials support
  - Size control (128-512px)
  - Error correction levels (L/M/Q/H: 7%/15%/25%/30%)
  - Custom foreground & background colors
  - Real-time preview
  - Download PNG & copy to clipboard
  - Statistics display
- **Technology**: `qrcode` npm package
- **UI**: Dark gray gradient (from-gray-900 via-gray-800 to-gray-900)
- **Files**: ➕ Added: `app/tools/qr/page.tsx` | ✏️ Modified: `package.json`

#### 6. Video Converter 🎬
- **Branch**: `claude/add-video-converter-tool-01Axkt5uw7M4S8RShEoEj3j5`
- **Route**: `/tools/videoConverter`
- **Description**: Convert videos between different formats
- **Features**:
  - FFmpeg.js integration for client-side conversion
  - Multiple format support (MP4, AVI, MOV, WebM, etc.)
  - Auto-detect input format
  - Progress bar during conversion
  - Drag-and-drop upload
  - Download converted video
- **Technology**: `@ffmpeg/ffmpeg` library
- **Files**: ➕ Added: `app/tools/videoConverter/page.tsx`

#### 7. Video Editor - Image to Video 🎞️
- **Branch**: `claude/video-editor-upload-011CUvyhhKhMohJ7PMVGJQoU`
- **Route**: `/tools/videoEditor`
- **Description**: Create videos from image sequences
- **Features**:
  - Upload multiple images
  - Drag-and-drop reordering
  - Adjustable FPS (frames per second)
  - Format selection (MP4, WebM, etc.)
  - Image preview grid
  - FFmpeg.js for client-side rendering
  - Progress tracking
- **Technology**: `@ffmpeg/ffmpeg`, `@ffmpeg/util`
- **Files**: ➕ Added: `app/tools/videoEditor/page.tsx`

---

### Learning Tools

#### 8. ASL Learning Tool 🤟
- **Branch**: `claude/create-asl-learning-tool-01TiAGNToDknH6geXxxPtLFw`
- **Route**: `/tools/asl`
- **Description**: Learn American Sign Language alphabet and numbers
- **Features**:
  - **Three Modes**: Reference guide | Flashcards | Quiz
  - Complete ASL alphabet (A-Z)
  - Numbers (0-9) with toggle option
  - Emoji representations
  - Detailed descriptions for each sign
  - Score tracking in quiz mode
  - Smart card rotation (prevents repeats)
- **Content**: 26 letters + 10 numbers with descriptions
- **Files**: ➕ Added: `app/tools/asl/page.tsx`

#### 9. Braille Learning Tool ⠃
- **Branch**: `claude/create-braille-learning-tool-01X5uG8nV9zbiF6vUMzxTbHo`
- **Route**: `/tools/braille`
- **Description**: Learn and translate Braille
- **Features**:
  - Text to Braille translator
  - Braille to text translator
  - Interactive Braille cell display
  - Visual dot patterns (which dots are filled)
  - Alphabet, numbers, and punctuation support
  - Real-time bidirectional translation
- **Content**: Complete Braille alphabet, numbers 0-9, common punctuation
- **Files**: ➕ Added: `app/tools/braille/page.tsx`

#### 10. Morse Code Learning Tool ▄▄▄ ▄ ▄ ▄
- **Branch**: `claude/create-morse-learning-tool-01MkFnWJ729R46wjMmL162Fq`
- **Route**: `/tools/morse`
- **Description**: Learn and translate Morse code with audio
- **Features**:
  - Text to Morse converter
  - Morse to text decoder
  - **Audio playback** of Morse code (beeps)
  - Adjustable playback speed
  - Interactive alphabet reference
  - Support for letters, numbers, and punctuation
  - Web Audio API for sound generation
- **Content**: Complete Morse alphabet, numbers, punctuation
- **Files**: ➕ Added: `app/tools/morse/page.tsx`

#### 11. Piano Learning Tool 🎹
- **Branch**: `claude/create-piano-learning-tool-0193b7x28nSerxKU89xn185v`
- **Route**: `/tools/piano`
- **Description**: Interactive virtual piano with learning features
- **Features**:
  - **3 octaves** of piano keys (C3-B5)
  - Keyboard shortcuts (A-M keys map to piano)
  - Common chords library (C Major, D Minor, etc.)
  - Pre-loaded melodies ("Twinkle Twinkle", "Mary Had a Little Lamb")
  - **Web Audio API** for realistic piano sounds
  - Visual note names toggle
  - Key highlighting during play
  - Touch support for mobile
- **Content**: 36 keys, 9 chords, 2 melodies
- **Files**: ➕ Added: `app/tools/piano/page.tsx`

#### 12. Portuguese Learning Tool 🇵🇹🇧🇷
- **Branch**: `claude/create-portuguese-learning-tool-01NSfk3EYjFtFStyzgKVpRph`
- **Route**: `/tools/portuguese`
- **Description**: Learn Portuguese vocabulary and verbs
- **Features**:
  - **Four Modes**: Vocabulary | Verbs | Phrases | Quiz
  - **5 Categories**: Common words, Food, Colors, Numbers, Greetings
  - Verb conjugations (eu, tu, ele, nós, vós, eles)
  - Common verbs (Ser, Estar, Ter, Fazer, etc.)
  - Flashcard system
  - Quiz with scoring
- **Content**: 50+ vocabulary words, verb conjugations, common phrases
- **Files**: ➕ Added: `app/tools/portuguese/page.tsx`

#### 13. Swedish Learning Tool 🇸🇪
- **Branch**: `claude/create-swedish-learning-tool-01QLpVyzLKmT8oezmQrXxVaa`
- **Route**: `/tools/swedish`
- **Description**: Learn Swedish vocabulary with pronunciation
- **Features**:
  - **Two Modes**: Flashcards | Quiz
  - **Categories**: Greetings, Numbers, Common Phrases, Food & Drink, Time & Days, Common Words
  - Pronunciation guides (phonetic spelling)
  - Flashcard flip animation
  - Quiz with instant feedback
  - Score tracking (correct/total)
  - Category filtering
- **Content**: 50+ words with Swedish, English, and pronunciation
- **Files**: ➕ Added: `app/tools/swedish/page.tsx`

#### 14. Cursive Writing Learning Tool ✍️
- **Branch**: `claude/tools-cursive-learning-0173ApwHCkFEgkyjTeNDj9mN`
- **Route**: `/tools/cursive`
- **Description**: Practice cursive handwriting
- **Features**:
  - Interactive alphabet selector (a-z, A-Z)
  - **Canvas drawing area** for practice
  - Guide lines (toggle on/off)
  - Uppercase/lowercase toggle
  - Letter display in cursive font
  - Free-form text practice
  - Clear canvas function
  - Mouse/touch drawing support
- **UI**: Cursive font for letter display, lined practice area
- **Files**: ➕ Added: `app/tools/cursive/page.tsx`

---

## Currently Available Tools (Already Merged)

### 1. Text Diff Tool ✅
- **Route**: `/tools/textDiff`
- **Location**: `app/tools/textDiff/page.tsx`
- **Description**: Side-by-side text comparison
- **Features**: Dual text areas | Real-time diff | Line highlighting (red) | Line numbers | Copy buttons | Statistics
- **Status**: Merged

### 2. Laser Etching Image Tracer ✅
- **Route**: `/tools/imageTrace`
- **Location**: `app/tools/imageTrace/page.tsx`
- **Description**: Convert images to traced outlines for laser etching
- **Features**: Sobel edge detection | Threshold control (0-255) | Edge strength (0.5-5.0) | Color inversion | Real-time processing | Drag-and-drop | Before/after view | PNG download
- **UI**: Dark gradient (from-gray-900 via-gray-800 to-gray-900)
- **Technology**: Canvas-based with custom Sobel implementation
- **Status**: Merged

---

## Tools Index Page

### `/tools` - Tools Landing Page ✅
- **Location**: `app/tools/page.tsx`
- **Status**: Available
- **Description**: Central hub for all tools
- **Features**:
  - Available tools section (active tools with direct links)
  - Coming soon section (tools under development)
  - Tool cards with icons, descriptions, status, features
  - Responsive grid (1-3 columns)
  - Hover effects & smooth transitions
  - Status badges (Available/Coming Soon)
- **UI**: Slate/blue gradient (from-slate-50 to-blue-50)

---

## Summary After All PRs Merge

### Total Routes: 17

#### Main Routes (2)
1. `/` - Home page with interactive book design
2. `/money` - Group expense tracker

#### Tools Hub (1)
3. `/tools` - Tools index/landing page

#### Creative Tools (7)
4. `/tools/textDiff` - Text comparison ✅
5. `/tools/imageTrace` - Laser etching tracer ✅
6. `/tools/embroideryTracer` - Embroidery SVG generator
7. `/tools/paintByNumbers` - Paint-by-numbers converter
8. `/tools/qr` - QR code generator
9. `/tools/videoConverter` - Video format converter
10. `/tools/videoEditor` - Image sequence to video

#### Learning Tools (7)
11. `/tools/asl` - American Sign Language
12. `/tools/braille` - Braille translation
13. `/tools/morse` - Morse code with audio
14. `/tools/piano` - Interactive piano
15. `/tools/portuguese` - Portuguese vocabulary
16. `/tools/swedish` - Swedish vocabulary
17. `/tools/cursive` - Cursive writing practice

---

## Dependencies to be Added

### Creative Tools
- **`imagetracerjs`** - For embroidery tracing
- **`qrcode`** - For QR code generation
- **`@ffmpeg/ffmpeg`** - For video conversion and editing
- **`@ffmpeg/util`** - FFmpeg utilities

---

## Technology Stack

- **Framework**: Next.js with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Image Processing**: Canvas API, ImageTracer.js
- **Video Processing**: FFmpeg.js (WASM)
- **Audio**: Web Audio API (for Piano and Morse code)
- **Data Storage**: localStorage (for /money route)
- **State Management**: React useState/useEffect hooks

---

## Notes

- Some PRs delete `app/deep/page.tsx` and `app/tools/imageTrace/page.tsx` - may cause merge conflicts
- Several PRs delete `OPEN_PRS_AND_TOOLS.md` and `app/tools/page.tsx` - created before those files existed
- The book design PR significantly changes the home page design
- All tools use **client-side processing** (no server required)
- All tools feature modern, gradient-based UI designs
- Most tools include drag-and-drop file upload
- Learning tools provide multiple modes (reference, flashcards, quiz)
- FFmpeg-based tools load library on-demand from CDN
- Audio features use Web Audio API for sound generation

---

**Last Updated**: 2025-11-14
**Repository**: estebandalelr.github.io
**Current Branch**: claude/list-open-prs-tools-011CUtorMGX5X9g4GSu8VZt5
**Latest Addition**: 9 new learning and creative tools added to documentation
