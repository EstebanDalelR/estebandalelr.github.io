import Link from "next/link";

const tools = [
  {
    name: "Text Diff",
    description: "Compare two texts side-by-side with line-by-line highlighting",
    href: "/tools/textDiff",
    icon: "📝",
  },
  {
    name: "Image Tracer",
    description:
      "Convert images to traced outlines for laser etching with edge detection",
    href: "/tools/imageTrace",
    icon: "🖼️",
  },
  {
    name: "ASL Learning",
    description:
      "Learn American Sign Language alphabet and numbers with flashcards and quizzes",
    href: "/tools/asl",
    icon: "🤟",
  },
];

export default function ToolsIndex() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-3">Tools</h1>
          <p className="text-gray-400 text-lg">
            A collection of handy browser-based utilities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors group"
            >
              <div className="text-4xl mb-4">{tool.icon}</div>
              <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {tool.name}
              </h2>
              <p className="text-gray-400 text-sm">{tool.description}</p>
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
