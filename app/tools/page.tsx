import Link from "next/link";

const tools = [
  {
    name: "Text Diff",
    description: "Compare two texts side by side with line-by-line highlighting of differences.",
    href: "/tools/textDiff",
    icon: "AB",
    color: "from-blue-500 to-blue-700",
  },
  {
    name: "Laser Etching Image Tracer",
    description: "Convert images to traced outlines using Sobel edge detection, perfect for laser etching.",
    href: "/tools/imageTrace",
    icon: "img",
    color: "from-purple-500 to-purple-700",
  },
  {
    name: "Morse Code Learning",
    description: "Learn and practice Morse code with a converter, audio playback, and interactive reference chart.",
    href: "/tools/morse",
    icon: "...",
    color: "from-cyan-500 to-cyan-700",
  },
];

export default function ToolsIndex() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto py-12">
        <h1 className="text-4xl font-bold text-center mb-2">Tools</h1>
        <p className="text-center text-gray-400 mb-12">
          A collection of useful browser-based tools
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group block bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-500 transition-all hover:shadow-lg hover:shadow-gray-900/50"
            >
              <div className={`h-24 bg-gradient-to-br ${tool.color} flex items-center justify-center`}>
                <span className="text-3xl font-mono font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                  {tool.icon}
                </span>
              </div>
              <div className="p-5">
                <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                  {tool.name}
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {tool.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-300 transition-colors text-sm"
          >
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
