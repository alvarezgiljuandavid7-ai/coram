export type SongOwnership = {
  owner_user_id: string | null;
  organization_id: string | null;
};

export const buildPersonalSongOwner = (userId: string): SongOwnership => ({
  owner_user_id: userId,
  organization_id: null,
});

export const buildOrganizationSongOwner = (organizationId: string): SongOwnership => ({
  owner_user_id: null,
  organization_id: organizationId,
});

export const isPersonalSong = (ownership: SongOwnership) =>
  ownership.owner_user_id !== null && ownership.organization_id === null;

export const isOrganizationSong = (ownership: SongOwnership) =>
  ownership.owner_user_id === null && ownership.organization_id !== null;
