import { Dimensions, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { verticalScale } from 'react-native-size-matters';
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import {useVideoPlayer, VideoView} from "expo-video";
import { useFonts } from 'expo-font';
import { EBGaramond_500Medium_Italic } from '@expo-google-fonts/eb-garamond';
import { Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AntDesign, Fontisto } from '@expo/vector-icons';
import EmailAuth from './emailAuth';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { signInWithOAuthProvider } from '@/lib/socialAuth';
import { toast } from 'sonner-native';




const MENU_HEIGHT = 250;
const PEEK_MENU_HEIGHT = 50;
 const CLOSED_POSITION = MENU_HEIGHT - PEEK_MENU_HEIGHT;
const PALETTE = {
  bg900: "#0B0F14",
  surface: "#121821",
  border: "#223041",
  textPrimary: "#F3F6FA",
  textSecondary: "#9AA8B8",
  accentGold: "#F6E7B8",
  accentBlue: "#6FA3FF",
  overlay: "rgba(7, 10, 14, 0.45)",
};

 const videoSource = require("../../assets/videos/onboarding.mp4");
 const logoSource = require("../../assets/images/icon.png");

const {height, width} = Dimensions.get("window");

const IntroScreen = () => {
  const mainTextOpacity = useSharedValue(0);
  const scriptTextOpacity = useSharedValue(0);
  const menuContentOpacity = useSharedValue(1);
  const menuTranslateY = useSharedValue(CLOSED_POSITION);
  const insets = useSafeAreaInsets();
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentView, setCurrentView] = useState<"login" | "email">("login");
  const mainTextWords: string[] = ["Learn", "Spanish", "the", "right", "way"];
  const scriptPhrases: string[] = ["Speaking", "Listening", "Practising", "Conversing"];
  const [fontsLoaded] = useFonts({
    EBGaramond_500Medium_Italic,
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null);
  const player = useVideoPlayer(videoSource, (player) =>{
    player.loop = true;
    player.muted = true;
    player.play();
  } )

    const mainTextAnimatedStyle = useAnimatedStyle(() => {
      const translateY = interpolate(
        mainTextOpacity.value,
        [0,1],
        [30, 0],
        Extrapolation.CLAMP
      );
      return {
        opacity: mainTextOpacity.value,
        transform: [{translateY}],
      }
    })
    const scriptTextAnimatedStyle = useAnimatedStyle(() => {
      const translateY = interpolate(
        scriptTextOpacity.value,
        [0,1],
        [20, 0],
        Extrapolation.CLAMP
      );
      return {
        opacity: scriptTextOpacity.value,
        transform: [{translateY}],
      }
    });

    const menuAnimatedStyle = useAnimatedStyle(() => {
      return{
        transform: [{translateY: menuTranslateY.value}],
      }
    })
    const menuContentAnimatedStyle = useAnimatedStyle(() => {
      return{
        opacity: menuContentOpacity.value
      }
    })

    const panGesture = Gesture.Pan().onEnd((event) => {
      "worklet"
      const swipeThreshold = 50; 
      const isUpSwipe = event.translationY < -swipeThreshold;
      const isDownSwipe = event.translationY > swipeThreshold;
      if(isUpSwipe){
       menuTranslateY.value = withSpring(0, {
        damping:30,
        stiffness:200,
        mass:1
       })
      }else if(isDownSwipe){
        menuTranslateY.value = withSpring(CLOSED_POSITION, {
          damping:30,
          stiffness:200,
          mass:1
        }) 
      }
    })

    const animateTextIn = () => {
      mainTextOpacity.value = withTiming(1, {duration : 1200});
      scriptTextOpacity.value = withDelay(800,withTiming(1,{duration : 800}));
    }
    const animateScriptOut = () => {
      scriptTextOpacity.value = withTiming(0, {duration : 500});
    }
    const animateScriptIn = () => {
      scriptTextOpacity.value = withTiming(1, {duration : 600});
    }
    useEffect(() => {
      player.play();

      const timeout = setTimeout(() => {
        animateTextIn();
      }, 300);

      // Wait for 3.5 seconds, fade out, then rotate phrase.
      const cycleInterval = setInterval(() => {
        animateScriptOut();
        setTimeout(() => {
          setCurrentPhraseIndex((prev) => {
            const nextIndex = (prev + 1) % scriptPhrases.length;
            if(nextIndex === 0){
              setTimeout(() => animateScriptIn(),150);
            }
            return nextIndex;
          });
        }, 500);
      }, 3500);

      return () => {
        clearTimeout(timeout);
        clearInterval(cycleInterval);
      };
    }, []);

    useEffect(() => {
      if (currentPhraseIndex > 0){
        const timeout = setTimeout(() => {
          animateScriptIn();
        }, 150);

        return () => {
          clearTimeout(timeout);
        };
      }
    }, [currentPhraseIndex]);

    const animateMenu = (open:boolean) => {
      menuTranslateY.value = withSpring(open ? 0 : CLOSED_POSITION, {
        damping:30,
        stiffness : 200,
        mass: 1
      })
    }
    const animateToEmailView = (to: "email" | "login") => {
      menuContentOpacity.value = withTiming(0, {duration: 200});
      setTimeout(() => {
        setCurrentView(to);
        menuContentOpacity.value = withTiming(1, {duration: 300});
      }, 200)
    }
    // const animateToLoginView = () => {
    //   menuContentOpacity.value = withTiming(0, {duration: 200});
    //   setTimeout(() => {
    //     setCurrentView("login");
    //     menuContentOpacity.value = withTiming(1, {duration: 200});
    //   }, 200)
    // }
    const handlePress = () => {
      const newState = !isMenuOpen;
      setIsMenuOpen(newState);
      animateMenu(newState);
    }

    const handleOAuthSignIn = async (provider: "google" | "apple") => {
      if (oauthLoading) return;
      setOauthLoading(provider);
      try {
        await signInWithOAuthProvider(provider);
      } catch (error: any) {
        toast.error(error?.message ?? "Something went wrong. Please try again.");
      } finally {
        setOauthLoading(null);
      }
    };

    const renderLoginView = () => {
        return(
          <Animated.View style={[styles.viewContainer, menuContentAnimatedStyle]}>
            <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
            <Image source={logoSource} style={styles.logo}/>
            <Text style={styles.appName}>Yǔlín </Text>
            </View>
            <View style={styles.statsContainer}>
            <Text style={styles.rating}>Start today</Text>
            </View>
            </View>
            <View style={styles.buttonsContainer}>
            {Platform.OS === "ios" && (
              <Pressable
                style={[styles.loginButton, oauthLoading === "apple" && styles.buttonDisabled]}
                onPress={() => handleOAuthSignIn("apple")}
                disabled={!!oauthLoading}
              >
                <AntDesign name="apple" size={16} color="white" style={styles.appleIcon}/>
                <Text style={styles.buttonText}>
                  {oauthLoading === "apple" ? "Signing in..." : "Continue with Apple"}
                </Text>
              </Pressable>
            )}
            <Pressable
              style={[styles.loginButton, oauthLoading === "google" && styles.buttonDisabled]}
              onPress={() => handleOAuthSignIn("google")}
              disabled={!!oauthLoading}
            >
              <AntDesign name="google" size={16} color="white" style={styles.googleIcon}/>
              <Text style={styles.buttonText}>
                {oauthLoading === "google" ? "Signing in..." : "Continue with Google"}
              </Text>
            </Pressable>
            <Pressable style={styles.loginButton} onPress={() => animateToEmailView("email")}>
              <Fontisto name="email" size={16} color="white" style={styles.emailIcon}/>
              <Text style={styles.buttonText}>Continue with Email</Text>
            </Pressable>

            </View>
          </Animated.View>
        )
    }

const renderEmailView = () => {
  return(
<EmailAuth onBack={() => animateToEmailView("login")} 
menuContentAnimatedStyle={menuContentAnimatedStyle}
  />
  )
  
}
useEffect(() => {
const keyboardWillShowListener  = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow", (event) => {
setKeyboardHeight(event?.endCoordinates?.height);
})
const keyboardWillHideListener  = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide", (event) => {
setKeyboardHeight(0);
})
return () => {
  keyboardWillShowListener?.remove();
  keyboardWillHideListener?.remove();
}
    }, [])
    const dynamicMenuHeight = keyboardHeight > 0 ? MENU_HEIGHT + keyboardHeight + 50 : MENU_HEIGHT + 100;
