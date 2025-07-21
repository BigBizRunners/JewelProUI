import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing, useAnimatedStyle, interpolate } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const AnimatedCheckmark = () => {
    const progress = useSharedValue(0);
    const checkmarkLength = 100;

    useEffect(() => {
        progress.value = withTiming(1, {
            duration: 800,
            easing: Easing.out(Easing.quad),
        });
    }, []);

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: checkmarkLength * (1 - progress.value),
    }));

    return (
        <Svg height="120" width="120" viewBox="0 0 52 52">
            <Path
                stroke="#075E54"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                d="M14.1 27.2l7.1 7.2 16.7-16.8"
                strokeDasharray={checkmarkLength}
                strokeDashoffset={checkmarkLength}
            />
            <AnimatedPath
                stroke="#075E54"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                d="M14.1 27.2l7.1 7.2 16.7-16.8"
                strokeDasharray={checkmarkLength}
                animatedProps={animatedProps}
            />
        </Svg>
    );
};

const OrderSuccessScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { orderId, isEditMode } = route.params || {};

    const animationProgress = useSharedValue(0);

    useEffect(() => {
        animationProgress.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.exp) });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, []);

    const handleViewOrder = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [
                    { name: 'Home', state: { routes: [{ name: 'Orders' }] } },
                    { name: 'OrderDetails', params: { orderId } }
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

    const title = isEditMode ? "Order Updated!" : "Order Created!";
    const subtitle = isEditMode
        ? "Your order has been successfully updated."
        : "Your order has been successfully placed.";

    const animatedContainerStyle = useAnimatedStyle(() => ({
        opacity: animationProgress.value,
        transform: [{
            translateY: interpolate(animationProgress.value, [0, 1], [20, 0])
        }],
    }));

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F0FDF4" />
            <Animated.View style={[styles.content, animatedContainerStyle]}>
                <AnimatedCheckmark />
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </Animated.View>
            <Animated.View style={[styles.buttonContainer, animatedContainerStyle]}>
                <TouchableOpacity style={[styles.button, styles.viewButton]} onPress={handleViewOrder}>
                    <Text style={styles.viewButtonText}>View Order Details</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.closeButton]} onPress={handleClose}>
                    <Text style={styles.closeButtonText}>Done</Text>
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
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
        color: '#1E40AF',
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
