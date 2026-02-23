export default function Loading() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
      <p className="mt-4 text-lg text-gray-600">Loading...</p>
    </div>
  );
}
