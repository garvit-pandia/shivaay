import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-midnight text-text px-4">
      <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
        Page Not Found
      </h1>
      <p className="text-text-dim text-lg mb-8">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="inline-flex items-center btn-primary px-6 py-3 text-base font-semibold no-underline"
      >
        Go Home
      </Link>
    </div>
  );
}
