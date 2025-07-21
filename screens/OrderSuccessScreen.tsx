import React, { useEffect, useRef, useCallback } from 'react'; // Add useCallback here
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
    Easing,
    runOnJS,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Import for icons

const AnimatedPath = Animated.createAnimatedComponent(Path);

const AnimatedCheckmark = ({ onAnimationEnd }) => {
    const progress = useSharedValue(0);
    const scale = useSharedValue(0.8);

    useEffect(() => {
        progress.value = withTiming(1, {
            duration: 800,
            easing: Easing.out(Easing.quad),
        }, (finished) => {
            if (finished && onAnimationEnd) {
                runOnJS(onAnimationEnd)();
            }
        });
        scale.value = withTiming(1, {
            duration: 600,
            easing: Easing.out(Easing.elastic(1.2)),
        });
    }, []);

    const animatedProps = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const animatedStrokeProps = useAnimatedStyle(() => ({
        strokeDashoffset: 100 * (1 - progress.value),
    }));

    return (
        <Animated.View style={animatedProps}>
            <Svg height="120" width="120" viewBox="0 0 52 52">
                {/* Background circle if desired */}
                <Path
                    d="M26 0C11.66 0 0 11.66 0 26s11.66 26 26 26 26-11.66 26-26S40.34 0 26 0z"
                    fill="#D1FAE5" // A lighter shade of your green for the background circle
                />
                <Path
                    stroke="#075E54"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    d="M14.1 27.2l7.1 7.2 16.7-16.8"
                    strokeDasharray={100}
                    strokeDashoffset={100}
                />
                <AnimatedPath
                    stroke="#075E54"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    d="M14.1 27.2l7.1 7.2 16.7-16.8"
                    strokeDasharray={100}
                    animatedProps={animatedStrokeProps} // Directly pass the animated style object
                />
            </Svg>
        </Animated.View>
    );
};

const OrderSuccessScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { orderId, isEditMode } = route.params || {};

    const animationProgress = useSharedValue(0);
    const showConfetti = useSharedValue(0);

    useEffect(() => {
        animationProgress.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, []);

    const handleCheckmarkAnimationEnd = useCallback(() => {
        // Delay confetti slightly after checkmark is done
        showConfetti.value = withTiming(1, { duration: 500 });
    }, []);

    const handleViewOrder = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [
                    { name: 'Home', state: { routes: [{ name: 'Orders' }] } },
                    { name: 'OrderDetails', params: { orderId } },
                ],
            })
        );
    };

    const handleClose = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Home', state: { routes: [{ name: 'Orders' }] } }],
            })
        );
    };

    const title = isEditMode ? 'Order Updated!' : 'Order Created!';
    const subtitle = isEditMode
        ? 'Your order has been successfully updated.'
        : 'Your order has been successfully placed.';

    const contentStyle = useAnimatedStyle(() => ({
        opacity: animationProgress.value,
        transform: [{ translateY: interpolate(animationProgress.value, [0, 1], [20, 0]) }],
    }));

    const buttonPressScale = useSharedValue(1);

    const animatedButtonPressStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonPressScale.value }],
    }));

    const handlePressIn = () => {
        buttonPressScale.value = withTiming(0.95, { duration: 100 });
    };

    const handlePressOut = () => {
        buttonPressScale.value = withTiming(1, { duration: 100 });
    };

    return (
        <LinearGradient colors={['#f0fdf4', '#d1fae5']} style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f0fdf4" />
            {showConfetti.value === 1 && (
                <ConfettiCannon count={80} origin={{ x: -10, y: 0 }} fadeOut />
            )}

            <Animated.View style={[styles.content, contentStyle]}>
                <AnimatedCheckmark onAnimationEnd={handleCheckmarkAnimationEnd} />
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </Animated.View>

            <Animated.View style={[styles.buttonContainer, contentStyle]}>
                <TouchableOpacity
                    style={[styles.button, styles.viewButton, animatedButtonPressStyle]}
                    onPress={handleViewOrder}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                >
                    <View style={styles.buttonContent}>
                        <Text style={styles.viewButtonText}>View Order Details</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.closeButton, animatedButtonPressStyle]}
                    onPress={handleClose}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                >
                    <View style={styles.buttonContent}>
                        <Text style={styles.closeButtonText}>Done</Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#075E54',
        marginTop: 24,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#4B5563',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    buttonContainer: {
        padding: 20,
        paddingBottom: 30,
    },
    button: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonIcon: {
        marginRight: 8,
    },
    viewButton: {
        backgroundColor: '#075E54',
    },
    viewButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    closeButton: {
        backgroundColor: '#E5E7EB',
    },
    closeButtonText: {
        color: '#1F2937',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default OrderSuccessScreen;
