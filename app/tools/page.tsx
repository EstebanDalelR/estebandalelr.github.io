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
  {
    name: "Paint by Numbers",
    description: "Upload an image and convert it to a paint by numbers artwork.",
    href: "/tools/paintByNumbers",
    color: "from-orange-500 to-pink-500",
  },
  {
    name: "ASL Learning",
    description: "Learn American Sign Language alphabet and numbers.",
    href: "/tools/asl",
    color: "from-violet-500 to-purple-600",
  },
  {
    name: "Braille",
    description: "Interactive Braille alphabet learning tool.",
    href: "/tools/braille",
    color: "from-amber-500 to-yellow-600",
  },
  {
    name: "Cursive",
    description: "Practice cursive handwriting with letters and common words.",
    href: "/tools/cursive",
    color: "from-rose-400 to-pink-500",
  },
  {
    name: "Embroidery Tracer",
    description: "Generate traced SVG paths from images for embroidery patterns.",
    href: "/tools/embroideryTracer",
    color: "from-fuchsia-500 to-pink-600",
  },
  {
    name: "Morse Code",
    description: "Learn, practice, and master Morse code.",
    href: "/tools/morse",
    color: "from-cyan-500 to-blue-500",
  },
  {
    name: "Piano",
    description: "Learn piano with an interactive keyboard, chords, and melodies.",
    href: "/tools/piano",
    color: "from-gray-700 to-gray-900",
  },
  {
    name: "Portuguese Learning",
    description: "Master Portuguese vocabulary, verbs, and common phrases.",
    href: "/tools/portuguese",
    color: "from-green-500 to-emerald-600",
  },
  {
    name: "QR Code Generator",
    description: "Create custom QR codes from text or URLs.",
    href: "/tools/qr",
    color: "from-indigo-500 to-blue-600",
  },
  {
    name: "Video Converter",
    description: "Convert videos between formats like AVI, MP4, MOV, and WebM.",
    href: "/tools/videoConverter",
    color: "from-red-500 to-orange-500",
  },
  {
    name: "Stop Motion Editor",
    description: "Upload images to create a stop motion animation with configurable timing.",
    href: "/tools/videoEditor",
    color: "from-teal-500 to-cyan-600",
  },
  {
    name: "Merge PDF",
    description: "Combine multiple PDF files into a single document.",
    href: "/tools/mergePdf",
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Split PDF",
    description: "Extract pages or split a PDF into separate files.",
    href: "/tools/splitPdf",
    color: "from-cyan-500 to-blue-500",
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
