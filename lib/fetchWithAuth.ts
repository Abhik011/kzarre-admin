export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  let accessToken = sessionStorage.getItem("access_token");
  let refreshToken = sessionStorage.getItem("refresh_token");

  const makeRequest = (token: string | null) =>
    fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

  let response = await makeRequest(accessToken);

  // 🔥 If access token expired
  if (response.status === 401 && refreshToken) {
    const refreshRes = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/admin/refresh`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );

    if (!refreshRes.ok) {
      sessionStorage.clear();
      window.location.href = "/admin-login";
      throw new Error("Session expired"); // ✅ THROW instead of return
    }

    const data = await refreshRes.json();

    sessionStorage.setItem("access_token", data.accessToken);

    response = await makeRequest(data.accessToken);
  }

  return response;
};