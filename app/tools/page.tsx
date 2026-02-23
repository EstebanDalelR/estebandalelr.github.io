import Link from "next/link";

const tools = [
  {
    name: "Character Count",
    description: "Get detailed character, word, and sentence statistics for any text.",
    href: "/tools/characterCount",
    color: "from-emerald-500 to-teal-500",
  },
  {
    name: "Text Diff",
    description: "Compare two blocks of text side-by-side and highlight differences.",
    href: "/tools/textDiff",
    color: "from-gray-500 to-slate-600",
  },
  {
    name: "Image Trace",
    description: "Convert images to traced outlines for laser etching.",
    href: "/tools/imageTrace",
    color: "from-blue-600 to-indigo-700",
  },
  {
    name: "Swedish Learning",
    description: "Flashcards and quizzes to learn Swedish vocabulary.",
    href: "/tools/swedish",
    color: "from-blue-500 to-purple-500",
  },
];

export default function ToolsIndex() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-3">Tools</h1>
          <p className="text-gray-500 text-lg">
            A collection of small utilities I built for myself.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group block bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6"
            >
              <div
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${tool.color} mb-4`}
              >
                {tool.name}
              </div>
              <h2 className="text-xl font-bold text-gray-800 group-hover:text-teal-600 transition-colors mb-2">
                {tool.name}
              </h2>
              <p className="text-gray-500 text-sm">{tool.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
