import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
      <h2 className="text-4xl font-bold mb-4">404 - Not Found</h2>
      <p className="text-muted-foreground mb-8">Could not find requested resource</p>
      <Link href="/" className="px-4 py-2 bg-cyan-500 text-black rounded-lg font-medium">
        Return Home
      </Link>
    </div>
  );
}
