import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const DonutChartCard = ({ states }) => {
    const total = states.reduce((sum, s) => sum + (s.noOfOrders || 0), 0);
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    let accumulatedPercentage = 0;

    const chartStates = states.filter(s => s.noOfOrders > 0);

    return (
        <View style={styles.chartCard}>
            <View style={styles.chartContainer}>
                <Svg height="150" width="150" viewBox="0 0 150 150">
                    <Circle
                        cx="75"
                        cy="75"
                        r={radius}
                        fill="transparent"
                        stroke="#e6e6e6"
                        strokeWidth="22"
                    />
                    {chartStates.map((state, index) => {
                        const percentage = total > 0 ? (state.noOfOrders / total) * 100 : 0;
                        const arcLength = (percentage / 100) * circumference;
                        const offset = -(accumulatedPercentage / 100) * circumference;
                        accumulatedPercentage += percentage;

                        return (
                            <Circle
                                key={index}
                                cx="75"
                                cy="75"
                                r={radius}
                                fill="transparent"
                                stroke={state.color || '#ccc'}
                                strokeWidth="22"
                                strokeDasharray={`${arcLength} ${circumference}`}
                                strokeDashoffset={offset}
                                rotation="-90"
                                origin="75, 75"
                            />
                        );
                    })}
                </Svg>
                <View style={styles.donutCenter}>
                    <Text style={styles.donutCenterText}>{total}</Text>
                </View>
            </View>
            <View style={styles.legendContainer}>
                <Text style={styles.legendTitle}>Order Status</Text>
                <ScrollView>
                    {states.map((item, index) => (
                        <View key={index} style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: item.color || '#ccc' }]} />
                            <Text style={styles.legendLabel}>{item.orderStateName}</Text>
                            <Text style={styles.legendValue}>{item.noOfOrders}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    chartCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        elevation: 2,
        marginBottom: 16,
        marginHorizontal: 6,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 220,
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    donutCenter: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    donutCenterText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    chartLabel: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    legendContainer: {
        flex: 1,
        marginLeft: 24,
        height: '100%',
    },
    legendTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    legendLabel: {
        flex: 1,
        fontSize: 14,
        color: '#000',
    },
    legendValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },
});

export default DonutChartCard;
