/** User-facing copy. Central so it can be tuned per store (or wired to i18n later). */
export const CONTENT = {
  fallbackStoreName: 'Atelier',

  nav: { bag: 'Bag' },

  hero: {
    eyebrow: 'New season',
    subtitle:
      'A considered edit of clothing, accessories and footwear — made to be worn on repeat.',
    cta: 'Shop the edit',
  },

  home: {
    sectionTitle: 'The edit',
    piecesLabel: (n: number) => `${n} pieces`,
  },

  list: {
    empty: 'Nothing here yet.',
  },

  cart: {
    title: 'Your bag',
    empty: 'Your bag is empty.',
    subtotal: 'Subtotal',
    checkout: 'Checkout — coming soon',
    remove: 'Remove',
  },

  product: {
    notFound: 'That piece could not be found.',
    back: 'Back to the edit',
    sizeLabel: 'Size',
    soldOut: 'Currently sold out.',
    addToBag: 'Add to bag',
    selectSize: 'Select a size',
    added: 'Added to bag',
    madeOf: 'Made of',
    inFocus: 'In focus',
    viewPiece: 'View piece',
  },

  footer: {
    settings: 'Store settings',
  },

  notFound: {
    title: 'Page not found',
    body: 'The page you were after isn’t here.',
  },

  admin: {
    eyebrow: 'Store settings',
    title: 'Appearance',
    viewStore: 'View store',
    note: 'Changes are saved to store_config in the database and take effect for every visitor. Each write is recorded in audit_log.',
    themeHeading: 'Theme',
    layoutHeading: 'Product & home layout',
    importLink: 'Import products',
    save: 'Save to store',
    saving: 'Saving…',
    saved: 'Saved.',
    dirty: 'Unsaved changes',
    clean: 'Everything matches the saved config',
  },

  import: {
    eyebrow: 'Store settings',
    title: 'Import products',
    intro:
      'Upload the product CSV and, optionally, a ZIP of the images named in its image_files column. Existing SKUs are updated.',
    csvLabel: 'Product CSV',
    zipLabel: 'Images ZIP (optional)',
    templateLink: 'Download CSV template',
    submit: 'Import',
    submitting: 'Importing…',
    resultsTitle: 'Result',
    back: 'Back to appearance',
    columns: { sku: 'SKU', action: 'Result', message: 'Detail' },
  },

  studio: {
    fabOpen: 'Studio',
    fabClose: 'Close',
    themeLabel: 'Theme',
    layoutLabel: 'Layout',
    overridden: 'Previewing an override',
    showingSaved: 'Showing saved store config',
    reset: 'Reset',
  },
} as const
