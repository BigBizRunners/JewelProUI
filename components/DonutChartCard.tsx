import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Circle } from 'react-native-svg';

const DonutChartCard = ({ data }) => {
    const size = 140;
    const strokeWidth = 16;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const total = data.reduce((sum, d) => sum + d.value, 0);

    let cumulativePercent = 0;

    const renderSegments = () =>
        data.map((item, index) => {
            const percent = item.value / total;
            const strokeDasharray = `${percent * circumference}, ${circumference}`;
            const strokeDashoffset = circumference * (1 - cumulativePercent);
            const segment = (
                <Circle
                    key={index}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={item.color || '#ccc'}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="butt"
                    fill="transparent"
                />
            );
            cumulativePercent += percent;
            return segment;
        });

    return (
        <View style={styles.card}>
            <View style={styles.row}>
                <View style={styles.chartWrapper}>
                    <Svg width={size} height={size}>
                        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                            {renderSegments()}
                        </G>
                    </Svg>
                    <View style={styles.centerLabel}>
                        <Text style={styles.totalText}>{total}</Text>
                    </View>
                </View>

                <View style={styles.legendWrapper}>
                    {data.map((item, index) => (
                        <View key={index} style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: item.color || '#ccc' }]} />
                            <Text style={styles.legendLabel}>{item.label}</Text>
                            <Text style={styles.legendValue}>{item.value}</Text>
                        </View>
                    ))}
                </View>
            </View>
            <Text style={styles.chartTitle}>Order Status</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 10,
        marginVertical: 12,
        elevation: 3,
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    chartWrapper: {
        width: 140,
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    centerLabel: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    totalText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    legendWrapper: {
        marginLeft: 20,
        flex: 1,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 6,
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
    chartTitle: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
});

export default DonutChartCard;
