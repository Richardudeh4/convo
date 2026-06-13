import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { useEffect, useRef } from "react";
import { toast } from "sonner-native";

type NetworkStatus = "online" | "offline" | "weak";

function getNetworkStatus(state: NetInfoState): NetworkStatus | null {
  if (state.isConnected == null) return null;

  const offline =
    state.isConnected === false || state.isInternetReachable === false;

  if (offline) return "offline";

  const cellularGeneration =
    state.type === "cellular" &&
    "cellularGeneration" in state.details &&
    state.details.cellularGeneration;

  if (cellularGeneration === "2g" || cellularGeneration === "3g") {
    return "weak";
  }

  return "online";
}

export function useNetworkToast() {
  const lastStatus = useRef<NetworkStatus | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    const handleStateChange = (state: NetInfoState) => {
      const status = getNetworkStatus(state);
      if (status === null) return;

      if (!hasInitialized.current) {
        hasInitialized.current = true;
        lastStatus.current = status;
        if (status === "offline") {
          toast.error("Seems you're offline", {
           
            duration: 5000,
          });
        } else if (status === "weak") {
          toast.warning("Slow connection", {
            description: "Your connection looks weak.",
            duration: 4000,
          });
        }
        return;
      }

      if (status === lastStatus.current) return;
      lastStatus.current = status;

      if (status === "offline") {
        toast.error("Seems you're offline", {
          
          duration: 5000,
        });
      } else if (status === "weak") {
        toast.warning("Slow connection", {
          duration: 4000,
        });
      } else {
        toast.success("Back online", {
          duration: 3000,
        });
      }
    };

    const unsubscribe = NetInfo.addEventListener(handleStateChange);

    return unsubscribe;
  }, []);
}
