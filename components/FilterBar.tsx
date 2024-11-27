import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { ThemedText } from './ThemedText';

export default function FilterBar({ onFilterChange }: { onFilterChange: (filter: { search: string, system: string, subsystem: string }) => void }) {
    const [search, setSearch] = React.useState<string>('');
    const [system, setSystem] = React.useState<string>('');
    const [subsystem, setSubsystem] = React.useState<string>('');

    React.useEffect(() => {
        onFilterChange({ search, system, subsystem });
    }, [search, system, subsystem]);

    return (
        <View>
            <ThemedText>Filter Bar</ThemedText>
            <TextInput
                placeholder="Search"
                placeholderTextColor={'#aaaaaa'}
                style={styles.input}
                value={search}
                onChangeText={setSearch}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 'auto',
        padding: 16,
        borderBottomColor: '#aaaaaa',
    },
    setColorDark: {
        color: '#000000',
    },
    image: {
        width: 200,
        height: 200,
    },
    titleContainer: {
        padding: 16,
        borderBottomColor: '#aaaaaa',
        borderBottomWidth: 1,
    },
    input: {
        width: '100%',
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        color: 'white',
    },
});