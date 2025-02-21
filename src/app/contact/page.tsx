"use client";

import React from "react";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      {/* Heading relies on global gradient if set in globals.css */}
      <h1 className="text-4xl font-bold mb-6">
        Contact Us
      </h1>

      {/* Paragraph also relies on global text styling (gradient) */}
      <p className="mb-8 max-w-md text-center">
        We’d love to hear from you. Shoot us a message and we’ll get back ASAP!
      </p>

      {/* Example form (placeholder) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          alert("Form submitted!");
        }}
        className="w-full max-w-md space-y-4"
      >
        <div>
          {/* Remove color classes on label to allow global gradient to apply if desired */}
          <label className="block mb-1" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-600
                       focus:outline-none focus:border-cyan-500"
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
            className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-600
                       focus:outline-none focus:border-cyan-500"
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
            className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-600
                       focus:outline-none focus:border-cyan-500"
            placeholder="How can we help?"
          ></textarea>
        </div>
        {/* Keep a colored button if you want contrast instead of gradient text on the button */}
        <button
          type="submit"
          className="bg-cyan-600 hover:bg-indigo-600 px-4 py-2 rounded
                     font-semibold transition-colors"
        >
          Send
        </button>
      </form>
    </main>
  );
}
