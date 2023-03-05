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

export const getUserData = async (
  oauthToken: string,
  clientId: string,
  login?: string
): Promise<TwitchUser> => {
    const url = `https://api.twitch.tv/helix/users?`;
    const params = new URLSearchParams();
    if (login) {
        params.append('login', login);
    }
  const response = await fetch(url + params.toString(), {
    headers: {
      Authorization: "Bearer " + oauthToken.replace("oauth:", ""),
      "Client-ID": clientId,
    },
  });

  const { data } = await response.json();
  if (Array.isArray(data)) {
    return data[0] as TwitchUser;
  }
  return data as TwitchUser;
}
