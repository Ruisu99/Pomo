import {
  SITE_DESCRIPTION_EN,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

/** JSON-LD for Google rich results (WebApplication). */
export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION_EN,
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    inLanguage: ["en", "de"],
    featureList: [
      "Pomodoro timer",
      "Task list with projects",
      "Lofi Girl and Jazz live streams",
      "Local-first statistics",
      "English and German",
      "PWA offline support",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