if(!fontsLoaded){
  return null;
}
  return (
    <View style={{flex:1, backgroundColor: PALETTE.bg900}}>
      <VideoView
       nativeControls={false}  
      player={player}  
      contentFit="cover" 
      style={[StyleSheet.absoluteFill, {width, height}]}
      />
      {/* Overlay */}
      <View 
      style={[
        StyleSheet.absoluteFill,
        {backgroundColor: PALETTE.overlay , zIndex:20},
      ]}
      />
      {/* Hero text  */}
      <View style={styles.heroTextContainer}>
      <Animated.Text style={[styles.mainTextContainer, mainTextAnimatedStyle]}>
      <Text style={styles.heroTextMain}>{mainTextWords.join(" ")}</Text>
      </Animated.Text>
      <Animated.Text style={scriptTextAnimatedStyle}>
      <Text style={styles.heroTextScript}>{scriptPhrases[currentPhraseIndex]}</Text>
      </Animated.Text>
      </View>
      <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.menuContainer, menuAnimatedStyle, {height: dynamicMenuHeight, paddingBottom: insets.bottom + 30}]}>
      <Pressable style={styles.handleContainer} onPress={handlePress}>
      <View style={styles.handle}/>
      </Pressable>
      <View style={styles.menuContent}>
        {currentView === "login" ? renderLoginView() : renderEmailView()}
      </View>
      </Animated.View>
      </GestureDetector>
     
    </View>
  )
}

