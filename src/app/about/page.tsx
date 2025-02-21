"use client";

export default function AboutPage() {
  return (
    <main className="min-h-screen w-full bg-black text-white flex flex-col items-center px-4 py-0">
      {/* Large gradient heading */}
      <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-cyan-400 mt-4">
        KRBYLAND
      </h1>

      {/* Paragraphs with gradient text */}
      <section className="max-w-3xl text-center space-y-4 mt-6">
        <p className="text-sm bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-green-400">
          Welcome to KRBYLAND, the ultimate virtual stage for artists and fans 
          alike. Connect with live shows, immersive visuals, and a global community 
          of music lovers—no matter where you are.
        </p>
        <p className="text-sm bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-green-400">
          Our advanced technology syncs stage performances, audio, and interactive 
          elements, making every concert a unique, surreal experience. Let’s redefine 
          “going to a gig” together.
        </p>
      </section>
    </main>
  );
}
