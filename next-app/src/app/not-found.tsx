import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <h1 className="font-display text-4xl md:text-5xl font-bold text-[#0B0F19] mb-4 border-b-2 border-[#1E3A8A] inline-block pb-1">
        Page Not Found
      </h1>
      <p className="text-[#4B5468] text-lg mb-8">
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
