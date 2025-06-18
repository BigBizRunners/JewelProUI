import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

const ProgressHeader = ({ title, currentStep, totalSteps }) => {
    // This function generates the visual steps (the dots and lines)
    const renderSteps = () => {
        const steps = [];
        for (let i = 1; i <= totalSteps; i++) {
            const isActive = i === currentStep;
            // Add the numbered circle for the step
            steps.push(
                <View key={`step-${i}`} style={[styles.stepDot, isActive ? styles.stepDotActive : styles.stepDotInactive]}>
                    <Text style={isActive ? styles.stepDotTextActive : styles.stepDotTextInactive}>{i}</Text>
                </View>
            );
            // Add a line between the steps, but not after the last one
            if (i < totalSteps) {
                steps.push(<View key={`line-${i}`} style={styles.stepLine} />);
            }
        }
        return steps;
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>{title}</Text>
                <View style={styles.stepIndicatorContainer}>
                    {renderSteps()}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: '#075E54', // Dark green background for the status bar area
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#075E54',
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        flexShrink: 1, // Ensure title doesn't push steps off-screen
    },
    stepIndicatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepDot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepDotActive: {
        backgroundColor: '#fff', // Active step is a white circle
    },
    stepDotInactive: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.5)', // Inactive step is a transparent circle with a light border
    },
    stepDotTextActive: {
        color: '#075E54', // Active step number is dark green
        fontWeight: 'bold',
    },
    stepDotTextInactive: {
        color: 'rgba(255, 255, 255, 0.5)', // Inactive step number is semi-transparent white
        fontWeight: 'bold',
    },
    stepLine: {
        width: 20,
        height: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.5)', // Line between steps
        marginHorizontal: 4,
    },
});

export default ProgressHeader;
