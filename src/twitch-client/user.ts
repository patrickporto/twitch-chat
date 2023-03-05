export interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  created_at: string;
}

export const getUsetData = async (
  oauthToken: string,
  clientId: string
): Promise<TwitchUser> => {
  const response = await fetch(`https://api.twitch.tv/helix/users`, {
    headers: {
      Authorization: "Bearer " + oauthToken.replace("oauth:", ""),
      "Client-ID": clientId,
    },
  });

  const { data } = await response.json();
  return data as TwitchUser;
};
