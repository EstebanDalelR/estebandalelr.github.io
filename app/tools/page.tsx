import Link from "next/link";

const tools = [
  {
    name: "Braille Learning",
    description:
      "Interactive Braille alphabet chart, text converter, and practice mode",
    href: "/tools/braille",
    icon: "⠃",
  },
  {
    name: "Laser Etching Image Tracer",
    description:
      "Convert images to traced outlines with Sobel edge detection for laser etching",
    href: "/tools/imageTrace",
    icon: "🖼",
  },
  {
    name: "Text Diff",
    description: "Compare two texts side by side and highlight the differences",
    href: "/tools/textDiff",
    icon: "↔",
  },
];

export default function ToolsIndex() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Tools</h1>
          <p className="text-gray-600 text-lg">
            A collection of small utilities
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="block bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <div className="text-4xl mb-3">{tool.icon}</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {tool.name}
              </h2>
              <p className="text-gray-600 text-sm">{tool.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
