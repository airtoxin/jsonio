import type { NextPage } from "next";
import GoogleLogin, {
  GoogleLoginResponse,
  GoogleLoginResponseOffline,
} from "react-google-login";
import { GoogleOauthClientId } from "./constants";
import { useCallback, useState } from "react";
import gql from "graphql-tag";

gql`
  query HomePage {
    me {
      email
    }
  }
`;

const Home: NextPage = () => {
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const handleSuccess = useCallback(
    (response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
      console.log("@response", response);
      if ("profileObj" in response) {
        fetch("/api/login", {
          method: "POST",
          headers: {
            Authorization: `Bearer: ${response.tokenId}`,
          },
        })
          .then((res) => res.json())
          .then(console.log);
      } else {
        setError("Network offline");
      }
    },
    []
  );

  if (error) return <div>Error: {error}</div>;
  return (
    <GoogleLogin
      clientId={GoogleOauthClientId}
      onSuccess={handleSuccess}
      onFailure={(error) => setError(JSON.stringify(error))}
      cookiePolicy={"single_host_origin"}
    />
  );
};

export default Home;
