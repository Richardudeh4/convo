import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import Animated from 'react-native-reanimated';
import {Entypo} from "@expo/vector-icons"
import { toast } from 'sonner-native';
import {makeRedirectUri} from  "expo-auth-session"
import { supabase } from '@/utils/supabase';

const redirectTo = makeRedirectUri({ scheme: "convo", path: "auth/callback" });
console.log("redirectTo", redirectTo);

export default function EmailAuth({ onBack, menuContentAnimatedStyle }: {onBack: () => void;
menuContentAnimatedStyle: any;}) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false); 
  const signInWithEmail = async() => {
    if(!email){
      toast.error("Please enter your email address");
      return;
    }
    setIsLoading(true);
try{

 const {error} = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      emailRedirectTo: redirectTo,
    },
  });
  if(error){
    toast.error(error.message);;
    throw error;
  }
else{
  toast.success("Check your email for login link");
}
}catch(error:any){
  toast.error("Something went wrong. please try again.");
}finally{
  setIsLoading(false);
}
  }
  return (
    <Animated.View style={[menuContentAnimatedStyle, styles.viewContainer]}>
      <View style={styles.emailHeader}>
        <Pressable onPress={onBack}>
        <Entypo name="chevron-thin-left" size={18} color="white" />
        </Pressable>
      </View>
      <View style={styles.titleContainer}>
      <Text style={styles.emailMainTitle}>Enter your email address </Text>
      <Text style={styles.emailSubtitle}>We'll send you a magic link to sign in .</Text>
      </View>
      <View style={styles.formContainer}>
      <View style={styles.inputContainer}>
    <TextInput style={styles.emailTextInput} 
    keyboardType="email-address"
    autoCapitalize="none"
    autoComplete="email"
    value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="rgba(255, 255, 255, 0.4)" />
      </View>
      <Pressable style={[styles.verificationButton, isLoading && styles.buttonDisabled]} onPress={signInWithEmail} disabled={isLoading}>
        <Text style={styles.verificationButtonText}>{isLoading ? "Sending..." : "Send magic link"}</Text>
      </Pressable>
      </View>
    </Animated.View>
  )
}



const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
  },
  emailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 20,
  },
  placeholder: {
    width: 40,
  },
  titleContainer: {
    marginBottom: 20,
  },
  emailMainTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
    lineHeight: 34,
  },
  emailSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "400",
  },
  formContainer: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  emailTextInput: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "white",
    minHeight: 52,
  },
  verificationButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    marginTop: 10,
  },
  verificationButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: -0.2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});