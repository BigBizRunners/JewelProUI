import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import TextInputField from './TextInputField';
import QuantityInput from './QuantityInput';
import DateInput from './DateInput';
import OptionSelector from './OptionSelector';
import WeightRangeInput from './WeightRangeInput';

const DynamicFieldRenderer = ({ fields, values, onChange }: any) => {
    return fields.map((field: any) => {
        const value = values[field.name] || (field.type === 'options' && field.multiSelect ? [] : '');

        if (field.type === 'note') {
            return (
                <View key={field.name} style={styles.noteContainer}>
                    <Text style={styles.note}>{field.label}</Text>
                </View>
            );
        }

        if (field.type === 'text') {
            return (
                <TextInputField
                    key={field.name}
                    label={field.label}
                    value={value}
                    required={field.required}
                    onChange={(text: string) => onChange(field.name, text)}
                    placeholder={`Enter ${field.label}`}
                />
            );
        }

        if (field.type === 'numeric') {
            return (
                <QuantityInput
                    key={field.name}
                    value={value}
                    onChange={(text: string) => onChange(field.name, text)}
                />
            );
        }

        if (field.type === 'date') {
            return (
                <DateInput
                    key={field.name}
                    label={field.label}
                    value={value || new Date()}
                    onChange={(date: Date) => onChange(field.name, date)}
                />
            );
        }

        if (field.type === 'options') {
            return (
                <OptionSelector
                    key={field.name}
                    label={field.label}
                    options={field.options}
                    value={value}
                    onChange={(val: string | string[]) => onChange(field.name, val)}
                    multiSelect={field.multiSelect}
                />
            );
        }

        if (field.type === 'range') {
            return (
                <WeightRangeInput
                    required={field.required}
                    key={field.name}
                    label={field.label}
                    from={value?.from || ''}
                    to={value?.to || ''}
                    onChangeFrom={(text: string) =>
                        onChange(field.name, { ...value, from: text })
                    }
                    onChangeTo={(text: string) =>
                        onChange(field.name, { ...value, to: text })
                    }
                />
            );
        }

        return null;
    });
};

const styles = StyleSheet.create({
    noteContainer: {
        marginBottom: 20,
    },
    note: {
        fontSize: 14,
        color: '#333',
        fontStyle: 'italic',
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 4,
    },
});

export default DynamicFieldRenderer;
