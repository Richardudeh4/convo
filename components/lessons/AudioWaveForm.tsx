import { Colors } from "@/constants/theme";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export default function AudioWaveForm({isPlaying} : {isPlaying: boolean}){

    const waveAmins = useRef(Array.from({length: 20}, () => new Animated.Value(0.3)),).current;

    // Simulated visulaization 
    useEffect(() => {
      if(isPlaying){
        const animations = waveAmins.map((anim) => {
          return Animated.loop(
            Animated.sequence([
              Animated.timing(anim, {
                toValue: Math.random() * 0.5 + 0.5,
                duration: 150 + Math.random() * 200,
                  useNativeDriver: true,
                }),
                Animated.timing(anim, {
                  toValue: 0.3,
                  duration: 150 + Math.random() * 200,
                  useNativeDriver: true,
                }),
            ])
          )
        });
        Animated.parallel(animations).start();
      }
     else {
      waveAmins.map((anim) => {
        anim.stopAnimation()
        Animated.timing(anim, {
          toValue: 0.3,
          duration: 150 + Math.random() * 200,
          useNativeDriver: true,
        }).start();
      })
     }
    }, [isPlaying])
    return (
        <View style={styles.waveformContainer}>
            <View style={styles.audioWaveContainer}>
              {waveAmins.map((anim, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.waveBar,
                    {
                      transform: [{ scaleY: anim }],
                      height: 16 + (index % 4) * 6,
                    },
                  ]}
                />
              ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    waveformContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 10,
      minHeight: 50,
    },
    audioWaveContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
      paddingHorizontal: 20,
    },
    waveBar: {
      width: 3,
      backgroundColor: Colors.primaryAccentColor,
      borderRadius: 1.5,
      opacity: 0.8,
      minHeight: 8,
    },
  });