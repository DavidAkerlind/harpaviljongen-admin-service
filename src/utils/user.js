// Name shown in the admin: the display name when set, otherwise the username
export const displayName = (user) => user?.name || user?.username || '';

export const firstName = (user) => displayName(user).split(' ')[0];

export const initial = (name) => name?.trim()?.[0]?.toUpperCase() ?? '';
