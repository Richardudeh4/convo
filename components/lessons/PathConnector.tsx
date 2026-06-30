import { Colors } from "@/constants/theme";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export default function PathConnector({ active }: { active: boolean }) {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      pulseAnim.setValue(0);
      return;
    }

    pulseAnim.setValue(0);
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, [active, pulseAnim]);

  const height = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 36],
  });

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0.8, 1],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.line, { height, opacity }]} />
      <Animated.View
        style={[
          styles.dot,
          {
            opacity,
            transform: [
              {
                scale: pulseAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.4, 1],
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
  },
  line: {
    width: 4,
    borderRadius: 2,
    backgroundColor: Colors.primaryAccentColor,
  },
  dot: {
    position: "absolute",
    bottom: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primaryAccentColor,
  },
});
