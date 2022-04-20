import {
  FunctionComponent,
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from "react";
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
      emailHash
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
  const [isSsr, setIsSsr] = useState(true);
  useEffect(() => {
    setIsSsr(false);
  }, []);

  const { data } = useAccountWallQuery();
  const { mutateAsync } = useAccountWallLoginMutation();
  const handleSuccess = useCallback(
    (response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
      if ("profileObj" in response) {
        global.localStorage?.setItem("auth-token", response.tokenId);
        mutateAsync({}).then((account) => {
          if (!account.login) {
            global.localStorage?.removeItem("auth-token");
          } else {
            global.window.location.reload();
          }
        });
      } else {
        throw new Error(`network error`);
      }
    },
    [mutateAsync]
  );

  if (isSsr || data == null) return null;
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
