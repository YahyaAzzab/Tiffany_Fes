const WORDS = [
  "Sweet escape",
  "Swirl",
  "Choco Rice",
  "Maxi Dough",
  "Choco Missu",
  "Fès",
  "Coffrets",
  "Moulay Hicham",
];

export function Marquee() {
  const line = [...WORDS, ...WORDS];
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track py-3">
        {[0, 1].map((copy) => (
          <p key={copy} className="flex items-center">
            {line.map((word, index) => (
              <span key={`${copy}-${word}-${index}`} className="px-4 text-sm font-semibold tracking-[0.14em] uppercase">
                {word}
                <span className="ml-4 text-pink-hot">●</span>
              </span>
            ))}
          </p>
        ))}
      </div>
    </div>
  );
}
