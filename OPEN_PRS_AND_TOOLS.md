# Open PRs and Available Tools

## Open Pull Requests (5 Total)

### 1. Book Feel Design
- **Branch**: `claude/book-feel-design-011CUqXfmEEWET5vv51Nc5P5`
- **Status**: Open
- **Description**: Home page redesign with leather-bound book aesthetic
- **Features**:
  - Leather-bound book design with realistic textures
  - Interactive page-turning animations with 800ms transitions
  - 3D perspective effects (2000px perspective)
  - Radial gradient background (brown/dark tones: #3a2f2f to #1a1410)
  - Slow, realistic page-turn animations
  - Multi-page navigation system
- **Files Modified**:
  - ❌ Deleted: `app/deep/page.tsx`, `app/tools/imageTrace/page.tsx`
  - ✏️ Modified: `app/page.tsx`, `next-env.d.ts`
- **Route**: `/` (home page)

---

### 2. Money Route - Group Expense Tracker
- **Branch**: `claude/create-money-route-011CUsE1o3r4PdahgFMjAXnF`
- **Status**: Open
- **Route**: `/money`
- **Description**: Full-featured group expense tracking and splitting application
- **Features**:
  - **Friend Management**: Add/remove friends in expense group
  - **Expense Tracking**: Record expenses with description, amount, payer, and split participants
  - **Smart Splitting**: Automatic calculation of who owes whom
  - **Balance Display**: Real-time balance updates showing +/- amounts
  - **Settlement Recommendations**: Optimized payment suggestions to settle all debts
  - **Data Persistence**: localStorage integration for data preservation
  - **Expense History**: Timestamped expense list with full details
  - **Clear Data**: Option to reset all data
- **UI Theme**: Emerald/teal gradient (from-emerald-50 to-teal-50)
- **Files Added**:
  - ➕ `app/money/page.tsx`

---

### 3. Embroidery Trace Uploader
- **Branch**: `claude/embroidery-trace-uploader-011CUryUqPjtiA5CMGs5EVWC`
- **Status**: Open
- **Route**: `/tools/embroideryTracer`
- **Description**: Convert images to SVG traces for embroidery machines
- **Features**:
  - **Three Tracing Modes**:
    1. **Color Trace**: 16-color vectorization with color sampling
    2. **Monochrome Trace**: 2-color black and white conversion
    3. **Line Art**: Edge/outline detection only
  - **Image Upload**: Drag-and-drop or click to upload
  - **SVG Output**: Downloadable SVG files for each mode
  - **ImageTracer.js Integration**: Professional-grade image vectorization
  - **Scalable Output**: Vector files perfect for embroidery machines
  - **Multiple Downloads**: Separate downloads for each trace type
- **Technology**: Uses `imagetracerjs` library
- **Files Changed**:
  - ❌ Deleted: `app/deep/page.tsx`, `app/tools/imageTrace/page.tsx`
  - ➕ Added: `app/tools/embroideryTracer/page.tsx`
  - ✏️ Modified: `package.json` (added imagetracerjs dependency)

---

### 4. Paint by Numbers Generator
- **Branch**: `claude/paint-by-numbers-upload-011CUryPYWrSAPUi2jGU57iM`
- **Status**: Open
- **Route**: `/tools/paintByNumbers`
- **Description**: Convert any image into a paint-by-numbers artwork
- **Features**:
  - **K-means Color Quantization**: Reduces image to 4-12 colors
  - **Adjustable Color Count**: Slider to control number of colors (4-12)
  - **Region Detection**: Flood fill algorithm to identify color regions
  - **Numbered Regions**: Each region labeled with corresponding color number
  - **Border Drawing**: Black outlines between different color areas
  - **Color Palette**: Visual guide showing each color with its number
  - **White Canvas**: Clean white background for printing
  - **Download**: Export as PNG file
  - **Side-by-Side**: Original vs paint-by-numbers comparison
- **Algorithm Details**:
  - K-means clustering for color reduction
  - 4-connected flood fill for region detection
  - Edge detection for border drawing
  - Smart region center finding for number placement
- **UI Theme**: Purple/blue gradient (from-purple-50 to-blue-50)
- **Files Changed**:
  - ❌ Deleted: `app/deep/page.tsx`, `app/tools/imageTrace/page.tsx`
  - ➕ Added: `app/tools/paintByNumbers/page.tsx`

---

### 5. QR Code Generator
- **Branch**: `claude/placeholder-task-011CUtnnW6bz81rNe2e6Hj59`
- **Status**: Open
- **Route**: `/tools/qr`
- **Description**: Generate customizable QR codes for any text or URL
- **Features**:
  - **Input Support**: Text, URLs, contact info, WiFi credentials
  - **Size Control**: Adjustable from 128px to 512px (32px steps)
  - **Error Correction Levels**:
    - L: Low (7% recovery)
    - M: Medium (15% recovery)
    - Q: Quartile (25% recovery)
    - H: High (30% recovery)
  - **Custom Colors**: Foreground and background color pickers
  - **Real-time Preview**: Instant QR code generation
  - **Download**: Export as PNG file
  - **Copy to Clipboard**: One-click image copying
  - **Statistics Display**: Character count, dimensions, error correction level
  - **Usage Tips**: Built-in guidance for best results
- **Technology**: Uses `qrcode` npm package
- **UI Theme**: Dark gray gradient (from-gray-900 via-gray-800 to-gray-900)
- **Files Changed**:
  - ➕ Added: `app/tools/qr/page.tsx`
  - ✏️ Modified: `package.json` (added qrcode dependency)

---

## Currently Available Tools (Already Merged)

### 1. Text Diff Tool
- **Route**: `/tools/textDiff`
- **Location**: `app/tools/textDiff/page.tsx`
- **Status**: ✅ Merged
- **Description**: Side-by-side text comparison with line-by-line diff highlighting
- **Features**:
  - **Dual Text Areas**: Two input fields for text comparison
  - **Real-time Diff**: Instant comparison as you type
  - **Line Highlighting**: Red background on different lines
  - **Line Numbers**: Left-aligned line numbering
  - **Copy Buttons**: Copy either text with one click
  - **Statistics**: Display line count and diff line count
  - **Responsive Layout**: Side-by-side on desktop, stacked on mobile

---

### 2. Laser Etching Image Tracer
- **Route**: `/tools/imageTrace`
- **Location**: `app/tools/imageTrace/page.tsx`
- **Status**: ✅ Merged
- **Description**: Convert images to traced outlines for laser etching
- **Features**:
  - **Sobel Edge Detection**: Professional edge detection algorithm
  - **Threshold Control**: Adjustable from 0-255 (lower = more detail)
  - **Edge Strength**: Control line boldness (0.5-5.0)
  - **Color Inversion**: Toggle for white/black lines
  - **Real-time Processing**: Instant preview with parameter changes
  - **Drag-and-Drop**: Easy image upload
  - **Before/After**: Side-by-side comparison view
  - **Download**: Export as PNG for laser software
  - **Usage Tips**: Built-in guidance for best results
- **UI Theme**: Dark gradient (from-gray-900 via-gray-800 to-gray-900)
- **Technology**: Canvas-based processing with custom Sobel implementation

---

## Summary After All PRs Merge

### Total Routes: 7

#### Main Routes (2)
1. **`/`** - Home page with interactive book design
2. **`/money`** - Group expense tracker and bill splitter

#### Tool Routes (5)
1. **`/tools/textDiff`** - Text comparison tool ✅ (merged)
2. **`/tools/imageTrace`** - Laser etching tracer ✅ (merged)
3. **`/tools/embroideryTracer`** - Embroidery SVG generator (pending)
4. **`/tools/paintByNumbers`** - Paint-by-numbers converter (pending)
5. **`/tools/qr`** - QR code generator (pending)

### Dependencies to be Added
- **`imagetracerjs`** - For embroidery tracing (embroidery-trace-uploader PR)
- **`qrcode`** - For QR code generation (placeholder-task PR)

### Technology Stack
- **Framework**: Next.js with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Image Processing**: Canvas API, ImageTracer.js
- **Data Storage**: localStorage (for /money route)
- **State Management**: React useState/useEffect hooks

---

## Notes
- Some PRs delete `app/deep/page.tsx` and `app/tools/imageTrace/page.tsx` - these changes may conflict
- The book design PR (`book-feel-design`) significantly changes the home page design
- All tools use client-side processing (no server required)
- All tools feature modern, gradient-based UI designs
- Most tools include drag-and-drop file upload functionality

---

**Last Updated**: 2025-11-14
**Repository**: estebandalelr.github.io
**Current Branch**: claude/list-open-prs-tools-011CUtorMGX5X9g4GSu8VZt5
