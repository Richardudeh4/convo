import { Question } from "@/constants/CourseData";
import { Colors } from "@/constants/theme";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Animated, Platform, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../themed-text";
import AudioWaveForm from "./AudioWaveForm";

export default function AudioPrompt({
    isPlaying,
    hasListenedToAudio,
    onPlay,
    onRevealMadarin,
    currentQuestion,
    showMandarin,
    scaleAmin,
    instructionOpacity,
    listeningOpacity,
    listeningScale,
    fadeAnim,
}: {
    isPlaying: boolean;
    hasListenedToAudio: boolean;
    onPlay: () => void;
    onRevealMadarin: () => void;
    currentQuestion: Question;
    showMandarin: boolean;
    scaleAmin: Animated.Value;
    instructionOpacity: Animated.Value;
    listeningOpacity: Animated.Value;
    listeningScale: Animated.Value;
    fadeAnim: Animated.Value;
}) {
    const playbackDisabled = isPlaying || hasListenedToAudio;

    return (
        <>
            <Pressable
            disabled={playbackDisabled}
            onPress={playbackDisabled ? undefined : () => requestAnimationFrame(onPlay)}
            onPressIn={() => {
                if (playbackDisabled) return;

                Animated.spring(scaleAmin, {
                    toValue: 0.9,
                    useNativeDriver: true,
                }).start();
            }}
            onPressOut={() => {
                if (playbackDisabled) return;

                Animated.spring(scaleAmin, {
                    toValue: 1,
                    useNativeDriver: true,
                }).start();
            }}
            >
                <Animated.View
                    style={[
                        styles.playButton,
                        {
                            backgroundColor: playbackDisabled
                                ? "#9ED4CF"
                                : Colors.primaryAccentColor,
                            transform: [{ scale: scaleAmin }],
                        },
                    ]}
                >
                    {isPlaying ? (
                        <MaterialIcons name="graphic-eq" size={36} color="white" />
                    ) : (
                        <Ionicons name="play" size={36} color="white" />
                    )}
                </Animated.View>
            </Pressable>

            <AudioWaveForm isPlaying={isPlaying} />

            <View
                style={[
                    styles.promptTextContainer,
                    { minHeight: currentQuestion.type === "listening_mc" ? 0 : 50 },
                ]}
            >
                {!hasListenedToAudio ? (
                    <View style={styles.listeningPrompt}>
                        <Animated.View
                            style={[styles.instructionContainer, { opacity: instructionOpacity }]}
                        >
                            <ThemedText style={[styles.instructionText, { marginBottom: 8 }]}>
                                Tap to listen
                            </ThemedText>
                            <ThemedText style={styles.instructionText}>
                                Play audio once before response
                            </ThemedText>
                        </Animated.View>
                        <Animated.View
                            style={[
                                styles.listeningContainer,
                                {
                                    opacity: listeningOpacity,
                                    transform: [{ scale: listeningScale }],
                                },
                            ]}
                        >
                            <ThemedText style={styles.revealButtonText}>Listening...</ThemedText>
                        </Animated.View>
                    </View>
                ) : showMandarin ? (
                    <TouchableOpacity onPress={onRevealMadarin}>
                        <Animated.View style={[styles.mandarinText, { opacity: fadeAnim }]}>
                            <ThemedText style={styles.pinyin}>
                                {currentQuestion.target.romanization}
                            </ThemedText>
                            <ThemedText style={[styles.hanzi, { color: Colors.subduedTextColor }]}>
                                {currentQuestion.target.text}
                            </ThemedText>
                        </Animated.View>
                    </TouchableOpacity>
                ) : (
                    currentQuestion.type !== "listening_mc" && (
                        <TouchableOpacity
                            style={styles.revealButton}
                            onPress={onRevealMadarin}
                            hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
                        >
                            <ThemedText style={styles.instructionText}>
                                Tap to reveal the Spanish
                            </ThemedText>
                        </TouchableOpacity>
                    )
                )}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    playButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primaryAccentColor,
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 10,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
            },
        }),
    },
    mandarinText: {
        alignItems: "center",
        padding: 16,
        borderRadius: 12,
    },
    pinyin: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
    },
    hanzi: {
        fontSize: 18,
    },
    revealButton: {
        marginBottom: 8,
        marginTop: 16,
        alignItems: "center",
    },
    revealButtonText: {
        fontSize: 16,
        color: Colors.subduedTextColor,
        marginBottom: 4,
    },
    promptTextContainer: {
        alignItems: "center",
    },
    listeningPrompt: {
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        minHeight: 60,
    },
    instructionContainer: {
        alignItems: "center",
    },
    listeningContainer: {
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
    },
    instructionText: {
        fontSize: 16,
        textAlign: "center",
        color: Colors.subduedTextColor,
    },
});
