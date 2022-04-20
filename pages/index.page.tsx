import type { NextPage } from "next";
import gql from "graphql-tag";
import {
  useHomePageCreateTokenMutation,
  useHomePageDeleteTokenMutation,
  useHomePageQuery,
} from "@gen_root/pages/index.page.gen";
import { useCallback } from "react";

gql`
  query HomePage {
    me {
      name
      picture
    }
    tokens {
      id
      createdAt
      lastUsedAt
    }
  }

  mutation HomePageCreateToken {
    createToken {
      id
    }
  }

  mutation HomePageDeleteToken($id: ID!) {
    deleteToken(id: $id)
  }
`;

const Home: NextPage = () => {
  const { data, refetch } = useHomePageQuery();
  const { mutateAsync: createTokenAsync } = useHomePageCreateTokenMutation();
  const handleClickLogout = useCallback(() => {
    if (typeof global.window != null) {
      global.window.localStorage.removeItem("auth-token");
      global.window.location.reload();
    }
  }, []);
  const handleClickCreateToken = useCallback(
    () => createTokenAsync({}).then(() => refetch()),
    [createTokenAsync, refetch]
  );
  const { mutateAsync: deleteTokenAsync } = useHomePageDeleteTokenMutation();
  const handleClickDeleteToken = useCallback(
    (id: string) => () => {
      deleteTokenAsync({ id }).then(() => refetch());
    },
    [deleteTokenAsync, refetch]
  );

  if (data == null) return null;
  return (
    <div>
      {data.me?.picture && <img src={data.me.picture} alt="profile" />}
      <button onClick={handleClickLogout}>logout</button>
      <hr />
      <button onClick={handleClickCreateToken}>create token</button>
      <div>
        {data.tokens.map((token) => (
          <div key={token.id} style={{ border: "solid 1px black" }}>
            <div>id: {token.id}</div>
            <div>createdAt: {token.createdAt}</div>
            <div>lastUsedAt: {token.lastUsedAt}</div>
            <button onClick={handleClickDeleteToken(token.id)}>delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
