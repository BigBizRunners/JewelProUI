import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native'; // Import CommonActions
import Svg, { Path } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const OrderSuccessScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { orderId } = route.params || {};

    const progress = useSharedValue(0);
    const checkmarkLength = 100;

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: checkmarkLength * (1 - progress.value),
    }));

    useEffect(() => {
        progress.value = withTiming(1, {
            duration: 800,
            easing: Easing.out(Easing.quad),
        });
    }, []);

    const handleViewOrder = () => {
        // This will reset the navigation stack to show the Orders list,
        // and then push the OrderDetail screen on top.
        // NOTE: You must create an 'OrderDetailScreen' and add it to your main
        // StackNavigator in App.tsx for this to work.
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [
                    { name: 'Home', state: { routes: [{ name: 'Orders' }] } },
                    { name: 'OrderDetail', params: { orderId } }
                ],
            })
        );
    };

    const handleClose = () => {
        // This resets the entire navigation state, taking the user to the 'Home'
        // navigator and ensuring the 'Orders' tab is the active one.
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [
                    {
                        name: 'Home', // This is the name of your BottomTabNavigator in App.tsx
                        state: {
                            routes: [{ name: 'Orders' }], // This is the name of the tab in BottomTabNavigator.tsx
                        },
                    },
                ],
            })
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Svg height="120" width="120" viewBox="0 0 52 52">
                    <AnimatedPath
                        fill="none"
                        stroke="#075E54"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.1 27.2l7.1 7.2 16.7-16.8"
                        strokeDasharray={checkmarkLength}
                        animatedProps={animatedProps}
                    />
                </Svg>
                <Text style={styles.title}>Order Created!</Text>
                <Text style={styles.subtitle}>Your order has been successfully placed.</Text>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.button, styles.viewButton]} onPress={handleViewOrder}>
                    <Text style={styles.viewButtonText}>View Order Details</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.closeButton]} onPress={handleClose}>
                    <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
            </View>
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
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    buttonContainer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    button: {
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 10,
    },
    viewButton: {
        backgroundColor: '#075E54',
    },
    viewButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    closeButton: {
        backgroundColor: '#f0f0f0',
    },
    closeButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default OrderSuccessScreen;
