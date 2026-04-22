export function NewsletterSection() {
  return (
    <section className="py-24 px-8">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="font-display text-ivory font-light text-4xl mb-4">
          The Inner Circle
        </h2>
        <p className="text-parchment font-sans font-light text-base mb-8">
          Early access, exclusive offers, and the stories behind our collections.
        </p>
        <div className="flex gap-0">
          <input
            type="email"
            placeholder="Your email address"
            className="flex-1 bg-transparent border border-iron text-ivory text-sm font-sans font-light px-4 py-3 placeholder:text-ash focus:outline-none focus:border-gold-antique transition-colors"
          />
          <button className="bg-gold-warm text-obsidian text-xs tracking-[0.14em] uppercase font-sans font-medium px-8 py-3 hover:bg-gold-bright transition-colors duration-300">
            Subscribe
          </button>
        </div>
      </div>
    </section>
  );
}
