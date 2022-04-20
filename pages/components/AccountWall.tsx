import { FunctionComponent, PropsWithChildren, useCallback } from "react";
import gql from "graphql-tag";
import {
  useAccountWallLoginMutation,
  useAccountWallQuery,
} from "./AccountWall.gen";
import GoogleLogin, {
  GoogleLoginResponse,
  GoogleLoginResponseOffline,
} from "react-google-login";
import { GoogleOauthClientId } from "../constants";

gql`
  query AccountWall {
    me {
      email
      name
      picture
    }
  }

  mutation AccountWallLogin {
    login
  }
`;

export const AccountWall: FunctionComponent<PropsWithChildren<{}>> = ({
  children,
}) => {
  const { data } = useAccountWallQuery();
  const { mutateAsync } = useAccountWallLoginMutation();
  const handleSuccess = useCallback(
    (response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
      if ("profileObj" in response) {
        global.localStorage?.setItem("auth-token", response.tokenId);
        mutateAsync({}).then((account) => {
          console.log("@account", account);
        });
      } else {
        throw new Error(`network error`);
      }
    },
    [mutateAsync]
  );

  if (data == null) return null;
  return data.me != null ? (
    <>{children}</>
  ) : (
    <GoogleLogin
      clientId={GoogleOauthClientId}
      onSuccess={handleSuccess}
      onFailure={(error) => {
        throw error;
      }}
      cookiePolicy={"single_host_origin"}
    />
  );
};