export default IntroScreen

const styles = StyleSheet.create({
    menuContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: MENU_HEIGHT + 100,
      backgroundColor: PALETTE.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderTopWidth: 1.5,
      borderLeftWidth: 1.5,
      borderRightWidth: 1.5,
      borderColor: PALETTE.border,
      zIndex: 30,
    },
    handleContainer: {
      paddingVertical: 12,
      alignItems: "center",
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: PALETTE.textSecondary,
      borderRadius: 2,
    },
    menuContent: {
      flex: 1,
      paddingHorizontal: 30,
    },
    viewContainer: {
      flex: 1,
    },
    logoSection: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 20,
      marginBottom: 24,
      paddingHorizontal: 10,
    },
    logoContainer: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    logo: {
      width: 25,
      height: 25,
      marginRight: 5,
      borderRadius: 12,
    },
    appName: {
      fontSize: 18,
      fontWeight: "700",
      color: PALETTE.textPrimary,
    },
    statsContainer: {
      alignItems: "center",
    },
    rating: {
      fontSize: 16,
      fontWeight: "600",
      color: PALETTE.textPrimary,
    },
    buttonsContainer: {
      gap: 16,
    },
    loginButton: {
      backgroundColor: PALETTE.surface,
      borderColor: PALETTE.border,
      borderWidth: 1,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 40,
    },
    appleIcon: {
      marginRight: 12,
    },
    googleIcon: {
      marginRight: 12,
    },
    emailIcon: {
      marginRight: 12,
    },
    buttonText: {
      color: PALETTE.textPrimary,
      fontSize: 17,
      fontWeight: "500",
      letterSpacing: -0.2,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    heroTextContainer: {
      position: "absolute",
      top: height * 0.15,
      left: 30,
      right: 30,
      zIndex: 25,
    },
    mainTextContainer: {
      marginBottom: 0,
    },
    heroTextMain: {
      fontSize: verticalScale(45),
      fontWeight: "800",
      fontFamily: "System",
      color: PALETTE.accentGold,
      lineHeight: verticalScale(50),
      letterSpacing: 0,
    },
    heroTextScript: {
      fontSize: verticalScale(55),
      fontFamily: "EBGaramond_500Medium_Italic",
      color: PALETTE.accentBlue,
      letterSpacing: 0.5,
    },
  });