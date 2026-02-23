import Link from "next/link";

const tools = [
  {
    name: "Text Diff",
    description: "Compare two texts side by side and highlight the differences.",
    href: "/tools/textDiff",
  },
  {
    name: "Embroidery Tracer",
    description:
      "Upload an image to generate traced SVG paths for embroidery - color, monochrome, and line art.",
    href: "/tools/embroideryTracer",
  },
];

export default function ToolsIndex() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-2">Tools</h1>
      <p className="text-gray-600 mb-8">A collection of useful web tools.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="border-2 border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition-all"
          >
            <h2 className="text-xl font-semibold mb-2">{tool.name}</h2>
            <p className="text-gray-600">{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
