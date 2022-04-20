export const reactQueryFetcher =
  <TData, TVariables>(query: string, variables?: TVariables) =>
  async (): Promise<TData> => {
    const authToken = localStorage.getItem("auth-token");
    const res = await fetch("/api/graphql", {
      method: "POST",
      ...{
        headers: authToken ? { Authorization: `Bearer: ${authToken}` } : {},
      },
      body: JSON.stringify({ query, variables }),
    });

    const json = await res.json();

    if (json.errors) {
      const { message } = json.errors[0];

      throw new Error(message);
    }

    return json.data;
  };
