export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="h-12 w-48 bg-gray-200 rounded-lg mx-auto mb-3 animate-pulse" />
          <div className="h-6 w-80 bg-gray-200 rounded mx-auto animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="block bg-white rounded-2xl shadow-md p-6 animate-pulse"
            >
              <div className="h-6 w-24 bg-gray-200 rounded-full mb-4" />
              <div className="h-7 w-40 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-full bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
