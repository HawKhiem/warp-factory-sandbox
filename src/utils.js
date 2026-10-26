// Convert a title into a URL-safe slug.
export function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/ /g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

// Return one page of items. Pages are 1-based.
export function paginate(items, page = 1, size = 10) {
  const start = (page - 1) * size;
  return {
    page,
    size,
    total: items.length,
    items: items.slice(start, start + size),
  };
}
