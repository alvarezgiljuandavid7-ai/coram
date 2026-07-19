export const contentStatuses = ['draft', 'published', 'archived'] as const;

export type ContentStatus = (typeof contentStatuses)[number];
