import { Paywall } from "@/components/subscription/paywall";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

function formatExpiryDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PremiumCard({
  isPremium,
  premiumExpiresAt,
}: {
  isPremium: boolean;
  premiumExpiresAt: string | null;
}) {
  const [paywallVisible, setPaywallVisible] = useState(false);

  if (isPremium) {
    return (
      <View style={[styles.card, styles.cardPremium]}>
        <View style={styles.headerRow}>
          <Ionicons name="diamond" size={22} color={Colors.primaryAccentColor} />
          <ThemedText style={styles.premiumTitle}>Premium active</ThemedText>
        </View>
        <ThemedText style={styles.premiumBody}>
          {premiumExpiresAt
            ? `Active until ${formatExpiryDate(premiumExpiresAt)}`
            : "You have full access to all roleplays and content."}
        </ThemedText>
      </View>
    );
  }

  return (
    <>
      <Pressable style={styles.card} onPress={() => setPaywallVisible(true)}>
        <View style={styles.headerRow}>
          <Ionicons name="diamond-outline" size={22} color={Colors.primaryAccentColor} />
          <ThemedText style={styles.title}>Upgrade to Premium</ThemedText>
        </View>
        <ThemedText style={styles.body}>
          Unlock all roleplays, advanced lessons, and personalized vocabulary.
        </ThemedText>
        <View style={styles.cta}>
          <ThemedText style={styles.ctaText}>Start free trial</ThemedText>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </View>
      </Pressable>
      <Paywall visible={paywallVisible} onClose={() => setPaywallVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primaryAccentColor + "44",
    backgroundColor: Colors.primaryAccentColor + "08",
  },
  cardPremium: {
    backgroundColor: Colors.primaryAccentColor + "12",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primaryAccentColor,
  },
  body: {
    fontSize: 14,
    color: Colors.subduedTextColor,
    lineHeight: 20,
    marginBottom: 12,
  },
  premiumBody: {
    fontSize: 14,
    color: Colors.subduedTextColor,
    lineHeight: 20,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: Colors.primaryAccentColor,
  },
  ctaText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
