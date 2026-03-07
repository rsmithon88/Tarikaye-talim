import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing, useColorScheme } from "react-native";
import Colors from "@/constants/colors";

interface LoadingSpinnerProps {
  size?: "small" | "large";
  showText?: boolean;
}

export default function LoadingSpinner({ size = "large", showText = true }: LoadingSpinnerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.6)).current;
  const dotAnim1 = useRef(new Animated.Value(0)).current;
  const dotAnim2 = useRef(new Animated.Value(0)).current;
  const dotAnim3 = useRef(new Animated.Value(0)).current;

  const isLarge = size === "large";
  const ringSize = isLarge ? 56 : 32;
  const borderW = isLarge ? 3 : 2;

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const dotBounce = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: -6,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 300,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

    spin.start();
    pulse.start();
    if (isLarge && showText) {
      dotBounce(dotAnim1, 0).start();
      dotBounce(dotAnim2, 150).start();
      dotBounce(dotAnim3, 300).start();
    }

    return () => {
      spin.stop();
      pulse.stop();
    };
  }, []);

  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={s.wrapper}>
      <Animated.View
        style={[
          s.ring,
          {
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            borderWidth: borderW,
            borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,50,100,0.1)",
            borderTopColor: Colors.navy,
            borderRightColor: isDark ? "rgba(100,180,255,0.5)" : "rgba(0,80,150,0.4)",
            transform: [{ rotate: spinInterpolate }],
            opacity: pulseAnim,
          },
        ]}
      />
      {isLarge && showText && (
        <View style={s.textRow}>
          <Text style={[s.loadingText, { color: isDark ? Colors.darkTextMid : Colors.textMid }]}>
            লোডিং
          </Text>
          <View style={s.dotsRow}>
            {[dotAnim1, dotAnim2, dotAnim3].map((anim, i) => (
              <Animated.View
                key={i}
                style={[
                  s.dot,
                  {
                    backgroundColor: isDark ? Colors.darkTextMid : Colors.textMid,
                    transform: [{ translateY: anim }],
                  },
                ]}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  ring: {},
  textRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  loadingText: {
    fontSize: 15,
    fontFamily: "SolaimanLipi",
    letterSpacing: 1,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
