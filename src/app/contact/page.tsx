"use client";

import React from "react";

export default function ContactPage() {
  return (
    // On mobile, we use min-h-[80vh] (80% of viewport height)
    // and center the content vertically (justify-center).
    // On screens ≥640px, we switch to justify-start.
    <main className="min-h-[80vh] bg-black flex flex-col items-center justify-center sm:justify-start px-4">
      <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
      <p className="mb-8 max-w-md text-center">
        We’d love to hear from you. Shoot us a message and we’ll get back ASAP!
      </p>

      <form className="w-full max-w-md space-y-4">
        <div>
          <label className="block mb-1" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            className="
              w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-600
              focus:outline-none focus:border-cyan-500
              gradient-text-input
            "
            placeholder="Your Name"
          />
        </div>

        <div>
          <label className="block mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="
              w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-600
              focus:outline-none focus:border-cyan-500
              gradient-text-input
            "
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block mb-1" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            rows={4}
            className="
              w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-600
              focus:outline-none focus:border-cyan-500
              gradient-text-input
            "
            placeholder="How can we help?"
          />
        </div>

        <button
          type="submit"
          className="
            bg-cyan-600 px-4 py-2 rounded font-semibold transition-colors
            hover:bg-gradient-to-r hover:from-pink-500 hover:to-yellow-500
            hover:text-transparent hover:bg-clip-text
          "
        >
          Send
        </button>
      </form>
    </main>
  );
}
