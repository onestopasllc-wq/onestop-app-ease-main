import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
}

const SEO = ({
  title = "OneStop Application Services LLC - We Make Applying Easy! 🎓💼",
  description = "Professional application support for visa forms, college admissions, document evaluations, licensing boards, job applications, and business licenses. Expert guidance to simplify your application process.",
  keywords = "onestopasllc, OneStopASLLC, OneStop AS LLC, application services, visa application help, college application support, document evaluation, licensing board applications, job application assistance, business license help, CGFNS application, nursing license application, professional application services",
  canonical,
  ogImage = "/og-image.jpg"
}: SEOProps) => {
  const fullTitle = title.includes("OneStop") ? title : `${title} | OneStop Application Services LLC`;
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.onestopasllc.com';
  const canonicalUrl = canonical || (typeof window !== 'undefined' ? window.location.href : siteUrl);

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update or create meta tags
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    // Primary Meta Tags
    updateMeta('description', description);
    updateMeta('keywords', keywords);
    updateMeta('robots', 'index, follow');

    // Open Graph / Facebook
    updateMeta('og:type', 'website', true);
    updateMeta('og:url', canonicalUrl, true);
    updateMeta('og:title', fullTitle, true);
    updateMeta('og:description', description, true);
    updateMeta('og:image', `${siteUrl}${ogImage}`, true);

    // Twitter
    updateMeta('twitter:card', 'summary_large_image', true);
    updateMeta('twitter:url', canonicalUrl, true);
    updateMeta('twitter:title', fullTitle, true);
    updateMeta('twitter:description', description, true);
    updateMeta('twitter:image', `${siteUrl}${ogImage}`, true);

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl;

    // Add structured data
    let scriptTag = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    scriptTag.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "name": "OneStop Application Services LLC",
      "image": `${siteUrl}${ogImage}`,
      "description": description,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Woodbridge",
        "addressRegion": "VA",
        "addressCountry": "US"
      },
      "telephone": "+1-571-660-4984",
      "email": "onestopapplicationservicesllc@gmail.com",
      "url": siteUrl,
      "priceRange": "$$",
      "areaServed": {
        "@type": "Country",
        "name": "United States"
      },
      "serviceType": ["Visa Application Support", "College Application Support", "Document Evaluation", "Licensing Board Applications", "Job Application Assistance", "Business License Support"]
    });
  }, [fullTitle, description, keywords, canonicalUrl, siteUrl, ogImage]);

  return null;
};

export default SEO;
