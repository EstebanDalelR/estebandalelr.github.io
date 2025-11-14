import Link from "next/link";

export default function ToolsIndex() {
  const availableTools = [
    {
      name: "Text Diff",
      route: "/tools/textDiff",
      description: "Compare two texts side-by-side with line-by-line highlighting",
      icon: "📝",
      status: "available",
      features: ["Real-time comparison", "Line highlighting", "Copy buttons"],
    },
    {
      name: "Laser Etching Tracer",
      route: "/tools/imageTrace",
      description: "Convert images to traced outlines perfect for laser etching",
      icon: "⚡",
      status: "available",
      features: ["Sobel edge detection", "Adjustable threshold", "Download PNG"],
    },
  ];

  const creativeTools = [
    {
      name: "Embroidery Tracer",
      route: "/tools/embroideryTracer",
      description: "Generate SVG traces from images for embroidery machines",
      icon: "🧵",
      status: "coming-soon",
      category: "creative",
      features: ["Color trace", "Monochrome trace", "Line art mode"],
    },
    {
      name: "Paint by Numbers",
      route: "/tools/paintByNumbers",
      description: "Transform any image into a paint-by-numbers artwork",
      icon: "🎨",
      status: "coming-soon",
      category: "creative",
      features: ["K-means quantization", "Numbered regions", "Color palette"],
    },
    {
      name: "QR Code Generator",
      route: "/tools/qr",
      description: "Create customizable QR codes for any text or URL",
      icon: "📱",
      status: "coming-soon",
      category: "creative",
      features: ["Custom colors", "Error correction", "Download & copy"],
    },
    {
      name: "Video Converter",
      route: "/tools/videoConverter",
      description: "Convert videos between different formats using FFmpeg",
      icon: "🎬",
      status: "coming-soon",
      category: "creative",
      features: ["Multiple formats", "Client-side conversion", "Progress tracking"],
    },
    {
      name: "Video Editor",
      route: "/tools/videoEditor",
      description: "Create videos from image sequences",
      icon: "🎞️",
      status: "coming-soon",
      category: "creative",
      features: ["Image sequences", "Adjustable FPS", "Drag-and-drop"],
    },
  ];

  const learningTools = [
    {
      name: "ASL Learning",
      route: "/tools/asl",
      description: "Learn American Sign Language alphabet and numbers",
      icon: "🤟",
      status: "coming-soon",
      category: "learning",
      features: ["Flashcards", "Quiz mode", "A-Z + 0-9"],
    },
    {
      name: "Braille Learning",
      route: "/tools/braille",
      description: "Learn and translate Braille with interactive displays",
      icon: "⠃",
      status: "coming-soon",
      category: "learning",
      features: ["Text ↔ Braille", "Visual dot patterns", "Full alphabet"],
    },
    {
      name: "Morse Code Learning",
      route: "/tools/morse",
      description: "Learn Morse code with audio playback",
      icon: "▄▄▄",
      status: "coming-soon",
      category: "learning",
      features: ["Audio playback", "Text translation", "Speed control"],
    },
    {
      name: "Piano Learning",
      route: "/tools/piano",
      description: "Interactive virtual piano with chords and melodies",
      icon: "🎹",
      status: "coming-soon",
      category: "learning",
      features: ["3 octaves", "Chords library", "Melodies"],
    },
    {
      name: "Portuguese Learning",
      route: "/tools/portuguese",
      description: "Learn Portuguese vocabulary and verb conjugations",
      icon: "🇵🇹",
      status: "coming-soon",
      category: "learning",
      features: ["Vocabulary", "Verb conjugations", "Quiz mode"],
    },
    {
      name: "Swedish Learning",
      route: "/tools/swedish",
      description: "Learn Swedish vocabulary with pronunciation guides",
      icon: "🇸🇪",
      status: "coming-soon",
      category: "learning",
      features: ["Flashcards", "Pronunciation", "Category filtering"],
    },
    {
      name: "Cursive Writing",
      route: "/tools/cursive",
      description: "Practice cursive handwriting with an interactive canvas",
      icon: "✍️",
      status: "coming-soon",
      category: "learning",
      features: ["Drawing canvas", "Guide lines", "A-Z practice"],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🛠️ Tools Collection
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A collection of creative and practical tools for designers, makers, developers, and learners
          </p>
          <div className="mt-4 flex gap-4 justify-center text-sm text-gray-600">
            <span className="bg-green-100 px-3 py-1 rounded-full">
              ✓ {availableTools.length} Available
            </span>
            <span className="bg-orange-100 px-3 py-1 rounded-full">
              ⏳ {creativeTools.length + learningTools.length} Coming Soon
            </span>
          </div>
        </div>

        {/* Available Tools */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <span className="text-green-500">✓</span>
            Available Now
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableTools.map((tool) => (
              <Link
                key={tool.route}
                href={tool.route}
                className="group bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-blue-500"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{tool.icon}</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    Available
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  {tool.description}
                </p>
                <ul className="space-y-1">
                  {tool.features.map((feature, idx) => (
                    <li key={idx} className="text-xs text-gray-500 flex items-center gap-2">
                      <span className="text-blue-500">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="text-blue-600 font-medium text-sm group-hover:underline">
                    Open Tool →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Creative Tools Coming Soon */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <span className="text-orange-500">⏳</span>
            Creative Tools - Coming Soon
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creativeTools.map((tool) => (
              <div
                key={tool.route}
                className="bg-white rounded-xl shadow-lg p-6 border-2 border-dashed border-gray-300 opacity-75 hover:opacity-100 transition-opacity"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl grayscale">{tool.icon}</span>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                    Coming Soon
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {tool.name}
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  {tool.description}
                </p>
                <ul className="space-y-1">
                  {tool.features.map((feature, idx) => (
                    <li key={idx} className="text-xs text-gray-500 flex items-center gap-2">
                      <span className="text-orange-500">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="text-gray-400 font-medium text-sm">
                    Under Development
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Learning Tools Coming Soon */}
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <span className="text-purple-500">📚</span>
            Learning Tools - Coming Soon
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningTools.map((tool) => (
              <div
                key={tool.route}
                className="bg-white rounded-xl shadow-lg p-6 border-2 border-dashed border-purple-200 opacity-75 hover:opacity-100 transition-opacity"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl grayscale">{tool.icon}</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                    Coming Soon
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {tool.name}
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  {tool.description}
                </p>
                <ul className="space-y-1">
                  {tool.features.map((feature, idx) => (
                    <li key={idx} className="text-xs text-gray-500 flex items-center gap-2">
                      <span className="text-purple-500">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="text-gray-400 font-medium text-sm">
                    Under Development
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-3xl mx-auto">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              💡 17 Tools Coming
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              This collection is constantly growing with creative tools and interactive learning experiences.
              All tools are free to use, work entirely in your browser, and require no account or registration.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs text-blue-600">
              <div>
                <div className="font-semibold mb-1">🎨 Creative Tools</div>
                <div className="text-blue-500">Image processing, video editing, QR codes</div>
              </div>
              <div>
                <div className="font-semibold mb-1">📚 Learning Tools</div>
                <div className="text-blue-500">Languages, sign language, music</div>
              </div>
              <div>
                <div className="font-semibold mb-1">⚡ Performance</div>
                <div className="text-blue-500">All processing happens in your browser</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
