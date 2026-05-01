import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, ogImage, ogType = 'website', canonicalUrl }) => {
  const siteName = 'CareTrip';
  const fullTitle = `${title} | ${siteName}`;
  const defaultDescription = 'CareTrip - Your global verified healthcare partner. Connecting travelers with world-class doctors and emergency medical support.';
  const defaultKeywords = 'medical tourism, healthcare, verified doctors, emergency medical help, CareTrip, travel health';
  const siteUrl = window.location.origin;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CareTrip",
    "url": siteUrl,
    "logo": "https://res.cloudinary.com/dgcmeb8ec/image/upload/v1776876267/cf4aebc6-9a38-4ca1-8439-a2f8ecafc8aa_rxtljz.png",
    "description": defaultDescription
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:url" content={window.location.href} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Accessibility - Set Language */}
      <html lang="en" />
    </Helmet>
  );
};

export default SEO;
