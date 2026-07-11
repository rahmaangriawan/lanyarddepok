export type JsonLd = Record<string, unknown>;

type PageSchemaConfig = {
  type?: 'WebPage' | 'AboutPage' | 'ContactPage';
  url: string;
  name: string;
  description: string;
  imageUrl?: string;
  datePublished?: string | null;
  dateModified?: string | null;
};

type CollectionItem = { name: string; url: string; imageUrl?: string };

export type HomepageSeoConfig = {
  siteUrl: string;
  siteName: string;
  description: string;
  logoUrl: string;
  imageUrl: string;
  phone: string;
  whatsapp: string;
  email: string;
  address?: string;
  sameAs: string[];
  faqs: Array<{ question: string; answer: string }>;
};

const fallbackSiteUrl = 'https://lanyarddepok.com';

export function resolveSiteUrl(value = import.meta.env.PUBLIC_SITE_URL): string {
  try {
    return new URL(value || fallbackSiteUrl).origin;
  } catch {
    return fallbackSiteUrl;
  }
}

export function absoluteUrl(value: string, siteUrl = resolveSiteUrl()): string {
  try {
    return new URL(value, siteUrl).toString();
  } catch {
    return new URL('/', siteUrl).toString();
  }
}

export function validExternalUrls(values: Array<string | undefined | null>): string[] {
  return values.flatMap((value) => {
    if (!value?.trim()) return [];

    try {
      const url = new URL(value.trim());
      return ['http:', 'https:'].includes(url.protocol) ? [url.toString()] : [];
    } catch {
      return [];
    }
  });
}

export function serializeJsonLd(value: JsonLd): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function normalizeIsoDate(value?: string | null): string | undefined {
  if (!value) return undefined;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

const organization = (siteUrl: string): JsonLd => ({
  '@type': 'Organization',
  '@id': `${siteUrl}/#organization`,
  name: 'Lanyard Depok',
  url: siteUrl,
});

export function createWebPageSchema(config: PageSchemaConfig): JsonLd {
  const pageType = config.type || 'WebPage';
  const published = normalizeIsoDate(config.datePublished);
  const modified = normalizeIsoDate(config.dateModified);
  const siteUrl = resolveSiteUrl();

  return {
    '@context': 'https://schema.org',
    '@type': pageType,
    '@id': `${config.url}#webpage`,
    url: config.url,
    name: config.name,
    description: config.description,
    inLanguage: 'id-ID',
    isPartOf: { '@id': `${siteUrl}/#website` },
    about: { '@id': `${siteUrl}/#localbusiness` },
    ...(config.imageUrl ? { primaryImageOfPage: config.imageUrl } : {}),
    ...(published ? { datePublished: published } : {}),
    ...(modified ? { dateModified: modified } : {}),
  };
}

export function createFaqPageSchema(config: Omit<PageSchemaConfig, 'type'> & { faqs: HomepageSeoConfig['faqs'] }): JsonLd {
  return {
    ...createWebPageSchema({ ...config, type: 'WebPage' }),
    '@type': 'FAQPage',
    mainEntity: config.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function createCollectionPageSchema(config: {
  url: string;
  name: string;
  description: string;
  items: CollectionItem[];
}): JsonLd {
  return {
    ...createWebPageSchema({
      url: config.url,
      name: config.name,
      description: config.description,
    }),
    '@type': 'CollectionPage',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: config.items.length,
      itemListElement: config.items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: item.url,
        name: item.name,
        ...(item.imageUrl ? { image: item.imageUrl } : {}),
      })),
    },
  };
}

export function createProductSchema(config: {
  url: string;
  name: string;
  description: string;
  imageUrl: string;
  sku?: string | null;
  category?: string | null;
}): JsonLd {
  const siteUrl = resolveSiteUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${config.url}#product`,
    url: config.url,
    name: config.name,
    description: config.description,
    image: config.imageUrl,
    ...(config.sku ? { sku: config.sku } : {}),
    ...(config.category ? { category: config.category } : {}),
    brand: {
      '@type': 'Brand',
      name: 'Lanyard Depok',
      url: siteUrl,
    },
  };
}

export function createBlogPostingSchema(config: {
  url: string;
  headline: string;
  description: string;
  imageUrl: string;
  datePublished?: string | null;
  dateModified?: string | null;
  category?: string | null;
}): JsonLd {
  const siteUrl = resolveSiteUrl();
  const published = normalizeIsoDate(config.datePublished);
  const modified = normalizeIsoDate(config.dateModified);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${config.url}#article`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': config.url },
    url: config.url,
    headline: config.headline,
    description: config.description,
    image: config.imageUrl,
    ...(config.category ? { articleSection: config.category } : {}),
    ...(published ? { datePublished: published } : {}),
    ...(modified ? { dateModified: modified } : {}),
    author: organization(siteUrl),
    publisher: organization(siteUrl),
  };
}

export function createHomepageSchema(config: HomepageSeoConfig): JsonLd {
  const siteId = `${config.siteUrl}/#website`;
  const businessId = `${config.siteUrl}/#localbusiness`;
  const homepageId = `${config.siteUrl}/#webpage`;
  const address = config.address?.trim()
    ? {
        '@type': 'PostalAddress',
        streetAddress: config.address.trim(),
        addressLocality: 'Depok',
        addressCountry: 'ID',
      }
    : undefined;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': siteId,
        url: config.siteUrl,
        name: config.siteName,
        inLanguage: 'id-ID',
        publisher: { '@id': businessId },
      },
      {
        '@type': 'LocalBusiness',
        '@id': businessId,
        name: config.siteName,
        url: config.siteUrl,
        logo: config.logoUrl,
        image: config.imageUrl,
        description: config.description,
        telephone: config.phone,
        email: config.email,
        ...(address ? { address } : {}),
        ...(config.whatsapp
          ? {
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                telephone: config.whatsapp,
                availableLanguage: ['id'],
              },
            }
          : {}),
        ...(config.sameAs.length ? { sameAs: config.sameAs } : {}),
      },
      {
        '@type': 'WebPage',
        '@id': homepageId,
        url: config.siteUrl,
        name: config.siteName,
        description: config.description,
        inLanguage: 'id-ID',
        isPartOf: { '@id': siteId },
        about: { '@id': businessId },
        primaryImageOfPage: config.imageUrl,
      },
      {
        '@type': 'FAQPage',
        '@id': `${config.siteUrl}/#faq`,
        mainEntity: config.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  };
}
