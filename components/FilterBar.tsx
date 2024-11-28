import React from 'react';
import { View, StyleSheet, TextInput, Text } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export default function FilterBar({ onFilterChange }: { onFilterChange: (filter: { search: string, system: string, subsystem: string }) => void }) {
    const [search, setSearch] = React.useState<string>('');
    const [system, setSystem] = React.useState<string>('');
    const [subsystem, setSubsystem] = React.useState<string>('');

    React.useEffect(() => {
        onFilterChange({ search, system, subsystem });
    }, [search, system, subsystem]);

    return (
        <View>
            <ThemedView>
                <ThemedText>Filter Bar</ThemedText>
                <TextInput
                    placeholder="Search"
                    placeholderTextColor={'#aaaaaa'}
                    style={styles.input}
                    value={search}
                    onChangeText={setSearch}
                />
            </ThemedView>
            {/* <ThemedView>
                <Text style={styles.label}>Subsystem:</Text>
                <DropDownPicker
                    open={subsystemDropdownOpen}
                    value={subsystem}
                    items={subsystemDropdownItems}
                    setOpen={setSubsystemDropdownOpen}
                    setValue={setSubsystem}
                    setItems={setSubsystemDropdownItems}
                />
            </ThemedView> */}
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