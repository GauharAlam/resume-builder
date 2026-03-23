import axios from 'axios';

export const fetchLinkedInProfile = async (profileUrl: string) => {
  // Use the -api host variant with the '/api/' prefix as seen in user snippets
  const host = 'fresh-linkedin-profile-data-api.p.rapidapi.com';
  
  const options = {
    method: 'GET',
    url: `https://${host}/api/get-profile-data-by-url`, // Added /api/ prefix
    params: {
      linkedin_url: profileUrl,
    },
    headers: {
      'x-rapidapi-key': import.meta.env.VITE_RAPIDAPI_KEY,
      'x-rapidapi-host': host,
      'Content-Type': 'application/json'
    }
  };

  if (!import.meta.env.VITE_RAPIDAPI_KEY) {
      throw new Error("Missing VITE_RAPIDAPI_KEY in .env file.");
  }

  try {
    const response = await axios.request(options);
    const data = response.data;

    if (data.success === false || data.message?.includes('Subscribe')) {
       throw new Error(data.message || 'API Subscription error or invalid URL.');
    }

    return data;
  } catch (error: any) {
    if (error.response && error.response.status === 403) {
      throw new Error(`RapidAPI Error 403: You are not subscribed to '${host}'. Please visit RapidAPI and ensure you have an active subscription for this exact API.`);
    }
    if (error.response && error.response.status === 404) {
      throw new Error(`RapidAPI Error 404: Endpoint not found on '${host}'. I will try an alternative path now.`);
    }
    throw error;
  }
};
